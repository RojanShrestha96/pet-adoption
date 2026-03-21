import mongoose from "mongoose";

const adopterProfileSchema = new mongoose.Schema(
  {
    adopter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // ── Personal Info ──────────────────────────────────────────
    personalInfo: {
      fullName: { type: String, trim: true },
      phone: { type: String, trim: true },
      age: { type: Number, min: 18, max: 120 },
      address: { type: String, trim: true },
      idType: { type: String, enum: ["citizenship", "passport", "license", ""] },
      idNumber: { type: String, trim: true },
      idDocuments: [String], // uploaded URLs
      documentsUploadedAt: { type: Date }, // for expiry nudge
    },

    // ── Household ─────────────────────────────────────────────
    household: {
      homeType: { type: String, enum: ["apartment", "house", "condo", ""] },
      rentOwn: { type: String, enum: ["rent", "own", "live with family", ""] },
      landlordPermission: [String],
      hasChildren: { type: Boolean },
      childrenDetails: { type: String },
      existingPets: { type: String },
      hasFencedYard: { type: Boolean, default: false },
      safeEnvironment: { type: Boolean },
      medicalAffordability: { type: Boolean },
      annualVaccinations: { type: Boolean },
      proofOfResidence: [String],
    },

    // ── Lifestyle (used for compatibility scoring) ─────────────
    lifestyle: {
      activityLevel: {
        type: String,
        enum: ["low", "moderate", "high", ""],
      },
      hoursAwayPerDay: { type: Number, min: 0, max: 24 },
      experienceLevel: {
        type: String,
        enum: ["none", "some", "experienced", ""],
      },
      dailyRoutine: { type: String }, // free text, optional
    },

    // ── Completion tracking ────────────────────────────────────
    completionStatus: {
      type: String,
      enum: ["none", "partial", "complete"],
      default: "none",
    },
    completedSections: {
      type: [String], // e.g. ['personalInfo', 'household', 'lifestyle']
      default: [],
    },

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── Helper: compute completion status ─────────────────────────
adopterProfileSchema.methods.computeCompletion = function () {
  const sections = [];

  // Personal info is complete when all required fields + at least 1 doc
  const { personalInfo } = this;
  const personalComplete =
    personalInfo?.fullName &&
    personalInfo?.phone &&
    personalInfo?.age &&
    personalInfo?.address &&
    personalInfo?.idType &&
    personalInfo?.idNumber &&
    personalInfo?.idDocuments?.length > 0;

  if (personalComplete) sections.push("personalInfo");

  // Household is complete when home type, rent/own, safety booleans set
  const { household } = this;
  const householdComplete =
    household?.homeType &&
    household?.rentOwn &&
    household?.safeEnvironment !== undefined &&
    household?.medicalAffordability !== undefined &&
    household?.annualVaccinations !== undefined &&
    household?.proofOfResidence?.length > 0;

  if (householdComplete) sections.push("household");

  // Lifestyle is complete when activity + experience set
  const { lifestyle } = this;
  const lifestyleComplete =
    lifestyle?.activityLevel && lifestyle?.experienceLevel;

  if (lifestyleComplete) sections.push("lifestyle");

  this.completedSections = sections;

  if (sections.length === 0) {
    this.completionStatus = "none";
  } else if (
    sections.includes("personalInfo") &&
    sections.includes("household") &&
    sections.includes("lifestyle")
  ) {
    this.completionStatus = "complete";
  } else {
    this.completionStatus = "partial";
  }

  return this.completionStatus;
};

const AdopterProfile = mongoose.model("AdopterProfile", adopterProfileSchema);

export default AdopterProfile;
