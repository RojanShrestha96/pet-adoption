import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import shelterRoutes from "./routes/shelterRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/shelter", shelterRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/upload", uploadRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.io Setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"]
  }
});

// Store active users: userId -> socketId
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User joins their own room for notifications
  socket.on("join_user", (userId) => {
    socket.join(`user_${userId}`);
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  // Join a specific conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation_${conversationId}`);
  });

  // Send message event
  socket.on("send_message", (data) => {
    // data: { conversationId, senderId, text, recipientId }
    // Emit to conversation room (for active chatters)
    socket.to(`conversation_${data.conversationId}`).emit("receive_message", data);

    // Emit notification to recipient's personal room (for badges/lists)
    socket.to(`user_${data.recipientId}`).emit("new_message_notification", {
      conversationId: data.conversationId,
      senderId: data.senderId,
      text: data.text,
      createdAt: new Date()
    });
  });

  // Typing indicator event
  socket.on("typing", (data) => {
    // data: { conversationId, userId, userName }
    // Broadcast to others in the conversation
    socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
      conversationId: data.conversationId,
      userId: data.userId,
      userName: data.userName
    });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Make io accessible in routes if needed (e.g. app.set('io', io))
app.set('io', io);

// Test route
app.get("/", (req, res) => {
  res.send("PetMate Backend is running!");
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
