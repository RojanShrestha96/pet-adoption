
import express from "express";
import mongoose from "mongoose";
import Pet from "../models/Pet.js";
import Shelter from "../models/Shelter.js";
import Donation from "../models/Donation.js";
import { verifyToken, requireAdmin, requireActiveUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/donations/my-donations
// Returns all donations made by the logged-in user
// ─────────────────────────────────────────────
router.get("/my-donations", verifyToken, async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id, status: "completed" })
      .populate("petId", "name species images")
      .populate("shelterId", "name city address")
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, donations });
  } catch (error) {
    console.error("Fetch user donations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your donations" });
  }
});

// ─────────────────────────────────────────────
// GET /api/donations/pet-stats/:petId
// Returns donation stats for a specific pet
// ─────────────────────────────────────────────
router.get("/pet-stats/:petId", async (req, res) => {
  try {
    const { petId } = req.params;

    const stats = await Donation.aggregate([
      {
        $match: {
          petId: new mongoose.Types.ObjectId(petId),
          status: "completed"
        }
      },
      {
        $group: {
          _id: null,
          totalRaised: { $sum: "$amount" },
          donorCount: { $sum: 1 } // Simple count of completed donations as requested
        }
      }
    ]);

    const result = stats[0] || { totalRaised: 0, donorCount: 0 };
    // Hardcoded goal amount as requested
    result.goalAmount = 50000;

    res.status(200).json({ success: true, stats: result });
  } catch (error) {
    console.error("Fetch pet stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pet stats" });
  }
});

// ─────────────────────────────────────────────
// GET /api/donations/featured-pet
// Returns the currently featured pet (with shelter name)
// ─────────────────────────────────────────────
router.get("/featured-pet", async (req, res) => {
  try {
    // Find the currently featured pet
    let pet = await Pet.findOne({
      isFeatured: true,
      reviewStatus: "approved",
      adoptionStatus: { $in: ["available", "pending"] }
    }).populate("shelter", "name city");

    // If no featured pet exists, pick the most recently approved available pet
    if (!pet) {
      pet = await Pet.findOne({
        reviewStatus: "approved",
        adoptionStatus: { $in: ["available", "pending"] }
      })
        .sort({ createdAt: -1 })
        .populate("shelter", "name city");
    }

    if (!pet) {
      return res.status(404).json({ 
        success: false, 
        message: "No featured pet available at this time" 
      });
    }

    // Fetch stats for this featured pet
    const stats = await Donation.aggregate([
      {
        $match: {
          petId: pet._id,
          status: "completed"
        }
      },
      {
        $group: {
          _id: null,
          totalRaised: { $sum: "$amount" },
          donorCount: { $sum: 1 }
        }
      }
    ]);

    const resultStats = stats[0] || { totalRaised: 0, donorCount: 0 };
    resultStats.goalAmount = 50000;

    res.status(200).json({ 
      success: true, 
      pet,
      stats: resultStats 
    });
  } catch (error) {
    console.error("Featured pet fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch featured pet" });
  }
});

// ─────────────────────────────────────────────
// GET /api/donations/pets
// Returns all available pets for the pet picker
// ─────────────────────────────────────────────
router.get("/pets", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const pets = await Pet.find({
      reviewStatus: "approved",
      adoptionStatus: { $in: ["available", "pending"] }
    })
      .select("name species images donationStory donationCount isFeatured shelter")
      .populate("shelter", "name")
      .sort({ isFeatured: -1, donationCount: 1 }) // featured first, least-donated first
      .skip(skip)
      .limit(limit);

    const total = await Pet.countDocuments({
      reviewStatus: "approved",
      adoptionStatus: { $in: ["available", "pending"] }
    });

    res.status(200).json({ 
      success: true, 
      pets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Pets list fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pets" });
  }
});

