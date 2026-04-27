import User from "../models/User.js";
import Shelter from "../models/Shelter.js";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOTP, sendOTPEmail, verifyOTP } from "../utils/emailService.js";
import { getFileUrl } from "../middleware/uploadMiddleware.js";

// SIGN UP - ADOPTER
export const registerAdopter = async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validate required fields
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate phone number - must be exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone.replaceAll(/\D/g, ""))) {
    return res
      .status(400)
      .json({ message: "Phone number must be exactly 10 digits" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate password strength
  if (password.length < 16) {
    return res
      .status(400)
      .json({ message: "Password must be at least 16 characters" });
  }

  // Check if email exists in EITHER User or Shelter collection
  let existingEmail = await User.findOne({ email });
  if (!existingEmail) {
    existingEmail = await Shelter.findOne({ email });
  }
  if (existingEmail) {
    return res.status(409).json({ message: "Email already registered" });
  }

  // Check if phone exists in EITHER User or Shelter collection
  let existingPhone = await User.findOne({ phone });
  if (!existingPhone) {
    existingPhone = await Shelter.findOne({ phone });
  }
  if (existingPhone) {
    return res.status(409).json({ message: "Phone number already registered" });
  }

  try {
    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Generate OTP (6 digits)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create adopter user
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      phone,
      emailOTP: otp,
      emailOTPExpires: otpExpires,
    });

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    return res.status(201).json({
      message:
        "Adopter signup successful. Check your email for OTP verification code.",
      userId: newUser._id,
      userEmail: newUser.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
};

// SIGN UP - SHELTER
export const registerShelter = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    city,
    state,
    zipCode,
    contactPerson,
  } = req.body;

  // Validate required fields
  // Validate required fields
  if (!name || !email || !password || !phone) {
    return res
      .status(400)
      .json({ message: "Missing required fields for shelter" });
  }

  // Validate phone number - must be exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone.replaceAll(/\D/g, ""))) {
    return res
      .status(400)
      .json({ message: "Phone number must be exactly 10 digits" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate password strength
  if (password.length < 16) {
    return res
      .status(400)
      .json({ message: "Password must be at least 16 characters" });
  }

  // Check if email exists in EITHER Shelter or User collection
  let existingEmail = await Shelter.findOne({ email });
  if (!existingEmail) {
    existingEmail = await User.findOne({ email });
  }
  if (existingEmail) {
    return res.status(409).json({ message: "Email already registered" });
  }

  // Check if phone exists in EITHER Shelter or User collection
  let existingPhone = await Shelter.findOne({ phone });
  if (!existingPhone) {
    existingPhone = await User.findOne({ phone });
  }
  if (existingPhone) {
    return res.status(409).json({ message: "Phone number already registered" });
  }

  try {
    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Generate OTP (6 digits)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create shelter
    const newShelter = await Shelter.create({
      name,
      email,
      password: hashed,
      phone,
      address,
      city,
      state,
      zipCode,
      contactPerson,
      emailOTP: otp,
      emailOTPExpires: otpExpires,
    });

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    return res.status(201).json({
      message:
        "Shelter signup successful. Check your email for OTP verification code.",
      userId: newShelter._id,
      userEmail: newShelter.email,
    });
  } catch (error) {
    console.error("Shelter registration error:", error);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Try to find user (adopter) first
    let user = await User.findOne({ email });
    let userType = "adopter";

    // If not found, try to find shelter
    if (!user) {
      user = await Shelter.findOne({ email });
      userType = "shelter";
    }

    // User not found
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if banned
    if (user.status === 'banned') {
      return res.status(403).json({ 
        message: `Account suspended/banned. Reason: ${user.statusReason || 'Violation of platform guidelines.'}` 
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        bio: user.bio || "",
        address: user.address || "",
        type: userType,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// VERIFY OTP
export const verifyOTPCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Try to verify in User collection first
    let user = await User.findOne({
      email: email,
      emailOTP: otp,
      emailOTPExpires: { $gt: Date.now() },
    });

    if (user) {
      user.isEmailVerified = true;
      user.emailOTP = null;
      user.emailOTPExpires = null;
      await user.save();

      return res.status(200).json({
        message: "Email verified successfully",
        userType: "adopter",
        email: user.email,
        name: user.name,
      });
    }

    // Try to verify in Shelter collection
    let shelter = await Shelter.findOne({
      email: email,
      emailOTP: otp,
      emailOTPExpires: { $gt: Date.now() },
    });

    if (shelter) {
      shelter.isEmailVerified = true;
      shelter.emailOTP = null;
      shelter.emailOTPExpires = null;
      await shelter.save();

      return res.status(200).json({
        message: "Email verified successfully",
        userType: "shelter",
        email: shelter.email,
        name: shelter.name,
      });
    }

    return res.status(400).json({ message: "Invalid or expired OTP" });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res
      .status(500)
      .json({ message: "Server error during OTP verification" });
  }
};

// FORGOT PASSWORD - Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Normalize email for case-insensitive search
    const normalizedEmail = email.trim().toLowerCase();

    // Find user in either User or Shelter collection
    let user = await User.findOne({ email: normalizedEmail });
    let userType = "adopter";

    if (!user) {
      user = await Shelter.findOne({ email: normalizedEmail });
      userType = "shelter";
    }

    if (!user) {
      // Email doesn't exist - return 404 to prevent processing
      return res.status(404).json({
        message: "Email not found in our system",
        found: false,
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, type: userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save reset token to user (for verification later)
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset link via email
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "PetMate - Password Reset Link",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h1 style="color: #333;">Password Reset Request</h1>
            <p style="color: #666; font-size: 16px;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${resetLink}" style="
                background-color: #007bff;
                color: white;
                padding: 12px 30px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
              ">
                Reset Password
              </a>
            </div>

            <p style="color: #666; margin-top: 20px;">
              This link will expire in 1 hour.
            </p>

            <p style="color: #666; margin-top: 20px;">
              If you didn't request this, please ignore this email.
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              © 2025 PetMate. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    // Import nodemailer here to send email
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Password reset link has been sent to your email",
      found: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ message: "Server error during password reset" });
  }
};

// RESET PASSWORD - Submit new password
export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token, email, and new password are required" });
    }

    // Validate password strength
    if (newPassword.length < 16) {
      return res
        .status(400)
        .json({ message: "Password must be at least 16 characters" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Find user
    let user = await User.findOne({ email, resetToken: token });
    let userType = "adopter";

    if (!user) {
      user = await Shelter.findOne({ email, resetToken: token });
      userType = "shelter";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid reset token or email" });
    }

    // Check if token has expired
    if (user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
      userType,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ message: "Server error during password reset" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { bio, address, phone } = req.body;
    const userId = req.user.userId;
    const userType = req.user.type;

    let user;
    if (userType === "adopter") {
      user = await User.findByIdAndUpdate(
        userId,
        { bio, address, phone },
        { new: true, runValidators: true }
      );
    } else {
      user = await Shelter.findByIdAndUpdate(
        userId,
        { bio, address, phone },
        { new: true, runValidators: true }
      );
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        bio: user.bio || "",
        address: user.address || "",
        type: userType,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res
      .status(500)
      .json({ message: "Server error during profile update" });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    const userType = req.user.type;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new passwords are required" });
    }

    if (newPassword.length < 16) {
      return res
        .status(400)
        .json({ message: "New password must be at least 16 characters" });
    }

    let user;
    if (userType === "adopter") {
      user = await User.findById(userId);
    } else {
      user = await Shelter.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res
      .status(500)
      .json({ message: "Server error during password change" });
  }
};

// GET PROFILE (Populated with favorites)
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.type;

    let user;
    if (userType === "adopter") {
      user = await User.findById(userId)
        .populate("favoritePets")
        .populate("adoptedPets")
        .populate("applicationsSent");
    } else if (userType === "admin") {
      user = await Admin.findById(userId);
    } else {
      user = await Shelter.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert to plain object to modify if needed
    const userData = user.toObject();

    // Ensure favoritePets is always an array
    if (!userData.favoritePets) {
      userData.favoritePets = [];
    }

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        bio: user.bio,
        address: user.address,
        type: userType,
        profileImage: user.profileImage,
        favoritePets: userData.favoritePets,
        adoptedPets: userData.adoptedPets,
        applicationsSent: userData.applicationsSent,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
};

// TOGGLE FAVORITE PET
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { petId } = req.params;

    // Only adopters can have favorites for now
    if (req.user.type !== "adopter") {
      return res
        .status(403)
        .json({ message: "Only adopters can save favorites" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if pet is already favorited
    const isFavorited = user.favoritePets.includes(petId);

    if (isFavorited) {
      // Remove from favorites
      user.favoritePets = user.favoritePets.filter(
        (id) => id.toString() !== petId
      );
    } else {
      // Add to favorites
      user.favoritePets.push(petId);
    }

    await user.save();

    // Return updated list populated
    await user.populate("favoritePets");

    return res.status(200).json({
      message: isFavorited ? "Removed from favorites" : "Added to favorites",
      isFavorited: !isFavorited,
      favoritePets: user.favoritePets,
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return res.status(500).json({ message: "Server error toggling favorite" });
  }
};

// UPDATE PROFILE IMAGE
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const userId = req.user.userId;
    const userType = req.user.type;
    const imageUrl = getFileUrl(req.file);

    let user;
    if (userType === "adopter") {
      user = await User.findByIdAndUpdate(
        userId,
        { profileImage: imageUrl },
        { new: true }
      );
    } else {
      user = await Shelter.findByIdAndUpdate(
        userId,
        { logo: imageUrl }, // Shelter uses 'logo' as profile image
        { new: true }
      );
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: imageUrl,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: userType === "adopter" ? user.profileImage : user.logo,
        type: userType,
      },
    });
  } catch (error) {
    console.error("Update profile image error:", error);
    return res.status(500).json({ message: "Server error updating profile image" });
  }
};
