/**
 * adoptionFinalizationService.js
 *
 * Single source of truth for all state transitions in the post-adoption
 * finalization pipeline. No controller or route handler may directly
 * mutate AdoptionApplication.status or Pet.adoptionStatus for pipeline
 * stages — every change goes through a function in this file.
 *
 * Rule 1 — Guard every transition:
 *   Every exported function checks the application is in the exact
 *   expected state before doing anything. Wrong state → throws a
 *   structured error with status 400.
 *
 * Rule 2 — Notifications last:
 *   State is committed to the database first. Notifications fire after.
 *   A missed notification is recoverable; corrupted state is not.
 */

import crypto from "crypto";
import { createRequire } from "module";
import { v2 as cloudinary } from "cloudinary";
import AdoptionApplication from "../models/AdoptionApplication.js";
import AdoptionFeeTable from "../models/AdoptionFeeTable.js";
import AdoptionPayment from "../models/AdoptionPayment.js";
import AdoptionContract from "../models/AdoptionContract.js";
import Pet from "../models/Pet.js";
import Notification from "../models/Notification.js";

// PDFKit is CommonJS — use createRequire to import it in an ESM context.
const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit");

// ── eSewa constants (mirrors paymentController.js exactly) ───────────────────
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ═══════════════════════════════════════════════════════════════════════════════
// PRIVATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * _parseAgeToMonths(ageString)
 *
 * Converts a pet's free-text age string to total months for fee table lookup.
 * Handles: "2 years", "6 months", "1 year 3 months", bare number (assumed years).
 * Returns 0 for unparseable strings — falls through to defaultFee safely.
 */
function _parseAgeToMonths(ageString) {
  if (!ageString) return 0;
  const s = ageString.toLowerCase().trim();
  let totalMonths = 0;

  const yearMatch = s.match(/(\d+)\s*(?:year|yr|y)/);
  if (yearMatch) totalMonths += parseInt(yearMatch[1], 10) * 12;

  const monthMatch = s.match(/(\d+)\s*(?:month|mo|m)/);
  if (monthMatch) totalMonths += parseInt(monthMatch[1], 10);

  if (totalMonths === 0) {
    const bareNumber = s.match(/^(\d+)$/);
    if (bareNumber) totalMonths = parseInt(bareNumber[1], 10) * 12;
  }

  return totalMonths;
}

/**
 * _requireStatus(application, ...allowedStatuses)
 *
 * Throws a structured 400 error if the application is not in one of the
 * allowed statuses. Called at the top of every exported function.
 */
function _requireStatus(application, ...allowedStatuses) {
  if (!allowedStatuses.includes(application.status)) {
    const err = new Error(
      `Invalid state transition. Application is '${application.status}' but must be one of: ${allowedStatuses.join(", ")}.`
    );
    err.statusCode = 400;
    throw err;
  }
}

/**
 * _uploadBufferToCloudinary(buffer, publicId, resourceType)
 *
 * Wraps cloudinary.uploader.upload_stream in a Promise so it can be
 * awaited cleanly. Used for both PDF uploads and signed PDF uploads.
 *
 * @param {Buffer} buffer
 * @param {string} publicId   - The Cloudinary asset identifier (no extension for raw)
 * @param {string} resourceType - 'raw' for PDFs, 'image' for signature images
 * @returns {Promise<object>} Cloudinary upload result ({ secure_url, public_id, ... })
 */
function _uploadBufferToCloudinary(buffer, publicId, resourceType = "auto") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: publicId,
        folder: "adoption-contracts",
        overwrite: false,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * _buildPdfBuffer(contentSnapshot, signatureDataUrl)
 *
 * Generates a PDF contract as a Node.js Buffer using PDFKit.
 * If signatureDataUrl is provided, the signature image is embedded
 * on the final page — this produces the SIGNED variant.
 * If null, an empty signature placeholder is rendered — this is the UNSIGNED copy.
 *
 * @param {object} contentSnapshot  - From AdoptionContract.contentSnapshot
 * @param {string|null} signatureDataUrl - base64 data URL or null
 * @returns {Promise<Buffer>}
 */
