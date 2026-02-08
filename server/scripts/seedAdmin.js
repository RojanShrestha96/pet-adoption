import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

// Load environment variables
import { config } from "dotenv";
config();

// Admin credentials
const ADMIN_DATA = {
  name: "System Administrator",
  username: "admin",
  email: "admin@petmate.com",
  password: "Admin@123456", 
  role: "super_admin",
  isActive: true,
};

async function seedAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists by email OR username
    const existingAdmin = await Admin.findOne({ 
        $or: [{ email: ADMIN_DATA.email }, { username: ADMIN_DATA.username }] 
    });
    
    if (existingAdmin) {
      console.log("Admin account found.");
      
      // Migration: Add username if missing
      if (!existingAdmin.username) {
        console.log("Migrating admin account to include username...");
        existingAdmin.username = ADMIN_DATA.username;
        await existingAdmin.save();
        console.log("✓ Updated existing admin with username:", ADMIN_DATA.username);
      } else {
         console.log("Admin already has username:", existingAdmin.username);
      }
      
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 10);

    // Create admin
    const admin = await Admin.create({
      ...ADMIN_DATA,
      password: hashedPassword,
    });

    console.log("✓ Admin account created successfully!");
    console.log("Username:", admin.username);
    console.log("Email:", admin.email);
    console.log("Password:", ADMIN_DATA.password);
    console.log("Role:", admin.role);
    console.log("\n⚠️  IMPORTANT: Change this password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
