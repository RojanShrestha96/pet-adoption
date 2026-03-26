import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Home,
  Activity,
  Shield,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { FileUpload } from "../forms/FileUpload";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { useToast } from "../ui/Toast";
import {
  useAdopterProfile,
  AdopterPersonalInfo,
  AdopterHousehold,
  AdopterLifestyle,
} from "../../contexts/AdopterProfileContext";

// ─── Section definitions ─────────────────────────────────────────────────────

type SectionId = "personalInfo" | "household" | "lifestyle";

const ALL_SECTIONS: { id: SectionId; title: string; subtitle: string; icon: React.ElementType }[] = [
  {
    id: "personalInfo",
    title: "Personal Details",
    subtitle: "Your identity & ID documents",
    icon: User,
  },
  {
    id: "household",
    title: "Your Home",
    subtitle: "Where your new pet will live",
    icon: Home,
  },
  {
    id: "lifestyle",
    title: "Your Lifestyle",
    subtitle: "Helps match you with the right pet",
    icon: Activity,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdoptionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Sections to show — if undefined, show all */
  missingSections?: SectionId[];
  /** Called when all required sections are saved */
  onComplete: () => void;
  /** Whether this is first time (show welcome copy) */
  isFirstTime?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AdoptionInfoModal({
  isOpen,
  onClose,
  missingSections,
  onComplete,
  isFirstTime = false,
}: AdoptionInfoModalProps) {
  const { showToast } = useToast();
  const { profile, saveProfile } = useAdopterProfile();

  const sectionsToShow = missingSections
    ? ALL_SECTIONS.filter((s) => missingSections.includes(s.id))
    : ALL_SECTIONS;

  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // ── Local form state ────────────────────────────────────────────────────────

  const [personalInfo, setPersonalInfo] = useState<AdopterPersonalInfo>({
    fullName: "",
    phone: "",
    age: undefined,
    address: "",
    idType: "",
    idNumber: "",
    idDocuments: [],
  });

  const [household, setHousehold] = useState<AdopterHousehold>({
    homeType: "",
    housing: { type: "", landlordPermission: false },
    rentOwn: "",
    landlordPermission: [],
    hasChildren: false,
    childrenAges: [],
    childrenDetails: "",
    hasDogs: false,
    hasCats: false,
    hasSmallAnimals: false,
    existingPets: "",
    hasFencedYard: false,
    safeEnvironment: false,
    medicalAffordability: false,
    annualVaccinations: false,
    proofOfResidence: [],
  });

  const [lifestyle, setLifestyle] = useState<AdopterLifestyle>({
    activityLevel: "",
    monthlyPetBudget: "",
    hoursAwayPerDay: undefined,
    experienceLevel: "",
    dailyRoutine: "",
  });

  // Pre-fill from existing profile if present.
  // Also seeds address & phone from the User account if not yet stored in personalInfo.
  useEffect(() => {
    if (!profile) return;

    if (profile.personalInfo) {
      setPersonalInfo((prev) => ({ ...prev, ...profile.personalInfo }));
    } else {
      // No personalInfo saved yet — pre-seed from the User model fields
      setPersonalInfo((prev) => ({
        ...prev,
        address: prev.address || profile.userAddress || "",
        phone: prev.phone || profile.userPhone || "",
      }));
    }

    if (profile.household) {
      setHousehold((prev) => ({ ...prev, ...profile.household }));
    }
    if (profile.lifestyle) {
      setLifestyle((prev) => ({ ...prev, ...profile.lifestyle }));
    }
  }, [profile]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const currentSection = sectionsToShow[currentSectionIdx];
  const isLastSection = currentSectionIdx === sectionsToShow.length - 1;

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateCurrentSection = (): boolean => {
    if (!currentSection) return true;

    if (currentSection.id === "personalInfo") {
      if (!personalInfo.fullName?.trim()) {
        showToast("Please enter your full name.", "error");
        return false;
      }
      if (!personalInfo.phone?.trim()) {
        showToast("Please enter your phone number.", "error");
        return false;
      }
      if (!personalInfo.age || personalInfo.age < 18) {
        showToast("You must be at least 18 years old.", "error");
        return false;
      }
      if (!personalInfo.address?.trim()) {
        showToast("Please enter your address.", "error");
        return false;
      }
      if (!personalInfo.idType) {
        showToast("Please select an ID type.", "error");
        return false;
      }
      if (!personalInfo.idNumber?.trim()) {
        showToast("Please enter your ID number.", "error");
        return false;
      }
      if (!personalInfo.idDocuments?.length) {
        showToast("Please upload your ID document.", "error");
        return false;
      }
    }

    if (currentSection.id === "household") {
      if (!household.homeType) {
        showToast("Please select your home type.", "error");
        return false;
      }
      if (!household.housing?.type && !household.rentOwn) {
        showToast("Please indicate whether you rent or own.", "error");
        return false;
      }
      if (!household.proofOfResidence?.length) {
        showToast("Please upload proof of residence.", "error");
        return false;
      }
    }

    if (currentSection.id === "lifestyle") {
      if (!lifestyle.activityLevel) {
        showToast("Please select your activity level.", "error");
        return false;
      }
      if (!lifestyle.experienceLevel) {
        showToast("Please select your experience level with pets.", "error");
        return false;
      }
    }

    return true;
  };

  // ── Save section data ───────────────────────────────────────────────────────

  const handleNext = async () => {
    if (!validateCurrentSection()) return;

    if (isLastSection) {
      await handleSaveAll();
    } else {
      setCurrentSectionIdx((i) => i + 1);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await saveProfile({ personalInfo, household, lifestyle });
      showToast("Your adoption profile has been saved! 🎉", "success");
      onComplete();
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || "Failed to save profile. Please try again.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render helpers ──────────────────────────────────────────────────────────

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          placeholder="Your full name"
          value={personalInfo.fullName ?? ""}
          onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
          fullWidth
        />
        <Input
          label="Age *"
          type="number"
          placeholder="Your age"
          value={personalInfo.age?.toString() ?? ""}
          onChange={(e) =>
            setPersonalInfo({ ...personalInfo, age: parseInt(e.target.value) || undefined })
          }
          fullWidth
        />
      </div>
      <Input
        label="Phone *"
        type="tel"
        placeholder="+977 98XXXXXXXX"
        value={personalInfo.phone ?? ""}
        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
        fullWidth
      />
      <Input
        label="Address *"
        placeholder="Your full address"
        value={personalInfo.address ?? ""}
        onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
        fullWidth
      />
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Government ID (Issued in Nepal) *
        </label>
        <select
          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-text)",
          }}
          value={personalInfo.idType ?? ""}
          onChange={(e) => setPersonalInfo({ ...personalInfo, idType: e.target.value })}
        >
          <option value="">Select identity document</option>
          <option value="citizenship">Nepali Citizenship Certificate</option>
          <option value="passport">Passport</option>
          <option value="license">Driving License</option>
        </select>
      </div>
      <div>
        <Input
          label={personalInfo.idType === "citizenship" ? "Citizenship Certificate Number *" : "ID Number *"}
          placeholder={personalInfo.idType === "citizenship" ? "Enter your citizenship number" : "Enter ID number"}
          value={personalInfo.idNumber ?? ""}
          onChange={(e) => setPersonalInfo({ ...personalInfo, idNumber: e.target.value })}
          fullWidth
        />
        {personalInfo.idType === "citizenship" && (
          <p className="text-xs mt-1.5" style={{ color: "var(--color-text-light)" }}>
            Issued by the Government of Nepal
          </p>
        )}
      </div>
      <FileUpload
        label="Upload ID Document *"
        files={personalInfo.idDocuments ?? []}
        onChange={(files) => setPersonalInfo({ ...personalInfo, idDocuments: files })}
        maxFiles={2}
      />
    </div>
  );

  const renderHousehold = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
            Home Type *
          </label>
          <select
            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-card)",
              color: "var(--color-text)",
            }}
            value={household.homeType ?? ""}
            onChange={(e) => setHousehold({ ...household, homeType: e.target.value })}
          >
            <option value="">Select type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
            Rent or Own *
          </label>
          <select
            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-card)",
              color: "var(--color-text)",
            }}
            value={household.housing?.type || household.rentOwn || ""}
            onChange={(e) => {
              const val = e.target.value;
              setHousehold({
                ...household,
                housing: { ...household.housing, type: val },
                rentOwn: val // Keep legacy in-sync just in case
              });
            }}
          >
            <option value="">Select</option>
            <option value="rent">Rent</option>
            <option value="own">Own</option>
            <option value="live-with-family">Live with family</option>
          </select>
        </div>
      </div>

      {(household.housing?.type === "rent" || household.rentOwn === "rent") && (
        <div className="space-y-4">
          <ToggleSwitch
            checked={household.housing?.landlordPermission || false}
            onChange={(v) =>
              setHousehold({
                ...household,
                housing: { ...household.housing, landlordPermission: v },
              })
            }
            label="I have explicit permission from my landlord to keep a pet."
          />
          <FileUpload
            label="Landlord Permission Letter (Optional)"
            files={household.landlordPermission ?? []}
            onChange={(files) => setHousehold({ ...household, landlordPermission: files })}
            maxFiles={1}
          />
        </div>
      )}

      <div className="space-y-4">
        <ToggleSwitch
          checked={household.hasChildren ?? false}
          onChange={(v) => setHousehold({ ...household, hasChildren: v })}
          label="Do you have children?"
          description="If yes, we'll check pet compatibility"
        />
        {household.hasChildren && (
          <div className="pl-4 border-l-2" style={{ borderColor: "var(--color-border)" }}>
            <label className="block text-sm font-medium mb-3" style={{ color: "var(--color-text)" }}>
              Children's Ages (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { id: "infant", label: "Infant (0-2)" },
                { id: "toddler", label: "Toddler (3-5)" },
                { id: "school-age", label: "School Age (6-12)" },
                { id: "teen", label: "Teen (13+)" },
              ].map((age) => (
                <label key={age.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    style={{ accentColor: "var(--color-primary)" }}
                    className="w-4 h-4 rounded"
                    checked={household.childrenAges?.includes(age.id) ?? false}
                    onChange={(e) => {
                      const ages = household.childrenAges || [];
                      const newAges = e.target.checked
                        ? [...ages, age.id]
                        : ages.filter((a) => a !== age.id);
                      setHousehold({ ...household, childrenAges: newAges });
                    }}
                  />
                  {age.label}
                </label>
              ))}
            </div>
            <Input
              label="Additional Details"
              placeholder="Any specific child routines?"
              value={household.childrenDetails ?? ""}
              onChange={(e) => setHousehold({ ...household, childrenDetails: e.target.value })}
              fullWidth
            />
          </div>
        )}
        <ToggleSwitch
          checked={household.hasFencedYard ?? false}
          onChange={(v) => setHousehold({ ...household, hasFencedYard: v })}
          label="Do you have a fenced yard?"
        />
        <ToggleSwitch
          checked={household.safeEnvironment ?? false}
          onChange={(v) => setHousehold({ ...household, safeEnvironment: v })}
          label="I can provide a safe environment"
        />
        <ToggleSwitch
          checked={household.medicalAffordability ?? false}
          onChange={(v) => setHousehold({ ...household, medicalAffordability: v })}
          label="I can afford regular medical care"
        />
        <ToggleSwitch
          checked={household.annualVaccinations ?? false}
          onChange={(v) => setHousehold({ ...household, annualVaccinations: v })}
          label="I commit to annual vaccinations"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Existing Pets in the Home
        </label>
        <div className="grid grid-cols-2 gap-3">
          <ToggleSwitch
            checked={household.hasDogs ?? false}
            onChange={(v) => setHousehold({ ...household, hasDogs: v })}
            label="Dogs"
          />
          <ToggleSwitch
            checked={household.hasCats ?? false}
            onChange={(v) => setHousehold({ ...household, hasCats: v })}
            label="Cats"
          />
          <ToggleSwitch
            checked={household.hasSmallAnimals ?? false}
            onChange={(v) => setHousehold({ ...household, hasSmallAnimals: v })}
            label="Small Animals"
          />
        </div>
        <textarea
          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-text)",
          }}
          rows={2}
          placeholder="Additional details about your pets (ages, personalities, etc.)"
          value={household.existingPets ?? ""}
          onChange={(e) => setHousehold({ ...household, existingPets: e.target.value })}
        />
      </div>

      <FileUpload
        label="Proof of Residence *"
        files={household.proofOfResidence ?? []}
        onChange={(files) => setHousehold({ ...household, proofOfResidence: files })}
        maxFiles={2}
      />
    </div>
  );

  const renderLifestyle = () => (
    <div className="space-y-5">
      {/* Activity level */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
          Your Activity Level *
        </label>
        <div className="flex gap-3">
          {(["low", "moderate", "high"] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setLifestyle({ ...lifestyle, activityLevel: level })}
              className="flex-1 px-3 py-3 rounded-xl text-sm font-medium capitalize transition-all border-2"
              style={{
                background:
                  lifestyle.activityLevel === level
                    ? "var(--color-primary)"
                    : "var(--color-surface)",
                color:
                  lifestyle.activityLevel === level ? "white" : "var(--color-text)",
                borderColor:
                  lifestyle.activityLevel === level
                    ? "var(--color-primary)"
                    : "var(--color-border)",
              }}
            >
              {level === "low" ? "🧘 Low" : level === "moderate" ? "🚶 Moderate" : "🏃 High"}
            </button>
          ))}
        </div>
      </div>

      {/* Experience level */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
          Experience with Pets *
        </label>
        <div className="flex gap-3">
          {(["none", "some", "experienced"] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setLifestyle({ ...lifestyle, experienceLevel: level })}
              className="flex-1 px-3 py-3 rounded-xl text-sm font-medium capitalize transition-all border-2"
              style={{
                background:
                  lifestyle.experienceLevel === level
                    ? "var(--color-primary)"
                    : "var(--color-surface)",
                color:
                  lifestyle.experienceLevel === level ? "white" : "var(--color-text)",
                borderColor:
                  lifestyle.experienceLevel === level
                    ? "var(--color-primary)"
                    : "var(--color-border)",
              }}
            >
              {level === "none"
                ? "🌱 First-time"
                : level === "some"
                ? "😊 Some experience"
                : "⭐ Experienced"}
            </button>
          ))}
        </div>
      </div>

      {/* Hours away */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
          Hours Away from Home per Day (approx.)
        </label>
        <input
          type="range"
          min={0}
          max={16}
          step={1}
          value={lifestyle.hoursAwayPerDay ?? 8}
          onChange={(e) =>
            setLifestyle({ ...lifestyle, hoursAwayPerDay: parseInt(e.target.value) })
          }
          className="w-full"
          style={{ accentColor: "var(--color-primary)" }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-light)" }}>
          <span>0h (home all day)</span>
          <span className="font-medium" style={{ color: "var(--color-primary)" }}>
            {lifestyle.hoursAwayPerDay ?? 8}h / day
          </span>
          <span>16h+</span>
        </div>
      </div>

      {/* Daily routine */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
          Daily Routine <span style={{ color: "var(--color-text-light)" }}>(optional)</span>
        </label>
        <textarea
          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-text)",
          }}
          rows={3}
          placeholder="e.g. Work from home, evening walks, weekend hikes…"
          value={lifestyle.dailyRoutine ?? ""}
          onChange={(e) => setLifestyle({ ...lifestyle, dailyRoutine: e.target.value })}
        />
      </div>

      {/* Monthly Budget */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
          Estimated Monthly Pet Budget
        </label>
        <select
          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-text)",
          }}
          value={lifestyle.monthlyPetBudget ?? ""}
          onChange={(e) => setLifestyle({ ...lifestyle, monthlyPetBudget: e.target.value })}
        >
          <option value="">Select a budget range</option>
          <option value="under-5000">Under Rs 5,000</option>
          <option value="5000-10000">Rs 5,000 – 10,000</option>
          <option value="10000-20000">Rs 10,000 – 20,000</option>
          <option value="20000+">Rs 20,000+</option>
        </select>
        <p className="text-xs mt-1.5" style={{ color: "var(--color-text-light)" }}>
          Covers food, treats, toys, basic grooming, and routine veterinary care.
        </p>
      </div>
    </div>
  );

  const renderSection = () => {
    if (!currentSection) return null;
    if (currentSection.id === "personalInfo") return renderPersonalInfo();
    if (currentSection.id === "household") return renderHousehold();
    if (currentSection.id === "lifestyle") return renderLifestyle();
    return null;
  };

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-xl pointer-events-auto flex flex-col"
              style={{
                maxHeight: "88vh",
                background: "var(--color-card)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-start justify-between p-6 border-b flex-shrink-0"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div>
                  {isFirstTime && currentSectionIdx === 0 && (
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-2"
                      style={{
                        background: "rgba(var(--color-primary-rgb, 99,102,241), 0.1)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <Shield className="w-3 h-3" />
                      Collected once, used forever
                    </div>
                  )}
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {isFirstTime && currentSectionIdx === 0
                      ? "Build Your Adoption Profile"
                      : currentSection?.title}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-text-light)" }}>
                    {isFirstTime && currentSectionIdx === 0
                      ? "We collect this once to make every future adoption faster."
                      : currentSection?.subtitle}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-black/5 flex-shrink-0"
                  style={{ background: "var(--color-surface)" }}
                >
                  <X className="w-5 h-5" style={{ color: "var(--color-text)" }} />
                </button>
              </div>

              {/* Progress strip */}
              {sectionsToShow.length > 1 && (
                <div
                  className="px-6 py-3 flex items-center gap-2 flex-shrink-0"
                  style={{ background: "var(--color-surface)" }}
                >
                  {sectionsToShow.map((section, idx) => {
                    const Icon = section.icon;
                    const done = idx < currentSectionIdx;
                    const active = idx === currentSectionIdx;
                    return (
                      <div key={section.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              background:
                                done || active
                                  ? "var(--color-primary)"
                                  : "var(--color-border)",
                              color: done || active ? "white" : "var(--color-text-light)",
                            }}
                          >
                            {done ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <span
                            className="text-xs mt-1 hidden sm:block whitespace-nowrap"
                            style={{
                              color: active
                                ? "var(--color-primary)"
                                : "var(--color-text-light)",
                              fontWeight: active ? 600 : 400,
                            }}
                          >
                            {section.title}
                          </span>
                        </div>
                        {idx < sectionsToShow.length - 1 && (
                          <div
                            className="flex-1 h-0.5 mx-2"
                            style={{
                              background:
                                idx < currentSectionIdx
                                  ? "var(--color-primary)"
                                  : "var(--color-border)",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSectionIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {renderSection()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between p-6 border-t flex-shrink-0"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-card)",
                }}
              >
                <Button
                  variant="ghost"
                  onClick={() =>
                    currentSectionIdx === 0 ? onClose() : setCurrentSectionIdx((i) => i - 1)
                  }
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  {currentSectionIdx === 0 ? "Cancel" : "Back"}
                </Button>

                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={isSaving}
                  icon={
                    isSaving ? undefined : isLastSection ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )
                  }
                >
                  {isSaving
                    ? "Saving…"
                    : isLastSection
                    ? "Save & Continue"
                    : "Continue"}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
