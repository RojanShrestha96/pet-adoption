import express from "express";
import { verifyToken, requireShelter } from "../middleware/authMiddleware.js";
import { getMyShelterProfile, updateShelterProfile, getShelterById, getAllShelters } from "../controllers/shelterController.js";

const router = express.Router();

// Protected Routes (Specific /me routes must be first)
router.get("/me", verifyToken, requireShelter, getMyShelterProfile);
router.put("/me", verifyToken, requireShelter, updateShelterProfile);

// Public Routes (Generic /:id route must be last)
router.get("/", getAllShelters);
router.get("/:id", getShelterById);

export default router;
