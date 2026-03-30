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
  Lock,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { FileUpload } from "../forms/FileUpload";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { useToast } from "../ui/Toast";
import { useAdopterProfile } from "../../contexts/AdopterProfileContext";
import { AdoptionInfoModal } from "./AdoptionInfoModal";
import { CompatibilityScorePanel } from "./CompatibilityScorePanel";
import { useSettings } from "../../contexts/SettingsContext";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Screening step (always shown — pet specific) ────────────────────────────

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
    options: ["Immediately", "Within a week", "Within a month", "Just browsing"],
  },
  {
    id: "specialNeeds",
    question: "Can you accommodate special needs?",
    options: ["Yes", "Depends", "No"],
  },
];

// ─── Step configs per flow case ───────────────────────────────────────────────

// ─── Step Case Definitions (Retired for Dynamic Flow) ───────────────────────
// Steps are now calculated dynamically in the useEffect block based on profile.completedSections.


// ─── Prefill Banner ───────────────────────────────────────────────────────────

function PrefillBanner({ onEdit }: { onEdit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-3 rounded-xl mb-4"
      style={{
        background: "rgba(34,197,94,0.08)",
        border: "1px solid rgba(34,197,94,0.25)",
      }}
    >
      <Check
        className="w-4 h-4 flex-shrink-0 mt-0.5"
        style={{ color: "var(--color-success, #22c55e)" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Your details have been pre-filled from your adoption profile.
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-light)" }}>
          Review below, or{" "}
          <button
            type="button"
            className="underline font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--color-primary)" }}
            onClick={onEdit}
          >
            edit your profile
          </button>{" "}
          to update these details.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Locked field display (read-only with lock icon) ─────────────────────────

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-light)" }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
          color: "var(--color-text)",
        }}
      >
        <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-text-light)" }} />
        <span className="truncate">{value || "—"}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdoptionModal({ pet, isOpen, onClose, onSubmit }: AdoptionModalProps) {
  const { showToast } = useToast();
  const { profile, profileStatus, refreshProfile, saveProfile } = useAdopterProfile();
  const { settings } = useSettings();

  // ── Flow determination ────────────────────────────────────────────────────

  // caseA = profile complete, caseB = partial, caseC = none
  type FlowCase = "A" | "B" | "C";
  const [flowCase, setFlowCase] = useState<FlowCase>("C");
  const [steps, setSteps] = useState<any[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [missingSections, setMissingSections] = useState<string[]>([]);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || profileStatus === "loading") return;

    // Start with always-required steps
    const dynamicSteps = [
      { id: 0, title: "Quick Screening", icon: ClipboardCheck },
    ];

    // Add Personal Info if not complete in profile
    if (!profile?.completedSections?.includes("personalInfo")) {
      dynamicSteps.push({ id: dynamicSteps.length, title: "Personal Info", icon: User });
    }

    // Add Household if not complete in profile
    if (!profile?.completedSections?.includes("household")) {
      dynamicSteps.push({ id: dynamicSteps.length, title: "Household", icon: Home });
    }

    // Add always-required Intent step
    dynamicSteps.push({ id: dynamicSteps.length, title: "Adoption Intent", icon: Heart });

    // Add Compatibility if enabled
    if (settings.compatibilityIntelligenceEnabled) {
      dynamicSteps.push({ id: dynamicSteps.length, title: "Compatibility", icon: FileText });
    }

    // Add Review step
    dynamicSteps.push({ id: dynamicSteps.length, title: "Review", icon: Check });

    setSteps(dynamicSteps);
    setFlowCase(profileStatus === "complete" ? "A" : "B"); // Simple fallback for existing logic
    
    if (profileStatus !== "complete") {
      const missing: string[] = [];
      if (!profile?.completedSections?.includes("personalInfo")) missing.push("personalInfo");
      if (!profile?.completedSections?.includes("household")) missing.push("household");
      if (!profile?.completedSections?.includes("lifestyle")) missing.push("lifestyle");
      setMissingSections(missing);
    }

    setProfileLoaded(true);
  }, [isOpen, profileStatus, profile, settings.compatibilityIntelligenceEnabled]);

  // ── Show profile collection modal for Cases B & C ────────────────────────

  // For B & C: show the info modal first before the adoption modal steps appear
  const [infoCollected, setInfoCollected] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setInfoCollected(false);
      setCurrentStep(0);
    }
  }, [isOpen]);

  // When modal opens, check if we need to show the info modal first
  const needsInfoModal = isOpen && profileLoaded && (flowCase === "B" || flowCase === "C") && !infoCollected;

  // ── Step state ────────────────────────────────────────────────────────────

  const [currentStep, setCurrentStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // ── Screening state ───────────────────────────────────────────────────────

  const [screening, setScreening] = useState({
    adoptedBefore: "",
    currentPets: "",
    homeOwnership: "",
    homeVisit: "",
    timeline: "",
    specialNeeds: "",
  });

  // ── Form data (fallback for Cases B/C or manual edits) ───────────────────

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
    // Issue 13: petExperience auto-populated from profile — no manual input
    petExperience: "",
    adoptionTimeline: "",
    readyForHomeVisit: false,
    handleVetVisits: false,
    proofOfResidence: [] as string[],
    agreeToTerms: false,
    // Issue 12: Missing adoptionIntent fields — now collected in UI
    typicalWeekdayRoutine: "",
    emergencyCarePlan: "",
    specificPetMotivation: "",
    monthlyBudgetEstimate: "",
    lifeChangesExplanation: "",
  });

  // ── Pre-fill formData from profile ────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !profile) return;

    if (profile.personalInfo) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.personalInfo?.fullName ?? prev.fullName,
        phone: profile.personalInfo?.phone ?? prev.phone,
        age: profile.personalInfo?.age?.toString() ?? prev.age,
        address: profile.personalInfo?.address ?? prev.address,
        idType: profile.personalInfo?.idType ?? prev.idType,
        idNumber: profile.personalInfo?.idNumber ?? prev.idNumber,
        idDocuments: profile.personalInfo?.idDocuments ?? prev.idDocuments,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        address: prev.address || profile.userAddress || "",
        phone: prev.phone || profile.userPhone || "",
      }));
    }

    if (profile.household) {
      setFormData((prev) => ({
        ...prev,
        homeType: profile.household?.homeType ?? prev.homeType,
        rentOwn: profile.household?.rentOwn ?? prev.rentOwn,
        landlordPermission: profile.household?.landlordPermission ?? prev.landlordPermission,
        hasChildren: profile.household?.hasChildren ?? prev.hasChildren,
        childrenDetails: profile.household?.childrenDetails ?? prev.childrenDetails,
        existingPets: profile.household?.existingPets ?? prev.existingPets,
        hasFencedYard: profile.household?.hasFencedYard ?? prev.hasFencedYard,
        safeEnvironment: profile.household?.safeEnvironment ?? prev.safeEnvironment,
        medicalAffordability: profile.household?.medicalAffordability ?? prev.medicalAffordability,
        annualVaccinations: profile.household?.annualVaccinations ?? prev.annualVaccinations,
        proofOfResidence: profile.household?.proofOfResidence ?? prev.proofOfResidence,
      }));
    }

    if (profile.email) {
      setFormData((prev) => ({ ...prev, email: profile.email ?? prev.email }));
    }

    // Issue 13: Auto-populate petExperience from profile experienceLevel (Turbo Flow fix)
    if (profile.lifestyle?.experienceLevel) {
      const expLabel: Record<string, string> = {
        "first-time": "I am a first-time pet owner.",
        "none": "I have no prior experience with pets.",
        "some": "I have some prior experience caring for pets.",
        "some-experience": "I have some prior experience caring for pets.",
        "experienced": "I am an experienced pet owner with multiple animals over the years.",
      };
      setFormData((prev) => ({
        ...prev,
        petExperience: expLabel[profile.lifestyle?.experienceLevel ?? ""] ?? prev.petExperience,
      }));
    }
  }, [isOpen, profile]);

  // ── Keyboard handlers ─────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !showInfoModal) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, showInfoModal]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // ── Step validation ───────────────────────────────────────────────────────

  const validateScreening = () => {
    if (!pet.compatibility.apartment && screening.homeOwnership === "rent") {
      setWarningMessage(
        `${pet.name} needs a home with a yard. Renting may not be ideal, but you can still apply!`
      );
      setShowWarning(true);
    } else if (screening.homeVisit === "no") {
      setWarningMessage("Home visits help ensure a safe environment. Consider if you can accommodate one.");
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
    return true;
  };

  // Map step index to logical step name per flow case
  const getStepName = (stepIdx: number) => {
      if (!steps || steps.length === 0 || !steps[stepIdx]) return "";
      if (steps[stepIdx].title === "Quick Screening" || steps[stepIdx].title === "Screening") return "screening";
      if (steps[stepIdx].title === "Personal Info") return "personalInfo";
      if (steps[stepIdx].title === "Household") return "household";
      if (steps[stepIdx].title === "Adoption Intent" || steps[stepIdx].title === "Intent") return "intent";
      if (steps[stepIdx].title === "Compatibility") return "compatibility";
      if (steps[stepIdx].title === "Review") return "review";
      return "";
  };

  const handleNext = () => {
    const stepName = getStepName(currentStep);

    if (stepName === "screening") {
      if (!validateScreening()) return;
    }

    if (stepName === "personalInfo") {
      const required = ["fullName", "phone", "age", "address", "idType", "idNumber"] as const;
      const missing = required.filter((f) => !formData[f]);
      if (missing.length > 0) {
        showToast("Please fill in all required personal info fields.", "error");
        return;
      }
      if (!formData.idDocuments.length) {
        showToast("Please upload your ID document.", "error");
        return;
      }
    }

    if (stepName === "household") {
      if (!formData.homeType || !formData.rentOwn) {
        showToast("Please answer the required questions about your home.", "error");
        return;
      }
      if (!formData.proofOfResidence.length) {
        showToast("Please upload proof of residence.", "error");
        return;
      }
    }

    if (stepName === "intent") {
      if (!formData.whyAdopt.trim()) {
        showToast("Please explain why you want to adopt this pet.", "error");
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  // ── Submission ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You must be logged in to submit an application.", "error");
      onClose();
      window.location.href = "/login";
      return;
    }

    try {
      // ── Sync to Profile ───────────────────────────────────────────────────
      // If we filled in personalInfo or household during this app (Missing in profile),
      // sync it back to the permanent profile so the next app is "Turbo".
      const syncPersonalInfo = !profile?.completedSections?.includes("personalInfo");
      const syncHousehold = !profile?.completedSections?.includes("household");

      if (syncPersonalInfo || syncHousehold) {
        try {
          await saveProfile({
            personalInfo: syncPersonalInfo ? {
              fullName: formData.fullName,
              phone: formData.phone,
              age: parseInt(formData.age),
              address: formData.address,
              idType: formData.idType,
              idNumber: formData.idNumber,
              idDocuments: formData.idDocuments,
            } : undefined,
            household: syncHousehold ? {
              homeType: formData.homeType,
              rentOwn: formData.rentOwn,
              landlordPermission: formData.landlordPermission,
              hasChildren: formData.hasChildren,
              childrenDetails: formData.childrenDetails,
              existingPets: formData.existingPets,
              hasFencedYard: formData.hasFencedYard,
              safeEnvironment: formData.safeEnvironment,
              medicalAffordability: formData.medicalAffordability,
              annualVaccinations: formData.annualVaccinations,
              proofOfResidence: formData.proofOfResidence,
            } : undefined,
            lifestyle: syncHousehold ? {
              dailyRoutine: formData.dailyRoutine,
            } : undefined,
          });
        } catch (syncErr) {
          console.warn("Minor: Failed to sync application data back to profile:", syncErr);
          // Don't block application submission if profile sync fails
        }
      }

      const api = (await import("../../utils/api")).default;

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
          email: formData.email || profile?.email || "",
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
          // Issue 12: Include all new intent fields in submission payload
          typicalWeekdayRoutine: formData.typicalWeekdayRoutine,
          emergencyCarePlan: formData.emergencyCarePlan,
          specificPetMotivation: formData.specificPetMotivation,
          monthlyBudgetEstimate: formData.monthlyBudgetEstimate,
          lifeChangesExplanation: formData.lifeChangesExplanation,
        },
        agreeToTerms: formData.agreeToTerms,
      };

      const response = await api.post("/applications", payload);
      const applicationId = response.data.application._id || response.data.application.id;

      onSubmit(applicationId);
      onClose();
      showToast(`Application submitted successfully for ${pet.name}! 🎉`, "success");
    } catch (error: any) {
      if (error.response?.status !== 401) {
        showToast(
          error.response?.data?.message || "Failed to submit application. Please try again.",
          "error"
        );
      }
    }
  };

  // ── Rendered step content ─────────────────────────────────────────────────

  const stepName = getStepName(currentStep);

  const renderStepContent = () => {
    // ── Screening ─────────────────────────────────────────────────────────
    if (stepName === "screening") {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
              Quick Screening 📋
            </h3>
            <p style={{ color: "var(--color-text-light)" }}>
              A few quick questions specific to {pet.name}
            </p>
          </div>

          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl flex items-start gap-3"
              style={{
                background: "rgba(244,162,97,0.1)",
                border: "1px solid var(--color-accent)",
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
              <p className="text-sm" style={{ color: "var(--color-text)" }}>{warningMessage}</p>
            </motion.div>
          )}

          <div className="space-y-5">
            {screeningQuestions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <p className="font-medium mb-3" style={{ color: "var(--color-text)" }}>
                  {q.question}
                </p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setScreening((prev) => ({
                          ...prev,
                          [q.id]: option.toLowerCase(),
                        }))
                      }
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background:
                          screening[q.id as keyof typeof screening] === option.toLowerCase()
                            ? "var(--color-primary)"
                            : "var(--color-surface)",
                        color:
                          screening[q.id as keyof typeof screening] === option.toLowerCase()
                            ? "white"
                            : "var(--color-text)",
                        border: "2px solid",
                        borderColor:
                          screening[q.id as keyof typeof screening] === option.toLowerCase()
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
      );
    }

    // ── Personal Info (Case B/C) ───────────────────────────────────────────
    if (stepName === "personalInfo") {
      // If profile was just filled via AdoptionInfoModal, show pre-filled (locked) view
      if (infoCollected && flowCase !== "A") {
        return (
          <div className="space-y-5">
            <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
              Personal Information
            </h3>
            <PrefillBanner onEdit={() => setShowInfoModal(true)} />
            <div className="grid grid-cols-2 gap-3">
              <LockedField label="Full Name" value={formData.fullName} />
              <LockedField label="Age" value={formData.age} />
              <LockedField label="Phone" value={formData.phone} />
              <LockedField label="ID Type" value={formData.idType} />
            </div>
            <LockedField label="Address" value={formData.address} />
            <LockedField label="ID Number" value={formData.idNumber} />
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-light)" }}>
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{formData.idDocuments.length} ID document(s) on file</span>
            </div>
          </div>
        );
      }
      // Editable form (should not reach here if info modal was used, but fallback)
      return (
        <div className="space-y-5">
          <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name *" placeholder="Your full name" value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} fullWidth />
            <Input label="Age *" type="number" placeholder="Your age" value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })} fullWidth />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email *" type="email" placeholder="your@email.com" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth />
            <Input label="Phone *" type="tel" placeholder="+977 98XXXXXXXX" value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth />
          </div>
          <Input label="Address *" placeholder="Your full address" value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })} fullWidth />
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>Government ID (Issued in Nepal) *</label>
            <select className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
              style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--color-text)" }}
              value={formData.idType} onChange={(e) => setFormData({ ...formData, idType: e.target.value })}>
              <option value="">Select identity document</option>
              <option value="citizenship">Nepali Citizenship Certificate</option>
              <option value="passport">Passport</option>
              <option value="license">Driving License</option>
            </select>
          </div>
          <div>
            <Input
              label={formData.idType === "citizenship" ? "Citizenship Certificate Number *" : "ID Number *"}
              placeholder={formData.idType === "citizenship" ? "Enter your citizenship number" : "Enter ID number"}
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              fullWidth
            />
            {formData.idType === "citizenship" && (
              <p className="text-xs mt-1.5" style={{ color: "var(--color-text-light)" }}>
                Issued by the Government of Nepal
              </p>
            )}
          </div>
          <FileUpload label="Upload ID Document *" files={formData.idDocuments}
            onChange={(files) => setFormData({ ...formData, idDocuments: files })} maxFiles={2} />
        </div>
      );
    }

    // ── Household (Case B/C) ──────────────────────────────────────────────
    if (stepName === "household") {
      if (infoCollected && flowCase !== "A") {
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
              Household & Lifestyle
            </h3>
            <PrefillBanner onEdit={() => setShowInfoModal(true)} />
            <div className="grid grid-cols-2 gap-3">
              <LockedField label="Home Type" value={formData.homeType} />
              <LockedField label="Rent / Own" value={formData.rentOwn} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <LockedField label="Children in home" value={formData.hasChildren ? "Yes" : "No"} />
              <LockedField label="Fenced yard" value={formData.hasFencedYard ? "Yes" : "No"} />
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-light)" }}>
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{formData.proofOfResidence.length} proof of residence document(s) on file</span>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-5">
          <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
            Household & Lifestyle
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>Home Type *</label>
              <select className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--color-text)" }}
                value={formData.homeType} onChange={(e) => setFormData({ ...formData, homeType: e.target.value })}>
                <option value="">Select type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>Rent or Own *</label>
              <select className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--color-text)" }}
                value={formData.rentOwn} onChange={(e) => setFormData({ ...formData, rentOwn: e.target.value })}>
                <option value="">Select</option>
                <option value="rent">Rent</option>
                <option value="own">Own</option>
              </select>
            </div>
          </div>
          {formData.rentOwn === "rent" && (
            <FileUpload label="Landlord Permission Letter" files={formData.landlordPermission}
              onChange={(files) => setFormData({ ...formData, landlordPermission: files })} maxFiles={1} />
          )}
          <div className="space-y-3">
            <ToggleSwitch checked={formData.hasChildren}
              onChange={(v) => setFormData({ ...formData, hasChildren: v })}
              label="Do you have children?" description="We'll check pet compatibility" />
            {formData.hasChildren && (
              <Input label="Children Details" placeholder="Ages and number of children"
                value={formData.childrenDetails}
                onChange={(e) => setFormData({ ...formData, childrenDetails: e.target.value })} fullWidth />
            )}
            <ToggleSwitch checked={formData.hasFencedYard}
              onChange={(v) => setFormData({ ...formData, hasFencedYard: v })} label="Do you have a fenced yard?" />
            <ToggleSwitch checked={formData.safeEnvironment}
              onChange={(v) => setFormData({ ...formData, safeEnvironment: v })} label="I can provide a safe environment" />
            <ToggleSwitch checked={formData.medicalAffordability}
              onChange={(v) => setFormData({ ...formData, medicalAffordability: v })} label="I can afford medical care" />
            <ToggleSwitch checked={formData.annualVaccinations}
              onChange={(v) => setFormData({ ...formData, annualVaccinations: v })} label="I commit to annual vaccinations" />
          </div>
          <FileUpload label="Proof of Residence *" files={formData.proofOfResidence}
            onChange={(files) => setFormData({ ...formData, proofOfResidence: files })} maxFiles={2} />
        </div>
      );
    }

    // ── Adoption Intent (always fresh — pet-specific) ──────────────────────
    if (stepName === "intent") {
      return (
        <div className="space-y-5">
          <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
            Adoption Intent
          </h3>
          <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
            These answers are specific to {pet.name} — tell us about your motivation.
          </p>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
              Why do you want to adopt {pet.name}? *
            </label>
            <textarea
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
              style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--color-text)" }}
              rows={4}
              placeholder="Tell us about your motivation and what you can offer..."
              value={formData.whyAdopt}
              onChange={(e) => setFormData({ ...formData, whyAdopt: e.target.value })}
            />
          </div>


          {/* Issue 13: petExperience now auto-populated from profile — shown as locked read-only */}
          {formData.petExperience && (
            <div
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--color-success, #22c55e)" }} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Experience Level (from your profile)</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--color-text-light)" }}>{formData.petExperience}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <ToggleSwitch checked={formData.readyForHomeVisit}
              onChange={(v) => setFormData({ ...formData, readyForHomeVisit: v })}
              label="I'm ready for a home visit"
              description="Shelter may conduct a home inspection" />
            <ToggleSwitch checked={formData.handleVetVisits}
              onChange={(v) => setFormData({ ...formData, handleVetVisits: v })}
              label="I will handle regular vet visits" />
          </div>
        </div>
      );
    }

    // ── Compatibility Score ───────────────────────────────────────────────
    if (stepName === "compatibility") {
      const petIdStr = pet.id || pet._id || "";
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>
              Compatibility Check
            </h3>
            <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
              See how well your profile matches {pet.name}'s needs.
            </p>
          </div>
          {petIdStr ? (
            <CompatibilityScorePanel petId={petIdStr} petName={pet.name} />
          ) : (
            <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
              Unable to compute score — pet ID missing.
            </p>
          )}
        </div>
      );
    }

    // ── Review & Submit ───────────────────────────────────────────────────
    if (stepName === "review") {
      return (
        <div className="space-y-5">
          <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
            Review & Confirm
          </h3>

          {/* Pet card */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: "var(--color-surface)" }}
          >
            <img
              src={pet.images?.[0] || pet.image}
              alt={pet.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h4 className="font-semibold" style={{ color: "var(--color-text)" }}>
                {pet.name}
              </h4>
              <p style={{ color: "var(--color-text-light)" }}>
                {pet.breed} • {typeof pet.age === "number" ? `${pet.age} yrs` : pet.age}
              </p>
            </div>
          </div>

          {/* Summary sections */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{ background: "var(--color-surface)" }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                  Personal Information
                </h4>
                {(flowCase === "A" || infoCollected) && (
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "var(--color-primary)" }}
                    onClick={() => setShowInfoModal(true)}
                  >
                    <RefreshCw className="w-3 h-3" /> Edit profile
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: "var(--color-text-light)" }}>
                <p><strong>Name:</strong> {formData.fullName || "—"}</p>
                <p><strong>Phone:</strong> {formData.phone || "—"}</p>
                <p><strong>Address:</strong> {formData.address || "—"}</p>
                <p><strong>Documents:</strong> {formData.idDocuments.length} uploaded</p>
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "var(--color-surface)" }}>
              <h4 className="font-semibold text-sm mb-2" style={{ color: "var(--color-text)" }}>
                Household
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: "var(--color-text-light)" }}>
                <p><strong>Home:</strong> {formData.homeType || "—"}</p>
                <p><strong>Rent/Own:</strong> {formData.rentOwn || "—"}</p>
                <p><strong>Children:</strong> {formData.hasChildren ? "Yes" : "No"}</p>
                <p><strong>Fenced Yard:</strong> {formData.hasFencedYard ? "Yes" : "No"}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "var(--color-surface)" }}>
              <h4 className="font-semibold text-sm mb-2" style={{ color: "var(--color-text)" }}>
                Intent for {pet.name}
              </h4>
              <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
                {formData.whyAdopt
                  ? formData.whyAdopt.length > 120
                    ? formData.whyAdopt.substring(0, 120) + "…"
                    : formData.whyAdopt
                  : "Not provided"}
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="p-4 rounded-xl" style={{ background: "var(--color-surface)" }}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded"
                style={{ accentColor: "var(--color-primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--color-text)" }}>
                I agree to the adoption policies and understand that providing false information may
                result in rejection of my application.
              </span>
            </label>
          </div>
        </div>
      );
    }

    return null;
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isOpen && !profileLoaded && profileStatus === "loading") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "white" }}
            />
            <p className="text-white text-sm">Loading your profile…</p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <>
      {/* AdoptionInfoModal — shown first for Cases B & C */}
      <AdoptionInfoModal
        isOpen={needsInfoModal || showInfoModal}
        onClose={() => {
          setShowInfoModal(false);
          // If it was the first-time modal and user closes without saving, close everything
          if (needsInfoModal) onClose();
        }}
        missingSections={missingSections as any}
        isFirstTime={flowCase === "C"}
        onComplete={async () => {
          await refreshProfile();
          setInfoCollected(true);
          setShowInfoModal(false);
          // Re-determine flow case based on refreshed profile
          // (profile context will update, useEffect will re-run)
        }}
      />

      <AnimatePresence>
        {isOpen && !needsInfoModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="w-full max-w-2xl pointer-events-auto flex flex-col"
                style={{
                  maxHeight: "85vh",
                  background: "var(--color-card)",
                  borderRadius: "var(--radius-xl)",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between p-6 border-b flex-shrink-0"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={pet.images?.[0] || pet.image}
                      alt={pet.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                        Adopt {pet.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
                          Step {currentStep + 1} of {steps.length}
                        </p>
                        {flowCase === "A" && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              color: "var(--color-success, #22c55e)",
                            }}
                          >
                            <Check className="w-2.5 h-2.5" />
                            Profile on file
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg transition-colors hover:bg-black/5"
                    style={{ background: "var(--color-surface)" }}
                  >
                    <X className="w-5 h-5" style={{ color: "var(--color-text)" }} />
                  </button>
                </div>

                {/* Step progress */}
                <div className="px-6 py-4 flex-shrink-0" style={{ background: "var(--color-surface)" }}>
                  <div className="flex items-center justify-between">
                    {steps.map((step: any, index: number) => {
                      const Icon = step.icon;
                      const isCompleted = index < currentStep;
                      const isCurrent = index === currentStep;
                      return (
                        <Fragment key={step.id}>
                          <div className="flex flex-col items-center">
                            <motion.div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{
                                background:
                                  isCompleted || isCurrent
                                    ? "var(--color-primary)"
                                    : "var(--color-border)",
                                color:
                                  isCompleted || isCurrent ? "white" : "var(--color-text-light)",
                              }}
                              animate={{ scale: isCurrent ? 1.1 : 1 }}
                            >
                              {isCompleted ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Icon className="w-4 h-4" />
                              )}
                            </motion.div>
                            <span
                              className="text-xs mt-1 hidden md:block"
                              style={{
                                color: isCurrent ? "var(--color-primary)" : "var(--color-text-light)",
                                fontWeight: isCurrent ? 600 : 400,
                              }}
                            >
                              {step.title}
                            </span>
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className="flex-1 h-0.5 mx-2 rounded-full"
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      {renderStepContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between p-6 border-t flex-shrink-0"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}
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
    </>
  );
}
