
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  // Pet-first fields
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  type: {
    type: String,
    enum: ["pet", "general"],
    default: "pet",
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pet",
    default: null,
  },
  shelterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shelter",
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // Payment fields
  amount: {
    type: Number,
    required: true,
  },
  donorName: {
    type: String,
    default: "Anonymous",
  },
  donorEmail: {
    type: String,
  },
  message: {
    type: String,
  },
  transactionUuid: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    default: "esewa",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

donationSchema.index({ petId: 1 });
donationSchema.index({ shelterId: 1 });
donationSchema.index({ userId: 1 });
donationSchema.index({ status: 1 });

export default mongoose.model("Donation", donationSchema);
