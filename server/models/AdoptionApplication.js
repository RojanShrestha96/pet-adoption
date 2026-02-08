import mongoose from "mongoose";

const adoptionApplicationSchema = new mongoose.Schema({
  // Pet and Shelter References
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true,
    index: true
  },
  shelter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true,
    index: true
  },
  adopter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Screening Information
  screening: {
    adoptedBefore: {
      type: String,
      required: true,
      enum: ['yes', 'no', 'first time']
    },
    currentPets: {
      type: String,
      required: true,
      enum: ['yes', 'no']
    },
    homeOwnership: {
      type: String,
      required: true,
      enum: ['own', 'rent', 'live with family']
    },
    homeVisit: {
      type: String,
      required: true,
      enum: ['yes', 'maybe', 'no']
    },
    timeline: {
      type: String,
      required: true,
      enum: ['immediately', 'within a week', 'within a month', 'just browsing']
    },
    specialNeeds: {
      type: String,
      required: true,
      enum: ['yes', 'depends', 'no']
    }
  },

  // Personal Information
  personalInfo: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 120
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    idType: {
      type: String,
      required: true,
      enum: ['citizenship', 'passport', 'license']
    },
    idNumber: {
      type: String,
      required: true,
      trim: true
    },
    idDocuments: [String] // URLs to uploaded ID documents
  },

  // Household Information
  household: {
    homeType: {
      type: String,
      required: true,
      enum: ['apartment', 'house', 'condo']
    },
    rentOwn: {
      type: String,
      required: true,
      enum: ['rent', 'own']
    },
    landlordPermission: [String], // URLs if renting
    hasChildren: {
      type: Boolean,
      default: false
    },
    childrenDetails: String,
    existingPets: String,
    dailyRoutine: String,
    hasFencedYard: {
      type: Boolean,
      default: false
    },
    safeEnvironment: {
      type: Boolean,
      required: true
    },
    medicalAffordability: {
      type: Boolean,
      required: true
    },
    annualVaccinations: {
      type: Boolean,
      required: true
    },
    proofOfResidence: [String] // URLs to documents
  },

  // Adoption Intent
  adoptionIntent: {
    whyAdopt: {
      type: String,
      required: true
    },
    petExperience: {
      type: String,
      required: true
    },
    adoptionTimeline: String,
    readyForHomeVisit: {
      type: Boolean,
      required: true
    },
    handleVetVisits: {
      type: Boolean,
      required: true
    }
  },

  // Application Status
  status: {
    type: String,
    enum: [
      'pending',
      'reviewing',
      'approved',
      'availability_submitted',
      'meeting_scheduled',
      'meeting_completed',
      'rejected',
      'completed'
    ],
    default: 'pending',
    index: true
  },

  // Document Verification Status
  // Array of { url: String, status: String }
  documentStatus: [{
    url: String,
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  }],

  // Meet & Greet Scheduling (new structured approach)
  meetAndGreet: {
    // Adopter's proposed availability (2-3 time slots)
    availabilitySlots: [{
      date: {
        type: String, // ISO date string YYYY-MM-DD
        required: true
      },
      timeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'], // morning: 9-12, afternoon: 12-3, evening: 3-6
        required: true
      },
      notes: String // Optional adopter notes for this slot
    }],
    
    // Shelter's confirmed selection from availability
    confirmedSlot: {
      date: String, // Selected from availabilitySlots
      timeSlot: String, // Selected from availabilitySlots
      specificTime: String // e.g., "10:00 AM" - more specific time within the slot
    },
    
    // Meeting location
    location: {
      type: String,
      trim: true
    },
    
    // Internal shelter notes for the meeting
    shelterNotes: String,
    
    // Post-meeting outcome
    outcome: {
      type: String,
      enum: ['successful', 'needs_followup', 'not_a_match']
    },
    
    // When the meeting was completed
    completedAt: Date,
    
    // When availability was submitted
    availabilitySubmittedAt: Date,
    
    // When shelter confirmed the schedule
    scheduledAt: Date
  },
  
  // Legacy scheduling fields (kept for backward compatibility)
  scheduledDate: Date,
  scheduledTime: String,
  
  // Notes and Communication
  notes: String, // Internal shelter notes
  rejectionReason: String, // Reason if rejected
  
  // Agreement
  agreeToTerms: {
    type: Boolean,
    required: true,
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'You must agree to the terms and conditions'
    }
  },

  // Metadata
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter'
  },
  reviewedAt: Date,
  completedAt: Date

}, {
  timestamps: true
});

// Compound indexes for efficient queries
adoptionApplicationSchema.index({ shelter: 1, status: 1 });
adoptionApplicationSchema.index({ adopter: 1, createdAt: -1 });
adoptionApplicationSchema.index({ pet: 1, adopter: 1 }, { unique: true }); // One application per pet per adopter

// Meet & Greet specific indexes for calendar views
adoptionApplicationSchema.index({ shelter: 1, 'meetAndGreet.confirmedSlot.date': 1 }); // For shelter calendar
adoptionApplicationSchema.index({ status: 1, 'meetAndGreet.confirmedSlot.date': 1 }); // For filtering scheduled meetings

// Methods
adoptionApplicationSchema.methods.updateStatus = function(newStatus, reviewerId) {
  this.status = newStatus;
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  
  return this.save();
};

const AdoptionApplication = mongoose.model("AdoptionApplication", adoptionApplicationSchema);

export default AdoptionApplication;
