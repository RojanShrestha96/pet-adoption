import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Home,
  Activity,
  Heart,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { FileUpload } from "../forms/FileUpload";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { useToast } from "../ui/Toast";
import axios from "axios";

export interface AdopterProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (updatedProfile: any) => void;
  token: string;
  initialStep?: number;
  profileData?: any; // the current loaded profile from the server
}

const stepsConfig = [
  { id: 0, title: "Personal Details", icon: User },
  { id: 1, title: "Household", icon: Home },
  { id: 2, title: "Lifestyle", icon: Activity },
  { id: 3, title: "Preferences", icon: Heart },
  { id: 4, title: "Financial", icon: DollarSign },
];

export function AdopterProfileEditorModal({
  isOpen,
  onClose,
  onComplete,
  token,
  initialStep = 0,
  profileData,
}: AdopterProfileEditorModalProps) {
  const { showToast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSaving, setIsSaving] = useState(false);
  const [tier2Pending, setTier2Pending] = useState<boolean>(false);
  const [tier2Note, setTier2Note] = useState("");

  // Draft States
  const [personalInfoDraft, setPersonalInfoDraft] = useState<any>({});
  const [householdDraft, setHouseholdDraft] = useState<any>({});
  const [lifestyleDraft, setLifestyleDraft] = useState<any>({});
  const [preferencesDraft, setPreferencesDraft] = useState<any>({});
  const [financialDraft, setFinancialDraft] = useState<any>({});

  useEffect(() => {
    if (isOpen && profileData) {
      setCurrentStep(initialStep);
      setTier2Pending(false);
      setTier2Note("");
      
      setPersonalInfoDraft(profileData.personalInfo ?? {
        fullName: "", phone: "", age: "", address: "", idType: "", idNumber: "", idDocuments: []
      });
      setHouseholdDraft(profileData.household ?? {});
      setLifestyleDraft(profileData.lifestyle ?? {});
      setPreferencesDraft({
        preferredEnergyLevel: profileData.lifestyle?.preferredEnergyLevel ?? "",
        preferredSize: profileData.lifestyle?.preferredSize ?? "",
      });
      setFinancialDraft({
        monthlyPetBudget: profileData.lifestyle?.monthlyPetBudget ?? "",
        upcomingLifeChanges: profileData.lifestyle?.upcomingLifeChanges ?? [],
      });
    }
  }, [isOpen, profileData, initialStep]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !tier2Pending) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, tier2Pending]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < stepsConfig.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const validateAndBuildPayload = () => {
    const payload: any = {
      personalInfo: personalInfoDraft,
      household: householdDraft,
      lifestyle: {
        ...lifestyleDraft,
        preferredEnergyLevel: preferencesDraft.preferredEnergyLevel,
        preferredSize: preferencesDraft.preferredSize,
        monthlyPetBudget: financialDraft.monthlyPetBudget,
        upcomingLifeChanges: financialDraft.upcomingLifeChanges,
      }
    };
    return payload;
  };

  const handleSave = async (force = false) => {
    const payload = validateAndBuildPayload();
    
    // Check Tier 2 triggers
    const TIER2 = [
      "homeType", "hasFencedYard", "hasChildren", "childrenAgeRange", 
      "existingPets", "housingTenure", "landlordPermission", 
      "proofOfResidence", "idDocuments"
    ];
    
    // Simplistic check to see if we changed tier 2 fields vs initial profileData?
    // Actually the backend just re-evaluates if needed, but the original UI warned if these existed.
    // For simplicity, we trigger the warning if the user edited any of the sensitive fields
    // without `force`. We can just check if any sensitive keys are present.
    // In original code, it was if `Object.keys(payload[section] ?? {}).some(k => TIER2.includes(k))`.
    // Since we pass the full payload, it always has them. We should just prompt if force === false && (there is active adoption).
    // Original UI always prompted if TIER2 keys were present in the payload being saved.
    const hasTier2 = Object.keys(payload.household ?? {}).some((k) => TIER2.includes(k)) || 
                     Object.keys(payload.personalInfo ?? {}).some((k) => TIER2.includes(k));
                     
    if (hasTier2 && !force) {
      setTier2Pending(true);
      return;
    }

    setIsSaving(true);
    try {
      const finalPayload = tier2Note ? { ...payload, adopterNote: tier2Note } : payload;
      const res = await axios.put("http://localhost:5000/api/auth/adopter-profile", finalPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updated = res.data.profile;
      const notified = res.data.tier2NotificationSent;
      
      showToast(
        notified
          ? "Profile updated. Your profile change has been shared with your active shelter(s)."
          : "Profile saved successfully. Your compatibility scores have been refreshed.",
        "success"
      );
      
      onComplete(updated);
      onClose();
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      showToast(err.response?.data?.message || "Failed to save profile changes.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row shadow-2xl"
      >
        {/* Sidebar Stepper */}
        <div className="bg-gray-50 border-r border-gray-200 w-full md:w-64 flex-shrink-0 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Update Profile</h2>
            <button onClick={onClose} className="md:hidden text-gray-500 hover:bg-gray-200 p-1 rounded-full">
               <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar">
            {stepsConfig.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === idx;
              const isPassed = currentStep > idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium ${
                    isActive ? "bg-[var(--color-primary)] text-white shadow-md" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <div className={`p-2 rounded-full ${isActive ? "bg-white/20" : isPassed ? "bg-green-100 text-green-600" : "bg-gray-200"}`}>
                    {isPassed ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="whitespace-nowrap">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute top-4 right-4 hidden md:block">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar">
            {tier2Pending ? (
              <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6">
                <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-2">
                   <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Important Notice</h3>
                <p className="text-gray-600">
                  You are changing core household/personal details. This may notify shelters that are currently reviewing your pending applications.
                </p>
                <div className="w-full text-left">
                  <Input 
                    label="Optional Note to Shelters" 
                    placeholder="Brief reason for the profile change..."
                    value={tier2Note}
                    onChange={(e) => setTier2Note(e.target.value)}
                    fullWidth
                  />
                </div>
                <div className="flex gap-3 w-full mt-4">
                  <Button variant="outline" fullWidth onClick={() => setTier2Pending(false)}>Go Back</Button>
                  <Button variant="primary" fullWidth onClick={() => handleSave(true)} disabled={isSaving}>
                     Confirm & Save
                  </Button>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Step 0: Personal Info */}
                  {currentStep === 0 && (
                    <>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Personal Details</h3>
                        <p className="text-gray-500">Your legal identity and contact information.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Full Name" value={personalInfoDraft.fullName ?? ""} onChange={(e) => setPersonalInfoDraft((p: any) => ({ ...p, fullName: e.target.value }))} placeholder="Full legal name" fullWidth />
                        <Input label="Phone Number" value={personalInfoDraft.phone ?? ""} onChange={(e) => setPersonalInfoDraft((p: any) => ({ ...p, phone: e.target.value }))} placeholder="+977..." fullWidth />
                        <Input label="Age" type="number" value={personalInfoDraft.age ?? ""} onChange={(e) => setPersonalInfoDraft((p: any) => ({ ...p, age: e.target.value ? Number(e.target.value) : undefined }))} fullWidth />
                        <Input label="Current Address" value={personalInfoDraft.address ?? ""} onChange={(e) => setPersonalInfoDraft((p: any) => ({ ...p, address: e.target.value }))} placeholder="City, Area, House No." fullWidth />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">ID Type</label>
                          <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={personalInfoDraft.idType ?? ""} onChange={(e) => setPersonalInfoDraft((p: any) => ({ ...p, idType: e.target.value }))}>
                            <option value="">Select identity document</option>
                            <option value="citizenship">Nepali Citizenship Certificate</option>
                            <option value="passport">Passport</option>
                            <option value="license">Driving License</option>
                          </select>
                        </div>
                        <Input label="ID Number" value={personalInfoDraft.idNumber ?? ""} onChange={(e) => setPersonalInfoDraft((p: any) => ({ ...p, idNumber: e.target.value }))} fullWidth />
                      </div>
                      <div className="mt-6">
                        <FileUpload
                          label="Government ID Documents (Max 2)"
                          files={personalInfoDraft.idDocuments ?? []}
                          onChange={(files) => setPersonalInfoDraft((p: any) => ({ ...p, idDocuments: files }))}
                          maxFiles={2}
                        />
                      </div>
                    </>
                  )}

                  {/* Step 1: Household */}
                  {currentStep === 1 && (
                    <>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Household</h3>
                        <p className="text-gray-500">Details about your living situation and family.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Home Type</label>
                          <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={householdDraft.homeType ?? ""} onChange={(e) => setHouseholdDraft((p: any) => ({ ...p, homeType: e.target.value }))}>
                            <option value="">Select type</option>
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="condo">Condo</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Rent or Own</label>
                          <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={householdDraft.rentOwn ?? ""} onChange={(e) => setHouseholdDraft((p: any) => ({ ...p, rentOwn: e.target.value }))}>
                            <option value="">Select</option>
                            <option value="rent">Rent</option>
                            <option value="own">Own</option>
                            <option value="live with family">Live with family</option>
                          </select>
                        </div>
                      </div>
                      {householdDraft.rentOwn === "rent" && (
                        <div className="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                           <FileUpload label="Landlord Permission Document (Optional)" files={householdDraft.landlordPermissionDocs ?? []} onChange={(files) => setHouseholdDraft((p: any) => ({ ...p, landlordPermissionDocs: files }))} maxFiles={1} />
                        </div>
                      )}
                      
                      <div className="space-y-4 mt-6">
                        <ToggleSwitch checked={householdDraft.hasChildren ?? false} onChange={(v) => setHouseholdDraft({ ...householdDraft, hasChildren: v })} label="Do you have children in the home?" />
                        {householdDraft.hasChildren && (
                          <div className="pl-4 border-l-2 border-gray-200 ml-2">
                             <Input label="Children Age Range/Details" value={householdDraft.childrenDetails ?? ""} onChange={(e) => setHouseholdDraft((p: any) => ({ ...p, childrenDetails: e.target.value }))} placeholder="E.g. 5, 8, 12 years old" fullWidth />
                          </div>
                        )}
                        <ToggleSwitch checked={householdDraft.hasFencedYard ?? false} onChange={(v) => setHouseholdDraft({ ...householdDraft, hasFencedYard: v })} label="Do you have a fenced yard?" />
                        <ToggleSwitch checked={householdDraft.safeEnvironment ?? false} onChange={(v) => setHouseholdDraft({ ...householdDraft, safeEnvironment: v })} label="I can provide a safe and stable environment" />
                        <ToggleSwitch checked={householdDraft.annualVaccinations ?? false} onChange={(v) => setHouseholdDraft({ ...householdDraft, annualVaccinations: v })} label="I agree to keep the pet up-to-date on annual vaccinations" />
                      </div>
                      
                      <div className="mt-6">
                        <FileUpload label="Proof of Residence (Utility Bill, Lease) *" files={householdDraft.proofOfResidence ?? []} onChange={(files) => setHouseholdDraft((p: any) => ({ ...p, proofOfResidence: files }))} maxFiles={2} />
                      </div>
                    </>
                  )}

                  {/* Step 2: Lifestyle */}
                  {currentStep === 2 && (
                    <>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Lifestyle</h3>
                        <p className="text-gray-500">Your daily routine and pet experience.</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Work Style</label>
                          <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={lifestyleDraft.workStyle ?? ""} onChange={(e) => setLifestyleDraft((p: any) => ({ ...p, workStyle: e.target.value }))}>
                            <option value="">Select your work setup</option>
                            <option value="remote">Remote / Work from home</option>
                            <option value="hybrid">Hybrid (Some days office)</option>
                            <option value="office">Office / On-site full time</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Home Activity Level</label>
                          <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={lifestyleDraft.activityLevel ?? ""} onChange={(e) => setLifestyleDraft((p: any) => ({ ...p, activityLevel: e.target.value }))}>
                            <option value="">Select activity level</option>
                            <option value="low">Quiet & Relaxed</option>
                            <option value="moderate">Moderate & Balanced</option>
                            <option value="high">Active & Busy</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Pet Experience</label>
                          <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={lifestyleDraft.experienceLevel ?? ""} onChange={(e) => setLifestyleDraft((p: any) => ({ ...p, experienceLevel: e.target.value }))}>
                            <option value="">Select experience level</option>
                            <option value="first-time">First Time Owner</option>
                            <option value="some">Have owned pets in the past</option>
                            <option value="experienced">Highly experienced with various pets</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Pet Care Support (Select all that apply)</label>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                             {["dog-walker", "pet-sitter", "trusted-family-nearby", "doggy-daycare"].map(support => {
                               const selected = (lifestyleDraft.petCareSupport ?? []).includes(support);
                               return (
                                 <button
                                   key={support}
                                   onClick={() => {
                                     const current = lifestyleDraft.petCareSupport ?? [];
                                     setLifestyleDraft((p: any) => ({
                                       ...p,
                                       petCareSupport: selected ? current.filter((i: string) => i !== support) : [...current, support]
                                     }));
                                   }}
                                   className={`p-3 border-2 rounded-xl text-sm transition-colors text-left ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                                 >
                                   {support.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                 </button>
                               )
                             })}
                          </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium mb-1 mt-4 text-gray-700">Describe your daily routine</label>
                           <textarea
                             className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                             rows={3}
                             placeholder="E.g., I wake up at 7, go for a walk, work from 9-5..."
                             value={lifestyleDraft.dailyRoutine ?? ""}
                             onChange={(e) => setLifestyleDraft((p: any) => ({ ...p, dailyRoutine: e.target.value }))}
                           />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 3: Preferences */}
                  {currentStep === 3 && (
                    <>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Matching Preferences</h3>
                        <p className="text-gray-500">Help shelters know what kind of pet suits you.</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Preferred Energy Level</label>
                          <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={preferencesDraft.preferredEnergyLevel ?? ""} onChange={(e) => setPreferencesDraft((p: any) => ({ ...p, preferredEnergyLevel: e.target.value }))}>
                            <option value="">No Preference</option>
                            <option value="low">Low (Couch Potato)</option>
                            <option value="moderate">Moderate (Daily Walks)</option>
                            <option value="high">High (Running/Hiking Partner)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Preferred Size</label>
                          <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={preferencesDraft.preferredSize ?? ""} onChange={(e) => setPreferencesDraft((p: any) => ({ ...p, preferredSize: e.target.value }))}>
                            <option value="">No Preference</option>
                            <option value="small">Small (0-10 kg)</option>
                            <option value="medium">Medium (10-25 kg)</option>
                            <option value="large">Large (25+ kg)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 4: Financial & Wrap Up */}
                  {currentStep === 4 && (
                    <>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Financial & Future</h3>
                        <p className="text-gray-500">Ensure you're ready for the long-term commitment.</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Monthly Pet Budget (NPR)</label>
                          <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={financialDraft.monthlyPetBudget ?? ""} onChange={(e) => setFinancialDraft((p: any) => ({ ...p, monthlyPetBudget: e.target.value }))}>
                            <option value="">Please select</option>
                            <option value="under-5000">Under NPR 5,000</option>
                            <option value="5000-10000">NPR 5,000 - 10,000</option>
                            <option value="10000-20000">NPR 10,000 - 20,000</option>
                            <option value="over-20000">Over NPR 20,000</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Upcoming Life Changes (Next 6-12 mos)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                             {["moving-home", "expecting-baby", "extended-travel", "job-change", "none"].map(change => {
                               const selected = (financialDraft.upcomingLifeChanges ?? []).includes(change);
                               return (
                                 <button
                                   key={change}
                                   onClick={() => {
                                     const current = financialDraft.upcomingLifeChanges ?? [];
                                     // "none" clears others
                                     if (change === "none") {
                                         setFinancialDraft((p: any) => ({ ...p, upcomingLifeChanges: ["none"] }));
                                     } else {
                                         const withoutNone = current.filter((i: string) => i !== "none");
                                         setFinancialDraft((p: any) => ({
                                           ...p,
                                           upcomingLifeChanges: selected ? withoutNone.filter((i: string) => i !== change) : [...withoutNone, change]
                                         }));
                                     }
                                   }}
                                   className={`p-2 border-2 rounded-xl text-xs transition-colors text-center ${selected ? "border-amber-500 bg-amber-50 text-amber-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                                 >
                                   {change.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                 </button>
                               )
                             })}
                          </div>
                        </div>
                        
                        
                        <div className="pt-6 border-t border-gray-100 mt-8">
                           <div className="bg-green-50 p-4 border border-green-100 rounded-xl mb-4">
                              <h4 className="text-sm font-bold text-green-800 mb-1">Ready to Save Profile?</h4>
                              <p className="text-xs text-green-700">Submitting these changes will update your compatibility scores across the entire platform.</p>
                           </div>
                           <Button variant="primary" fullWidth size="lg" icon={<Save className="w-5 h-5" />} onClick={() => handleSave(false)} disabled={isSaving}>
                             {isSaving ? "Saving..." : "Save Adoption Profile"}
                           </Button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Bottom Footer Actions (Only if not tier2Pending and not Step 4 where save is inline) */}
          {!tier2Pending && (
            <div className="border-t border-gray-100 p-4 bg-white flex items-center justify-between">
              <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} icon={<ChevronLeft className="w-4 h-4" />}>
                Back
              </Button>
              {currentStep < stepsConfig.length - 1 ? (
                <Button variant="primary" onClick={handleNext} className="ml-auto flex items-center gap-2">
                  Next Step <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <div /> // spacing 
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
