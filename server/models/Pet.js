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
    goodWithKids: { type: Boolean, default: false },
    goodWithPets: { type: Boolean, default: false },
    apartmentFriendly: { type: Boolean, default: false }
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
  favorites: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Index for efficient queries
petSchema.index({ shelter: 1, adoptionStatus: 1 });
petSchema.index({ species: 1, adoptionStatus: 1 });
petSchema.index({ reviewStatus: 1 });

const Pet = mongoose.model("Pet", petSchema);

export default Pet;
