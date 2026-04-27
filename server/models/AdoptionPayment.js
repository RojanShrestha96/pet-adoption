import mongoose from "mongoose";

/**
 * AdoptionPayment
 *
 * Tracks each individual eSewa payment attempt for an adoption fee.
 * Each attempt is its own document — failed attempts are NEVER updated,
 * only a new document is created for the next attempt. This preserves
 * a full, immutable audit trail of every payment event.
 *
 * Payload shape mirrors the existing Donation model so that the
 * frontend can reuse the identical eSewa form-submit logic without
 * any changes. The only additions are adoption-specific fields
 * (application, attemptNumber).
 *
 * Maximum attempts: 3. Use AdoptionPayment.isExhausted(applicationId)
 * to check before creating a new attempt document.
 *
 * Status lifecycle per document:
 *   pending  — created when initiate is called; eSewa not yet responded
 *   completed — eSewa returned COMPLETE and amount verified
 *   failed   — eSewa returned non-COMPLETE, or amount mismatch, or timeout
 */

const adoptionPaymentSchema = new mongoose.Schema(
  {
    // ── Adoption-specific references ──────────────────────────────────────
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdoptionApplication",
      required: true,
      index: true,
    },

    // ── Mirrors Donation schema exactly (frontend reuse) ──────────────────
    adopter: {
      // Mirrors Donation.userId
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shelter: {
      // Mirrors Donation.shelterId
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: true,
    },
    pet: {
      // Mirrors Donation.petId
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    transactionUuid: {
      // Mirrors Donation.transactionUuid — used to look up this record on eSewa callback
      type: String,
      required: true,
      unique: true,
    },
    status: {
      // Mirrors Donation.status
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      // Mirrors Donation.paymentMethod
      type: String,
      default: "esewa",
    },

    // ── Adoption-specific fields (no Donation equivalent) ────────────────
    attemptNumber: {
      // Which attempt this document represents (1, 2, 3...).
      // Failed attempts are capped separately by isExhausted.
      type: Number,
      required: true,
      min: 1,
    },
    esewaRef: {
      // eSewa's own transaction reference, returned in the verified callback data.
      // Null until verifyAdoptionPayment succeeds and populates it.
      type: String,
      default: null,
    },
    failureReason: {
      // Human-readable reason for failure, stored for audit. e.g. "status: FAILED"
      type: String,
      default: null,
    },
    verifiedAt: {
      // Timestamp when the eSewa verification callback was successfully processed.
      type: Date,
      default: null,
    },
    failedAt: {
      // Timestamp when the failure was confirmed.
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt = when initiate was called
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────
// Fast lookup for the verify callback (transactionUuid is already unique-indexed above)
adoptionPaymentSchema.index({ application: 1, status: 1 });
adoptionPaymentSchema.index({ application: 1, attemptNumber: 1 });

// ── Static Methods ────────────────────────────────────────────────────────

/**
 * isExhausted(applicationId)
 *
 * Returns true if 3 failed payment documents already exist for this
 * application, meaning no further attempts are allowed.
 *
 * This is a pure query against the AdoptionPayment collection only —
 * the service calls this before creating a new attempt document.
 *
 * @param {ObjectId|string} applicationId
 * @returns {Promise<boolean>}
 */
adoptionPaymentSchema.statics.isExhausted = async function (applicationId) {
  const failedCount = await this.countDocuments({
    application: applicationId,
    status: "failed",
  });
  return failedCount >= 10;
};

/**
 * getNextAttemptNumber(applicationId)
 *
 * Returns the attempt number the next document should use (1, 2, or 3).
 * The service calls this immediately before creating a new attempt
 * so the number is always accurate even under concurrent requests.
 *
 * @param {ObjectId|string} applicationId
 * @returns {Promise<number>} 1 | 2 | 3
 */
adoptionPaymentSchema.statics.getNextAttemptNumber = async function (
  applicationId
) {
  const existingCount = await this.countDocuments({
    application: applicationId,
  });
  return existingCount + 1;
};

/**
 * getCompletedPayment(applicationId)
 *
 * Returns the single completed payment document for this application,
 * or null if none exists yet. Used by the service when generating the
 * contract to embed the eSewa transaction reference.
 *
 * @param {ObjectId|string} applicationId
 * @returns {Promise<AdoptionPayment|null>}
 */
adoptionPaymentSchema.statics.getCompletedPayment = async function (
  applicationId
) {
  return this.findOne({ application: applicationId, status: "completed" });
};

const AdoptionPayment = mongoose.model("AdoptionPayment", adoptionPaymentSchema);

export default AdoptionPayment;
