import express from "express";
import { verifyToken, requireShelter, requireAdmin } from "../middleware/authMiddleware.js";
import { getAdopterProfileById } from "../controllers/adopterProfileController.js";

const router = express.Router();

// Allow both shelters and admins to view any adopter's profile by ID
router.get("/:id", verifyToken, getAdopterProfileById);

export default router;
