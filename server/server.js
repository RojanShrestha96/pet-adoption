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
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adoptionRoutes from "./routes/adoptionRoutes.js";
import donationRoutes, { rotateFeaturedPet } from "./routes/donationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import geoRoutes from "./routes/geoRoutes.js";
import testRoutes from "./routes/testRoutes.js";

dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/shelter", shelterRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/applications", adoptionRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/geocode", geoRoutes);       // Public geocoding endpoint
app.use("/api/test", testRoutes);         // Internal test utility

// MongoDB connection
// MongoDB connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log(`Attempting to connect to MongoDB at: ${uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED'}`);
    const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};



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
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

// One-time migration: convert legacy boolean compatibility fields to new string enums.
// One-time migration: convert legacy boolean compatibility fields to new string enums.
const migrateCompatibilityFields = async () => {
  try {
    const Pet = mongoose.model('Pet');
    
    // Fix goodWithKids: true -> 'yes', false -> 'no'
    const res1 = await Pet.updateMany(
      { 'compatibility.goodWithKids': true },
      { $set: { 'compatibility.goodWithKids': 'yes' } }
    );
    const res2 = await Pet.updateMany(
      { 'compatibility.goodWithKids': false },
      { $set: { 'compatibility.goodWithKids': 'no' } }
    );
    
    // Fix goodWithPets: true -> 'yes', false -> 'no'
    const res3 = await Pet.updateMany(
      { 'compatibility.goodWithPets': true },
      { $set: { 'compatibility.goodWithPets': 'yes' } }
    );
    const res4 = await Pet.updateMany(
      { 'compatibility.goodWithPets': false },
      { $set: { 'compatibility.goodWithPets': 'no' } }
    );

    const totalFixed = res1.modifiedCount + res2.modifiedCount + res3.modifiedCount + res4.modifiedCount;
    
    if (totalFixed > 0) {
      console.log(`[Migration] Success: Fixed ${totalFixed} legacy compatibility field(s).`);
    } else {
      console.log('[Migration] Database is clean.');
    }
  } catch (err) {
    console.error('[Migration] Error:', err.message);
  }
};

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Run migration
  migrateCompatibilityFields().catch(console.error);

  // Featured pet rotation — every 6 hours
  rotateFeaturedPet().catch(console.error); // Run once on startup
  setInterval(() => {
    rotateFeaturedPet().catch(console.error);
  }, SIX_HOURS_MS);
  console.log("[FeaturedPet] Rotation job started (every 6h)");
});
