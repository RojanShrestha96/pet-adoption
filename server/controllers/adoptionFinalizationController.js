/**
 * adoptionFinalizationController.js
 *
 * Thin HTTP layer for the post-adoption finalization pipeline.
 * Each function: decodes the request, calls the corresponding service
 * function, and returns the result. No direct DB writes happen here.
 *
 * Error shape returned on failure:
 *   { success: false, message: string }
 * Service functions throw errors with an optional .statusCode property;
 * if absent, 500 is used.
 */

import * as FinalizationService from "../services/adoptionFinalizationService.js";

// ── Shared error handler ──────────────────────────────────────────────────────
function handleError(res, err) {
  const status = err.statusCode || 500;
  console.error(`[AdoptionFinalization] ${err.message}`);
  return res.status(status).json({ success: false, message: err.message });
}

// ─────────────────────────────────────────────────────────────────────────────
// SHELTER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /:id/finalize/initialize
 * Shelter — "Finalize Adoption" button on meeting_completed application.
 * Calculates fee and transitions to finalization_pending.
 * Response includes the calculated fee so the UI can display it immediately.
 */
export const initializeFinalization = async (req, res) => {
  try {
    const application = await FinalizationService.initializeFinalization(
      req.params.id,
      req.user.userId
    );
    return res.status(200).json({
      success: true,
      message: "Finalization initialized. Review the fee and confirm.",
      application,
      calculatedFee: application.finalization.calculatedFee,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * POST /:id/finalize/confirm-fee
 * Shelter — "Confirm Fee" button. Accepts optional overrideFee in body.
 * Transitions to payment_pending and notifies the adopter to pay.
 */
export const confirmFee = async (req, res) => {
  try {
    const { overrideFee } = req.body;
    const application = await FinalizationService.confirmFee(
      req.params.id,
      req.user.userId,
      overrideFee
    );
    return res.status(200).json({
      success: true,
      message: "Fee confirmed. Adopter has been notified to proceed with payment.",
      application,
      confirmedFee: application.finalization.adoptionFee,
      wasOverridden: application.finalization.feeWasOverridden,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * POST /:id/finalize/confirm-ready
 * Shelter — "Ready for Pickup" button on contract_signed application.
 * Transitions to handover_pending and notifies the adopter to come collect.
 */
export const confirmReadyForPickup = async (req, res) => {
  try {
    const application = await FinalizationService.confirmReadyForPickup(
      req.params.id,
      req.user.userId
    );
    return res.status(200).json({
      success: true,
      message: "Adopter notified. Awaiting physical handover.",
      application,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * POST /:id/finalize/confirm-handover
 * Shelter — "Confirm Handover Complete" button on handover_pending application.
 * Final step: transitions to completed, marks pet adopted, closes rival apps.
 */
export const confirmHandover = async (req, res) => {
  try {
    const application = await FinalizationService.confirmHandover(
      req.params.id,
      req.user.userId
    );
    return res.status(200).json({
      success: true,
      message: "Adoption complete. Pet has been marked as adopted.",
      application,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADOPTER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /:id/finalize/initiate-payment
 * Adopter — "Pay Now" button on payment_pending application.
 * Returns eSewa payload in the exact same shape as the donation payment,
 * so the frontend's existing form-submit logic works without any changes.
 */
export const initiateAdoptionPayment = async (req, res) => {
  try {
    const result = await FinalizationService.initiateAdoptionPayment(
      req.params.id,
      req.user.userId
    );
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * GET /:id/finalize/verify-payment
 * System — eSewa redirects here on success.
 * Query param: ?data=<base64-encoded-JSON>
 * Decodes eSewa payload here (matching paymentController pattern),
 * then delegates to the service for idempotent verification.
 */
export const verifyAdoptionPayment = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) {
      return res.status(400).json({ success: false, message: "eSewa data param is required." });
    }

    // Decode base64 → JSON (mirrors paymentController.verifyPayment exactly)
    const decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    const { transaction_uuid } = decodedData;

    if (!transaction_uuid) {
      return res.status(400).json({ success: false, message: "transaction_uuid missing from eSewa response." });
    }

    const result = await FinalizationService.verifyAdoptionPayment(
      transaction_uuid,
      decodedData
    );

    return res.status(200).json({
      success: true,
      message: result.alreadyProcessed
        ? "Payment already verified."
        : "Payment verified. Contract generated.",
      ...result,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * POST /:id/finalize/sign-contract
 * Adopter — "Sign & Submit" on the contract review screen.
 * Body: { signatureData: "data:image/png;base64,..." }
 */
export const submitSignature = async (req, res) => {
  try {
    const { signatureData } = req.body;
    if (!signatureData) {
      return res
        .status(400)
        .json({ success: false, message: "signatureData is required." });
    }

    const result = await FinalizationService.submitSignature(
      req.params.id,
      req.user.userId,
      signatureData
    );

    return res.status(200).json({
      success: true,
      message: "Contract signed. The shelter will confirm pickup readiness shortly.",
      signedContractUrl: result.contract.signedContractPdfUrl,
      application: result.application,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * GET /:id/finalize/status
 * Adopter + Shelter — poll the current finalization stage.
 * Returns the finalization sub-document so the frontend stepper
 * can render the correct active step.
 */
export const getFinalizationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, type: userType } = req.user;

    // Build the ownership query based on who is asking
    let query = { _id: id };
    if (userType === "shelter") {
      query.shelter = userId;
    } else if (userType === "adopter") {
      query.adopter = userId;
    } // if admin, we can query just by _id

    const { default: AdoptionApplication } = await import(
      "../models/AdoptionApplication.js"
    );
    const { default: AdoptionContract } = await import(
      "../models/AdoptionContract.js"
    );

    const application = await AdoptionApplication.findOne(query).select(
      "status finalization pet adopter shelter"
    );

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    // Include signed contract URL if it exists (for the adopter download link)
    // AND unsigned contract URL (for the adopter to review before signing)
    let signedContractUrl = null;
    let contractPdfUrl = null;
    if (application.finalization?.contractId) {
      const contract = await AdoptionContract.findById(
        application.finalization.contractId
      ).select("signedContractPdfUrl contractPdfUrl status");
      signedContractUrl = contract?.signedContractPdfUrl || null;
      contractPdfUrl = contract?.contractPdfUrl || null;
    }

    return res.status(200).json({
      success: true,
      status: application.status,
      finalization: application.finalization,
      signedContractUrl,
      contractPdfUrl,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * POST /:id/finalize/revert
 * Shelter — "Reset to Meeting Complete" button.
 * Resets the finalization state so the shelter can start over.
 */
export const revertToMeetingComplete = async (req, res) => {
  try {
    const application = await FinalizationService.revertToMeetingComplete(
      req.params.id,
      req.user.userId
    );
    return res.status(200).json({
      success: true,
      message: "Application reverted to meeting_completed.",
      application,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * POST /:id/finalize/payment-failure
 * GET  /:id/finalize/payment-failure
 *
 * Called by AdoptionPaymentFailure.tsx immediately after eSewa redirects
 * the adopter to the failure URL.  The controller:
 *   1. Marks the latest pending AdoptionPayment attempt as "failed".
 *   2. Counts how many attempts have been used and how many remain.
 *   3. Returns { attemptsUsed, maxAttempts, exhausted } for the UI.
 *
 * No auth required — eSewa redirects externally without JWT.
 */
export const handlePaymentFailure = async (req, res) => {
  const MAX_ATTEMPTS = 10;

  try {
    const { default: AdoptionPayment } = await import("../models/AdoptionPayment.js");
    const { default: AdoptionApplication } = await import("../models/AdoptionApplication.js");
    const { default: Notification } = await import("../models/Notification.js");

    const applicationId = req.params.id;

    // 1. Find the most recent pending payment attempt and mark it failed
    const pendingPayment = await AdoptionPayment.findOne({
      application: applicationId,
      status: "pending",
    }).sort({ attemptNumber: -1 });

    if (pendingPayment) {
      pendingPayment.status = "failed";
      pendingPayment.failureReason = "eSewa redirect to failure URL";
      await pendingPayment.save();
    }

    // 2. Count total attempts for this application
    const attemptsUsed = await AdoptionPayment.countDocuments({
      application: applicationId,
    });

    const exhausted = attemptsUsed >= MAX_ATTEMPTS;

    // 3. If exhausted, update the application status and notify shelter
    if (exhausted) {
      const application = await AdoptionApplication.findById(applicationId)
        .populate("adopter", "name")
        .populate("pet", "name")
        .populate("shelter");

      if (application && application.status === "payment_pending") {
        application.status = "payment_failed";
        await application.save();

        // Notify shelter
        if (application.shelter) {
          try {
            await Notification.create({
              recipient: application.shelter._id,
              recipientType: "shelter",
              type: "application",
              title: "Adopter Payment Exhausted ⚠️",
              message: `${application.adopter?.name || "An adopter"} has used all ${MAX_ATTEMPTS} payment attempts for ${application.pet?.name || "a pet"}. Please contact them directly.`,
              relatedLink: `/shelter/applications/${applicationId}`,
            });
          } catch (_) {}
        }
      }
    }

    return res.status(200).json({
      success: true,
      attemptsUsed,
      maxAttempts: MAX_ATTEMPTS,
      exhausted,
    });
  } catch (err) {
    return handleError(res, err);
  }
};
