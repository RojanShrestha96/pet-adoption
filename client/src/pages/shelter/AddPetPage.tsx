import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  PawPrint,
  Check,
  Upload,
  X,
  FileText,
  Syringe,
  Cpu,
  Scissors,
  Bug,
  Stethoscope,
  Heart,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShelterSidebar } from "../../components/layout/ShelterSidebar";
import { HamburgerMenu } from "../../components/layout/HamburgerMenu";
import { NotificationCenter } from "../../components/common/NotificationCenter";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { DragDropImageUpload } from "../../components/forms/DragDropImageUpload";
import { useToast } from "../../components/ui/Toast";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog";
import { useAuth } from "../../contexts/AuthContext";

// Step configuration
const STEPS = [
  { id: 1, title: "Photos", description: "Upload pet images" },
  { id: 2, title: "Basic Info", description: "Name, species, breed" },
  { id: 3, title: "Details", description: "Age, gender, size" },
  { id: 4, title: "Health & Docs", description: "Medical records" },
  { id: 5, title: "Review", description: "Final check" },
];

interface FormData {
  // Basic Info
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  weight: string;
  description: string;

  // Images
  images: File[];

  // Documentation
  isVaccinated: boolean;
  vaccinationDate: string;
  isMicrochipped: boolean;
  microchipId: string;
  isNeutered: boolean;
  isDewormed: boolean;
  dewormingDate: string;
  lastVetCheckup: string;
  healthStatus: string;
  medicalNotes: string;
  otherConditions: string[];

  // Medical Documents
  medicalDocuments: File[];

  // Compatibility (string enums match updated Pet model)
  temperament: string[];
  goodWithKids: string; // "yes" | "with-supervision" | "no"
  goodWithPets: string; // "yes" | "cats-only" | "dogs-only" | "no"

  // Behavioural Assessment — shelter-entered, never inferred from breed/size
  energyScore: string;         // "1"–"5"
  separationAnxiety: string;   // "none" | "mild" | "moderate" | "severe"
  attachmentStyle: string;     // "independent" | "moderate" | "velcro"
  trainingDifficulty: string;  // "easy" | "moderate" | "challenging"
  noiseLevel: string;          // "quiet" | "moderate" | "vocal"
  sheddingLevel: string;       // "low" | "moderate" | "high"

  // Environment Requirements
  idealEnvironment: string;    // "indoor-only" | "indoor-with-outdoor-access" | "garden-required" | "rural-preferred"
  minSpaceSqm: string;         // number as string

  // Financial
  estimatedMonthlyCost: string; // number as string
}

const initialFormData: FormData = {
  name: "",
  species: "",
  breed: "",
  age: "",
  gender: "",
  size: "",
  weight: "",
  description: "",
  images: [],
  isVaccinated: false,
  vaccinationDate: "",
  isMicrochipped: false,
  microchipId: "",
  isNeutered: false,
  isDewormed: false,
  dewormingDate: "",
  lastVetCheckup: "",
  healthStatus: "healthy",
  medicalNotes: "",
  otherConditions: [],
  medicalDocuments: [],
  temperament: [],
  goodWithKids: "yes",
  goodWithPets: "yes",
  energyScore: "",
  separationAnxiety: "",
  attachmentStyle: "",
  trainingDifficulty: "",
  noiseLevel: "",
  sheddingLevel: "",
  idealEnvironment: "",
  minSpaceSqm: "0",
  estimatedMonthlyCost: "",
};

