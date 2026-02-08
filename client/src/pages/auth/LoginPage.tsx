import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, PawPrint } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!email.trim() || !password.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.status === 200) {
        showToast("Login successful! Welcome back.", "success");
        // Update auth context (this also stores to localStorage)
        login(response.data.user, response.data.token);

        // Redirect based on user type
        if (response.data.user.type === "shelter") {
          navigate("/shelter/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      let errorMessage = "Login failed";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 400) {
          errorMessage = data?.message || "Please fill in all fields";
        } else if (status === 401) {
          errorMessage = data?.message || "Invalid email or password";
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
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Illustration */}
        <motion.div
          initial={{
            opacity: 0,
            x: -50,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl opacity-20"
              style={{
                background: "var(--color-primary)",
              }}
            />
            <img
              src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=700&fit=crop"
              alt="Happy pets"
              className="rounded-3xl shadow-2xl relative z-10"
              style={{
                boxShadow: "var(--shadow-lg)",
              }}
            />
            <motion.div
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                duration: 0.5,
                delay: 0.3,
              }}
              className="absolute -bottom-6 -right-6 p-6 rounded-2xl z-20"
              style={{
                background: "var(--color-card)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: "var(--color-primary)",
                  }}
                >
                  <PawPrint className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p
                    className="font-bold text-2xl"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    500+
                  </p>
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--color-text-light)",
                    }}
                  >
                    Happy Adoptions
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="w-full max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: "var(--color-primary)",
              }}
            >
              <PawPrint className="w-8 h-8 text-white" />
            </div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: "var(--color-text)",
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                color: "var(--color-text-light)",
              }}
            >
              Sign in to continue your adoption journey
            </p>
          </div>

          <Card padding="lg">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                type="email"
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                fullWidth
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                fullWidth
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded focus:ring-2"
                    style={{
                      accentColor: "var(--color-primary)",
                      borderColor: "var(--color-border)",
                    }}
                  />
                  <span
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="hover:underline"
                  style={{
                    color: "var(--color-primary)",
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <p
              className="text-center text-sm mt-6"
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
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
