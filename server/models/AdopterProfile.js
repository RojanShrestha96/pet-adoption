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
      homeType: { type: String, enum: ["apartment", "house", "condo", "townhouse", ""] },

      // V2.1: Unified housing ownership — replaces rentOwn, ownershipStatus, housingTenure
      housing: {
        type: { type: String, enum: ["own", "rent", "live-with-family", ""] },
        landlordPermission: { type: Boolean, default: null }, // required when type === 'rent'
      },

      // Deprecated legacy fields — kept for backward compat with old records
      rentOwn: { type: String, enum: ["rent", "own", "live with family", ""] },
      ownershipStatus: { type: String, enum: ["own", "rent", ""] },
      housingTenure: {
        type: String,
        enum: ["owner", "renter-with-permission", "renter-no-confirmation", "lives-with-family", ""],
      },
      landlordPermission: { type: Boolean, default: null }, // legacy top-level field
      landlordPermissionDocs: [String],

      hasChildren: { type: Boolean },
      // V2.1: Explicit child age categories — used by Child Safety pillar
      childrenAges: {
        type: [String],
        enum: ["infant", "toddler", "school-age", "teen"],
        default: [],
      },
      // Deprecated — kept for backward compat
      childrenAgeRange: {
        type: [String],
        enum: ["infant-2", "toddler-2-5", "school-age-6-12", "teen-13+"],
        default: [],
      },
      childrenDetails: { type: String },

      // V2.1: Explicit boolean pet type fields — replaces regex detection
      hasDogs: { type: Boolean, default: false },
      hasCats: { type: Boolean, default: false },
      hasSmallAnimals: { type: Boolean, default: false },

      // Kept for backward compat
      hasExistingPets: { type: Boolean, default: false },
      existingPetsDescription: { type: String, default: "" },

      hasFencedYard: { type: Boolean, default: false },
      livingSize: { type: String, enum: ["small", "medium", "large", "extra-large", ""] },
      livingSizeSqm: { type: Number, min: 0 },
      hasAllergies: { type: Boolean },
      safeEnvironment: { type: Boolean },
      annualVaccinations: { type: Boolean },
      proofOfResidence: [String],
      medicalAffordability: { type: Boolean }, // deprecated
    },

    // ── Lifestyle (used for compatibility scoring) ─────────────
    lifestyle: {
      activityLevel: {
        type: String,
        // Unified enum — legacy 'sedentary'/'active'/'very-active' normalised at engine layer
        enum: ["low", "moderate", "high", ""],
      },

      // ── Work Style ──
      workStyle: {
        type: String,
        // Canonical values. 'fully-remote' is a legacy alias — normalised at engine layer.
        enum: ["remote", "hybrid", "office", "fully-remote", "office-based", ""],
      },
      // Required when workStyle = 'hybrid'
      hybridDaysHomePerWeek: { type: Number, min: 0, max: 5 },
      // Derived field — calculated from workStyle. Do NOT ask user directly.
      hoursAwayPerDay: { type: Number, min: 0, max: 24 }, // kept for backward compat

      // Bug 2 fix: max continuous alone time (different from total daily hours away)
      maxContinuousAloneTime: { type: Number, min: 0, max: 24 },

      // External support available when adopter is away
      petCareSupport: {
        type: [String],
        enum: ["dog-walker", "pet-sitter", "trusted-family-nearby", "doggy-daycare", "none"],
        default: [],
      },

      // Moved to Basic tier — low friction, high value for scoring
      experienceLevel: {
        type: String,
        enum: ["first-time", "none", "some", "some-experience", "experienced", ""],
      },

      // ── Preference signals ───────────────────────────────────
      preferredEnergyLevel: {
        type: String,
        enum: ["low", "moderate", "high", "no-preference", ""],
      },
      preferredSize: {
        type: String,
        enum: ["small", "medium", "large", "no-preference", ""],
      },

      // ── Financial / budget (Enhanced tier) ────────────────────
      // V2.1: NPR-aligned tiers — replaces incorrect USD-era enum
      monthlyPetBudget: {
        type: String,
        enum: ["under-5000", "5000-10000", "10000-20000", "20000+", ""],
      },

      // ── Life stability context (Enhanced tier) ─────────────────
      upcomingLifeChanges: {
        type: [String],
        enum: ["moving-home", "expecting-baby", "extended-travel", "job-change", "none", "other"],
        default: [],
      },

      // ── Adoption context (persisted from screening) ────────────
      adoptedBefore: { type: Boolean, default: null },
      adoptionTimeline: {
        type: String,
        enum: ["immediately", "1-3months", "exploring", ""],
      },

      dailyRoutine: { type: String }, // free text description of daily schedule
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

    // ── Completion tier — drives partial vs full score display ─
    // Basic  = personalInfo + household + experienceLevel
    // Enhanced = Basic + workStyle + petCareSupport + preferredEnergyLevel + monthlyPetBudget
    completionTier: {
      type: String,
      enum: ["basic", "enhanced"],
      default: "basic",
    },

    // ── Versioning ─────────────────────────────────────────────
    profileVersion: { type: Number, default: 1 },
    lastUpdatedAt: { type: Date, default: Date.now },
    // Keeps last 10 archived versions for audit trail
    profileVersionHistory: {
      type: [
        {
          version: Number,
          archivedAt: Date,
        },
      ],
      default: [],
    },


    lastUpdated: { type: Date, default: Date.now }, // legacy alias

    // ── Location (geocoded from personalInfo.address) ──────────
    // Stored as GeoJSON Point for potential future $near queries.
    // coordinates: [longitude, latitude] (GeoJSON order)
    userLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined }, // [lng, lat]
      formattedAddress: { type: String }, // display label
    },

    // ── Search preferences ────────────────────────────────────
    searchPreferences: {
      defaultRadius: { type: Number, default: 25, min: 1, max: 100 }, // km
    },
  },
  { timestamps: true }
);

