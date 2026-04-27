import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  PawPrint,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!token || !email) {
      showToast("Invalid reset link. Please request a new one.", "error");
      navigate("/forgot-password");
    }
  }, [token, email, navigate, showToast]);

  const passwordChecks = [
    {
      label: "At least 16 characters",
      valid: password.length >= 16,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number",
      valid: /[0-9]/.test(password),
    },
  ];
  const allChecksPass = passwordChecks.every((check) => check.valid);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const getStrength = () => {
    const passedChecks = passwordChecks.filter((c) => c.valid).length;
    if (passedChecks <= 1)
      return {
        label: "Weak",
        color: "var(--color-error)",
        width: "25%",
      };
    if (passedChecks <= 2)
      return {
        label: "Fair",
        color: "var(--color-accent)",
        width: "50%",
      };
    if (passedChecks <= 3)
      return {
        label: "Good",
        color: "var(--color-secondary)",
        width: "75%",
      };
    return {
      label: "Strong",
      color: "var(--color-success)",
      width: "100%",
    };
  };
  const strength = getStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecksPass || !passwordsMatch) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          token,
          email,
          newPassword: password,
        }
      );

      if (response.status === 200) {
        showToast("Password reset successfully!", "success");
        setIsSubmitted(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      let errorMessage = "Failed to reset password";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 400) {
          errorMessage =
            data?.message || "Invalid or expired reset link. Please try again.";
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
                  <Lock className="w-10 h-10 text-white" />
                </motion.div>
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  Create New Password
                </h1>
                <p
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  Your new password must be different from previous passwords.
                </p>
              </div>

              {/* Form */}
              <Card padding="lg">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Lock
                          className="w-5 h-5"
                          style={{
                            color: "var(--color-text-light)",
                          }}
                        />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                        style={{
                          borderColor: "var(--color-border)",
                          background: "var(--color-card)",
                          color: "var(--color-text)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff
                            className="w-5 h-5"
                            style={{
                              color: "var(--color-text-light)",
                            }}
                          />
                        ) : (
                          <Eye
                            className="w-5 h-5"
                            style={{
                              color: "var(--color-text-light)",
                            }}
                          />
                        )}
                      </button>
                    </div>

                    {/* Strength Indicator */}
                    {password && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        className="mt-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-xs"
                            style={{
                              color: "var(--color-text-light)",
                            }}
                          >
                            Password strength
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{
                              color: strength.color,
                            }}
                          >
                            {strength.label}
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{
                            background: "var(--color-border)",
                          }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: strength.color,
                            }}
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: strength.width,
                            }}
                            transition={{
                              duration: 0.3,
                            }}
                          />
                        </div>

                        {/* Checklist */}
                        <div className="mt-3 space-y-2">
                          {passwordChecks.map((check, index) => (
                            <motion.div
                              key={check.label}
                              initial={{
                                opacity: 0,
                                x: -10,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                              }}
                              transition={{
                                delay: index * 0.05,
                              }}
                              className="flex items-center gap-2"
                            >
                              {check.valid ? (
                                <Check
                                  className="w-4 h-4"
                                  style={{
                                    color: "var(--color-success)",
                                  }}
                                />
                              ) : (
                                <X
                                  className="w-4 h-4"
                                  style={{
                                    color: "var(--color-text-light)",
                                  }}
                                />
                              )}
                              <span
                                className="text-xs"
                                style={{
                                  color: check.valid
                                    ? "var(--color-success)"
                                    : "var(--color-text-light)",
                                }}
                              >
                                {check.label}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Lock
                          className="w-5 h-5"
                          style={{
                            color: "var(--color-text-light)",
                          }}
                        />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                        style={{
                          borderColor: confirmPassword
                            ? passwordsMatch
                              ? "var(--color-success)"
                              : "var(--color-error)"
                            : "var(--color-border)",
                          background: "var(--color-card)",
                          color: "var(--color-text)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff
                            className="w-5 h-5"
                            style={{
                              color: "var(--color-text-light)",
                            }}
                          />
                        ) : (
                          <Eye
                            className="w-5 h-5"
                            style={{
                              color: "var(--color-text-light)",
                            }}
                          />
                        )}
                      </button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p
                        className="text-xs mt-2"
                        style={{
                          color: "var(--color-error)",
                        }}
                      >
                        Passwords don't match
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={!allChecksPass || !passwordsMatch || isLoading}
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
                        Updating...
                      </motion.div>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </Card>
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
                  background: "var(--color-success)",
                  opacity: 0.15,
                }}
              >
                <CheckCircle2
                  className="w-12 h-12"
                  style={{
                    color: "var(--color-success)",
                  }}
                />
              </motion.div>

              <h1
                className="text-3xl font-bold mb-3"
                style={{
                  color: "var(--color-text)",
                }}
              >
                Password Updated!
              </h1>
              <p
                className="text-lg mb-8"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                Your password has been successfully reset. You can now log in
                with your new password.
              </p>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>

              {/* Illustration */}
              <div className="mt-8">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full"
                  style={{
                    background: "var(--color-success)",
                    opacity: 0.2,
                  }}
                >
                  <Shield
                    className="w-8 h-8"
                    style={{
                      color: "var(--color-success)",
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
