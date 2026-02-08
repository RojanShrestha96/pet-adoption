import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Lock, Shield, AlertTriangle } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";

export function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!username.trim() || !password.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/login",
        {
          username,
          password,
        }
      );

      if (response.status === 200) {
        showToast("Admin login successful!", "success");
        
        // Use the AuthContext login method to store token and user
        login(response.data.admin, response.data.token);

        // Redirect to admin dashboard
        navigate("/admin/dashboard");
      }
    } catch (err) {
      let errorMessage = "Login failed";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 400) {
          errorMessage = data?.message || "Please fill in all fields";
        } else if (status === 401) {
          errorMessage = data?.message || "Invalid admin credentials";
        } else if (status === 403) {
          errorMessage = data?.message || "Access denied";
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
        {/* Left side - Illustration/Info */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl opacity-10"
              style={{
                background: "linear-gradient(135deg, var(--color-error) 0%, var(--color-warning) 100%)",
              }}
            />
            {/* Security Shield Visual */}
            <div className="relative z-10 p-12">
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                  style={{
                    background: "linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%)",
                  }}
                >
                  <Shield className="w-14 h-14 text-white" />
                </div>
                <h2
                  className="text-2xl font-bold text-center mb-3"
                  style={{ color: "var(--color-text)" }}
                >
                  Admin Portal
                </h2>
                <p
                  className="text-center mb-6"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Secure access to platform management and monitoring tools
                </p>
                
                {/* Security Features */}
                <div className="space-y-3">
                  {[
                    "Multi-layer authentication",
                    "Activity audit logs",
                    "Real-time monitoring",
                    "Role-based access control"
                  ].map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "var(--color-error)" }}
                      />
                      <span style={{ color: "var(--color-text)" }}>
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Security Warning */}
          <div
            className="mb-6 p-4 rounded-xl border flex items-start gap-3"
            style={{
              background: "var(--color-warning-light)",
              borderColor: "var(--color-warning)",
            }}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="text-amber-900 font-semibold text-sm">
                Restricted Access
              </p>
              <p className="text-amber-800 text-xs mt-1">
                This area is for authorized administrators only. All access attempts are logged.
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: "linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%)",
              }}
            >
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Admin Sign In
            </h1>
            <p style={{ color: "var(--color-text-light)" }}>
              Access the management dashboard
            </p>
          </div>

          {/* Login Form */}
          <Card padding="lg">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<User className="w-5 h-5" />}
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

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={isLoading}
                style={{
                  background: isLoading ? undefined : "linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%)",
                }}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
              <p
                className="text-center text-xs"
                style={{ color: "var(--color-text-light)" }}
              >
                Protected by advanced security measures
              </p>
              <p
                className="text-center text-xs mt-1"
                style={{ color: "var(--color-text-light)" }}
              >
                Multiple failed attempts will lock your account
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
