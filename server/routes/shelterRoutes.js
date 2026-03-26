import express from "express";
import { verifyToken, requireShelter } from "../middleware/authMiddleware.js";
import { getMyShelterProfile, updateShelterProfile, getShelterById, getAllShelters, getShelterAnalytics, getShelterDonationStats } from "../controllers/shelterController.js";

const router = express.Router();

// Protected Routes (Specific /me routes must be first)
router.get("/me", verifyToken, requireShelter, getMyShelterProfile);
router.put("/me", verifyToken, requireShelter, updateShelterProfile);
router.get("/analytics", verifyToken, requireShelter, getShelterAnalytics);
router.get("/donations/my-stats", verifyToken, requireShelter, getShelterDonationStats);

// Public Routes (Generic /:id route must be last)
router.get("/", getAllShelters);
router.get("/:id", getShelterById);

export default router;
