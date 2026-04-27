import mongoose from "mongoose";

const successStorySchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdoptionApplication",
      required: true,
      unique: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    adopter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: true,
    },
    story: {
      type: String,
      required: true,
    },
    quote: {
      type: String,
      default: "A perfect match made on PetMate!",
    },
    petImage: {
      type: String,
      required: true,
    },
    ownerImage: {
      type: String,
      default: "",
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published"],
      default: "published", // Default to published for real adoptions for now
    },
  },
  { timestamps: true }
);

const SuccessStory = mongoose.model("SuccessStory", successStorySchema);

export default SuccessStory;
