import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  PawPrint,
  Heart,
  Stethoscope,
  Home,
  MapPin,
  Image,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AdminSidebar } from "../../components/layout/AdminSidebar";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ImageUpload } from "../../components/forms/ImageUpload";
import { FileUpload } from "../../components/forms/FileUpload";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";
import { Badge } from "../../components/ui/Badge";
interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
}
export function AdminAddPetPage() {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [vetRecords, setVetRecords] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([
    {
      id: "basic",
      title: "Basic Information",
      icon: PawPrint,
      isOpen: true,
    },
    {
      id: "health",
      title: "Health & Medical",
      icon: Stethoscope,
      isOpen: true,
    },
    {
      id: "behavior",
      title: "Behavior & Personality",
      icon: Heart,
      isOpen: true,
    },
    {
      id: "requirements",
      title: "Adoption Requirements",
      icon: Home,
      isOpen: true,
    },
    {
      id: "media",
      title: "Media Uploads",
      icon: Image,
      isOpen: true,
    },
    {
      id: "location",
      title: "Location & Shelter",
      icon: MapPin,
      isOpen: true,
    },
  ]);
  const [formData, setFormData] = useState({
    // Basic
    name: "",
    species: "",
    breed: "",
    age: "",
    ageUnit: "years",
    gender: "",
    size: "",
    color: "",
    // Health
    vaccinationStatus: "",
    medicalHistory: "",
    microchipNumber: "",
    lastCheckup: "",
    specialMedicalNeeds: "",
    // Behavior
    temperament: [] as string[],
    activityLevel: "",
    goodWithKids: false,
    goodWithPets: false,
    goodWithCats: false,
    houseTrained: false,
    crateTrainedtrained: false,
    description: "",
    // Requirements
    homeVisitRequired: true,
    fencedYardRequired: false,
    experienceRequired: false,
    specialNeeds: false,
    adoptionFee: "",
    // Location
    shelterAssignment: "",
    location: "",
  });
  const temperamentOptions = [
    "Friendly",
    "Playful",
    "Calm",
    "Energetic",
    "Loyal",
    "Independent",
    "Affectionate",
    "Protective",
    "Curious",
    "Gentle",
  ];
  const toggleSection = (id: string) => {
    setSections(
      sections.map((s) =>
        s.id === id
          ? {
              ...s,
              isOpen: !s.isOpen,
            }
          : s
      )
    );
  };
  const toggleTemperament = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      temperament: prev.temperament.includes(trait)
        ? prev.temperament.filter((t) => t !== trait)
        : [...prev.temperament, trait],
    }));
  };
  const handleSaveDraft = () => {
    alert("Pet saved as draft!");
    navigate("/admin/dashboard");
  };
  const handlePublish = () => {
    alert("Pet published successfully!");
    navigate("/admin/dashboard");
  };
  const renderSection = (section: Section) => {
    const Icon = section.icon;
    return (
      <motion.div
        key={section.id}
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-6"
      >
        <Card padding="none">
          {/* Section Header */}
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-6"
            style={{
              background: "var(--color-card)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl"
                style={{
                  background: "var(--color-primary)",
                  opacity: 0.1,
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: "var(--color-primary)",
                  }}
                />
              </div>
              <h3
                className="text-lg font-bold"
                style={{
                  color: "var(--color-text)",
                }}
              >
                {section.title}
              </h3>
            </div>
            {section.isOpen ? (
              <ChevronUp
                className="w-5 h-5"
                style={{
                  color: "var(--color-text-light)",
                }}
              />
            ) : (
              <ChevronDown
                className="w-5 h-5"
                style={{
                  color: "var(--color-text-light)",
                }}
              />
            )}
          </button>

          {/* Section Content */}
          <AnimatePresence>
            {section.isOpen && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="overflow-hidden"
              >
                <div
                  className="p-6 pt-0 border-t"
                  style={{
                    borderColor: "var(--color-border)",
                  }}
                >
                  {section.id === "basic" && (
                    <div className="space-y-5 pt-6">
                      <Input
                        label="Pet Name"
                        placeholder="Enter pet's name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: e.target.value,
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
                            Species *
                          </label>
                          <select
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                            style={{
                              borderColor: "var(--color-border)",
                              background: "var(--color-card)",
                              color: "var(--color-text)",
                            }}
                            value={formData.species}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                species: e.target.value,
                              })
                            }
                          >
                            <option value="">Select species</option>
                            <option value="dog">Dog</option>
                            <option value="cat">Cat</option>
                            <option value="bird">Bird</option>
                            <option value="rabbit">Rabbit</option>
                          </select>
                        </div>
                        <Input
                          label="Breed"
                          placeholder="Enter breed"
                          value={formData.breed}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              breed: e.target.value,
                            })
                          }
                          fullWidth
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Input
                            label="Age"
                            type="number"
                            placeholder="Enter age"
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
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{
                              color: "var(--color-text)",
                            }}
                          >
                            Unit
                          </label>
                          <select
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                            style={{
                              borderColor: "var(--color-border)",
                              background: "var(--color-card)",
                              color: "var(--color-text)",
                            }}
                            value={formData.ageUnit}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ageUnit: e.target.value,
                              })
                            }
                          >
                            <option value="months">Months</option>
                            <option value="years">Years</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{
                              color: "var(--color-text)",
                            }}
                          >
                            Gender *
                          </label>
                          <select
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                            style={{
                              borderColor: "var(--color-border)",
                              background: "var(--color-card)",
                              color: "var(--color-text)",
                            }}
                            value={formData.gender}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{
                              color: "var(--color-text)",
                            }}
                          >
                            Size *
                          </label>
                          <select
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                            style={{
                              borderColor: "var(--color-border)",
                              background: "var(--color-card)",
                              color: "var(--color-text)",
                            }}
                            value={formData.size}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                size: e.target.value,
                              })
                            }
                          >
                            <option value="">Select size</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                      </div>
                      <Input
                        label="Color/Markings"
                        placeholder="e.g., Golden, Black with white spots"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            color: e.target.value,
                          })
                        }
                        fullWidth
                      />
                    </div>
                  )}

                  {section.id === "health" && (
                    <div className="space-y-5 pt-6">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Vaccination Status *
                        </label>
                        <select
                          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                          style={{
                            borderColor: "var(--color-border)",
                            background: "var(--color-card)",
                            color: "var(--color-text)",
                          }}
                          value={formData.vaccinationStatus}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vaccinationStatus: e.target.value,
                            })
                          }
                        >
                          <option value="">Select status</option>
                          <option value="fully-vaccinated">
                            Fully Vaccinated
                          </option>
                          <option value="partially-vaccinated">
                            Partially Vaccinated
                          </option>
                          <option value="not-vaccinated">Not Vaccinated</option>
                        </select>
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Medical History
                        </label>
                        <textarea
                          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none resize-none"
                          style={{
                            borderColor: "var(--color-border)",
                            background: "var(--color-card)",
                            color: "var(--color-text)",
                          }}
                          rows={4}
                          placeholder="Any past medical conditions, surgeries, or ongoing treatments..."
                          value={formData.medicalHistory}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              medicalHistory: e.target.value,
                            })
                          }
                        />
                      </div>
                      <FileUpload
                        label="Upload Vet Records"
                        files={vetRecords}
                        onChange={setVetRecords}
                        maxFiles={5}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Microchip Number"
                          placeholder="Enter microchip ID"
                          value={formData.microchipNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              microchipNumber: e.target.value,
                            })
                          }
                          fullWidth
                        />
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{
                              color: "var(--color-text)",
                            }}
                          >
                            Last Checkup Date
                          </label>
                          <input
                            type="date"
                            value={formData.lastCheckup}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lastCheckup: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                            style={{
                              borderColor: "var(--color-border)",
                              background: "var(--color-card)",
                              color: "var(--color-text)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === "behavior" && (
                    <div className="space-y-5 pt-6">
                      <div>
                        <label
                          className="block text-sm font-medium mb-3"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Temperament (Select all that apply)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {temperamentOptions.map((trait) => (
                            <button
                              key={trait}
                              onClick={() => toggleTemperament(trait)}
                              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                              style={{
                                background: formData.temperament.includes(trait)
                                  ? "var(--color-primary)"
                                  : "var(--color-surface)",
                                color: formData.temperament.includes(trait)
                                  ? "white"
                                  : "var(--color-text)",
                                border: "2px solid",
                                borderColor: formData.temperament.includes(
                                  trait
                                )
                                  ? "var(--color-primary)"
                                  : "transparent",
                              }}
                            >
                              {trait}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Activity Level *
                        </label>
                        <select
                          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                          style={{
                            borderColor: "var(--color-border)",
                            background: "var(--color-card)",
                            color: "var(--color-text)",
                          }}
                          value={formData.activityLevel}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              activityLevel: e.target.value,
                            })
                          }
                        >
                          <option value="">Select level</option>
                          <option value="low">Low - Couch potato</option>
                          <option value="moderate">
                            Moderate - Daily walks
                          </option>
                          <option value="high">High - Very active</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <ToggleSwitch
                          checked={formData.goodWithKids}
                          onChange={(checked) =>
                            setFormData({
                              ...formData,
                              goodWithKids: checked,
                            })
                          }
                          label="Good with children?"
                        />
                        <ToggleSwitch
                          checked={formData.goodWithPets}
                          onChange={(checked) =>
                            setFormData({
                              ...formData,
                              goodWithPets: checked,
                            })
                          }
                          label="Good with other dogs?"
                        />
                        <ToggleSwitch
                          checked={formData.goodWithCats}
                          onChange={(checked) =>
                            setFormData({
                              ...formData,
                              goodWithCats: checked,
                            })
                          }
                          label="Good with cats?"
                        />
                        <ToggleSwitch
                          checked={formData.houseTrained}
                          onChange={(checked) =>
                            setFormData({
                              ...formData,
                              houseTrained: checked,
                            })
                          }
                          label="House trained?"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Description *
                        </label>
                        <textarea
                          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none resize-none"
                          style={{
                            borderColor: "var(--color-border)",
                            background: "var(--color-card)",
                            color: "var(--color-text)",
                          }}
                          rows={5}
                          placeholder="Write a compelling description of this pet's personality, quirks, and what makes them special..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {section.id === "requirements" && (
                    <div className="space-y-5 pt-6">
                      <div className="space-y-3">
                        <ToggleSwitch
                          checked={formData.homeVisitRequired}
                          onChange={(checked) =>
                            setFormData({
                              ...formData,
                              homeVisitRequired: checked,
                            })
                          }
                          label="Home visit required?"
                          description="Shelter will conduct a home inspection before adoption"
                        />
                        <ToggleSwitch
                          checked={formData.fencedYardRequired}
                          onChange={(checked) =>
                            setFormData({
                              ...formData,
                              fencedYardRequired: checked,
                            })
                          }
                          label="Fenced yard required?"
                          description="Adopter must have a securely fenced outdoor area"
                        />
                        <ToggleSwitch
                          checked={formData.experienceRequired}
                          onChange={(checked) =>
                            setFormData({
                              ...formData,
                              experienceRequired: checked,
                            })
                          }
                          label="Experience required?"
                          description="Adopter should have prior pet ownership experience"
                        />
                        <ToggleSwitch
                          checked={formData.specialNeeds}
                          onChange={(checked) =>
                            setFormData({
                              ...formData,
                              specialNeeds: checked,
                            })
                          }
                          label="Special needs pet?"
                          description="This pet requires extra care or accommodations"
                        />
                      </div>
                      <Input
                        label="Adoption Fee (NPR)"
                        type="number"
                        placeholder="Enter adoption fee"
                        value={formData.adoptionFee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            adoptionFee: e.target.value,
                          })
                        }
                        fullWidth
                      />
                    </div>
                  )}

                  {section.id === "media" && (
                    <div className="space-y-5 pt-6">
                      <div>
                        <h4
                          className="font-medium mb-3"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Photo Gallery *
                        </h4>
                        <p
                          className="text-sm mb-4"
                          style={{
                            color: "var(--color-text-light)",
                          }}
                        >
                          Upload clear, high-quality photos. The first image
                          will be the primary photo.
                        </p>
                        <ImageUpload
                          images={images}
                          onChange={setImages}
                          maxImages={8}
                        />
                      </div>
                      <div>
                        <h4
                          className="font-medium mb-3"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Video (Optional)
                        </h4>
                        <p
                          className="text-sm mb-4"
                          style={{
                            color: "var(--color-text-light)",
                          }}
                        >
                          Upload a short video showing the pet's personality.
                        </p>
                        <FileUpload
                          label="Upload Video"
                          files={videos}
                          onChange={setVideos}
                          maxFiles={2}
                          accept=".mp4,.mov,.avi"
                        />
                      </div>
                    </div>
                  )}

                  {section.id === "location" && (
                    <div className="space-y-5 pt-6">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{
                            color: "var(--color-text)",
                          }}
                        >
                          Assign to Shelter *
                        </label>
                        <select
                          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                          style={{
                            borderColor: "var(--color-border)",
                            background: "var(--color-card)",
                            color: "var(--color-text)",
                          }}
                          value={formData.shelterAssignment}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shelterAssignment: e.target.value,
                            })
                          }
                        >
                          <option value="">Select shelter</option>
                          <option value="kathmandu">
                            Kathmandu Animal Shelter
                          </option>
                          <option value="patan">Patan Pet Rescue</option>
                          <option value="bhaktapur">
                            Bhaktapur Animal Care
                          </option>
                          <option value="pokhara">Pokhara Pet Haven</option>
                        </select>
                      </div>
                      <Input
                        label="Location"
                        placeholder="Enter specific location or address"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: e.target.value,
                          })
                        }
                        icon={<MapPin className="w-5 h-5" />}
                        fullWidth
                      />
                      <div
                        className="h-48 rounded-xl flex items-center justify-center"
                        style={{
                          background: "var(--color-surface)",
                        }}
                      >
                        <div className="text-center">
                          <MapPin
                            className="w-8 h-8 mx-auto mb-2"
                            style={{
                              color: "var(--color-text-light)",
                            }}
                          />
                          <p
                            className="text-sm"
                            style={{
                              color: "var(--color-text-light)",
                            }}
                          >
                            Map preview will appear here
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  };
  return (
    <div
      className="admin-layout flex min-h-screen"
      style={{
        background: "var(--color-background)",
      }}
    >
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 mb-4 transition-colors"
              style={{
                color: "var(--color-text-light)",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <h1
              className="text-4xl font-bold mb-2"
              style={{
                color: "var(--color-text)",
              }}
            >
              Add New Pet
            </h1>
            <p
              style={{
                color: "var(--color-text-light)",
              }}
            >
              Fill in the details to list a new pet for adoption
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {sections.map(renderSection)}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                size="lg"
                icon={<Save className="w-5 h-5" />}
                onClick={handleSaveDraft}
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon={<Check className="w-5 h-5" />}
                onClick={handlePublish}
              >
                Publish Pet
              </Button>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card padding="lg">
                <h3
                  className="text-lg font-bold mb-4"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  Preview
                </h3>

                {/* Preview Card */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "var(--color-surface)",
                  }}
                >
                  {images.length > 0 ? (
                    <img
                      src={images[0]}
                      alt="Pet preview"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-48 flex items-center justify-center"
                      style={{
                        background: "var(--color-border)",
                      }}
                    >
                      <Image
                        className="w-12 h-12"
                        style={{
                          color: "var(--color-text-light)",
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4
                      className="text-xl font-bold mb-1"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      {formData.name || "Pet Name"}
                    </h4>
                    <p
                      className="text-sm mb-3"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      {formData.breed || "Breed"} • {formData.age || "?"}{" "}
                      {formData.ageUnit}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.gender && (
                        <Badge variant="info">{formData.gender}</Badge>
                      )}
                      {formData.size && (
                        <Badge variant="neutral">{formData.size}</Badge>
                      )}
                      {formData.vaccinationStatus === "fully-vaccinated" && (
                        <Badge variant="success">Vaccinated</Badge>
                      )}
                    </div>
                    {formData.temperament.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formData.temperament.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background: "var(--color-primary)",
                              color: "white",
                              opacity: 0.8,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Completion Status */}
                <div className="mt-6">
                  <h4
                    className="font-medium mb-3"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Completion Status
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Basic Info",
                        complete: !!formData.name && !!formData.species,
                      },
                      {
                        label: "Health Info",
                        complete: !!formData.vaccinationStatus,
                      },
                      {
                        label: "Behavior",
                        complete: formData.temperament.length > 0,
                      },
                      {
                        label: "Photos",
                        complete: images.length > 0,
                      },
                      {
                        label: "Location",
                        complete: !!formData.shelterAssignment,
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        {item.complete ? (
                          <Check
                            className="w-4 h-4"
                            style={{
                              color: "var(--color-success)",
                            }}
                          />
                        ) : (
                          <div
                            className="w-4 h-4 rounded-full border-2"
                            style={{
                              borderColor: "var(--color-border)",
                            }}
                          />
                        )}
                        <span
                          className="text-sm"
                          style={{
                            color: item.complete
                              ? "var(--color-success)"
                              : "var(--color-text-light)",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



