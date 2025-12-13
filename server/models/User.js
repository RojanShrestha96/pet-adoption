import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true, trim: true },
    profileImage: { type: String },
    bio: { type: String, trim: true },
    address: { type: String, trim: true },
    isEmailVerified: { type: Boolean, default: false },
    emailOTP: { type: String },
    emailOTPExpires: { type: Date },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    preferences: {
      petTypes: [String],
      notifyAdoptions: { type: Boolean, default: true },
    },
    theme: { type: String, default: 'friendly' },
    adoptedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
    favoritePets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
    applicationsSent: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
