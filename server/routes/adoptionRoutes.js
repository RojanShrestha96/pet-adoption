import express from "express";
import { verifyToken, requireAdopter, requireShelter } from "../middleware/authMiddleware.js";
import {
  createApplication,
  getShelterApplications,
  getApplicationById,
  updateApplicationStatus,
  getAdopterApplications,
  getShelterApplicationStats,
  getAdopterApplicationById,
  updateDocumentStatus,
  cancelApplication
} from "../controllers/adoptionApplicationController.js";
import { getCompatibilityScore } from "../controllers/compatibilityController.js";

// Import meet & greet controllers
import {
  submitAvailability,
  scheduleMeetAndGreet,
  completeMeetAndGreet,
  getShelterMeetAndGreets,
  requestReschedule
} from "../controllers/meetAndGreetController.js";

const router = express.Router();

// ============ ADOPTER ROUTES ============
// Submit new adoption application (requires adopter/user auth)
router.post("/", verifyToken, requireAdopter, createApplication);

// Get adopter's own applications
router.get("/adopter/my-applications", verifyToken, requireAdopter, getAdopterApplications);

// Get single application detail (for adopter who created it)
router.get("/adopter/:id", verifyToken, requireAdopter, getAdopterApplicationById);

// Compatibility score for a pet (adopter only)
router.get("/compatibility/:petId", verifyToken, requireAdopter, getCompatibilityScore);

// ============ MEET & GREET - ADOPTER ROUTES ============
// Submit availability for meet & greet
router.post("/:id/availability", verifyToken, requireAdopter, submitAvailability);

// Request reschedule
router.put("/:id/reschedule-request", verifyToken, requireAdopter, requestReschedule);

// Cancel / withdraw application
router.delete("/:id/cancel", verifyToken, requireAdopter, cancelApplication);

// ============ SHELTER ROUTES ============
// Get all applications for shelter's pets
router.get("/shelter", verifyToken, requireShelter, getShelterApplications);

// Get application statistics
router.get("/shelter/stats", verifyToken, requireShelter, getShelterApplicationStats);

// ============ MEET & GREET - SHELTER ROUTES ============
// Get all meet & greet schedules for calendar
router.get("/shelter/meet-and-greets", verifyToken, requireShelter, getShelterMeetAndGreets);

// Schedule meet & greet
router.put("/:id/schedule-meeting", verifyToken, requireShelter, scheduleMeetAndGreet);

// Complete meet & greet
router.put("/:id/complete-meeting", verifyToken, requireShelter, completeMeetAndGreet);

// ============ COMMON SHELTER ROUTES ============
// Get single application detail
router.get("/:id", verifyToken, requireShelter, getApplicationById);

// Update application status
router.put("/:id/status", verifyToken, requireShelter, updateApplicationStatus);

// Update document verification status
router.put("/:id/documents/status", verifyToken, requireShelter, updateDocumentStatus);

export default router;
