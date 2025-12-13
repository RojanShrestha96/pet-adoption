import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure your email service
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your PetMate Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h1 style="color: #333;">Welcome to PetMate, ${userName}!</h1>
            <p style="color: #666; font-size: 16px;">
              Thank you for signing up. Please use the following code to verify your email address.
            </p>
            
            <div style="margin: 30px 0; text-align: center;">
              <div style="
                background-color: #007bff;
                color: white;
                padding: 20px;
                border-radius: 8px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 5px;
              ">
                ${otp}
              </div>
            </div>

            <p style="color: #666; margin-top: 20px;">
              This code will expire in 10 minutes.
            </p>

            <p style="color: #666; margin-top: 20px;">
              If you didn't create this account, please ignore this email.
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              © 2025 PetMate. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent to email" };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, message: "Failed to send OTP email" };
  }
};

// Verify OTP
export const verifyOTP = async (model, email, otp) => {
  try {
    const user = await model.findOne({
      email: email,
      emailOTP: otp,
      emailOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return { success: false, message: "Invalid or expired OTP" };
    }

    user.isEmailVerified = true;
    user.emailOTP = null;
    user.emailOTPExpires = null;
    await user.save();

    return { success: true, message: "Email verified successfully" };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { success: false, message: "Error verifying OTP" };
  }
};
