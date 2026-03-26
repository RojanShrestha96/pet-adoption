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

  // ── Profile Snapshot ──────────────────────────────────────
  // Frozen copy of AdopterProfile at time of submission. Never mutated after save.
  profileSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  // Version number of the snapshot — used for delta detection on shelter view
  profileVersionAtSubmission: {
    type: Number,
    default: null,
  },

  // ── Compatibility Snapshot ────────────────────────────────
  // Full engine output stored at submission time. NEVER re-computed or mutated.
  // Gives shelters an accurate picture of the score at the moment of applying.
  compatibilitySnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },

  // ── AI Insights (cached, server-generated) ────────────────
  // Null until first generated. Regeneratable by shelter staff.
  // Never contains PII — only engine output and anonymised lifestyle signals.
  aiInsights: {
    type: {
      shelter: {
        explanation: { type: String },
        questions: [{ type: String }],
        topConcern: { type: String },
        generatedAt: { type: Date },
        status: { 
          type: String, 
          enum: ['none', 'generating', 'success', 'error'],
          default: 'none'
        },
        error: { type: String }
      },
      adopter: {
        summary: { type: String },
        suggestion: { type: String },
        generatedAt: { type: Date },
        status: { 
          type: String, 
          enum: ['none', 'generating', 'success', 'error'],
          default: 'none'
        },
        error: { type: String }
      },
    },
    default: null,
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
    // Deprecated — low signal, no longer collected in new applications
    timeline: {
      type: String,
      enum: ['immediately', 'within a week', 'within a month', 'just browsing', '']
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
      enum: ['rent', 'own', 'live with family']
    },
    landlordPermission: [String], // URLs if renting
    // Confirms the landlord permission specifically covers this pet's species/size
    landlordPermissionCoversPetType: {
      type: Boolean,
      default: null,
    },
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
    // DEPRECATED — kept for old records only, no longer collected
    adoptionTimeline: String,
    readyForHomeVisit: {
      type: Boolean,
      required: true
    },
    handleVetVisits: {
      type: Boolean,
      required: true
    },
    // ── New questionnaire fields ────────────────────────────
    // "Describe a typical weekday in your home..."
    typicalWeekdayRoutine: { type: String },
    // "If you were unexpectedly unable to care for your pet... backup plan?"
    emergencyCarePlan: { type: String },
    // "What specifically about this pet's personality/needs made you choose them?"
    specificPetMotivation: { type: String },
    // "Have you researched typical monthly costs?..."
    monthlyBudgetEstimate: { type: String },
    // Conditional — only asked when adopter has upcomingLifeChanges in profile
    lifeChangesExplanation: { type: String },
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
      'follow_up_required',
      'follow_up_scheduled',
      'rejected',
      'completed',
      'cancelled'
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
    
    // Structured rejection details (internal only)
    rejectionDetails: {
      reason: {
        type: String,
        enum: [
          'home_not_suitable',
          'energy_mismatch',
          'behavioral_concerns',
          'expectations_mismatch',
          'compatibility_issue',
          'adopter_withdrew',
          'other'
        ]
      },
      customReason: String, // Required when reason is 'other'
      internalNotes: String // Internal observations, NEVER shown to adopter
    },
    
    // Follow-up meeting tracking
    followUpDetails: {
      requiredByDate: Date,
      notes: String,
      secondMeetingScheduled: Boolean
    },
    
    // Follow-up counter (max 2 follow-ups allowed)
    followUpCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 2
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

// Filter out internal data for adopter view (backend security)
adoptionApplicationSchema.methods.getAdopterView = function() {
  const obj = this.toObject();
  
  // Remove all internal/sensitive fields
  if (obj.meetAndGreet) {
    delete obj.meetAndGreet.shelterNotes; // Internal shelter notes
    delete obj.meetAndGreet.rejectionDetails; // Structured rejection data
  }
  delete obj.notes; // Internal shelter notes
  delete obj.reviewedBy; // Staff metadata
  
  return obj;
};

const AdoptionApplication = mongoose.model("AdoptionApplication", adoptionApplicationSchema);

export default AdoptionApplication;
