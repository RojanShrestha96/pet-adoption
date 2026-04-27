import mongoose from "mongoose";

/**
 * AdoptionContract
 *
 * One document per successfully completed adoption payment. Created
 * automatically by adoptionFinalizationService.generateContract()
 * immediately after payment verification succeeds.
 *
 * Dual PDF architecture
 * ─────────────────────
 * contractPdfUrl     → The original, unsigned PDF uploaded to Cloudinary
 *                      at generation time. This is the AUDIT COPY and must
 *                      NEVER be overwritten or deleted. It proves what was
 *                      agreed to before the signature was applied.
 *
 * signedContractPdfUrl → A second Cloudinary upload containing an identical
 *                        PDF with the adopter's signature image embedded.
 *                        Populated only after submitSignature() completes.
 *                        Absent (null) means the contract is not yet signed.
 *
 * Signature storage
 * ─────────────────
 * signatureData stores the raw base64 data URL (e.g. "data:image/png;base64,…")
 * directly in the document. This is acceptable for V1 but can grow large
 * for high-resolution drawn signatures (~50–200 KB per signature string).
 * TODO (V2): Upload signature image to Cloudinary on receipt and store only
 * the Cloudinary URL here, removing the inline base64 entirely.
 *
 * Audit chain
 * ───────────
 * contract → payment  (via `payment` field, ref: AdoptionPayment)
 *          → esewaRef (via payment.esewaRef)
 * This lets you trace any dispute in one hop: contract → payment → eSewa.
 */

const adoptionContractSchema = new mongoose.Schema(
  {
    // ── Core references ──────────────────────────────────────────────────
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdoptionApplication",
      required: true,
      unique: true, // One contract per application
      index: true,
    },
    adopter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },

    // ── Direct link to the specific payment that triggered this contract ─
    // Populated from AdoptionPayment.getCompletedPayment(applicationId).
    // Allows contract → payment → esewaRef traceability in one hop.
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdoptionPayment",
      required: true,
    },

    // ── PDF storage (Cloudinary URLs) ────────────────────────────────────
    contractPdfUrl: {
      // AUDIT COPY — unsigned PDF. Set at generation, never overwritten.
      type: String,
      required: true,
    },
    signedContractPdfUrl: {
      // Set by submitSignature() after adopter signs.
      // Null until signed.
      type: String,
      default: null,
    },

    // ── Signature ────────────────────────────────────────────────────────
    signatureData: {
      // Raw base64 data URL of the adopter's drawn or typed signature.
      // e.g. "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      // Stored inline for V1. See file-level comment re: V2 migration.
      type: String,
      default: null,
    },
    signedAt: {
      type: Date,
      default: null,
    },

    // ── Snapshot of contract content at generation time ──────────────────
    // Storing key fields as a plain object means the contract is self-contained
    // even if the referenced documents are later edited or deleted.
    contentSnapshot: {
      // Shelter details
      shelterName: { type: String, required: true },
      shelterAddress: { type: String, default: "" },

      // Adopter details (from application.personalInfo at contract time)
      adopterName: { type: String, required: true },
      adopterIdType: { type: String },
      adopterIdNumber: { type: String },

      // Pet details
      petName: { type: String, required: true },
      petSpecies: { type: String },
      petBreed: { type: String, default: "" },
      petAge: { type: String },

      // Payment details
      adoptionFee: { type: Number, required: true },
      currency: { type: String, default: "NPR" },
      transactionUuid: { type: String, required: true },
      esewaRef: { type: String, default: null },

      // Dates
      contractDate: { type: Date, required: true },
    },

    // ── Lifecycle status ─────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["generated", "signed"],
      default: "generated",
      index: true,
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────
adoptionContractSchema.index({ adopter: 1, status: 1 });
adoptionContractSchema.index({ shelter: 1, status: 1 });

// ── Instance Methods ──────────────────────────────────────────────────────

/**
 * isSigned()
 *
 * Returns true when the adopter has submitted a signature and the
 * signed PDF has been uploaded. The service calls this before allowing
 * the shelter to proceed to handover confirmation.
 *
 * @returns {boolean}
 */
adoptionContractSchema.methods.isSigned = function () {
  return this.status === "signed" && this.signedContractPdfUrl !== null;
};

/**
 * markSigned(signatureData, signedPdfUrl)
 *
 * Atomically records the signature and the signed PDF URL on this
 * document, then saves. Keeps the mutation logic off the service layer.
 *
 * @param {string} signatureData - base64 data URL of the signature image
 * @param {string} signedPdfUrl  - Cloudinary secure_url of the signed PDF
 * @returns {Promise<AdoptionContract>}
 */
adoptionContractSchema.methods.markSigned = function (
  signatureData,
  signedPdfUrl
) {
  this.signatureData = signatureData;
  this.signedContractPdfUrl = signedPdfUrl;
  this.status = "signed";
  this.signedAt = new Date();
  return this.save();
};

const AdoptionContract = mongoose.model(
  "AdoptionContract",
  adoptionContractSchema
);

export default AdoptionContract;