// ─────────────────────────────────────────────
// GET /api/donations/stories
// Returns recent completed donations with messages for the Rescue Stories carousel
// ─────────────────────────────────────────────
router.get("/stories", async (req, res) => {
  try {
    const stories = await Donation.find({
      status: "completed",
      message: { $exists: true, $type: "string", $ne: "" },
    })
      .populate("petId", "name species images donationStory")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ success: true, stories });
  } catch (error) {
    console.error("Fetch stories error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rescue stories" });
  }
});

// ─────────────────────────────────────────────
// PUT /api/donations/:id/message
// Updates the message for a specific donation
// ─────────────────────────────────────────────
router.put("/:id/message", verifyToken, requireActiveUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (message && message.length > 150) {
      return res.status(400).json({ success: false, message: "Message is too long (max 150 chars)." });
    }

    const donation = await Donation.findOne({ _id: id, userId: req.user._id });

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found or unauthorized." });
    }

    if (donation.status !== "completed") {
      return res.status(400).json({ success: false, message: "Only completed donations can have messages." });
    }

    if (donation.message) {
      return res.status(400).json({ success: false, message: "A message has already been set for this donation and cannot be changed." });
    }

    donation.message = message;
    await donation.save();

    res.status(200).json({ success: true, message: "Message updated successfully", donation });
  } catch (error) {
    console.error("Update donation message error:", error);
    res.status(500).json({ success: false, message: "Failed to update message" });
  }
});

// ─────────────────────────────────────────────
// POST /api/donations/admin/set-featured
// Admin manually sets a featured pet
// ─────────────────────────────────────────────
router.post("/admin/set-featured", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { petId } = req.body;
    if (!petId) {
      return res.status(400).json({ success: false, message: "petId is required" });
    }

    // Unfeature all current featured pets
    await Pet.updateMany({ isFeatured: true }, { 
      isFeatured: false, 
      featuredUntil: null,
      lastFeaturedAt: new Date()
    });

    // Feature the selected pet
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const pet = await Pet.findByIdAndUpdate(
      petId,
      { 
        isFeatured: true, 
        featuredUntil: new Date(Date.now() + SIX_HOURS),
        lastFeaturedAt: new Date()
      },
      { new: true }
    ).populate("shelter", "name");

    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    res.status(200).json({ success: true, message: "Featured pet updated", pet });
  } catch (error) {
    console.error("Set featured pet error:", error);
    res.status(500).json({ success: false, message: "Failed to set featured pet" });
  }
});

// ─────────────────────────────────────────────
// POST /api/donations/rotate-featured  (internal / cron)
// Round-robin rotation: pick the least recently featured eligible pet
// ─────────────────────────────────────────────
router.post("/rotate-featured", async (req, res) => {
  try {
    await rotateFeaturedPet();
    res.status(200).json({ success: true, message: "Featured pet rotated" });
  } catch (error) {
    console.error("Rotate featured error:", error);
    res.status(500).json({ success: false, message: "Rotation failed" });
  }
});

// ─────────────────────────────────────────────
// Rotation logic (also exported for server.js cron)
// ─────────────────────────────────────────────
export async function rotateFeaturedPet() {
  const eligiblePets = await Pet.find({
    reviewStatus: "approved",
    adoptionStatus: { $in: ["available", "pending"] }
  }).sort({ lastFeaturedAt: 1 }); // null comes first (never featured), then oldest

  if (eligiblePets.length === 0) return;

  // Un-feature current
  await Pet.updateMany({ isFeatured: true }, { 
    isFeatured: false, 
    featuredUntil: null,
    lastFeaturedAt: new Date()
  });

  // Pick next: first in sorted list that isn't currently featured
  const nextPet = eligiblePets[0];
  const SIX_HOURS = 6 * 60 * 60 * 1000;

  await Pet.findByIdAndUpdate(nextPet._id, {
    isFeatured: true,
    featuredUntil: new Date(Date.now() + SIX_HOURS),
    lastFeaturedAt: new Date()
  });

  console.log(`[FeaturedPet] Rotated to: ${nextPet.name} (${nextPet._id})`);
}

export default router;