export function AddPetPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTemperamentToggle = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      temperament: prev.temperament.includes(trait)
        ? prev.temperament.filter((t) => t !== trait)
        : [...prev.temperament, trait],
    }));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];

      newFiles.forEach(file => {
        if (allowedTypes.includes(file.type)) {
          if (file.size <= 10 * 1024 * 1024) { // 10MB limit
             validFiles.push(file);
          } else {
             showToast(`File ${file.name} is too large (max 10MB)`, "error");
          }
        } else {
          showToast(`File ${file.name} format not supported. Use PDF, DOC, or Images.`, "error");
        }
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          medicalDocuments: [...prev.medicalDocuments, ...validFiles],
        }));
      }
    }
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicalDocuments: prev.medicalDocuments.filter((_, i) => i !== index),
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.images.length > 0;
      case 2:
        return formData.name && formData.species;
      case 3:
        return formData.age && formData.gender;
      case 4:
        return true; // Documentation is optional
      case 5:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];
      let documentUrls: string[] = [];

      // Upload images first
      if (formData.images.length > 0) {
        const imageFormData = new FormData();
        formData.images.forEach((file) => {
          imageFormData.append("images", file);
        });

        const imageResponse = await fetch(
          "http://localhost:5000/api/upload/images",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageFormData,
          }
        );

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json().catch(() => ({}));
          console.error("Image upload failed:", errorData);
          throw new Error(errorData.message || "Failed to upload images");
        }

        const imageResult = await imageResponse.json();
        imageUrls = imageResult.urls;
      }

      // Upload documents
      if (formData.medicalDocuments.length > 0) {
        const docFormData = new FormData();
        formData.medicalDocuments.forEach((file) => {
          docFormData.append("documents", file);
        });

        const docResponse = await fetch(
          "http://localhost:5000/api/upload/documents",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: docFormData,
          }
        );

        if (!docResponse.ok) {
          throw new Error("Failed to upload documents");
        }

        const docResult = await docResponse.json();
        documentUrls = docResult.urls;
      }

      // Now send the pet data with file URLs
      const response = await fetch("http://localhost:5000/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          age: formData.age,
          gender: formData.gender,
          size: formData.size,
          weight: formData.weight,
          description: formData.description,
          images: imageUrls,
          isVaccinated: formData.isVaccinated,
          vaccinationDate: formData.vaccinationDate || null,
          isMicrochipped: formData.isMicrochipped,
          microchipId: formData.microchipId || null,
          isNeutered: formData.isNeutered,
          isDewormed: formData.isDewormed,
          dewormingDate: formData.dewormingDate || null,
          lastVetCheckup: formData.lastVetCheckup || null,
          healthStatus: formData.healthStatus,
          medicalNotes: formData.medicalNotes,
          otherConditions: formData.otherConditions,
          medicalDocuments: documentUrls,
          temperament: formData.temperament,
          goodWithKids: formData.goodWithKids,
          goodWithPets: formData.goodWithPets,
          // Behavioural Assessment
          behaviour: {
            energyScore: formData.energyScore ? Number(formData.energyScore) : undefined,
            separationAnxiety: formData.separationAnxiety || undefined,
            attachmentStyle: formData.attachmentStyle || undefined,
            trainingDifficulty: formData.trainingDifficulty || undefined,
            noiseLevel: formData.noiseLevel || undefined,
            sheddingLevel: formData.sheddingLevel || undefined,
          },
          // Environment Requirements
          environment: {
            idealEnvironment: formData.idealEnvironment || undefined,
            minSpaceSqm: formData.minSpaceSqm ? Number(formData.minSpaceSqm) : 0,
          },
          // Financial
          financial: {
            estimatedMonthlyCost: formData.estimatedMonthlyCost ? Number(formData.estimatedMonthlyCost) : undefined,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit pet");
      }

      showToast(
        "Pet submitted for review! 🐾 Admin will approve it shortly.",
        "success"
      );
      navigate("/shelter/manage-pets");
    } catch (error) {
      console.error("Error submitting pet:", error);
      showToast("Failed to submit pet. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <ShelterSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <HamburgerMenu />
              </div>
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Add New Pet
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Step {currentStep} of {STEPS.length}:{" "}
                  {STEPS[currentStep - 1].title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            {/* Background track */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Step indicators */}
            <div className="flex justify-between mt-3">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() =>
                    step.id <= currentStep && setCurrentStep(step.id)
                  }
                  className="flex flex-col items-center group"
                  disabled={step.id > currentStep}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step.id < currentStep
                        ? "bg-green-500 text-white"
                        : step.id === currentStep
                        ? "bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary)]/20"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`hidden sm:block text-xs mt-1 ${
                      step.id === currentStep
                        ? "text-[var(--color-primary)] font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Photos */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl">
                        <ImageIcon className="w-6 h-6 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Pet Photos
                        </h2>
                        <p className="text-sm text-gray-500">
                          Upload high-quality images (max 5)
                        </p>
                      </div>
                    </div>
                    <DragDropImageUpload
                      onUpload={(files) => handleInputChange("images", files)}
                      maxFiles={5}
                      accept="image/jpeg, image/png, image/gif, image/webp"
                    />
                    {formData.images.length === 0 && (
                      <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        At least one photo is required
                      </p>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Basic Info */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl">
                        <PawPrint className="w-6 h-6 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Basic Information
                        </h2>
                        <p className="text-sm text-gray-500">
                          Tell us about the pet
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Pet Name *"
                        placeholder="e.g. Luna"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                        fullWidth
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Species *
                        </label>
                        <select
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white"
                          value={formData.species}
                          onChange={(e) =>
                            handleInputChange("species", e.target.value)
                          }
                        >
                          <option value="">Select Species</option>
                          <option value="dog">Dog</option>
                          <option value="cat">Cat</option>
                          <option value="other">Others</option>
                        </select>
                      </div>

                      <Input
                        label="Breed"
                        placeholder="e.g. Golden Retriever"
                        value={formData.breed}
                        onChange={(e) =>
                          handleInputChange("breed", e.target.value)
                        }
                        fullWidth
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
                        placeholder="Tell us about the pet's personality, history, and needs..."
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                      />
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl">
                        <Heart className="w-6 h-6 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Physical Details
                        </h2>
                        <p className="text-sm text-gray-500">
                          Age, size, and characteristics
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Age *"
                        placeholder="e.g. 2 years, 6 months"
                        value={formData.age}
                        onChange={(e) =>
                          handleInputChange("age", e.target.value)
                        }
                        fullWidth
                      />

                      <Input
                        label="Weight"
                        placeholder="e.g. 25 kg"
                        value={formData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        fullWidth
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <div className="flex gap-3">
                          {["male", "female"].map((gender) => (
                            <button
                              key={gender}
                              type="button"
                              onClick={() =>
                                handleInputChange("gender", gender)
                              }
                              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all capitalize ${
                                formData.gender === gender
                                  ? "bg-[var(--color-primary)] text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {gender}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Size
                        </label>
                        <div className="flex gap-2">
                          {["small", "medium", "large"].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleInputChange("size", size)}
                              className={`flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all capitalize ${
                                formData.size === size
                                  ? "bg-[var(--color-primary)] text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Temperament */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Temperament
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Friendly",
                          "Playful",
                          "Calm",
                          "Energetic",
                          "Shy",
                          "Affectionate",
                          "Independent",
                          "Loyal",
                          "Curious",
                          "Gentle",
                        ].map((trait) => (
                          <button
                            key={trait}
                            type="button"
                            onClick={() => handleTemperamentToggle(trait)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              formData.temperament.includes(trait)
                                ? "bg-[var(--color-primary)] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {trait}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Compatibility — string enums */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Compatibility
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Good with Kids</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.goodWithKids}
                            onChange={(e) => handleInputChange("goodWithKids", e.target.value)}
                          >
                            <option value="yes">Yes — great with children</option>
                            <option value="with-supervision">With supervision</option>
                            <option value="no">Not recommended with children</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Good with Other Pets</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.goodWithPets}
                            onChange={(e) => handleInputChange("goodWithPets", e.target.value)}
                          >
                            <option value="yes">Yes — all animals</option>
                            <option value="cats-only">Cats only</option>
                            <option value="dogs-only">Dogs only</option>
                            <option value="no">No other animals</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Behavioural Assessment — required for scoring engine */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="mb-4">
                        <h3 className="text-base font-semibold text-gray-800">Behavioural Assessment</h3>
                        <p className="text-xs text-amber-600 mt-1">⚠️ These fields power the compatibility scoring engine. Please fill them in based on direct observation — never assume from breed or size.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Energy Level (1 = very low, 5 = very high)</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.energyScore}
                            onChange={(e) => handleInputChange("energyScore", e.target.value)}
                          >
                            <option value="">Select energy level</option>
                            <option value="1">1 — Very low energy, mostly resting</option>
                            <option value="2">2 — Low energy, short walks fine</option>
                            <option value="3">3 — Moderate energy, daily walks needed</option>
                            <option value="4">4 — High energy, active play daily</option>
                            <option value="5">5 — Very high energy, 2+ hrs exercise daily</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Separation Anxiety</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.separationAnxiety}
                            onChange={(e) => handleInputChange("separationAnxiety", e.target.value)}
                          >
                            <option value="">Select level</option>
                            <option value="none">None — content when alone</option>
                            <option value="mild">Mild — some restlessness (&lt;2hr OK)</option>
                            <option value="moderate">Moderate — needs support after 2–3hrs</option>
                            <option value="severe">Severe — cannot be left alone without distress</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Attachment Style</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.attachmentStyle}
                            onChange={(e) => handleInputChange("attachmentStyle", e.target.value)}
                          >
                            <option value="">Select style</option>
                            <option value="independent">Independent — content without constant contact</option>
                            <option value="moderate">Moderate — enjoys company but manages alone</option>
                            <option value="velcro">Velcro — needs near-constant human presence</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Training Difficulty (individual assessment)</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.trainingDifficulty}
                            onChange={(e) => handleInputChange("trainingDifficulty", e.target.value)}
                          >
                            <option value="">Select difficulty</option>
                            <option value="easy">Easy — responds well, good manners</option>
                            <option value="moderate">Moderate — needs consistent training</option>
                            <option value="challenging">Challenging — requires experienced handler</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Noise Level</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.noiseLevel}
                            onChange={(e) => handleInputChange("noiseLevel", e.target.value)}
                          >
                            <option value="">Select noise level</option>
                            <option value="quiet">Quiet — rarely vocalises</option>
                            <option value="moderate">Moderate — occasional barking/meowing</option>
                            <option value="vocal">Vocal — frequently vocalises</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Shedding Level</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.sheddingLevel}
                            onChange={(e) => handleInputChange("sheddingLevel", e.target.value)}
                          >
                            <option value="">Select shedding level</option>
                            <option value="low">Low — minimal shedding</option>
                            <option value="moderate">Moderate — regular brushing needed</option>
                            <option value="high">High — frequent grooming required</option>
                          </select>
                        </div>
                      </div>

                      {/* Environment & Financial */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Ideal Environment</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.idealEnvironment}
                            onChange={(e) => handleInputChange("idealEnvironment", e.target.value)}
                          >
                            <option value="">Select environment</option>
                            <option value="indoor-only">Indoor only</option>
                            <option value="indoor-with-outdoor-access">Indoor with outdoor access</option>
                            <option value="garden-required">Garden required</option>
                            <option value="rural-preferred">Rural / suburban preferred</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Min Living Space (sqm, 0=none)</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.minSpaceSqm}
                            onChange={(e) => handleInputChange("minSpaceSqm", e.target.value)}
                            placeholder="e.g. 40"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Est. Monthly Cost (£)</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white text-sm"
                            value={formData.estimatedMonthlyCost}
                            onChange={(e) => handleInputChange("estimatedMonthlyCost", e.target.value)}
                            placeholder="e.g. 100"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Health & Documentation */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Medical Status */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Stethoscope className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Medical Information
                        </h2>
                        <p className="text-sm text-gray-500">
                          Health status and documentation
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Vaccination */}
                      <div
                        onClick={() =>
                          handleInputChange(
                            "isVaccinated",
                            !formData.isVaccinated
                          )
                        }
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.isVaccinated
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              formData.isVaccinated
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          >
                            <Syringe
                              className={`w-5 h-5 ${
                                formData.isVaccinated
                                  ? "text-white"
                                  : "text-gray-500"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Vaccinated
                            </p>
                            <p className="text-xs text-gray-500">
                              Up to date vaccinations
                            </p>
                          </div>
                          {formData.isVaccinated && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </div>
                      </div>

                      {/* Microchipped */}
                      <div
                        onClick={() =>
                          handleInputChange(
                            "isMicrochipped",
                            !formData.isMicrochipped
                          )
                        }
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.isMicrochipped
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              formData.isMicrochipped
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          >
                            <Cpu
                              className={`w-5 h-5 ${
                                formData.isMicrochipped
                                  ? "text-white"
                                  : "text-gray-500"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Microchipped
                            </p>
                            <p className="text-xs text-gray-500">
                              Has identification chip
                            </p>
                          </div>
                          {formData.isMicrochipped && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </div>
                      </div>

                      {/* Neutered/Spayed */}
                      <div
                        onClick={() =>
                          handleInputChange("isNeutered", !formData.isNeutered)
                        }
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.isNeutered
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              formData.isNeutered
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          >
                            <Scissors
                              className={`w-5 h-5 ${
                                formData.isNeutered
                                  ? "text-white"
                                  : "text-gray-500"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Neutered/Spayed
                            </p>
                            <p className="text-xs text-gray-500">
                              Sterilization complete
                            </p>
                          </div>
                          {formData.isNeutered && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </div>
                      </div>

                      {/* Dewormed */}
                      <div
                        onClick={() =>
                          handleInputChange("isDewormed", !formData.isDewormed)
                        }
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.isDewormed
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              formData.isDewormed
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          >
                            <Bug
                              className={`w-5 h-5 ${
                                formData.isDewormed
                                  ? "text-white"
                                  : "text-gray-500"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Dewormed
                            </p>
                            <p className="text-xs text-gray-500">
                              Deworming treatment done
                            </p>
                          </div>
                          {formData.isDewormed && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional fields when toggles are on */}
                    {formData.isMicrochipped && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        <Input
                          label="Microchip ID"
                          placeholder="Enter microchip number"
                          value={formData.microchipId}
                          onChange={(e) =>
                            handleInputChange("microchipId", e.target.value)
                          }
                          fullWidth
                        />
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Last Vet Checkup
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                          value={formData.lastVetCheckup}
                          onChange={(e) =>
                            handleInputChange("lastVetCheckup", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Health Status
                        </label>
                        <select
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white"
                          value={formData.healthStatus}
                          onChange={(e) =>
                            handleInputChange("healthStatus", e.target.value)
                          }
                        >
                          <option value="healthy">Healthy</option>
                          <option value="special-needs">Special Needs</option>
                          <option value="treatment">Under Treatment</option>
                          <option value="recovering">Recovering</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Notes
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
                        placeholder="Any special health conditions, allergies, or care instructions..."
                        value={formData.medicalNotes}
                        onChange={(e) =>
                          handleInputChange("medicalNotes", e.target.value)
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <AlertCircle className="w-4 h-4 inline mr-2" />
                        Other Conditions (Optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="condition-input"
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                          placeholder="Type a condition and press Enter or click Add..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const input = e.currentTarget;
                              const value = input.value.trim();
                              if (
                                value &&
                                !formData.otherConditions.includes(value)
                              ) {
                                handleInputChange("otherConditions", [
                                  ...formData.otherConditions,
                                  value,
                                ]);
                                input.value = "";
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(
                              "condition-input"
                            ) as HTMLInputElement;
                            const value = input?.value.trim();
                            if (
                              value &&
                              !formData.otherConditions.includes(value)
                            ) {
                              handleInputChange("otherConditions", [
                                ...formData.otherConditions,
                                value,
                              ]);
                              input.value = "";
                            }
                          }}
                          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors font-medium"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                      {formData.otherConditions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.otherConditions.map((condition, idx) => (
                            <span
                              key={idx}
                              className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                            >
                              {condition}
                              <button
                                type="button"
                                onClick={() => {
                                  handleInputChange(
                                    "otherConditions",
                                    formData.otherConditions.filter(
                                      (_, i) => i !== idx
                                    )
                                  );
                                }}
                                className="hover:text-orange-900"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        E.g., Diabetes, Arthritis, Blind, Deaf, Special diet
                        required
                      </p>
                    </div>
                  </Card>

                  {/* Document Upload */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Medical Documents
                        </h2>
                        <p className="text-sm text-gray-500">
                          Upload vaccination records, vet reports, etc.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-gray-50 transition-all"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">
                        Click to upload documents
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        PDF, DOC, or images up to 10MB
                      </p>
                    </div>

                    {/* Uploaded documents list */}
                    {formData.medicalDocuments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.medicalDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeDocument(index)}
                              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Review & Submit
                        </h2>
                        <p className="text-sm text-gray-500">
                          Check all information before submitting
                        </p>
                      </div>
                    </div>

                    {/* Pet Preview Card */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex gap-6">
                        {/* Image */}
                        <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                          {formData.images.length > 0 ? (
                            <img
                              src={URL.createObjectURL(formData.images[0])}
                              alt="Pet preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PawPrint className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {formData.name || "Pet Name"}
                          </h3>
                          <p className="text-gray-500 capitalize">
                            {formData.breed || "Breed"} •{" "}
                            {formData.species || "Species"}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {formData.age && (
                              <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                {formData.age}
                              </span>
                            )}
                            {formData.gender && (
                              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                                {formData.gender === "male" ? "♂" : "♀"}
                                {formData.gender}
                              </span>
                            )}
                            {formData.size && (
                              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                                {formData.size}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-4">
                            {formData.isVaccinated && (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <Syringe className="w-4 h-4" /> Vaccinated
                              </span>
                            )}
                            {formData.isMicrochipped && (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <Cpu className="w-4 h-4" /> Microchipped
                              </span>
                            )}
                            {formData.isNeutered && (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <Scissors className="w-4 h-4" /> Neutered
                              </span>
                            )}
                            {formData.isDewormed && (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <Bug className="w-4 h-4" /> Dewormed
                              </span>
                            )}
                            {formData.otherConditions.map((condition, idx) => (
                              <span
                                key={idx}
                                className="flex items-center gap-1 text-orange-600 text-sm"
                              >
                                <AlertCircle className="w-4 h-4" /> {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {formData.description && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-gray-600 text-sm">
                            {formData.description}
                          </p>
                        </div>
                      )}

                      {formData.medicalDocuments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-[var(--color-primary)]">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {formData.medicalDocuments.length} document(s)
                              attached
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Edit Sections */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Need to make changes?
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl hover:bg-[var(--color-primary)]/10 transition-all"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Photos
                        </button>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl hover:bg-[var(--color-primary)]/10 transition-all"
                        >
                          <PawPrint className="w-4 h-4" />
                          Basic Info
                        </button>
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl hover:bg-[var(--color-primary)]/10 transition-all"
                        >
                          <Heart className="w-4 h-4" />
                          Details
                        </button>
                        <button
                          onClick={() => setCurrentStep(4)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl hover:bg-[var(--color-primary)]/10 transition-all"
                        >
                          <Stethoscope className="w-4 h-4" />
                          Health
                        </button>
                      </div>
                    </div>

                    {/* Admin Review Notice */}
                    <div className="mt-6 p-4 bg-[var(--color-primary)]/5 rounded-xl border border-[var(--color-primary)]/20">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Review Process
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            After submission, your pet listing will be reviewed
                            by our admin team. This typically takes 24-48 hours.
                            You'll be notified once it's approved.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowConfirm(true)}
                  disabled={isSubmitting}
                  icon={isSubmitting ? undefined : <Save className="w-4 h-4" />}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    "Add Pet"
                  )}
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        title="Submit Pet for Review?"
        message="Your pet listing will be submitted and reviewed by our admin team. Once approved, it will be visible to potential adopters. This usually takes 24-48 hours."
        confirmText="Submit for Review"
        variant="info"
      />
    </div>
  );
}



