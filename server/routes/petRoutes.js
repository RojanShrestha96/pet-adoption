import express from "express";
import { verifyToken, requireShelter, requireAdmin, requireAdopter } from "../middleware/authMiddleware.js";
import {
  createPet,
  getShelterPets,
  getPetById,
  updatePet,
  deletePet,
  getApprovedPets,
  getPendingReviewPets,
  reviewPet,
  getCompatibilityPreview,
  getPetsNearby
} from "../controllers/petController.js";

const router = express.Router();

// ============ PUBLIC ROUTES ============
// Nearby pets (MUST be before /:id to avoid route conflict)
router.get("/nearby", getPetsNearby);

// Get all approved pets (for adopters)
router.get("/", getApprovedPets);

// Get single pet by ID
router.get("/:id", getPetById);

// Compatibility preview (adopter only)
router.get("/:id/compatibility-preview", verifyToken, requireAdopter, getCompatibilityPreview);

// ============ SHELTER ROUTES ============
// Create a new pet (requires shelter auth)
router.post("/", verifyToken, requireShelter, createPet);

// Get shelter's own pets
router.get("/shelter/my-pets", verifyToken, requireShelter, getShelterPets);

// Update a pet
router.put("/:id", verifyToken, requireShelter, updatePet);

// Delete a pet
router.delete("/:id", verifyToken, requireShelter, deletePet);

// ============ ADMIN ROUTES ============
// Get pets pending review
router.get("/admin/pending", verifyToken, requireAdmin, getPendingReviewPets);

// Approve or reject a pet
router.post("/admin/review/:id", verifyToken, requireAdmin, reviewPet);

export default router;
