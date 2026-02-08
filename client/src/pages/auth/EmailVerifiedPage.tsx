import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
export function EmailVerifiedPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate("/login");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-surface)] overflow-hidden">
      {/* Confetti Background (Simulated with circles) */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-50"
          initial={{
            top: -20,
            left: `${Math.random() * 100}%`,
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            backgroundColor: ["#FF6B35", "#F7931E", "#C1D5A4"][
              Math.floor(Math.random() * 3)
            ],
          }}
          animate={{
            top: "100%",
            rotate: 360,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            ease: "linear",
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          type: "spring",
          duration: 0.8,
        }}
        className="relative z-10 max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{
            scale: 0,
          }}
          animate={{
            scale: 1,
          }}
          transition={{
            delay: 0.2,
            type: "spring",
          }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>

        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          Email Verified! 🎉
        </h1>
        <p className="text-[var(--color-text-light)] mb-8">
          Your account has been successfully verified.
          <br />
          You can now access all features.
        </p>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => navigate("/login")}
        >
          Continue to Login
        </Button>

        <p className="text-sm text-gray-400 mt-4">
          Redirecting in {countdown} seconds...
        </p>
      </motion.div>
    </div>
  );
}



