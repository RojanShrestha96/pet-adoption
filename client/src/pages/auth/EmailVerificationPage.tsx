import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
export function EmailVerificationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const email = "user@example.com"; // In real app, get from state/params
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);
  const handleResend = () => {
    setCountdown(45);
    setCanResend(false);
    showToast("Verification email sent!", "success");
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-surface)]">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Mail className="w-10 h-10 text-[var(--color-primary)]" />
        </motion.div>

        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Verify Your Email
        </h1>
        <p className="text-[var(--color-text-light)] mb-8">
          We've sent a verification link to
          <br />
          <span className="font-semibold text-[var(--color-text)]">
            {email}
          </span>
        </p>

        <div className="space-y-4">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate("/verify-otp")}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Enter OTP Code
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={handleResend}
            disabled={!canResend}
          >
            {canResend
              ? "Resend Verification Email"
              : `Resend in ${countdown}s`}
          </Button>

          <button
            onClick={() => navigate("/signup")}
            className="text-sm text-[var(--color-primary)] hover:underline mt-4"
          >
            Change Email Address
          </button>
        </div>
      </motion.div>
    </div>
  );
}



