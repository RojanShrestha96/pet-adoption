
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
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

export default mongoose.model("Donation", donationSchema);
