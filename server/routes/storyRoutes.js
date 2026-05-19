import express from "express";
import { getStories, submitStory, createStory } from "../controllers/storyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — anyone can view stories
router.get("/", getStories);

// Authenticated — adopter submits their own story after a completed adoption
router.post("/submit", verifyToken, submitStory);

// Admin/manual story creation (kept for backwards compatibility)
router.post("/", verifyToken, createStory);

export default router;