// ── Pre-save hook: increment version and update timestamps ──────
adopterProfileSchema.pre("save", async function () {
  if (!this.isNew) {
    // Archive current version before incrementing
    const history = this.profileVersionHistory ?? [];
    history.push({ version: this.profileVersion, archivedAt: new Date() });
    // Keep only the last 10 entries
    if (history.length > 10) history.splice(0, history.length - 10);
    this.profileVersionHistory = history;
    this.profileVersion = (this.profileVersion ?? 1) + 1;
  }
  this.lastUpdatedAt = new Date();
  this.lastUpdated = new Date(); // sync legacy field
});

// ── Helper: derive hoursAwayPerDay from workStyle ──────────────
// V2.1 FIX (Issue 4): Hybrid workers use worst-case daily hours (8) instead of weekly average
adopterProfileSchema.methods.deriveHoursAway = function () {
  const ws = this.lifestyle?.workStyle;
  if (ws === "remote" || ws === "fully-remote") return 0;
  if (ws === "hybrid") return 8; // Worst-case: office days are full 8-hour days
  if (ws === "office" || ws === "office-based") return 8;
  return this.lifestyle?.hoursAwayPerDay ?? 6;
};

// ── Helper: compute completion status AND tier ─────────────────
adopterProfileSchema.methods.computeCompletion = function () {
  const sections = [];

  // Personal info
  const { personalInfo } = this;
  const personalComplete =
    personalInfo?.fullName &&
    personalInfo?.phone &&
    personalInfo?.age &&
    personalInfo?.address &&
    personalInfo?.idType &&
    personalInfo?.idNumber &&
    (personalInfo?.idDocuments?.length ?? 0) > 0;
  if (personalComplete) sections.push("personalInfo");

  // Household — V2.1: use new housing.type instead of rentOwn
  const { household } = this;
  const householdComplete =
    household?.homeType &&
    (household?.housing?.type || household?.rentOwn) && // support new + legacy field
    household?.safeEnvironment !== undefined &&
    household?.annualVaccinations !== undefined &&
    (household?.proofOfResidence?.length ?? 0) > 0;
  if (householdComplete) sections.push("household");

  // experienceLevel is Basic tier — must be present for Basic
  const { lifestyle } = this;
  const experiencePresent = !!lifestyle?.experienceLevel;

  // ── Compute completionTier ─────────────────────────────────
  const basicReady = sections.includes("personalInfo") && sections.includes("household") && experiencePresent;
  const enhancedReady =
    basicReady &&
    !!lifestyle?.activityLevel &&
    !!lifestyle?.workStyle &&
    ((lifestyle?.petCareSupport?.length ?? 0) > 0) &&
    !!lifestyle?.preferredEnergyLevel &&
    !!lifestyle?.monthlyPetBudget;

  this.completionTier = enhancedReady ? "enhanced" : "basic";

  // ── Legacy lifestyle section (broader) ─────────────────────
  const lifestyleComplete = !!lifestyle?.activityLevel && !!lifestyle?.experienceLevel && !!lifestyle?.workStyle;
  if (lifestyleComplete) sections.push("lifestyle");

  const preferencesComplete =
    !!lifestyle?.preferredEnergyLevel &&
    !!lifestyle?.monthlyPetBudget &&
    ((lifestyle?.petCareSupport?.length ?? 0) > 0);
  if (preferencesComplete) sections.push("preferences");

  this.completedSections = sections;

  const required = ["personalInfo", "household", "lifestyle"];
  if (sections.length === 0) {
    this.completionStatus = "none";
  } else if (required.every((s) => sections.includes(s))) {
    this.completionStatus = "complete";
  } else {
    this.completionStatus = "partial";
  }

  return this.completionStatus;
};

const AdopterProfile = mongoose.model("AdopterProfile", adopterProfileSchema);

// ── V2.1 Post-save hook: Invalidate AI cache on critical profile changes (Issue 6) ──
// Dynamic import used to avoid circular dependency with AdoptionApplication
adopterProfileSchema.post("save", async function (doc) {
  try {
    const criticalFields = ["household.housing", "lifestyle.workStyle", "lifestyle.monthlyPetBudget", "lifestyle.activityLevel", "household.hasChildren"];
    const modifiedPaths = doc.modifiedPaths ? doc.modifiedPaths() : [];
    const hasCriticalChange = criticalFields.some((f) => modifiedPaths.some((p) => p.startsWith(f)));
    if (hasCriticalChange) {
      const { default: AdoptionApplication } = await import("./AdoptionApplication.js");
      await AdoptionApplication.updateMany(
        { adopter: doc._id, "aiInsights": { $ne: null } },
        { $unset: { aiInsights: "" } }
      );
    }
  } catch (err) {
    console.warn("[V2.1] Failed to invalidate AI cache on profile save:", err.message);
  }
});

export default AdopterProfile;