function _buildPdfBuffer(contentSnapshot, signatureDataUrl = null) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const snap = contentSnapshot;
    const dateStr = snap.contractDate
      ? new Date(snap.contractDate).toLocaleDateString("en-NP", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString();

    // ── HEADER ────────────────────────────────────────────────────────────
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("PetMate — Adoption Agreement", { align: "center" });

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666666")
      .text("This document constitutes the official adoption agreement between the shelter and adopter.", {
        align: "center",
      });

    doc.moveDown(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke("#CCCCCC");
    doc.moveDown(1).fillColor("#000000");

    // ── SHELTER DETAILS ───────────────────────────────────────────────────
    doc.fontSize(12).font("Helvetica-Bold").text("Shelter Information");
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Name:     ${snap.shelterName}`);
    if (snap.shelterAddress) doc.text(`Address:  ${snap.shelterAddress}`);

    doc.moveDown(1);

    // ── ADOPTER DETAILS ───────────────────────────────────────────────────
    doc.fontSize(12).font("Helvetica-Bold").text("Adopter Information");
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Full Name:  ${snap.adopterName}`);
    if (snap.adopterIdType && snap.adopterIdNumber) {
      doc.text(`ID Type:    ${snap.adopterIdType}`);
      doc.text(`ID Number:  ${snap.adopterIdNumber}`);
    }

    doc.moveDown(1);

    // ── PET DETAILS ───────────────────────────────────────────────────────
    doc.fontSize(12).font("Helvetica-Bold").text("Pet Being Adopted");
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Name:     ${snap.petName}`);
    doc.text(`Species:  ${snap.petSpecies || "—"}`);
    if (snap.petBreed) doc.text(`Breed:    ${snap.petBreed}`);
    if (snap.petAge) doc.text(`Age:      ${snap.petAge}`);

    doc.moveDown(1);

    // ── PAYMENT DETAILS ───────────────────────────────────────────────────
    doc.fontSize(12).font("Helvetica-Bold").text("Payment Details");
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Adoption Fee:       ${snap.currency || "NPR"} ${snap.adoptionFee}`);
    doc.text(`Transaction UUID:   ${snap.transactionUuid}`);
    if (snap.esewaRef) doc.text(`eSewa Reference:    ${snap.esewaRef}`);
    doc.text(`Contract Date:      ${dateStr}`);

    doc.moveDown(1);

    // ── TERMS ─────────────────────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke("#CCCCCC")
      .moveDown(0.5)
      .fillColor("#000000");

    doc.fontSize(12).font("Helvetica-Bold").text("Terms & Conditions");
    doc.moveDown(0.3);
    doc.fontSize(9).font("Helvetica").fillColor("#333333");
    doc.text(
      "The adopter agrees to provide a safe, loving, and permanent home for the above-named pet. " +
        "The adopter commits to regular veterinary care, vaccinations, and responsible ownership. " +
        "The shelter reserves the right to reclaim the pet if the adopter is found to be in violation " +
        "of the agreed terms. This adoption is final upon shelter confirmation of physical handover."
    );

    doc.moveDown(1.5).fillColor("#000000");

    // ── SIGNATURE BLOCK ───────────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke("#CCCCCC")
      .moveDown(0.5);

    doc.fontSize(12).font("Helvetica-Bold").text("Adopter Signature");
    doc.moveDown(0.5);

    if (signatureDataUrl) {
      // Embed the signature image from its base64 data URL
      try {
        const base64Data = signatureDataUrl.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const sigBuffer = Buffer.from(base64Data, "base64");
        doc.image(sigBuffer, { width: 220, height: 80 });
      } catch {
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#CC0000")
          .text("[Signature image could not be rendered]");
      }

      doc.moveDown(0.3).fillColor("#000000").fontSize(10).font("Helvetica");
      const signedDate = new Date().toLocaleString("en-NP");
      doc.text(`Signed digitally on: ${signedDate}`);
    } else {
      // Unsigned copy — render a placeholder box
      const boxTop = doc.y;
      doc
        .rect(50, boxTop, 250, 70)
        .stroke("#AAAAAA");
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#AAAAAA")
        .text("[ Awaiting adopter signature ]", 55, boxTop + 28, { width: 240 });
      doc.moveDown(5).fillColor("#000000");
      doc.fontSize(10).text("Signature pending — this document is unsigned.");
    }

    doc.end();
  });
}

/**
 * _generateContract(applicationId)
 *
 * Internal helper — called automatically by verifyAdoptionPayment after
 * payment succeeds. Creates the AdoptionContract document and transitions
 * the application to 'contract_generated'.
 *
 * Not exported. Only verifyAdoptionPayment may call this.
 *
 * @param {string} applicationId
 * @returns {Promise<AdoptionContract>}
 */
