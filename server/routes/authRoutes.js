import express from "express";
import {
  registerAdopter,
  registerShelter,
  loginUser,
  verifyOTPCode,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getProfile,
  toggleFavorite
} from "../controllers/authController.js";
import { verifyToken, requireAdopter } from "../middleware/authMiddleware.js";
import {
  getAdopterProfile,
  upsertAdopterProfile,
} from "../controllers/adopterProfileController.js";

const router = express.Router();

// Adopter routes
router.post("/register/adopter", registerAdopter);

// Shelter routes
router.post("/register/shelter", registerShelter);

// OTP verification
router.post("/verify-otp", verifyOTPCode);

// Login (supports both adopter and shelter)
router.post("/login", loginUser);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Profile update (protected route)
router.put("/profile", verifyToken, updateProfile);
router.post("/change-password", verifyToken, changePassword);

// New endpoints for favorites system
router.get("/profile", verifyToken, getProfile);
router.put("/profile/favorites/:petId", verifyToken, toggleFavorite);

// ── Adopter persistent profile (reusable adoption info) ──
router.get("/adopter-profile", verifyToken, requireAdopter, getAdopterProfile);
router.put("/adopter-profile", verifyToken, requireAdopter, upsertAdopterProfile);

export default router;
