import mongoose from "mongoose";

const shelterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    description: { type: String, trim: true },
    website: { type: String, trim: true },
    logo: { type: String },
    coverImage: { type: String },
    contactPerson: { type: String, trim: true },
    isEmailVerified: { type: Boolean, default: false },
    emailOTP: { type: String },
    emailOTPExpires: { type: Date },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    adminNotes: { type: String, default: '' },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    totalPets: { type: Number, default: 0 },
    adoptionsSheltered: { type: Number, default: 0 },
    
    // Read-only tracking fields. Money flows directly to shelter via eSewa. PetMate does not hold funds.
    totalFundsAllocated: { type: Number, default: 0 },
    totalDonationsThisMonth: { type: Number, default: 0 },
    // @deprecated - kept for backward compatibility, use totalDonationsThisMonth instead.
    pendingPayout: { type: Number, default: 0 },
    
    theme: { type: String, default: 'friendly' },
    establishedDate: { type: Date },
    operatingHours: {
      sunday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
      monday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
      tuesday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
      wednesday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
      thursday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
      friday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } },
      saturday: { open: { type: String }, close: { type: String }, closed: { type: Boolean, default: false } }
    },
    // GeoJSON Point — required for $geoNear / 2dsphere queries.
    // coordinates order: [longitude, latitude] (GeoJSON standard)
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined }, // [lng, lat]
      formattedAddress: { type: String, trim: true }
    },
    documentation: [{
      title: { type: String },
      url: { type: String },
      type: { type: String }, // 'license', 'certificate', etc.
      uploadedAt: { type: Date, default: Date.now }
    }],
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        applicationUpdates: { type: Boolean, default: true }
      },
      publicVisibilty: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

// Required for $geoNear and $near geospatial queries
shelterSchema.index({ location: '2dsphere' });

export default mongoose.model("Shelter", shelterSchema);