async function _generateContract(applicationId) {
  // Load application fully populated for contract content
  const application = await AdoptionApplication.findById(applicationId)
    .populate("pet", "name species breed age")
    .populate("adopter", "name email")
    .populate("shelter", "name address city");

  if (!application) {
    throw new Error(`Application ${applicationId} not found during contract generation.`);
  }

  // Retrieve the succeeded payment document (for esewaRef and transactionUuid)
  const payment = await AdoptionPayment.getCompletedPayment(applicationId);
  if (!payment) {
    throw new Error(
      `No completed payment found for application ${applicationId}. Cannot generate contract.`
    );
  }

  // Retrieve the fee table currency if available
  const feeTable = await AdoptionFeeTable.findOne({
    shelter: application.shelter._id,
  });

  // ── Build the content snapshot (frozen at generation time) ──────────────
  const shelterAddress = [
    application.shelter.address,
    application.shelter.city,
  ]
    .filter(Boolean)
    .join(", ");

  const contentSnapshot = {
    shelterName: application.shelter.name,
    shelterAddress,
    adopterName:
      application.personalInfo?.fullName || application.adopter?.name || "—",
    adopterIdType: application.personalInfo?.idType || null,
    adopterIdNumber: application.personalInfo?.idNumber || null,
    petName: application.pet.name,
    petSpecies: application.pet.species,
    petBreed: application.pet.breed || "",
    petAge: application.pet.age || "",
    adoptionFee: application.finalization.adoptionFee,
    currency: feeTable?.currency || "NPR",
    transactionUuid: payment.transactionUuid,
    esewaRef: payment.esewaRef || null,
    contractDate: new Date(),
  };

  // ── Generate unsigned PDF buffer ─────────────────────────────────────────
  const pdfBuffer = await _buildPdfBuffer(contentSnapshot, null);

  // ── Upload unsigned PDF to Cloudinary ────────────────────────────────────
  const publicId = `unsigned_${applicationId}_${Date.now()}.pdf`;
  const uploadResult = await _uploadBufferToCloudinary(pdfBuffer, publicId, "auto");

  // ── Persist AdoptionContract document ────────────────────────────────────
  const contract = await AdoptionContract.create({
    application: applicationId,
    adopter: application.adopter._id,
    shelter: application.shelter._id,
    pet: application.pet._id,
    payment: payment._id,
    contractPdfUrl: uploadResult.secure_url,
    signedContractPdfUrl: null,
    contentSnapshot,
    status: "generated",
    generatedAt: new Date(),
  });

  // ── Update application with contract reference ───────────────────────────
  application.finalization.contractId = contract._id;
  application.finalization.contractGeneratedAt = new Date();
  application.status = "contract_generated";
  await application.save();

  // ── Notify adopter to review and sign ────────────────────────────────────
  try {
    await Notification.create({
      recipient: application.adopter._id,
      recipientType: "adopter",
      type: "success",
      title: "Your Adoption Contract is Ready 📄",
      message: `Payment confirmed! Your adoption contract for ${application.pet.name} is ready. Please review and sign it to continue.`,
      relatedLink: `/application-tracking/${application._id}`,
    });
  } catch (notifErr) {
    console.error(
      "[AdoptionFinalization] _generateContract notification failed:",
      notifErr.message
    );
  }

  return contract;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 1 — initializeFinalization
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * initializeFinalization(applicationId, shelterId)
 *
 * What    : Fetches the shelter's AdoptionFeeTable, calls calculateFee() with
 *           the pet's species and age, stores the result in both
 *           finalization.calculatedFee and finalization.adoptionFee, then
 *           transitions the application to 'finalization_pending'.
 * Who     : Shelter staff — triggered by clicking "Finalize Adoption".
 * Transition: meeting_completed → finalization_pending
 */
export async function initializeFinalization(applicationId, shelterId) {
  // ── 1. Load and own-check ─────────────────────────────────────────────────
  const application = await AdoptionApplication.findOne({
    _id: applicationId,
    shelter: shelterId,
  })
    .populate("pet", "name species age")
    .populate("adopter", "name email")
    .populate("shelter", "name address");

  if (!application) {
    const err = new Error(
      "Application not found or you do not have permission to finalize it."
    );
    err.statusCode = 404;
    throw err;
  }

  // ── 2. Guard ──────────────────────────────────────────────────────────────
  _requireStatus(application, "meeting_completed");

  // ── 3. Calculate fee ──────────────────────────────────────────────────────
  const feeTable = await AdoptionFeeTable.findOne({ shelter: shelterId });
  const ageMonths = _parseAgeToMonths(application.pet?.age);
  const species = application.pet?.species || "other";
  const calculatedFee = feeTable ? feeTable.calculateFee(species, ageMonths) : 0;

  // ── 4. Persist state change ───────────────────────────────────────────────
  application.finalization = application.finalization || {};
  application.finalization.calculatedFee = calculatedFee;
  application.finalization.adoptionFee = calculatedFee;
  application.finalization.feeWasOverridden = false;
  application.status = "finalization_pending";

  await application.save();

  // ── 5. Notify adopter (after save) ───────────────────────────────────────
  try {
    await Notification.create({
      recipient: application.adopter._id,
      recipientType: "adopter",
      type: "info",
      title: "Adoption Process Starting 🐾",
      message: `Great news! The shelter is finalizing ${application.pet.name}'s adoption. You will be notified shortly with the adoption fee and next steps.`,
      relatedLink: `/application-tracking/${application._id}`,
    });
  } catch (notifErr) {
    console.error(
      "[AdoptionFinalization] initializeFinalization notification failed:",
      notifErr.message
    );
  }

  return application;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 2 — confirmFee
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * confirmFee(applicationId, shelterId, overrideFee)
 *
 * What    : Confirms the adoption fee (calculated or staff-overridden),
 *           records confirmation metadata, and transitions to 'payment_pending'.
 * Who     : Shelter staff — triggered by clicking "Confirm Fee".
 * Transition: finalization_pending → payment_pending
 */
export async function confirmFee(applicationId, shelterId, overrideFee) {
  // ── 1. Load and own-check ─────────────────────────────────────────────────
  const application = await AdoptionApplication.findOne({
    _id: applicationId,
    shelter: shelterId,
  })
    .populate("pet", "name")
    .populate("adopter", "name email");

  if (!application) {
    const err = new Error(
      "Application not found or you do not have permission to modify it."
    );
    err.statusCode = 404;
    throw err;
  }

  // ── 2. Guard ──────────────────────────────────────────────────────────────
  _requireStatus(application, "finalization_pending");

  // ── 3. Validate and apply override if provided ────────────────────────────
  if (overrideFee !== undefined && overrideFee !== null) {
    const feeValue = Number(overrideFee);
    if (isNaN(feeValue) || feeValue < 0) {
      const err = new Error(
        "If provided, override fee must be a non-negative number."
      );
      err.statusCode = 400;
      throw err;
    }
    application.finalization.adoptionFee = feeValue;
    application.finalization.feeWasOverridden = true;
  } else {
    // No override — fee stays exactly as set by initializeFinalization
    application.finalization.feeWasOverridden = false;
  }

  // ── 4. Persist state change ───────────────────────────────────────────────
  application.finalization.feeConfirmedAt = new Date();
  application.finalization.feeConfirmedBy = shelterId;
  application.status = "payment_pending";

  await application.save();

  // ── 5. Notify adopter (after save) ───────────────────────────────────────
  try {
    const amountStr = `Rs ${application.finalization.adoptionFee}`;
    await Notification.create({
      recipient: application.adopter._id,
      recipientType: "adopter",
      type: "application",
      title: "Adoption Fee Ready for Payment 💳",
      message: `The shelter has confirmed the adoption fee of ${amountStr} for ${application.pet.name}. Please proceed to payment to continue the adoption process.`,
      relatedLink: `/application-tracking/${application._id}`,
    });
  } catch (notifErr) {
    console.error(
      "[AdoptionFinalization] confirmFee notification failed:",
      notifErr.message
    );
  }

  return application;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 3 — initiateAdoptionPayment
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * initiateAdoptionPayment(applicationId, adopterId)
 *
 * What    : Creates a new AdoptionPayment attempt document, generates an
 *           HMAC-SHA256 signed eSewa payload using the identical pattern from
 *           paymentController.js, and returns it for the frontend to
 *           auto-submit as a form POST to eSewa.
 * Who     : Adopter — triggered by clicking "Pay Now".
 * Transition: payment_pending → payment_pending (no status change; payment is
 *             initiated but not yet verified. Status only changes on verify or failure.)
 */
export async function initiateAdoptionPayment(applicationId, adopterId) {
  // ── 1. Load application (adopter owns this check) ─────────────────────────
  const application = await AdoptionApplication.findOne({
    _id: applicationId,
    adopter: adopterId,
  })
    .populate("pet", "name species")
    .populate("shelter", "name")
    .populate("adopter", "name email");

  if (!application) {
    const err = new Error(
      "Application not found or you do not have permission."
    );
    err.statusCode = 404;
    throw err;
  }

  // ── 2. Guard ──────────────────────────────────────────────────────────────
  _requireStatus(application, "payment_pending");

  // ── 3. Check payment attempts have not been exhausted ─────────────────────
  const exhausted = await AdoptionPayment.isExhausted(applicationId);
  if (exhausted) {
    const err = new Error(
      "Maximum payment attempts (3) reached. Please contact the shelter."
    );
    err.statusCode = 400;
    throw err;
  }

  // ── 4. Get the next attempt number ───────────────────────────────────────
  const attemptNumber = await AdoptionPayment.getNextAttemptNumber(applicationId);

  // ── 5. Build eSewa payload (identical to paymentController.initiatePayment) ─
  const transactionUuid = `ADOPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const amount = application.finalization.adoptionFee;
  const productServiceCharge = 0;
  const productDeliveryCharge = 0;
  const taxAmount = 0;
  const totalAmount = amount + taxAmount + productServiceCharge + productDeliveryCharge;

  const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(signatureString)
    .digest("base64");

  // ── 6. Create AdoptionPayment document (pending) ──────────────────────────
  await AdoptionPayment.create({
    application: applicationId,
    adopter: adopterId,
    shelter: application.shelter._id,
    pet: application.pet._id,
    amount,
    transactionUuid,
    status: "pending",
    attemptNumber,
    paymentMethod: "esewa",
    esewaRef: null,
  });

  // ── 7. Increment paymentAttempts counter on application ───────────────────
  application.finalization.paymentAttempts = attemptNumber;
  await application.save();

  // ── 8. Return eSewa payload (identical shape to the donation payment response) ─
  const paymentData = {
    amount,
    failure_url: `${FRONTEND_URL}/adoption-payment/failure/${applicationId}`,
    product_delivery_charge: productDeliveryCharge,
    product_service_charge: productServiceCharge,
    product_code: ESEWA_PRODUCT_CODE,
    signature,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    success_url: `${FRONTEND_URL}/adoption-payment/success/${applicationId}`,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
  };

  return {
    adoptionPayment: { transactionUuid, attemptNumber, amount },
    data: paymentData,
    url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 4 — verifyAdoptionPayment  (idempotent)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * verifyAdoptionPayment(transactionUuid, decodedEsewaData)
 *
 * What    : Verifies an eSewa payment callback, marks the AdoptionPayment
 *           document as completed, and auto-triggers _generateContract.
 *           IDEMPOTENT — if called twice with the same transactionUuid, the
 *           second call returns success immediately without re-processing.
 * Who     : System — called from the controller handling eSewa's success redirect.
 * Transition: payment_pending → contract_generated (via _generateContract)
 *
 * @param {string} transactionUuid    - From the eSewa callback data
 * @param {object} decodedEsewaData   - Already decoded by the controller from base64:
 *                                     { transaction_uuid, total_amount, status, ref_id? }
 * @returns {Promise<{ application, contract }>}
 */
export async function verifyAdoptionPayment(transactionUuid, decodedEsewaData) {
  const { total_amount, status: esewaStatus, ref_id: esewaRef } = decodedEsewaData;

  // ── 1. Find the AdoptionPayment record ────────────────────────────────────
  const payment = await AdoptionPayment.findOne({ transactionUuid });

  if (!payment) {
    const err = new Error(
      `No payment record found for transaction UUID: ${transactionUuid}`
    );
    err.statusCode = 404;
    throw err;
  }

  // ── 2. Idempotency check — already verified ───────────────────────────────
  // If this payment was already marked completed (e.g. eSewa redirected twice),
  // return success without re-processing anything.
  if (payment.status === "completed") {
    const application = await AdoptionApplication.findById(payment.application);
    const contract = await AdoptionContract.findOne({
      application: payment.application,
    });
    console.log(
      `[AdoptionFinalization] verifyAdoptionPayment called again for already-completed UUID ${transactionUuid}. Returning cached result.`
    );
    return { application, contract, alreadyProcessed: true };
  }

  // ── 3. Reject already-failed payments ────────────────────────────────────
  if (payment.status === "failed") {
    const err = new Error(
      "This payment attempt was already marked as failed. A new payment must be initiated."
    );
    err.statusCode = 400;
    throw err;
  }

  // ── 4. Validate eSewa status ──────────────────────────────────────────────
  if (esewaStatus !== "COMPLETE") {
    // Route to failure handler rather than throwing
    await handlePaymentFailure(transactionUuid, `eSewa returned status: ${esewaStatus}`);
    const err = new Error("Payment was not completed by eSewa.");
    err.statusCode = 400;
    throw err;
  }

  // ── 5. Validate amount (tamper prevention) ────────────────────────────────
  if (parseFloat(total_amount) !== payment.amount) {
    console.error(
      `[AdoptionFinalization] Amount mismatch on ${transactionUuid}! Expected ${payment.amount}, got ${total_amount}`
    );
    await handlePaymentFailure(transactionUuid, `Amount mismatch: expected ${payment.amount}, received ${total_amount}`);
    const err = new Error("Payment amount mismatch. This attempt has been invalidated.");
    err.statusCode = 400;
    throw err;
  }

  // ── 6. Mark payment as completed (Rule 1: state first) ───────────────────
  payment.status = "completed";
  payment.esewaRef = esewaRef || null;
  payment.verifiedAt = new Date();
  await payment.save();

  // ── 7. Update application with payment reference ──────────────────────────
  const application = await AdoptionApplication.findById(payment.application);
  if (!application) {
    throw new Error(`Application ${payment.application} not found during payment verify.`);
  }

  application.finalization.paymentId = payment._id;
  application.finalization.paymentCompletedAt = new Date();
  await application.save();

  // ── 8. Auto-trigger contract generation ───────────────────────────────────
  // _generateContract handles its own state transition to contract_generated
  // and its own notification.
  const contract = await _generateContract(payment.application.toString());

  return { application, contract, alreadyProcessed: false };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 5 — handlePaymentFailure
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * handlePaymentFailure(transactionUuid, failureReason)
 *
 * What    : Marks an AdoptionPayment attempt as failed, checks if all 3
 *           attempts are exhausted, and if so transitions the application to
 *           'payment_failed' and notifies the shelter.
 * Who     : System — called from the controller on eSewa's failure redirect,
 *           or internally by verifyAdoptionPayment on a bad status/amount.
 * Transition: payment_pending → payment_pending (if attempts remain)
 *             payment_pending → payment_failed   (if attempts exhausted)
 */
export async function handlePaymentFailure(transactionUuid, failureReason = "Payment failed") {
  // ── 1. Find the payment record ────────────────────────────────────────────
  const payment = await AdoptionPayment.findOne({ transactionUuid });

  if (!payment) {
    const err = new Error(
      `No payment record found for transaction: ${transactionUuid}`
    );
    err.statusCode = 404;
    throw err;
  }

  // Idempotency — already handled
  if (payment.status !== "pending") {
    console.log(
      `[AdoptionFinalization] handlePaymentFailure: payment ${transactionUuid} is already '${payment.status}', skipping.`
    );
    return;
  }

  // ── 2. Mark this attempt as failed ───────────────────────────────────────
  payment.status = "failed";
  payment.failureReason = failureReason;
  payment.failedAt = new Date();
  await payment.save();

  // ── 3. Check if all attempts exhausted ───────────────────────────────────
  const exhausted = await AdoptionPayment.isExhausted(payment.application);

  const application = await AdoptionApplication.findById(payment.application)
    .populate("adopter", "name email")
    .populate("shelter", "name")
    .populate("pet", "name");

  if (!application) return;

  if (exhausted) {
    // ── 4a. Transition application to payment_failed ──────────────────────
    application.status = "payment_failed";
    await application.save();

    // ── 5a. Notify SHELTER (adopter cannot retry, shelter must intervene) ─
    try {
      await Notification.create({
        recipient: application.shelter._id,
        recipientType: "shelter",
        type: "warning",
        title: "Adoption Payment Failed — Action Required ⚠️",
        message: `All 3 payment attempts for ${application.pet.name}'s adoption by ${application.adopter.name} have failed. Please contact the adopter to resolve the payment issue.`,
        relatedLink: `/shelter/applications/${application._id}`,
      });
    } catch (notifErr) {
      console.error(
        "[AdoptionFinalization] handlePaymentFailure (exhausted) shelter notification failed:",
        notifErr.message
      );
    }

    // Also notify adopter that the process is paused
    try {
      await Notification.create({
        recipient: application.adopter._id,
        recipientType: "adopter",
        type: "error",
        title: "Adoption Payment Could Not Be Completed",
        message: `We were unable to process payment for ${application.pet.name}'s adoption after 3 attempts. The shelter has been notified and will reach out to assist you.`,
        relatedLink: `/application-tracking/${application._id}`,
      });
    } catch (notifErr) {
      console.error(
        "[AdoptionFinalization] handlePaymentFailure (exhausted) adopter notification failed:",
        notifErr.message
      );
    }
  } else {
    // ── 4b. Attempts remain — notify adopter to retry ─────────────────────
    const remaining = 3 - (application.finalization.paymentAttempts || 0);

    try {
      await Notification.create({
        recipient: application.adopter._id,
        recipientType: "adopter",
        type: "warning",
        title: "Payment Unsuccessful — Please Try Again",
        message: `The payment for ${application.pet.name}'s adoption was not completed. You have ${remaining} attempt(s) remaining.`,
        relatedLink: `/application-tracking/${application._id}`,
      });
    } catch (notifErr) {
      console.error(
        "[AdoptionFinalization] handlePaymentFailure (retry) notification failed:",
        notifErr.message
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 7 — submitSignature
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * submitSignature(applicationId, adopterId, signatureData)
 *
 * What    : Accepts the adopter's base64 signature image, regenerates the PDF
 *           with the signature embedded, uploads the signed copy to Cloudinary,
 *           calls contract.markSigned(), and transitions to 'contract_signed'.
 * Who     : Adopter — triggered by clicking "Sign & Submit".
 * Transition: contract_generated → contract_signed
 */
export async function submitSignature(applicationId, adopterId, signatureData) {
  // ── 1. Load application (adopter-owned) ──────────────────────────────────
  const application = await AdoptionApplication.findOne({
    _id: applicationId,
    adopter: adopterId,
  })
    .populate("pet", "name")
    .populate("shelter", "name")
    .populate("adopter", "name email");

  if (!application) {
    const err = new Error(
      "Application not found or you do not have permission."
    );
    err.statusCode = 404;
    throw err;
  }

  // ── 2. Guard ──────────────────────────────────────────────────────────────
  _requireStatus(application, "contract_generated");

  // ── 3. Validate signatureData ─────────────────────────────────────────────
  if (
    !signatureData ||
    typeof signatureData !== "string" ||
    !signatureData.startsWith("data:image/")
  ) {
    const err = new Error(
      "signatureData must be a valid base64 image data URL (e.g. data:image/png;base64,...)."
    );
    err.statusCode = 400;
    throw err;
  }

  // ── 4. Load the contract ──────────────────────────────────────────────────
  const contract = await AdoptionContract.findOne({ application: applicationId });
  if (!contract) {
    const err = new Error("Contract document not found for this application.");
    err.statusCode = 404;
    throw err;
  }

  // ── 5. Re-generate PDF with signature embedded ────────────────────────────
  const signedPdfBuffer = await _buildPdfBuffer(contract.contentSnapshot, signatureData);

  // ── 6. Upload signed PDF to Cloudinary as a NEW asset (not overwriting) ───
  const signedPublicId = `signed_${applicationId}_${Date.now()}.pdf`;
  const uploadResult = await _uploadBufferToCloudinary(
    signedPdfBuffer,
    signedPublicId,
    "auto"
  );

  // ── 7. Persist contract state via instance method (handles its own save) ──
  await contract.markSigned(signatureData, uploadResult.secure_url);

  // ── 8. Update application (Rule 1: state first) ───────────────────────────
  application.finalization.contractSignedAt = new Date();
  application.status = "contract_signed";
  await application.save();

  // ── 9. Notify shelter (after save) ────────────────────────────────────────
  try {
    await Notification.create({
      recipient: application.shelter._id,
      recipientType: "shelter",
      type: "success",
      title: "Adoption Contract Signed ✍️",
      message: `${application.adopter.name} has signed the adoption contract for ${application.pet.name}. Please signal when the pet is ready for pickup.`,
      relatedLink: `/shelter/applications/${application._id}`,
    });
  } catch (notifErr) {
    console.error(
      "[AdoptionFinalization] submitSignature notification failed:",
      notifErr.message
    );
  }

  return { application, contract };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 8 — confirmReadyForPickup
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * confirmReadyForPickup(applicationId, shelterId)
 *
 * What    : Shelter signals the pet is physically ready for the adopter to
 *           collect. Transitions to 'handover_pending' and notifies the adopter
 *           to come to the shelter.
 * Who     : Shelter staff — triggered by clicking "Ready for Pickup".
 * Transition: contract_signed → handover_pending
 */
export async function confirmReadyForPickup(applicationId, shelterId) {
  // ── 1. Load and own-check ─────────────────────────────────────────────────
  const application = await AdoptionApplication.findOne({
    _id: applicationId,
    shelter: shelterId,
  })
    .populate("pet", "name")
    .populate("adopter", "name email")
    .populate("shelter", "name address");

  if (!application) {
    const err = new Error(
      "Application not found or you do not have permission."
    );
    err.statusCode = 404;
    throw err;
  }

  // ── 2. Guard ──────────────────────────────────────────────────────────────
  _requireStatus(application, "contract_signed");

  // ── 3. Persist state change ───────────────────────────────────────────────
  application.finalization.readyForPickupAt = new Date();
  application.finalization.readyForPickupConfirmedBy = shelterId;
  application.status = "handover_pending";

  await application.save();

  // ── 4. Notify adopter to collect their pet (after save) ───────────────────
  try {
    const shelterAddress = application.shelter.address || "the shelter";
    await Notification.create({
      recipient: application.adopter._id,
      recipientType: "adopter",
      type: "success",
      title: `${application.pet.name} is Ready to Come Home! 🏠`,
      message: `Everything is set! Please visit ${application.shelter.name} at ${shelterAddress} to collect ${application.pet.name}. The shelter is ready for you.`,
      relatedLink: `/application-tracking/${application._id}`,
    });
  } catch (notifErr) {
    console.error(
      "[AdoptionFinalization] confirmReadyForPickup notification failed:",
      notifErr.message
    );
  }

  return application;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 9 — confirmHandover
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * confirmHandover(applicationId, shelterId)
 *
 * What    : The final step. Shelter staff confirms the pet has physically left
 *           the building. Transitions to 'completed', sets completedAt, then
 *           calls _globalAdoptionEvent to mark the pet as adopted and close
 *           all rival applications.
 * Who     : Shelter staff — triggered by clicking "Confirm Handover Complete".
 * Transition: handover_pending → completed
 */
export async function confirmHandover(applicationId, shelterId) {
  // ── 1. Load and own-check ─────────────────────────────────────────────────
  const application = await AdoptionApplication.findOne({
    _id: applicationId,
    shelter: shelterId,
  })
    .populate("pet", "name _id")
    .populate("adopter", "name email _id")
    .populate("shelter", "name");

  if (!application) {
    const err = new Error(
      "Application not found or you do not have permission."
    );
    err.statusCode = 404;
    throw err;
  }

  // ── 2. Guard ──────────────────────────────────────────────────────────────
  _requireStatus(application, "handover_pending");

  // ── 3. Retrieve the signed contract URL for the final notification ────────
  const contract = await AdoptionContract.findOne({ application: applicationId });
  const signedContractUrl = contract?.signedContractPdfUrl || null;

  // ── 4. Persist final state (Rule 1: state first) ──────────────────────────
  application.finalization.handoverConfirmedAt = new Date();
  application.finalization.handoverConfirmedBy = shelterId;
  application.status = "completed";
  application.completedAt = new Date();

  await application.save();

  // ── 5. Trigger the global adoption event ─────────────────────────────────
  // This marks the pet as adopted and closes all rival applications.
  // Runs after the primary application is saved so its 'completed' status
  // is never at risk of being caught by the rival-close query.
  await _globalAdoptionEvent(
    applicationId,
    application.pet._id.toString(),
    application.adopter._id.toString(),
    application.pet.name,
    application.adopter.name,
    signedContractUrl
  );

  return application;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIVATE — _globalAdoptionEvent
// Called ONLY by confirmHandover. Never exported.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * _globalAdoptionEvent(applicationId, petId, adopterId, petName, adopterName, signedContractUrl)
 *
 * 1. Sets Pet.adoptionStatus = 'adopted'
 * 2. Bulk-rejects all other non-terminal applications for this pet
 * 3. Sends a displacement notification to each affected adopter
 * 4. Sends the final congratulations notification to the successful adopter
 *    with a download link for the signed contract PDF
 */
async function _globalAdoptionEvent(
  completedApplicationId,
  petId,
  adopterId,
  petName,
  adopterName,
  signedContractUrl
) {
  // ── 1. Mark the pet as adopted ────────────────────────────────────────────
  await Pet.findByIdAndUpdate(petId, { adoptionStatus: "adopted" });
  console.log(`[AdoptionFinalization] Pet ${petId} (${petName}) marked as adopted.`);

  // ── 2. Find all rival active applications for this pet ────────────────────
  const terminalStatuses = ["rejected", "completed", "cancelled"];
  const rivalApplications = await AdoptionApplication.find({
    pet: petId,
    _id: { $ne: completedApplicationId }, // Exclude the completed application
    status: { $nin: terminalStatuses },
  }).populate("adopter", "_id name email");

  // ── 3. Bulk-reject rival applications ────────────────────────────────────
  if (rivalApplications.length > 0) {
    const rivalIds = rivalApplications.map((a) => a._id);
    await AdoptionApplication.updateMany(
      { _id: { $in: rivalIds } },
      {
        $set: {
          status: "rejected",
          rejectionReason: "This pet has found their forever home.",
        },
      }
    );
    console.log(
      `[AdoptionFinalization] Auto-rejected ${rivalApplications.length} rival application(s) for pet ${petId}.`
    );

    // ── 4. Notify each displaced adopter ─────────────────────────────────
    for (const rival of rivalApplications) {
      try {
        await Notification.create({
          recipient: rival.adopter._id,
          recipientType: "adopter",
          type: "info",
          title: `${petName} Has Found a Forever Home 🏡`,
          message: `We're happy to share that ${petName} has been adopted! While this means your application is no longer active, we encourage you to explore other wonderful pets waiting for a home.`,
          relatedLink: "/adopt",
        });
      } catch (notifErr) {
        console.error(
          `[AdoptionFinalization] _globalAdoptionEvent: rival notification failed for adopter ${rival.adopter._id}:`,
          notifErr.message
        );
      }
    }
  }

  // ── 5. Send final congratulations to the successful adopter ──────────────
  try {
    await Notification.create({
      recipient: adopterId,
      recipientType: "adopter",
      type: "success",
      title: `Congratulations! ${petName} is officially yours 🎉`,
      message: `Welcome to the family! ${petName} has officially been adopted. Your signed contract is ready to download. Thank you for giving them a forever home.`,
      relatedLink: signedContractUrl || "/profile",
    });
  } catch (notifErr) {
    console.error(
      "[AdoptionFinalization] _globalAdoptionEvent: final congratulations notification failed:",
      notifErr.message
    );
  }
}
/**
 * revertToMeetingComplete(applicationId, shelterId)
 *
 * What    : Resets the application from finalization stages back to 
 *           meeting_completed, clearing the finalization sub-document.
 * Who     : Shelter — used to "go back" and fix issues.
 */
export async function revertToMeetingComplete(applicationId, shelterId) {
  const application = await AdoptionApplication.findOne({
    _id: applicationId,
    shelter: shelterId,
  });

  if (!application) {
    const err = new Error("Application not found.");
    err.statusCode = 404;
    throw err;
  }

  // Allowed to revert from any finalization stage before 'completed'
  const finalizationStages = [
    "finalization_pending",
    "payment_pending",
    "payment_failed",
    "contract_generated",
    "contract_signed",
    "handover_pending",
  ];

  if (!finalizationStages.includes(application.status)) {
    const err = new Error(
      `Cannot revert from status: ${application.status}.`
    );
    err.statusCode = 400;
    throw err;
  }

  // Reset status and clear finalization data
  application.status = "meeting_completed";
  application.finalization = {
    calculatedFee: 0,
    adoptionFee: 0,
    feeWasOverridden: false,
    initiatedAt: null,
    confirmedAt: null,
  };

  await application.save();

  // Notify adopter
  const notif = await Notification.create({
    recipient: application.adopter,
    recipientType: "adopter",
    type: "info",
    title: "Application Status Update",
    message: "The shelter has reset the finalization process for your application. They may need to adjust details.",
    relatedLink: `/application-tracking/${application._id}`,
  });
  // Socket emit handled by caller or assumed
  
  return application;
}
