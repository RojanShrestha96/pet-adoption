import { useEffect, useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  User,
  Home,
  Heart,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { FileUpload } from "../forms/FileUpload";
import { ToggleSwitch } from "../ui/ToggleSwitch";

interface Pet {
  id: string;
  _id?: string;
  name: string;
  species: "dog" | "cat" | "other";
  breed: string;
  age: number;
  gender: "male" | "female";
  size: "small" | "medium" | "large" | "extra-large";
  image: string;
  images?: string[];
  compatibility: {
    children: boolean;
    dogs: boolean;
    cats: boolean;
    apartment: boolean;
  };
}

interface AdoptionModalProps {
  pet: Pet;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (applicationId: string) => void;
}
import { useToast } from "../ui/Toast";

const steps = [
  {
    id: 0,
    title: "Quick Screening",
    icon: ClipboardCheck,
  },
  {
    id: 1,
    title: "Personal Info",
    icon: User,
  },
  {
    id: 2,
    title: "Household",
    icon: Home,
  },
  {
    id: 3,
    title: "Adoption Intent",
    icon: Heart,
  },
  {
    id: 4,
    title: "Review",
    icon: FileText,
  },
];

export function AdoptionModal({
  pet,
  isOpen,
  onClose,
  onSubmit,
}: AdoptionModalProps) {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  // Screening questions
  const [screening, setScreening] = useState({
    adoptedBefore: "",
    currentPets: "",
    homeOwnership: "",
    homeVisit: "",
    timeline: "",
    specialNeeds: "",
  });
  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    address: "",
    idType: "",
    idNumber: "",
    idDocuments: [] as string[],
    homeType: "",
    rentOwn: "",
    landlordPermission: [] as string[],
    hasChildren: false,
    childrenDetails: "",
    existingPets: "",
    dailyRoutine: "",
    hasFencedYard: false,
    safeEnvironment: false,
    medicalAffordability: false,
    annualVaccinations: false,
    whyAdopt: "",
    petExperience: "",
    adoptionTimeline: "",
    readyForHomeVisit: false,
    handleVetVisits: false,
    proofOfResidence: [] as string[],
    agreeToTerms: false,
  });
  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  const handleScreeningChange = (field: string, value: string) => {
    setScreening((prev) => ({
      ...prev,
      [field]: value,
    }));
    setShowWarning(false);
  };
  const validateScreening = () => {
    // Check for potential issues
    if (!pet.compatibility.apartment && screening.homeOwnership === "rent") {
      setWarningMessage(
        `${pet.name} needs a home with a yard. Renting may not be ideal, but you can still apply!`
      );
      setShowWarning(true);
    } else if (screening.homeVisit === "no") {
      setWarningMessage(
        "Home visits help ensure a safe environment. Consider if you can accommodate one."
      );
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateScreening()) return;
    }

    // Step 1: Personal Info Validation
    if (currentStep === 1) {
      const required = ['fullName', 'email', 'phone', 'age', 'address', 'idType', 'idNumber'];
      const missing = required.filter(field => !formData[field as keyof typeof formData]);
      
      if (missing.length > 0) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (formData.idDocuments.length === 0) {
        showToast('Please upload your ID document.', 'error');
        return;
      }
    }

    // Step 2: Household Validation
    if (currentStep === 2) {
      if (!formData.homeType || !formData.rentOwn) {
        showToast('Please answer the required questions about your home.', 'error');
        return;
      }
    }

    // Step 3: Adoption Intent Validation
    if (currentStep === 3) {
      if (!formData.whyAdopt.trim()) {
        showToast('Please explain why you want to adopt this pet.', 'error');
        return;
      }
      if (!formData.petExperience.trim()) {
         showToast('Please describe your experience with pets.', 'error');
         return;
      }
      if (formData.proofOfResidence.length === 0) {
          showToast('Please upload proof of residence.', 'error');
          return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        showToast("You must be logged in to submit an application.", "error");
        onClose();
        // Redirect to login
        window.location.href = "/login";
        return;
      }

      const payload = {
        petId: pet.id || pet._id,
        screening: {
          adoptedBefore: screening.adoptedBefore.toLowerCase(),
          currentPets: screening.currentPets.toLowerCase(),
          homeOwnership: screening.homeOwnership.toLowerCase(),
          homeVisit: screening.homeVisit.toLowerCase(),
          timeline: screening.timeline.toLowerCase(),
          specialNeeds: screening.specialNeeds.toLowerCase(),
        },
        personalInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          address: formData.address,
          idType: formData.idType,
          idNumber: formData.idNumber,
          idDocuments: formData.idDocuments,
        },
        household: {
          homeType: formData.homeType,
          rentOwn: formData.rentOwn,
          landlordPermission: formData.landlordPermission,
          hasChildren: formData.hasChildren,
          childrenDetails: formData.childrenDetails,
          existingPets: formData.existingPets,
          dailyRoutine: formData.dailyRoutine,
          hasFencedYard: formData.hasFencedYard,
          safeEnvironment: formData.safeEnvironment,
          medicalAffordability: formData.medicalAffordability,
          annualVaccinations: formData.annualVaccinations,
          proofOfResidence: formData.proofOfResidence,
        },
        adoptionIntent: {
          whyAdopt: formData.whyAdopt,
          petExperience: formData.petExperience,
          adoptionTimeline: formData.adoptionTimeline,
          readyForHomeVisit: formData.readyForHomeVisit,
          handleVetVisits: formData.handleVetVisits,
        },
        agreeToTerms: formData.agreeToTerms,
      };

      //  Submit to backend using API utility (handles token expiration automatically)
      const api = (await import("../../utils/api")).default;
      const response = await api.post("/applications", payload);

      // Success!
      // Provide the application ID to the parent/callback
      const applicationId = response.data.application._id || response.data.application.id; 
      
      onSubmit(applicationId); 
      onClose();
      
      // Show success message
      showToast(`Application submitted successfully for ${pet.name}!`, 'success');
      
    } catch (error: any) {
      console.error("Error submitting application:", error);
      
      // If it's a 401 error, the interceptor will handle it
      // For other errors, show a message
      if (error.response?.status !== 401) {
        const message = error.response?.data?.message || "Failed to submit application. Please try again.";
        showToast(message, 'error');
      }
    }
  };
  const screeningQuestions = [
    {
      id: "adoptedBefore",
      question: "Have you adopted a pet before?",
      options: ["Yes", "No", "First time"],
    },
    {
      id: "currentPets",
      question: "Do you currently have any pets?",
      options: ["Yes", "No"],
    },
    {
      id: "homeOwnership",
      question: "Do you rent or own your home?",
      options: ["Own", "Rent", "Live with family"],
    },
    {
      id: "homeVisit",
      question: "Are you available for a home visit?",
      options: ["Yes", "Maybe", "No"],
    },
    {
      id: "timeline",
      question: "When are you looking to adopt?",
      options: [
        "Immediately",
        "Within a week",
        "Within a month",
        "Just browsing",
      ],
    },
    {
      id: "specialNeeds",
      question: "Can you accommodate special needs?",
      options: ["Yes", "Depends", "No"],
    },
  ];
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal - FIXED POSITIONING */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="w-full max-w-2xl pointer-events-auto flex flex-col"
              style={{
                maxHeight: "85vh",
                background: "var(--color-card)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed at top */}
              <div
                className="flex items-center justify-between p-6 border-b flex-shrink-0"
                style={{
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={pet.images?.[0] || pet.image}
                    alt={pet.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Adopt {pet.name}
                    </h2>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Step {currentStep + 1} of {steps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-black/5"
                  style={{
                    background: "var(--color-surface)",
                  }}
                >
                  <X
                    className="w-5 h-5"
                    style={{
                      color: "var(--color-text)",
                    }}
                  />
                </button>
              </div>

              {/* Progress - Fixed below header */}
              <div
                className="px-6 py-4 flex-shrink-0"
                style={{
                  background: "var(--color-surface)",
                }}
              >
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    return (
                      <Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                          <motion.div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              background:
                                isCompleted || isCurrent
                                  ? "var(--color-primary)"
                                  : "var(--color-border)",
                              color:
                                isCompleted || isCurrent
                                  ? "white"
                                  : "var(--color-text-light)",
                            }}
                            animate={{
                              scale: isCurrent ? 1.1 : 1,
                            }}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </motion.div>
                          <span
                            className="text-xs mt-1 hidden md:block"
                            style={{
                              color: isCurrent
                                ? "var(--color-primary)"
                                : "var(--color-text-light)",
                            }}
                          >
                            {step.title}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className="flex-1 h-1 mx-2 rounded-full"
                            style={{
                              background:
                                index < currentStep
                                  ? "var(--color-primary)"
                                  : "var(--color-border)",
                            }}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Content - Scrollable area */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
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
                    {/* Step 0: Screening */}
                    {currentStep === 0 && (
                      <div className="space-y-6">
                        <div>
                          <h3
                            className="text-2xl font-bold mb-2"
                            style={{
                              color: "var(--color-text)",
                            }}
                          >
                            Quick Screening 📋
                          </h3>
                          <p
                            style={{
                              color: "var(--color-text-light)",
                            }}
                          >
                            Help us understand your situation better
                          </p>
                        </div>

                        {showWarning && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: -10,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            className="p-4 rounded-xl flex items-start gap-3"
                            style={{
                              background: "rgba(244, 162, 97, 0.1)",
                              border: "1px solid var(--color-accent)",
                            }}
                          >
                            <AlertCircle
                              className="w-5 h-5 flex-shrink-0 mt-0.5"
                              style={{
                                color: "var(--color-accent)",
                              }}
                            />
                            <p
                              className="text-sm"
                              style={{
                                color: "var(--color-text)",
                              }}
                            >
                              {warningMessage}
                            </p>
                          </motion.div>
                        )}

                        <div className="space-y-5">
                          {screeningQuestions.map((q, index) => (
                            <motion.div
                              key={q.id}
                              initial={{
                                opacity: 0,
                                y: 10,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              transition={{
                                delay: index * 0.05,
                              }}
                            >
                              <p
                                className="font-medium mb-3"
                                style={{
                                  color: "var(--color-text)",
                                }}
                              >
                                {q.question}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {q.options.map((option) => (
                                  <button
                                    key={option}
                                    onClick={() =>
                                      handleScreeningChange(
                                        q.id,
                                        option.toLowerCase()
                                      )
                                    }
                                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                    style={{
                                      background:
                                        screening[
                                          q.id as keyof typeof screening
                                        ] === option.toLowerCase()
                                          ? "var(--color-primary)"
                                          : "var(--color-surface)",
                                      color:
                                        screening[
                                          q.id as keyof typeof screening
                                        ] === option.toLowerCase()
                                          ? "white"
                                          : "var(--color-text)",
                                      border: "2px solid",
                                      borderColor:
                                        screening[
                                          q.id as keyof typeof screening
                                        ] === option.toLowerCase()
                                          ? "var(--color-primary)"
                                          : "var(--color-border)",
                                    }}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 1: Personal Info */}
                    {currentStep === 1 && (
                      <div className="space-y-5">
                        <h3
                          className="text-2xl font-bold mb-4"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Full Name"
                            placeholder="Your full name"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                            fullWidth
                            required
                          />
                          <Input
                            label="Age"
                            type="number"
                            placeholder="Your age"
                            value={formData.age}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                age: e.target.value,
                              })
                            }
                            fullWidth
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            fullWidth
                            required
                          />
                          <Input
                            label="Phone"
                            type="tel"
                            placeholder="+977 98XXXXXXXX"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            fullWidth
                            required
                          />
                        </div>
                        <Input
                          label="Address"
                          placeholder="Your full address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          fullWidth
                          required
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              className="block text-sm font-medium mb-2"
                              style={{
                                color: "var(--color-text)",
                              }}
                            >
                              ID Type *
                            </label>
                            <select
                              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                              style={{
                                borderColor: "var(--color-border)",
                                background: "var(--color-card)",
                                color: "var(--color-text)",
                              }}
                              value={formData.idType}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  idType: e.target.value,
                                })
                              }
                            >
                              <option value="">Select ID type</option>
                              <option value="citizenship">Citizenship</option>
                              <option value="passport">Passport</option>
                              <option value="license">Driving License</option>
                            </select>
                          </div>
                          <Input
                            label="ID Number"
                            placeholder="Enter ID number"
                            value={formData.idNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                idNumber: e.target.value,
                              })
                            }
                            fullWidth
                            required
                          />
                        </div>
                        <FileUpload
                          label="Upload ID Document"
                          files={formData.idDocuments}
                          onChange={(files) =>
                            setFormData({
                              ...formData,
                              idDocuments: files,
                            })
                          }
                          maxFiles={2}
                        />
                      </div>
                    )}

                    {/* Step 2: Household */}
                    {currentStep === 2 && (
                      <div className="space-y-5">
                        <h3
                          className="text-2xl font-bold mb-4"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Household & Lifestyle
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              className="block text-sm font-medium mb-2"
                              style={{
                                color: "var(--color-text)",
                              }}
                            >
                              Home Type *
                            </label>
                            <select
                              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                              style={{
                                borderColor: "var(--color-border)",
                                background: "var(--color-card)",
                                color: "var(--color-text)",
                              }}
                              value={formData.homeType}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  homeType: e.target.value,
                                })
                              }
                            >
                              <option value="">Select type</option>
                              <option value="apartment">Apartment</option>
                              <option value="house">House</option>
                              <option value="condo">Condo</option>
                            </select>
                          </div>
                          <div>
                            <label
                              className="block text-sm font-medium mb-2"
                              style={{
                                color: "var(--color-text)",
                              }}
                            >
                              Rent or Own *
                            </label>
                            <select
                              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                              style={{
                                borderColor: "var(--color-border)",
                                background: "var(--color-card)",
                                color: "var(--color-text)",
                              }}
                              value={formData.rentOwn}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  rentOwn: e.target.value,
                                })
                              }
                            >
                              <option value="">Select</option>
                              <option value="rent">Rent</option>
                              <option value="own">Own</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <ToggleSwitch
                            checked={formData.hasChildren}
                            onChange={(checked) =>
                              setFormData({
                                ...formData,
                                hasChildren: checked,
                              })
                            }
                            label="Do you have children?"
                          />
                          {formData.hasChildren && (
                            <Input
                              label="Children Details"
                              placeholder="Ages and number of children"
                              value={formData.childrenDetails}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  childrenDetails: e.target.value,
                                })
                              }
                              fullWidth
                            />
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{
                              color: "var(--color-text)",
                            }}
                          >
                            Daily Routine
                          </label>
                          <textarea
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                            style={{
                              borderColor: "var(--color-border)",
                              background: "var(--color-card)",
                              color: "var(--color-text)",
                            }}
                            rows={3}
                            placeholder="Describe your typical daily schedule"
                            value={formData.dailyRoutine}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dailyRoutine: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-3">
                          <ToggleSwitch
                            checked={formData.hasFencedYard}
                            onChange={(checked) =>
                              setFormData({
                                ...formData,
                                hasFencedYard: checked,
                              })
                            }
                            label="Do you have a fenced yard?"
                          />
                          <ToggleSwitch
                            checked={formData.safeEnvironment}
                            onChange={(checked) =>
                              setFormData({
                                ...formData,
                                safeEnvironment: checked,
                              })
                            }
                            label="I can provide a safe environment"
                          />
                          <ToggleSwitch
                            checked={formData.medicalAffordability}
                            onChange={(checked) =>
                              setFormData({
                                ...formData,
                                medicalAffordability: checked,
                              })
                            }
                            label="I can afford medical care"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Adoption Intent */}
                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <h3
                          className="text-2xl font-bold mb-4"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Adoption Intent
                        </h3>
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{
                              color: "var(--color-text)",
                            }}
                          >
                            Why do you want to adopt {pet.name}? *
                          </label>
                          <textarea
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                            style={{
                              borderColor: "var(--color-border)",
                              background: "var(--color-card)",
                              color: "var(--color-text)",
                            }}
                            rows={4}
                            placeholder="Tell us about your motivation"
                            value={formData.whyAdopt}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                whyAdopt: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{
                              color: "var(--color-text)",
                            }}
                          >
                            Experience with Pets
                          </label>
                          <textarea
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                            style={{
                              borderColor: "var(--color-border)",
                              background: "var(--color-card)",
                              color: "var(--color-text)",
                            }}
                            rows={3}
                            placeholder="Describe your experience with pets"
                            value={formData.petExperience}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                petExperience: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-3">
                          <ToggleSwitch
                            checked={formData.readyForHomeVisit}
                            onChange={(checked) =>
                              setFormData({
                                ...formData,
                                readyForHomeVisit: checked,
                              })
                            }
                            label="I'm ready for a home visit"
                            description="Shelter may conduct a home inspection"
                          />
                          <ToggleSwitch
                            checked={formData.handleVetVisits}
                            onChange={(checked) =>
                              setFormData({
                                ...formData,
                                handleVetVisits: checked,
                              })
                            }
                            label="I will handle regular vet visits"
                          />
                        </div>
                        <FileUpload
                          label="Proof of Residence"
                          files={formData.proofOfResidence}
                          onChange={(files) =>
                            setFormData({
                              ...formData,
                              proofOfResidence: files,
                            })
                          }
                          maxFiles={2}
                        />
                      </div>
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <h3
                          className="text-2xl font-bold mb-4"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Review & Confirm
                        </h3>

                        {/* Pet Summary */}
                        <div
                          className="flex items-center gap-4 p-4 rounded-xl"
                          style={{
                            background: "var(--color-surface)",
                          }}
                        >
                          <img
                            src={pet.images?.[0] || pet.image}
                            alt={pet.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div>
                            <h4
                              className="font-semibold"
                              style={{
                                color: "var(--color-text)",
                              }}
                            >
                              {pet.name}
                            </h4>
                            <p
                              style={{
                                color: "var(--color-text-light)",
                              }}
                            >
                              {pet.breed} • {pet.age}
                            </p>
                          </div>
                        </div>

                        {/* Summary Sections */}
                        <div className="space-y-4">
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "var(--color-surface)",
                            }}
                          >
                            <h4
                              className="font-semibold mb-2"
                              style={{
                                color: "var(--color-text)",
                              }}
                            >
                              Personal Information
                            </h4>
                            <div
                              className="grid grid-cols-2 gap-2 text-sm"
                              style={{
                                color: "var(--color-text-light)",
                              }}
                            >
                              <p>
                                <strong>Name:</strong>{" "}
                                {formData.fullName || "Not provided"}
                              </p>
                              <p>
                                <strong>Email:</strong>{" "}
                                {formData.email || "Not provided"}
                              </p>
                              <p>
                                <strong>Phone:</strong>{" "}
                                {formData.phone || "Not provided"}
                              </p>
                              <p>
                                <strong>Documents:</strong>{" "}
                                {formData.idDocuments.length} uploaded
                              </p>
                            </div>
                          </div>

                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "var(--color-surface)",
                            }}
                          >
                            <h4
                              className="font-semibold mb-2"
                              style={{
                                color: "var(--color-text)",
                              }}
                            >
                              Household
                            </h4>
                            <div
                              className="grid grid-cols-2 gap-2 text-sm"
                              style={{
                                color: "var(--color-text-light)",
                              }}
                            >
                              <p>
                                <strong>Home Type:</strong>{" "}
                                {formData.homeType || "Not provided"}
                              </p>
                              <p>
                                <strong>Rent/Own:</strong>{" "}
                                {formData.rentOwn || "Not provided"}
                              </p>
                              <p>
                                <strong>Children:</strong>{" "}
                                {formData.hasChildren ? "Yes" : "No"}
                              </p>
                              <p>
                                <strong>Fenced Yard:</strong>{" "}
                                {formData.hasFencedYard ? "Yes" : "No"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "var(--color-surface)",
                          }}
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.agreeToTerms}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  agreeToTerms: e.target.checked,
                                })
                              }
                              className="w-5 h-5 mt-0.5 rounded"
                              style={{
                                accentColor: "var(--color-primary)",
                              }}
                            />
                            <span
                              className="text-sm"
                              style={{
                                color: "var(--color-text)",
                              }}
                            >
                              I agree to the adoption policies and understand
                              that providing false information may result in
                              rejection of my application.
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer - Sticky at bottom */}
              <div
                className="flex items-center justify-between p-6 border-t flex-shrink-0"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-card)",
                }}
              >
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!formData.agreeToTerms}
                    icon={<Check className="w-4 h-4" />}
                  >
                    Submit Application
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
