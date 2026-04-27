import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  AlertTriangle,
  Image as ImageIcon,
  PawPrint,
  Heart,
  Stethoscope,
  Syringe,
  Cpu,
  Scissors,
  Bug,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Upload,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
import axios from "axios";
import { VaccinationRecordsEditor, VaccinationRecord } from "../../components/pets/VaccinationRecordsEditor";
import { formatAge } from "../../utils/ageUtils";

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
  ageYears: string;
  ageMonths: string;
  gender: string;
  size: string;
  weight: string;
  description: string;

  // Images - can be both Files and URLs
  images: File[];
  existingImages: string[];

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
  vaccinations: VaccinationRecord[];
  vaccinationStatus: string;

  // Medical Documents
  medicalDocuments: File[];
  existingDocuments: string[];

  // Personality
  temperament: string[];
  goodWithKids: string;
  goodWithPets: string;
  energyScore: string;
  separationAnxiety: string;
  attachmentStyle: string;
  trainingDifficulty: string;
  noiseLevel: string;
  sheddingLevel: string;

  // Environment
  idealEnvironment: string;
  minSpaceSqm: string;

  // Financial
  estimatedMonthlyCost: string;
}

const initialFormData: FormData = {
  name: "",
  species: "",
  breed: "",
  ageYears: "",
  ageMonths: "",
  gender: "",
  size: "",
  weight: "",
  description: "",
  images: [],
  existingImages: [],
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
  vaccinations: [],
  vaccinationStatus: "unknown",
  medicalDocuments: [],
  existingDocuments: [],
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

export function EditPetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { token } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Fetch existing pet data
  useEffect(() => {
    const fetchPet = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const pet = response.data;
        
        // Populate form with existing data
        setFormData({
          name: pet.name || "",
          species: pet.species || "",
          breed: pet.breed || "",
          ageYears: pet.age?.years?.toString() || "",
          ageMonths: pet.age?.months?.toString() || "",
          gender: pet.gender || "",
          size: pet.size || "",
          weight: pet.weight || "",
          description: pet.description || "",
          images: [],
          existingImages: pet.images || [],
          isVaccinated: pet.medical?.isVaccinated || false,
          vaccinationDate: pet.medical?.vaccinationDate ? pet.medical.vaccinationDate.split('T')[0] : "",
          isMicrochipped: pet.medical?.isMicrochipped || false,
          microchipId: pet.medical?.microchipId || "",
          isNeutered: pet.medical?.isNeutered || false,
          isDewormed: pet.medical?.isDewormed || false,
          dewormingDate: pet.medical?.dewormingDate ? pet.medical.dewormingDate.split('T')[0] : "",
          lastVetCheckup: pet.medical?.lastVetCheckup ? pet.medical.lastVetCheckup.split('T')[0] : "",
          healthStatus: pet.medical?.healthStatus || "healthy",
          medicalNotes: pet.medical?.medicalNotes || "",
          otherConditions: pet.medical?.otherConditions || [],
          vaccinations: pet.medical?.vaccinations?.map((v: any) => ({
            ...v,
            dateAdministered: v.dateAdministered ? v.dateAdministered.split('T')[0] : "",
            nextDueDate: v.nextDueDate ? v.nextDueDate.split('T')[0] : ""
          })) || [],
          vaccinationStatus: pet.medical?.vaccinationStatus || "unknown",
          medicalDocuments: [],
          existingDocuments: pet.medical?.medicalDocuments || [],
          temperament: pet.temperament || [],
          goodWithKids: pet.compatibility?.goodWithKids || "yes",
          goodWithPets: pet.compatibility?.goodWithPets || "yes",
          energyScore: pet.behaviour?.energyScore?.toString() || "",
          separationAnxiety: pet.behaviour?.separationAnxiety || "",
          attachmentStyle: pet.behaviour?.attachmentStyle || "",
          trainingDifficulty: pet.behaviour?.trainingDifficulty || "",
          noiseLevel: pet.behaviour?.noiseLevel || "",
          sheddingLevel: pet.behaviour?.sheddingLevel || "",
          idealEnvironment: pet.environment?.idealEnvironment || "",
          minSpaceSqm: pet.environment?.minSpaceSqm?.toString() || "0",
          estimatedMonthlyCost: pet.financial?.estimatedMonthlyCost?.toString() || "",
        });
      } catch (error: any) {
        console.error("Error fetching pet:", error);
        showToast("Failed to load pet data", "error");
        navigate("/shelter/manage-pets");
      } finally {
        setIsLoading(false);
      }
    };

    if (token && id) {
      fetchPet();
    }
  }, [id, token, navigate, showToast]);

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

  const handleOtherConditionToggle = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      otherConditions: prev.otherConditions.includes(condition)
        ? prev.otherConditions.filter((c) => c !== condition)
        : [...prev.otherConditions, condition],
    }));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        medicalDocuments: [...prev.medicalDocuments, ...newFiles],
      }));
    }
  };

  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  const removeExistingDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingDocuments: prev.existingDocuments.filter((_, i) => i !== index),
    }));
  };

  const removeNewDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicalDocuments: prev.medicalDocuments.filter((_, i) => i !== index),
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.existingImages.length > 0 || formData.images.length > 0;
      case 2:
        return formData.name && formData.species;
      case 3:
        return !!((formData.ageYears || formData.ageMonths) && formData.gender);
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
      let newImageUrls: string[] = [];
      let newDocumentUrls: string[] = [];

      // Upload new images if any
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
          throw new Error("Failed to upload images");
        }

        const imageResult = await imageResponse.json();
        newImageUrls = imageResult.urls;
      }

      // Upload new documents if any
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
        newDocumentUrls = docResult.urls;
      }

      // Combine existing URLs with new uploaded URLs
      const allImages = [...formData.existingImages, ...newImageUrls];
      const allDocuments = [...formData.existingDocuments, ...newDocumentUrls];

      // Now send the pet data update
      await axios.put(
        `http://localhost:5000/api/pets/${id}`,
        {
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          age: {
            years: Number(formData.ageYears) || 0,
            months: Number(formData.ageMonths) || 0
          },
          gender: formData.gender,
          size: formData.size,
          weight: formData.weight,
          description: formData.description,
          images: allImages,
          medical: {
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
            vaccinations: formData.vaccinations,
            vaccinationStatus: formData.vaccinationStatus,
            medicalDocuments: allDocuments,
          },
          temperament: formData.temperament,
          compatibility: {
            goodWithKids: formData.goodWithKids,
            goodWithPets: formData.goodWithPets,
          },
          behaviour: {
            energyScore: parseInt(formData.energyScore) || null,
            separationAnxiety: formData.separationAnxiety || null,
            attachmentStyle: formData.attachmentStyle || null,
            trainingDifficulty: formData.trainingDifficulty || null,
            noiseLevel: formData.noiseLevel || null,
            sheddingLevel: formData.sheddingLevel || null,
          },
          // Derived/Canonical fields
          energyLevel: parseInt(formData.energyScore) <= 2 ? 'low' : parseInt(formData.energyScore) === 3 ? 'moderate' : parseInt(formData.energyScore) === 4 ? 'high' : 'very-high',
          environment: {
            idealEnvironment: formData.idealEnvironment || null,
            minSpaceSqm: parseInt(formData.minSpaceSqm) || 0,
          },
          estimatedMonthlyCost: parseInt(formData.estimatedMonthlyCost) || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast(
        "Pet updated successfully! ✓ It will be reviewed by admin before becoming visible.",
        "success"
      );
      navigate("/shelter/manage-pets");
    } catch (error: any) {
      console.error("Error updating pet:", error);
      showToast(
        error.response?.data?.message || "Failed to update pet. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <div className="hidden lg:block">
          <ShelterSidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" label="Loading pet data..." />
        </div>
      </div>
    );
  }

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
                  Edit Pet
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

          {/* Re-approval Warning Banner */}
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 text-sm">
                  Changes Require Admin Re-approval
                </h3>
                <p className="text-xs text-amber-700 mt-1">
                  After you submit your changes, this pet will be marked as "Pending Review" and won't be publicly visible until an admin re-approves it.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            {/* Background track */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                initial={{ width: `${progress}%` }}
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
                          Upload high-quality images (max 5 total)
                        </p>
                      </div>
                    </div>

                    {/* Existing Images */}
                    {formData.existingImages.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Current Images
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {formData.existingImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Pet ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeExistingImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Images Upload */}
                    {(formData.existingImages.length + formData.images.length) < 5 && (
                      <DragDropImageUpload
                        onUpload={(files) => handleInputChange("images", files)}
                        maxFiles={5 - formData.existingImages.length}
                        accept="image/jpeg, image/png, image/gif, image/webp"
                      />
                    )}

                    {(formData.existingImages.length === 0 && formData.images.length === 0) && (
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

              {/* Step 3: Details - CONTINUED IN NEXT PART DUE TO LENGTH... */}
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
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Age (Years) *"
                          type="number"
                          min="0"
                          placeholder="Years"
                          value={formData.ageYears}
                          onChange={(e) =>
                            handleInputChange("ageYears", e.target.value)
                          }
                          fullWidth
                        />
                        <Input
                          label="Age (Months)"
                          type="number"
                          min="0"
                          max="11"
                          placeholder="Months"
                          value={formData.ageMonths}
                          onChange={(e) =>
                            handleInputChange("ageMonths", e.target.value)
                          }
                          fullWidth
                        />
                      </div>

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
                        <p className="text-xs text-amber-600 mt-1">⚠️ These fields power the compatibility scoring engine. Please fill them in based on direct observation.</p>
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
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Training Difficulty</label>
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
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Est. Monthly Cost (Rs)</label>
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

              {/* Step 4: Health & Documentation - WILL CONTINUE... */}
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
                      {/* Overall Vaccination Status */}
                      <div className="col-span-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Overall Vaccination Status *
                        </label>
                        <select
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors bg-white font-medium shadow-sm"
                          value={formData.vaccinationStatus}
                          onChange={(e) =>
                            handleInputChange("vaccinationStatus", e.target.value)
                          }
                          required
                        >
                          <option value="unknown">Unknown</option>
                          <option value="not-vaccinated">Not Vaccinated</option>
                          <option value="partially-vaccinated">Partially Vaccinated</option>
                          <option value="fully-vaccinated">Fully Vaccinated</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 ml-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Set based on core vaccine requirements for {formData.species || 'the pet'}.
                        </p>
                      </div>

                      {/* Structured Vaccination Records */}
                      <div className="col-span-full mt-6 pt-6 border-t border-gray-100">
                        <VaccinationRecordsEditor
                          species={formData.species}
                          vaccinations={formData.vaccinations}
                          onChange={(vals) => handleInputChange("vaccinations", vals)}
                        />
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
                              Has microchip ID
                            </p>
                          </div>
                          {formData.isMicrochipped && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </div>
                      </div>

                      {/* Neutered */}
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
                              Spayed/Neutered
                            </p>
                            <p className="text-xs text-gray-500">
                              Sterilized
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
                              Treated for parasites
                            </p>
                          </div>
                          {formData.isDewormed && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                      {formData.isDewormed && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Deworming Date
                          </label>
                          <input
                            type="date"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                            value={formData.dewormingDate}
                            onChange={(e) =>
                              handleInputChange("dewormingDate", e.target.value)
                            }
                          />
                        </div>
                      )}

                      {formData.isMicrochipped && (
                        <Input
                          label="Microchip ID"
                          placeholder="Enter microchip number"
                          value={formData.microchipId}
                          onChange={(e) =>
                            handleInputChange("microchipId", e.target.value)
                          }
                          fullWidth
                        />
                      )}

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
                    </div>

                    {/* Health Status */}
                    <div className="mt-6">
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
                        <option value="needs-attention">Needs Attention</option>
                        <option value="under-treatment">Under Treatment</option>
                      </select>
                    </div>

                    {/* Other Conditions */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Other Conditions (if any)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Allergies",
                          "Arthritis",
                          "Diabetes",
                          "Heart Condition",
                          "Skin Condition",
                          "Special Diet",
                        ].map((condition) => (
                          <button
                            key={condition}
                            type="button"
                            onClick={() => handleOtherConditionToggle(condition)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              formData.otherConditions.includes(condition)
                                ? "bg-amber-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {condition}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Medical Notes */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Notes
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
                        placeholder="Any additional medical information..."
                        value={formData.medicalNotes}
                        onChange={(e) =>
                          handleInputChange("medicalNotes", e.target.value)
                        }
                      />
                    </div>
                  </Card>

                  {/* Medical Documents */}
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

                    {/* Existing Documents */}
                    {formData.existingDocuments.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Current Documents
                        </label>
                        <div className="space-y-2">
                          {formData.existingDocuments.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  Document {index + 1}
                                </span>
                              </div>
                              <button
                                onClick={() => removeExistingDocument(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Documents Upload */}
                    <div>
                      <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--color-primary)] transition-colors">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-[var(--color-primary)]">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, DOC, or Images (max 10MB each)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
                          onChange={handleDocumentUpload}
                        />
                      </label>
                    </div>

                    {formData.medicalDocuments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.medicalDocuments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-700">
                                {file.name}
                              </span>
                            </div>
                            <button
                              onClick={() => removeNewDocument(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
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
                      <div className="p-3 bg-green-100 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Review Your Changes
                        </h2>
                        <p className="text-sm text-gray-500">
                          Make sure everything looks correct
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Name</p>
                          <p className="text-base font-semibold text-gray-900">
                            {formData.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Species</p>
                          <p className="text-base font-semibold text-gray-900 capitalize">
                            {formData.species}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Age</p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatAge({ years: parseInt(formData.ageYears) || 0, months: parseInt(formData.ageMonths) || 0 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Gender</p>
                          <p className="text-base font-semibold text-gray-900 capitalize">
                            {formData.gender}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-gray-500 mb-2">
                          Total Images
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {formData.existingImages.length + formData.images.length} image(s)
                        </p>
                      </div>

                      {formData.temperament.length > 0 && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium text-gray-500 mb-2">
                            Temperament
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formData.temperament.map((trait) => (
                              <span
                                key={trait}
                                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-gray-500 mb-2">
                          Medical Status
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm font-medium text-gray-600">Vaccination Status</span>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                              formData.vaccinationStatus === 'fully-vaccinated' ? 'bg-green-100 text-green-700' :
                              formData.vaccinationStatus === 'partially-vaccinated' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {formData.vaccinationStatus.replace('-', ' ')}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              {formData.isMicrochipped ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm">Microchipped</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {formData.isNeutered ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm">Neutered</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {formData.isDewormed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm">Dewormed</span>
                            </div>
                          </div>

                          {formData.vaccinations.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500 italic">
                              {formData.vaccinations.length} vaccination record(s) added
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {currentStep} / {STEPS.length}
                </span>
              </div>

              {currentStep < STEPS.length ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  <span className="flex items-center gap-2">
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowConfirm(true)}
                  disabled={!canProceed()}
                  icon={<Save className="w-4 h-4" />}
                >
                  Update Pet
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
        title="Update Pet?"
        message="Your changes will be submitted for admin re-approval. The pet won't be publicly visible until approved."
        confirmText={isSubmitting ? "Updating..." : "Update Pet"}
      />
    </div>
  );
}
