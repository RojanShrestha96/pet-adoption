import express from "express";
import { getStories, createStory } from "../controllers/storyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getStories);
router.post("/", verifyToken, createStory);

export default router;
