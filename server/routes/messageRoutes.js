import express from "express";
import {
  createOrGetConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  deleteConversation
} from "../controllers/messageController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Base path: /api/messages

router.use(verifyToken); // All routes require auth

router.post("/", createOrGetConversation);
router.get("/conversations", getUserConversations);
router.get("/:conversationId", getMessages);
router.post("/send", sendMessage);
router.delete("/conversations/:conversationId", deleteConversation);

export default router;
