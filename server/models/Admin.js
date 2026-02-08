import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, lowercase: true, sparse: true }, // Sparse allows null/undefined to not conflict
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['super_admin', 'moderator', 'admin'], 
      default: 'admin' 
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

// Virtual property to check if account is locked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

export default mongoose.model("Admin", adminSchema);
