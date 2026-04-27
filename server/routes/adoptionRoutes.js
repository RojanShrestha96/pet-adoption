import express from "express";
import { verifyToken, requireAdopter, requireShelter, requireActiveUser } from "../middleware/authMiddleware.js";
import {
  createApplication,
  getShelterApplications,
  getApplicationById,
  updateApplicationStatus,
  getAdopterApplications,
  getShelterApplicationStats,
  getAdopterApplicationById,
  updateDocumentStatus,
  cancelApplication,
  regenerateInsights
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
router.post("/", verifyToken, requireAdopter, requireActiveUser, createApplication);

// Get adopter's own applications
router.get("/adopter/my-applications", verifyToken, requireAdopter, getAdopterApplications);

// Get single application detail (for adopter who created it)
router.get("/adopter/:id", verifyToken, requireAdopter, getAdopterApplicationById);

// Compatibility score for a pet (adopter only)
router.get("/compatibility/:petId", verifyToken, requireAdopter, getCompatibilityScore);

// ============ MEET & GREET - ADOPTER ROUTES ============
// Submit availability for meet & greet
router.post("/:id/availability", verifyToken, requireAdopter, requireActiveUser, submitAvailability);

// Request reschedule
router.put("/:id/reschedule-request", verifyToken, requireAdopter, requireActiveUser, requestReschedule);

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

// Regenerate AI Insights
router.post("/:id/regenerate-insights", verifyToken, requireShelter, regenerateInsights);

// Update application status
router.put("/:id/status", verifyToken, requireShelter, updateApplicationStatus);

// Update document verification status
router.put("/:id/documents/status", verifyToken, requireShelter, updateDocumentStatus);

// ============ FINALIZATION PIPELINE ROUTES ============
import * as finalizationController from "../controllers/adoptionFinalizationController.js";

// Adopter + Shelter Shared
router.get("/:id/finalize/status", verifyToken, finalizationController.getFinalizationStatus);

// Shelter Actions
router.post("/:id/finalize/initialize", verifyToken, requireShelter, finalizationController.initializeFinalization);
router.post("/:id/finalize/confirm-fee", verifyToken, requireShelter, finalizationController.confirmFee);
router.post("/:id/finalize/confirm-ready", verifyToken, requireShelter, finalizationController.confirmReadyForPickup);
router.post("/:id/finalize/confirm-handover", verifyToken, requireShelter, finalizationController.confirmHandover);
router.post("/:id/finalize/revert", verifyToken, requireShelter, finalizationController.revertToMeetingComplete);

// Adopter Actions
router.post("/:id/finalize/initiate-payment", verifyToken, requireAdopter, finalizationController.initiateAdoptionPayment);
router.post("/:id/finalize/sign-contract", verifyToken, requireAdopter, finalizationController.submitSignature);

// System Actions (eSewa callbacks — these routes might be hit by user redirect, so token might not be in headers)
// Usually eSewa redirect is a GET request with query params
router.get("/:id/finalize/verify-payment", finalizationController.verifyAdoptionPayment);
router.post("/:id/finalize/payment-failure", finalizationController.handlePaymentFailure);
router.get("/:id/finalize/payment-failure", finalizationController.handlePaymentFailure);

export default router;
