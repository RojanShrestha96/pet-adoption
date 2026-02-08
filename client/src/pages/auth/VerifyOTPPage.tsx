import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useToast } from "../../components/ui/Toast";
export function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from navigation state
  const email = location.state?.email || "";

  // If no email, redirect back to signup
  React.useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);
  const handleChange = (index: number, value: string) => {
    if (Number.isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(false);
    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      handleSubmit(newOtp.join(""));
    }
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const digits = pastedData.split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    if (digits.length === 6) {
      handleSubmit(newOtp.join(""));
    } else {
      inputRefs.current[digits.length]?.focus();
    }
  };
  const handleSubmit = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          email,
          otp: code,
        }
      );

      if (response.status === 200) {
        showToast("Email verified successfully!", "success");
        navigate("/email-verified");
      }
    } catch (err) {
      setError(true);
      // Reset error state after shake animation (800ms)
      setTimeout(() => setError(false), 800);

      let errorMessage = "Invalid OTP code";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 400) {
          errorMessage = data?.message || "Invalid OTP code";
        } else if (status === 404) {
          errorMessage = "Email not found. Please signup again.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again.";
        }
      }

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-surface)]">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-blue-500" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Enter OTP Code
        </h1>
        <p className="text-[var(--color-text-light)] mb-8">
          Enter the 6-digit code sent to your email
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              animate={
                error
                  ? {
                      x: [-10, 10, -10, 10, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.4 }}
              className={`w-12 h-14 text-2xl font-bold text-center rounded-xl border-2 focus:outline-none transition-colors ${
                error
                  ? "border-red-500 bg-red-50 text-red-500"
                  : "border-gray-200 focus:border-[var(--color-primary)]"
              }`}
            />
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-2">
            <LoadingSpinner size="md" label="Verifying..." />
          </div>
        ) : (
          <Button
            variant="primary"
            fullWidth
            onClick={() => handleSubmit(otp.join(""))}
            disabled={otp.some((d) => !d)}
          >
            Verify Email
          </Button>
        )}

        <p className="text-sm text-gray-500 mt-6">
          Didn't receive code?{" "}
          <button className="text-[var(--color-primary)] font-medium hover:underline">
            Resend OTP
          </button>
        </p>
      </motion.div>
    </div>
  );
}



