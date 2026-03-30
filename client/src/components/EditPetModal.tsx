import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ImageUpload } from "./forms/ImageUpload";
export interface Pet {
  id: string;
  _id?: string; // Backend often uses _id
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  weight: string;
  size?: string;
  description: string;
  adoptionStatus: string;
  images: string[];
  medical?: {
    isVaccinated?: boolean;
    isDewormed?: boolean;
    isMicrochipped?: boolean;
    isNeutered?: boolean;
    healthStatus?: string;
    medicalNotes?: string;
  };
  behaviour?: {
    energyScore?: number;
    separationAnxiety?: string;
    attachmentStyle?: string;
    trainingDifficulty?: string;
    noiseLevel?: string;
    sheddingLevel?: string;
  };
  compatibility?: {
    goodWithKids?: string;
    goodWithPets?: string;
  };
  environment?: {
    idealEnvironment?: string;
    minSpaceSqm?: number;
  };
  financial?: {
    estimatedMonthlyCost?: number;
  };
}
export interface EditPetModalProps {
  pet: Pet;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pet: Pet) => void;
}
export function EditPetModal({
  pet,
  isOpen,
  onClose,
  onSave,
}: EditPetModalProps) {
  const [formData, setFormData] = useState<Pet>(pet);
  const [images, setImages] = useState(pet.images);

  // Sync state when pet prop changes
  useEffect(() => {
    setFormData(pet);
    setImages(pet.images);
  }, [pet]);

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
  const handleSave = () => {
    onSave({
      ...formData,
      images,
    });
    onClose();
  };

  const updateNestedField = (section: keyof Pet, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any || {}),
        [field]: value
      }
    }));
  };

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
              className="w-full max-w-4xl pointer-events-auto flex flex-col"
              style={{
                maxHeight: "90vh",
                background: "var(--color-card, #fff)",
                borderRadius: "var(--radius-xl, 24px)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed at top */}
              <div
                className="flex items-center justify-between p-6 border-b flex-shrink-0"
                style={{
                  background: "var(--color-card, #fff)",
                  borderColor: "var(--color-border, #e5e7eb)",
                }}
              >
                <h2
                  className="text-2xl font-bold text-gray-900"
                >
                  Edit Pet Details
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-black/5 bg-gray-100"
                >
                  <X
                    className="w-5 h-5 text-gray-600"
                  />
                </button>
              </div>

              {/* Content - Scrollable area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Images */}
                <section>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">01</span>
                    Pet Photos
                  </h3>
                  <ImageUpload
                    images={images}
                    onChange={setImages}
                    maxImages={5}
                  />
                </section>

                {/* Basic Info */}
                <section>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">02</span>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Pet Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      fullWidth
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Species
                      </label>
                      <select
                        className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-900"
                        value={formData.species}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            species: e.target.value,
                          })
                        }
                      >
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="bird">Bird</option>
                        <option value="rabbit">Rabbit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <Input
                      label="Breed"
                      value={formData.breed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breed: e.target.value,
                        })
                      }
                      fullWidth
                    />
                    <Input
                      label="Age"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age: e.target.value,
                        })
                      }
                      fullWidth
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Gender
                      </label>
                      <select
                        className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-900"
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <Input
                      label="Weight"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-900 resize-none"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </section>

                {/* Behaviour & Personality */}
                <section>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">03</span>
                    Behaviour & Personality
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Energy Level (1-5)</label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-sm"
                        value={formData.behaviour?.energyScore || ""}
                        onChange={(e) => updateNestedField("behaviour", "energyScore", parseInt(e.target.value))}
                      >
                        <option value="">Select level</option>
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Separation Anxiety</label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-sm"
                        value={formData.behaviour?.separationAnxiety || ""}
                        onChange={(e) => updateNestedField("behaviour", "separationAnxiety", e.target.value)}
                      >
                        <option value="">Select level</option>
                        <option value="none">None</option>
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Attachment Style</label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-sm"
                        value={formData.behaviour?.attachmentStyle || ""}
                        onChange={(e) => updateNestedField("behaviour", "attachmentStyle", e.target.value)}
                      >
                        <option value="">Select style</option>
                        <option value="independent">Independent</option>
                        <option value="moderate">Moderate</option>
                        <option value="velcro">Velcro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Training Difficulty</label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-sm"
                        value={formData.behaviour?.trainingDifficulty || ""}
                        onChange={(e) => updateNestedField("behaviour", "trainingDifficulty", e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="challenging">Challenging</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Compatibility & Environment */}
                <section>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm">04</span>
                    Compatibility & Environment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Good with Kids</label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-sm"
                        value={formData.compatibility?.goodWithKids || ""}
                        onChange={(e) => updateNestedField("compatibility", "goodWithKids", e.target.value)}
                      >
                        <option value="yes">Yes</option>
                        <option value="with-supervision">With Supervision</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Good with Other Pets</label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-sm"
                        value={formData.compatibility?.goodWithPets || ""}
                        onChange={(e) => updateNestedField("compatibility", "goodWithPets", e.target.value)}
                      >
                        <option value="yes">Yes</option>
                        <option value="dogs-only">Dogs Only</option>
                        <option value="cats-only">Cats Only</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Ideal Environment</label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-sm"
                        value={formData.environment?.idealEnvironment || ""}
                        onChange={(e) => updateNestedField("environment", "idealEnvironment", e.target.value)}
                      >
                        <option value="">Select environment</option>
                        <option value="indoor-only">Indoor Only</option>
                        <option value="indoor-with-outdoor-access">Indoor / Outdoor</option>
                        <option value="garden-required">Garden Required</option>
                        <option value="rural-preferred">Rural Preferred</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Min Space (sqm)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-sm"
                        value={formData.environment?.minSpaceSqm || 0}
                        onChange={(e) => updateNestedField("environment", "minSpaceSqm", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </section>

                {/* Status */}
                <section>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm">05</span>
                    Visibility & Status
                  </h3>
                  <div>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-900"
                      value={formData.adoptionStatus}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adoptionStatus: e.target.value,
                        })
                      }
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending Application</option>
                      <option value="adopted">Adopted</option>
                      <option value="pending-review">In Review (Hidden)</option>
                    </select>
                  </div>
                </section>
              </div>

              {/* Footer - Sticky at bottom */}
              <div
                className="flex items-center justify-end gap-3 p-6 border-t flex-shrink-0"
                style={{
                  background: "var(--color-card, #fff)",
                  borderColor: "var(--color-border, #e5e7eb)",
                }}
              >
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  icon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
