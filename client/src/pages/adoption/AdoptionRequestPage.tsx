import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  Heart,
  FileText,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { FileUpload } from "../../components/forms/FileUpload";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";
import { mockPets } from "../../data/mockData";
import { ProgressStepper } from "../../components/common/ProgressStepper";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog";
import { useToast } from "../../components/ui/Toast";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
export function AdoptionRequestPage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const pet = mockPets.find((p) => p.id === petId);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
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
    supportingFiles: [] as string[],
    agreeToTerms: false,
  });
  const steps = [
    {
      title: "Personal Info",
      icon: FileText,
      description: "Basic details",
    },
    {
      title: "Household",
      icon: Home,
      description: "Living situation",
    },
    {
      title: "Adoption Intent",
      icon: Heart,
      description: "Your motivation",
    },
    {
      title: "Review",
      icon: Check,
      description: "Confirm & submit",
    },
  ];
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowConfirm(false);
    setShowSuccess(true);
    showToast("Application submitted successfully!", "success");
  };
  if (!pet) {
    return <div>Pet not found</div>;
  }
  if (showSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "var(--color-background)",
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="max-w-md w-full text-center"
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
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
            style={{
              background: "var(--color-success)",
              opacity: 0.1,
            }}
          >
            <Check
              className="w-12 h-12"
              style={{
                color: "var(--color-success)",
              }}
            />
          </motion.div>
          <h1
            className="text-3xl font-bold mb-4"
            style={{
              color: "var(--color-text)",
            }}
          >
            Application Submitted!
          </h1>
          <p
            className="text-lg mb-8"
            style={{
              color: "var(--color-text-light)",
            }}
          >
            Your adoption request for {pet.name} has been sent to the shelter.
            They'll review it and get back to you soon.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/application-tracking/1")}
            >
              Track Your Application
            </Button>
            <Button variant="outline" fullWidth onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background: "var(--color-background)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 transition-colors"
          style={{
            color: "var(--color-text-light)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              color: "var(--color-text)",
            }}
          >
            Adoption Application
          </h1>
          <p
            style={{
              color: "var(--color-text-light)",
            }}
          >
            Complete this form to request adoption for {pet.name}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <ProgressStepper
            steps={steps.map((s) => ({
              title: s.title,
              icon: s.icon,
              description: s.description,
            }))}
            currentStep={currentStep}
          />
        </div>

        {/* Form Content */}
        <Card padding="lg">
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
              {/* Step 0: Personal Info */}
              {currentStep === 0 && (
                <div className="space-y-5">
                  <h2
                    className="text-2xl font-bold mb-6"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
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

              {/* Step 1: Household */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h2
                    className="text-2xl font-bold mb-6"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Household & Lifestyle
                  </h2>
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
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
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
                  {formData.rentOwn === "rent" && (
                    <FileUpload
                      label="Landlord Permission Letter"
                      files={formData.landlordPermission}
                      onChange={(files) =>
                        setFormData({
                          ...formData,
                          landlordPermission: files,
                        })
                      }
                      maxFiles={1}
                    />
                  )}
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
                      description="If yes, please provide details below"
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
                      Existing Pets
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-card)",
                        color: "var(--color-text)",
                      }}
                      rows={3}
                      placeholder="List any pets you currently have"
                      value={formData.existingPets}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          existingPets: e.target.value,
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
                      Daily Routine
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
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
                    <ToggleSwitch
                      checked={formData.annualVaccinations}
                      onChange={(checked) =>
                        setFormData({
                          ...formData,
                          annualVaccinations: checked,
                        })
                      }
                      label="I commit to annual vaccinations"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Adoption Intent */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h2
                    className="text-2xl font-bold mb-6"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Adoption Intent
                  </h2>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Why do you want to adopt this pet? *
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-card)",
                        color: "var(--color-text)",
                      }}
                      rows={5}
                      placeholder="Tell us about your motivation and what you can offer"
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
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-card)",
                        color: "var(--color-text)",
                      }}
                      rows={4}
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
                  <Input
                    label="Adoption Timeline"
                    placeholder="When are you planning to adopt?"
                    value={formData.adoptionTimeline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adoptionTimeline: e.target.value,
                      })
                    }
                    fullWidth
                  />
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
                  <FileUpload
                    label="Supporting Documents (Optional)"
                    files={formData.supportingFiles}
                    onChange={(files) =>
                      setFormData({
                        ...formData,
                        supportingFiles: files,
                      })
                    }
                    maxFiles={3}
                  />
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2
                    className="text-2xl font-bold mb-6"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Review & Confirm
                  </h2>

                  {/* Pet Info */}
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{
                      background: "var(--color-surface)",
                    }}
                  >
                    <img
                      src={pet.images[0]}
                      alt={pet.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div>
                      <h3
                        className="font-semibold text-lg"
                        style={{
                          color: "var(--color-text)",
                        }}
                      >
                        {pet.name}
                      </h3>
                      <p
                        style={{
                          color: "var(--color-text-light)",
                        }}
                      >
                        {pet.breed} • {pet.age}
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-4">
                    <div>
                      <h4
                        className="font-semibold mb-2"
                        style={{
                          color: "var(--color-text)",
                        }}
                      >
                        Personal Information
                      </h4>
                      <div
                        className="text-sm space-y-1"
                        style={{
                          color: "var(--color-text-light)",
                        }}
                      >
                        <p>
                          <strong>Name:</strong> {formData.fullName}
                        </p>
                        <p>
                          <strong>Email:</strong> {formData.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {formData.phone}
                        </p>
                        <p>
                          <strong>Documents:</strong>{" "}
                          {formData.idDocuments.length} uploaded
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4
                        className="font-semibold mb-2"
                        style={{
                          color: "var(--color-text)",
                        }}
                      >
                        Household
                      </h4>
                      <div
                        className="text-sm space-y-1"
                        style={{
                          color: "var(--color-text-light)",
                        }}
                      >
                        <p>
                          <strong>Home Type:</strong> {formData.homeType}
                        </p>
                        <p>
                          <strong>Rent/Own:</strong> {formData.rentOwn}
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
                        I agree to the adoption policies and understand that
                        providing false information may result in rejection of
                        my application.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div
            className="flex items-center justify-between mt-8 pt-6"
            style={{
              borderTop: "1px solid var(--color-border)",
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
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setShowConfirm(true)}
                disabled={!formData.agreeToTerms || isSubmitting}
                icon={isSubmitting ? undefined : <Check className="w-4 h-4" />}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
      <ConfirmationDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalSubmit}
        title="Submit Application?"
        message={`Are you sure you want to submit your adoption application for ${pet.name}? This cannot be undone.`}
        confirmText="Yes, Submit"
        variant="info"
      />
    </div>
  );
}



