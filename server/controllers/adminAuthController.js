import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logAdminAction } from "../utils/auditLogger.js";

// Maximum login attempts before account lock
const MAX_LOGIN_ATTEMPTS = 5;
// Lock duration in milliseconds (30 minutes)
const LOCK_TIME = 30 * 60 * 1000;

// ADMIN LOGIN
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    // Find admin by username (case insensitive)
    const admin = await Admin.findOne({ 
       username: { $regex: new RegExp(`^${username}$`, 'i') } 
    });

    // Admin not found
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({ 
        message: "Account is deactivated. Please contact system administrator." 
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      const lockTimeRemaining = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
      return res.status(403).json({ 
        message: `Account is locked due to multiple failed login attempts. Try again in ${lockTimeRemaining} minutes.` 
      });
    }

    // Check password
    const match = await bcrypt.compare(password, admin.password);
    
    if (!match) {
      // Increment login attempts
      admin.loginAttempts += 1;

      // Lock account if max attempts reached
      if (admin.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        admin.lockUntil = new Date(Date.now() + LOCK_TIME);
        await admin.save();
        return res.status(403).json({ 
          message: "Account locked due to multiple failed login attempts. Try again in 30 minutes." 
        });
      }

      await admin.save();
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - admin.loginAttempts;
      return res.status(401).json({ 
        message: `Invalid credentials. ${attemptsLeft} attempt(s) remaining.` 
      });
    }

    // Successful login - reset login attempts and update last login
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    admin.lastLogin = new Date();
    await admin.save();

    // Log the action
    await logAdminAction(admin._id, "LOGIN", "System", "Admin logged in successfully", "success");

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: admin._id,
        email: admin.email,
        type: "admin",
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Admin tokens expire after 24 hours for security
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: "admin",
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// GET ADMIN PROFILE
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.userId;

    const admin = await Admin.findById(adminId).select('-password');

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    return res.status(200).json({
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: "admin",
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
};

// UPDATE ADMIN PROFILE
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { name, email, currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update basic info
    if (name) admin.name = name;
    if (email && email !== admin.email) {
       const existingEmail = await Admin.findOne({ email });
       if (existingEmail) {
         return res.status(400).json({ message: "Email already in use" });
       }
       admin.email = email;
    }

    // Update password if requested
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid current password" });
      }
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();

    await logAdminAction(
      adminId, 
      currentPassword && newPassword ? "UPDATE_PASSWORD" : "UPDATE_PROFILE", 
      "Self", 
      "Updated profile settings", 
      "info"
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: "admin",
        isActive: admin.isActive,
      }
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    return res.status(500).json({ message: "Server error updating profile" });
  }
};

// CREATE NEW ADMIN (Super Admin only)
export const createAdmin = async (req, res) => {
  const { name, username, email, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Username, password, and role are required" });
  }

  try {
    // Check if username already exists
    const existingUsername = await Admin.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') } 
    });
    if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Check email if provided
    let processedEmail = undefined;
    if (email && email.trim() !== '') {
        processedEmail = email.trim().toLowerCase();
        const existingEmail = await Admin.findOne({ email: processedEmail });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = await Admin.create({
      name: name ? name.trim() : username.trim(), // Default name to username if not provided
      username: username.trim(),
      email: processedEmail,
      password: hashedPassword,
      role,
    });

    await logAdminAction(
      req.user.userId, 
      "CREATE_ADMIN", 
      `Admin: ${newAdmin.username}`, 
      `Created new admin with role ${role}`, 
      "success"
    );

    return res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return res.status(500).json({ message: "Server error creating admin" });
  }
};

// GET ALL ADMINS (Super Admin only)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(admins);
  } catch (error) {
    console.error("Get all admins error:", error);
    return res.status(500).json({ message: "Server error fetching admins" });
  }
};

// DELETE ADMIN (Super Admin only)
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting self
    if (id === req.user.userId) {
        return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await logAdminAction(
      req.user.userId, 
      "DELETE_ADMIN", 
      `Admin: ${admin.username}`, 
      `Deleted admin account`, 
      "danger"
    );

    return res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete admin error:", error);
    return res.status(500).json({ message: "Server error deleting admin" });
  }
};
