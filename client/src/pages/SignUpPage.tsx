import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Building2,
  Mail,
  Lock,
  Phone,

  PawPrint,
  Check,
  X,
} from "lucide-react";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useToast } from "../components/Toast";
import { LoadingSpinner } from "../components/LoadingSpinner";

type AccountType = "adopter" | "shelter" | null;
export function SignUpPage() {
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  });
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0)
      return {
        strength: 0,
        label: "",
        color: "",
      };
    if (password.length < 6)
      return {
        strength: 1,
        label: "Weak",
        color: "var(--color-error)",
      };
    if (password.length < 10)
      return {
        strength: 2,
        label: "Medium",
        color: "var(--color-accent)",
      };
    return {
      strength: 3,
      label: "Strong",
      color: "var(--color-success)",
    };
  };
  const passwordStrength = getPasswordStrength(formData.password);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation checks
    if (!formData.name.trim()) {
      showToast("Please enter your name", "error");
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      showToast("Please enter your email", "error");
      setIsLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      showToast("Please enter your phone number", "error");
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      showToast("Please enter a password", "error");
      setIsLoading(false);
      return;
    }

    // Validate phone number is exactly 10 digits
    if (formData.phone.length !== 10) {
      showToast("Phone number must be exactly 10 digits", "error");
      setIsLoading(false);
      return;
    }



    const payload: Record<string, string> = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    };


    try {
      // Choose endpoint based on account type
      const endpoint =
        accountType === "shelter"
          ? "http://localhost:5000/api/auth/register/shelter"
          : "http://localhost:5000/api/auth/register/adopter";

      const res = await axios.post(endpoint, payload);

      // Only navigate on successful registration (status 201 or 200)
      if (res.status === 201 || res.status === 200) {
        showToast(res.data.message, "success");
        // Redirect to OTP verification page with email
        navigate("/verify-otp", { state: { email: res.data.userEmail } });
      }
    } catch (err) {
      let errorMessage = "Signup failed";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 400) {
          errorMessage = data?.message || "Invalid input data";
        } else if (status === 409) {
          // Email or phone already exists
          if (data?.message?.includes("Email")) {
            errorMessage =
              "Email already registered. Please use a different email or login.";
          } else if (data?.message?.includes("Phone")) {
            errorMessage =
              "Phone number already registered. Please use a different number.";
          } else {
            errorMessage = data?.message || "User already exists";
          }
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data?.message || "Signup failed";
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
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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
          <div className="space-y-6">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-3xl opacity-20"
                style={{
                  background: "var(--color-secondary)",
                }}
              />
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop"
                alt="Pet shelter"
                className="rounded-3xl shadow-2xl relative z-10"
                style={{
                  boxShadow: "var(--shadow-lg)",
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  delay: 0.3,
                }}
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--color-card)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg relative">
                    <div 
                        className="absolute inset-0 rounded-lg"
                        style={{
                            background: "var(--color-primary)",
                            opacity: 0.1,
                        }}
                    />
                    <User
                      className="w-5 h-5 relative z-10"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-bold text-lg"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      1000+
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Adopters
                    </p>
                  </div>
                </div>
              </motion.div>

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
                  delay: 0.4,
                }}
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--color-card)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg relative">
                    <div 
                        className="absolute inset-0 rounded-lg"
                        style={{
                            background: "var(--color-secondary)",
                            opacity: 0.1,
                        }}
                    />
                    <Building2
                      className="w-5 h-5 relative z-10"
                      style={{
                        color: "var(--color-secondary)",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-bold text-lg"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      25+
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Shelters
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Sign Up Form */}
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
              Join PetMate
            </h1>
            <p
              style={{
                color: "var(--color-text-light)",
              }}
            >
              Create an account to start your journey
            </p>
          </div>

          <Card padding="lg">
            <AnimatePresence mode="wait">
              {accountType === null ? (
                <motion.div
                  key="account-type"
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: 20,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                >
                  <h2
                    className="text-xl font-semibold mb-6 text-center"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Choose your account type
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setAccountType("adopter")}
                      className="p-6 border-2 rounded-2xl transition-all group"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-card)",
                      }}
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform relative overflow-hidden">
                           <div 
                                className="absolute inset-0"
                                style={{
                                    background: "var(--color-primary)",
                                    opacity: 0.1,
                                }}
                           />
                          <User
                            className="w-8 h-8 relative z-10"
                            style={{
                              color: "var(--color-primary)",
                            }}
                          />
                        </div>
                        <div>
                          <h3
                            className="text-lg font-semibold mb-1"
                            style={{
                              color: "var(--color-text)",
                            }}
                          >
                            I'm an Adopter
                          </h3>
                          <p
                            className="text-sm"
                            style={{
                              color: "var(--color-text-light)",
                            }}
                          >
                            Looking to adopt a pet
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setAccountType("shelter")}
                      className="p-6 border-2 rounded-2xl transition-all group"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-card)",
                      }}
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform relative overflow-hidden">
                           <div 
                                className="absolute inset-0"
                                style={{
                                    background: "var(--color-secondary)",
                                    opacity: 0.1,
                                }}
                           />
                          <Building2
                            className="w-8 h-8 relative z-10"
                            style={{
                              color: "var(--color-secondary)",
                            }}
                          />
                        </div>
                        <div>
                          <h3
                            className="text-lg font-semibold mb-1"
                            style={{
                              color: "var(--color-text)",
                            }}
                          >
                            I'm a Shelter
                          </h3>
                          <p
                            className="text-sm"
                            style={{
                              color: "var(--color-text-light)",
                            }}
                          >
                            Managing pet adoptions
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-form"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2
                      className="text-xl font-semibold"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      {accountType === "adopter" ? "Adopter" : "Shelter"} Sign
                      Up
                    </h2>
                    <button
                      onClick={() => setAccountType(null)}
                      className="text-sm hover:underline"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    >
                      Change type
                    </button>
                  </div>

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <Input
                      type="text"
                      label={accountType === "shelter" ? "Shelter Name" : "Full Name"}
                      placeholder={accountType === "shelter" ? "Enter shelter name" : "Enter your name"}
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      icon={accountType === "shelter" ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      fullWidth
                      required
                    />

                    <Input
                      type="email"
                      label="Email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      icon={<Mail className="w-5 h-5" />}
                      fullWidth
                      required
                    />

                    <div>
                      <Input
                        type="tel"
                        label="Phone Number"
                        placeholder="+977 98XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 10) {
                            handleInputChange("phone", value);
                          }
                        }}
                        icon={<Phone className="w-5 h-5" />}
                        fullWidth
                        required
                      />
                      {formData.phone && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          {formData.phone.length === 10 ? (
                            <>
                              <Check
                                className="w-3 h-3"
                                style={{
                                  color: "var(--color-success)",
                                }}
                              />
                              <span
                                style={{
                                  color: "var(--color-success)",
                                }}
                              >
                                Valid phone number
                              </span>
                            </>
                          ) : (
                            <>
                              <X
                                className="w-3 h-3"
                                style={{
                                  color: "var(--color-error)",
                                }}
                              />
                              <span
                                style={{
                                  color: "var(--color-error)",
                                }}
                              >
                                Phone must be exactly 10 digits (
                                {formData.phone.length}/10)
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>



                    <div>
                      <Input
                        type="password"
                        label="Password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        icon={<Lock className="w-5 h-5" />}
                        fullWidth
                        required
                      />
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="flex-1 h-1 rounded-full"
                              style={{
                                background: "var(--color-border)",
                              }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    (passwordStrength.strength / 3) * 100
                                  }%`,
                                  background: passwordStrength.color,
                                }}
                              />
                            </div>
                            <span
                              className="text-xs font-medium"
                              style={{
                                color: passwordStrength.color,
                              }}
                            >
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div
                              className="flex items-center gap-2 text-xs"
                              style={{
                                color:
                                  formData.password.length >= 8
                                    ? "var(--color-success)"
                                    : "var(--color-text-light)",
                              }}
                            >
                              {formData.password.length >= 8 ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              <span>At least 8 characters</span>
                            </div>
                            <div
                              className="flex items-center gap-2 text-xs"
                              style={{
                                color: /[A-Z]/.test(formData.password)
                                  ? "var(--color-success)"
                                  : "var(--color-text-light)",
                              }}
                            >
                              {/[A-Z]/.test(formData.password) ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              <span>One uppercase letter</span>
                            </div>
                            <div
                              className="flex items-center gap-2 text-xs"
                              style={{
                                color: /\d/.test(formData.password)
                                  ? "var(--color-success)"
                                  : "var(--color-text-light)",
                              }}
                            >
                              {/\d/.test(formData.password) ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              <span>One number</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 mt-0.5 rounded"
                          style={{
                            accentColor: "var(--color-primary)",
                          }}
                          required
                        />
                        <span>
                          I agree to the Terms of Service and Privacy Policy
                        </span>
                      </label>
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
                        "Create Account"
                      )}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div
                          className="w-full border-t"
                          style={{
                            borderColor: "var(--color-border)",
                          }}
                        ></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span
                          className="px-4"
                          style={{
                            background: "var(--color-card)",
                            color: "var(--color-text-light)",
                          }}
                        >
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 rounded-xl transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-card)",
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        style={{
                          color: "var(--color-text)",
                        }}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span
                        className="font-medium"
                        style={{
                          color: "var(--color-text)",
                        }}
                      >
                        Continue with Google
                      </span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p
              className="text-center text-sm mt-6"
              style={{
                color: "var(--color-text-light)",
              }}
            >
              Already have an account?{" "}
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
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
