import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle,
  Shield,
  Inbox,
  MailCheck,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email.trim()) {
      showToast("Please enter your email", "error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      if (response.status === 200 && response.data?.found) {
        showToast("Reset link sent to your email!", "success");
        setIsSubmitted(true);
      }
    } catch (err) {
      let errorMessage = "Failed to send reset link";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 400) {
          errorMessage = data?.message || "Invalid email";
        } else if (status === 404) {
          errorMessage = "Email not found. Please check and try again.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{
        background: "var(--color-surface)",
      }}
    >
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              transition={{
                duration: 0.4,
              }}
            >
              {/* Back Link */}
              <Link
                to="/login"
                className="inline-flex items-center gap-2 mb-8 transition-colors"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                    delay: 0.2,
                  }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
                  style={{
                    background: "var(--color-primary)",
                  }}
                >
                  <Shield className="w-10 h-10 text-white" />
                </motion.div>
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  Forgot Password?
                </h1>
                <p
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              {/* Form */}
              <Card padding="lg">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-5 h-5" />}
                    fullWidth
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={!email || isLoading}
                    icon={isLoading ? undefined : <Send className="w-5 h-5" />}
                  >
                    {isLoading ? (
                      <motion.div
                        className="flex items-center gap-2"
                        animate={{
                          opacity: [1, 0.5, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      >
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </motion.div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                {/* Security Note */}
                <div
                  className="mt-6 p-4 rounded-xl"
                  style={{
                    background: "var(--color-surface)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--color-text-light)",
                    }}
                  >
                    🔒 <strong>Security tip:</strong> We'll never ask for your
                    password via email. Only use the official reset link.
                  </p>
                </div>
              </Card>

              {/* Links */}
              <div className="text-center mt-6 space-y-2">
                <p
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="font-medium hover:underline"
                    style={{
                      color: "var(--color-primary)",
                    }}
                  >
                    Sign in
                  </Link>
                </p>
                <p
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-medium hover:underline"
                    style={{
                      color: "var(--color-primary)",
                    }}
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.4,
              }}
              className="text-center"
            >
              {/* Success Animation */}
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
                style={{
                  background: "var(--color-primary)",
                }}
              >
                <Mail className="w-12 h-12 text-white" />
              </motion.div>

              <h1
                className="text-3xl font-bold mb-3"
                style={{
                  color: "var(--color-text)",
                }}
              >
                Check Your Email!
              </h1>
              <p
                className="text-lg mb-2"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                We've sent a password reset link to:
              </p>
              <p
                className="font-semibold mb-8"
                style={{
                  color: "var(--color-primary)",
                }}
              >
                {email}
              </p>

              <Card padding="lg" className="mb-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--color-primary)",
                      }}
                    >
                      <Inbox className="w-4 h-4 text-white" />
                    </div>
                    <p
                      className="text-sm text-left"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Open the email from PetMate
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--color-primary)",
                      }}
                    >
                      <MailCheck className="w-4 h-4 text-white" />
                    </div>
                    <p
                      className="text-sm text-left"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Click the "Reset Password" button
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--color-primary)",
                      }}
                    >
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <p
                      className="text-sm text-left"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Create your new password
                    </p>
                  </div>
                </div>
              </Card>

              <p
                className="text-sm mb-6"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="font-medium hover:underline"
                  style={{
                    color: "var(--color-primary)",
                  }}
                >
                  try again
                </button>
              </p>

              <Link to="/login">
                <Button variant="outline" fullWidth>
                  Back to Login
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
