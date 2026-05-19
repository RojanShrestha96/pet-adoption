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

/**
 * Send vaccination renewal reminder email to an adopter.
 * @param {string} email - Adopter's email address
 * @param {string} userName - Adopter's name
 * @param {string} petName - Pet's name
 * @param {string} vaccineName - Name of the due vaccine
 * @param {string} dueDate - Formatted due date string
 */
export const sendVaccinationReminderEmail = async (email, userName, petName, vaccineName, dueDate) => {
  try {
    const mailOptions = {
      from: `"PetMate 🐾" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `💉 Vaccination Reminder for ${petName} — Due in 7 Days`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; padding: 28px 24px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🐾 PetMate</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Pet Care Reminder</p>
          </div>

          <!-- Body Card -->
          <div style="background: #ffffff; border-radius: 10px; padding: 28px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
            <p style="color: #374151; font-size: 16px; margin: 0 0 12px;">Hi <strong>${userName}</strong>,</p>
            <p style="color: #4b5563; font-size: 15px; margin: 0 0 20px; line-height: 1.6;">
              This is a friendly reminder that <strong>${petName}</strong>'s <strong>${vaccineName}</strong> vaccination is due in <strong>7 days</strong>.
            </p>

            <!-- Reminder Box -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #6b7280; font-size: 13px; padding: 4px 0;">Pet</td>
                  <td style="color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${petName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 13px; padding: 4px 0;">Vaccine</td>
                  <td style="color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${vaccineName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 13px; padding: 4px 0;">Due Date</td>
                  <td style="color: #15803d; font-size: 14px; font-weight: 700; text-align: right;">📅 ${dueDate}</td>
                </tr>
              </table>
            </div>

            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
              Please book an appointment with your veterinarian soon to keep ${petName} healthy and up to date on vaccinations.
            </p>

            <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              You're receiving this reminder because you adopted ${petName} through PetMate. &copy; 2025 PetMate. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("[VaccinationReminder] Email error:", error.message);
    return { success: false, message: error.message };
  }
};
