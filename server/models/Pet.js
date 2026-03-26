import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    enum: ['dog', 'cat', 'other']
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large']
  },
  weight: String,
  description: String,

  // Images
  images: [{
    type: String // URLs to uploaded images
  }],

  // Medical/Documentation
  medical: {
    isVaccinated: { type: Boolean, default: false },
    vaccinationDate: Date,
    isMicrochipped: { type: Boolean, default: false },
    microchipId: String,
    isNeutered: { type: Boolean, default: false },
    isDewormed: { type: Boolean, default: false },
    dewormingDate: Date,
    lastVetCheckup: Date,
    healthStatus: {
      type: String,
      enum: ['healthy', 'special-needs', 'treatment', 'recovering'],
      default: 'healthy'
    },
    medicalNotes: String,
    otherConditions: [String], // Custom medical conditions
    medicalDocuments: [String] // URLs to uploaded documents
  },

  // Personality & Compatibility
  temperament: [String],
  compatibility: {
    // Upgraded from Boolean → String enum for finer scoring
    goodWithKids: {
      type: String,
      enum: ['yes', 'with-supervision', 'no'],
      default: 'yes'
    },
    goodWithPets: {
      type: String,
      enum: ['yes', 'cats-only', 'dogs-only', 'no'],
      default: 'yes'
    },
    // Deprecated — use environment.idealEnvironment instead; kept for backward compat
    apartmentFriendly: { type: Boolean, default: false }
  },

  // ── Behavioural Assessment (shelter-entered at intake, NEVER inferred from breed/size) ──
  behaviour: {
    energyScore: {
      type: Number,
      min: 1, max: 5,
      // 1 = very low energy, 5 = very high energy (2+ hrs exercise daily)
    },
    separationAnxiety: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe'],
    },
    attachmentStyle: {
      type: String,
      enum: ['independent', 'moderate', 'velcro'],
    },
    trainingDifficulty: {
      type: String,
      enum: ['easy', 'moderate', 'challenging'],
    },
    noiseLevel: {
      type: String,
      enum: ['quiet', 'moderate', 'vocal'],
    },
    sheddingLevel: {
      type: String,
      enum: ['none', 'low', 'moderate', 'high'],
    },
  },

  // ── Top-level energy & cost fields (used directly by compatibility engine V2) ──
  // energyLevel is the canonical field; energyScore in behaviour is the numeric form.
  energyLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'very-high'],
  },
  // Maximum comfortable hours the pet can be left alone
  independenceTolerance: {
    type: Number,
    min: 0,
    max: 24,
  },
  // Space requirement — coarser-grained than environment.idealEnvironment
  spaceNeeds: {
    type: String,
    enum: ['apartment-ok', 'house-preferred', 'house-required'],
  },
  // Estimated monthly care cost in NPR (set by shelter at intake)
  estimatedMonthlyCost: {
    type: Number,
    min: 0,
    default: 0,
  },

  // ── Environment Requirements (shelter-entered at intake) ─────────────────────────────
  environment: {
    idealEnvironment: {
      type: String,
      enum: ['indoor-only', 'indoor-with-outdoor-access', 'garden-required', 'rural-preferred'],
    },
    // Minimum living space in square metres — 0 means no minimum
    minSpaceSqm: { type: Number, min: 0, default: 0 },
  },

  // Status
  adoptionStatus: {
    type: String,
    enum: ['pending-review', 'available', 'pending', 'adopted', 'rejected'],
    default: 'pending-review'
  },
  
  // Review status (for admin)
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,

  // Shelter that owns this pet
  shelter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true
  },

  // Stats
  views: { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },

  // Donation / Featured pet fields
  donationStory: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ""
  },
  isFeatured: { type: Boolean, default: false },
  featuredUntil: { type: Date, default: null },
  donationCount: { type: Number, default: 0 },
  lastFeaturedAt: { type: Date, default: null }
}, {
  timestamps: true
});

// Index for efficient queries
petSchema.index({ shelter: 1, adoptionStatus: 1 });
petSchema.index({ species: 1, adoptionStatus: 1 });
petSchema.index({ reviewStatus: 1 });
petSchema.index({ isFeatured: 1 });
petSchema.index({ lastFeaturedAt: 1 });

const Pet = mongoose.model("Pet", petSchema);

export default Pet;
