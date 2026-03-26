import { useState, useEffect } from "react";
import { formatAddress } from "../../utils/formatters";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Weight,
  Heart,
  Phone,
  Mail,
  ArrowLeft,
  Users,
  Activity,
  Ruler,
  Loader2,
  AlertCircle,
  Dna,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { PetGallery } from "../../components/pets/PetGallery";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { FavouriteButton } from "../../components/pets/FavouriteButton";
import { MedicalRecord } from "../../components/pets/MedicalRecord";
import { AdoptionSteps } from "../../components/adoption/AdoptionSteps";
import { MapView } from "../../components/shelters/MapView";
import { AdoptionModal } from "../../components/adoption/AdoptionModal";
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

// Health status variant mapping
const healthVariant: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  healthy: "success",
  vaccinated: "success",
  "special-needs": "warning",
  sick: "error",
  injured: "error",
  unknown: "neutral",
};

export function PetDetailPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const { user } = useAuth();
  
  // Check if user has already applied
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);



  useEffect(() => {
    const checkApplication = async () => {
      // 1. Initial check from localStorage for immediate UI feedback
      if (id) {
         const applied = localStorage.getItem(`applied-${id}`) === "true";
         const appId = localStorage.getItem(`application-id-${id}`);
         setHasApplied(applied);
         setApplicationId(appId);
      }

      // 2. Server-side check for users who are logged in (most reliable)
      if (id && user && user.type === "adopter") {
        try {
          const response = await api.get(`/applications/adopter/my-applications?petId=${id}`);
          if (response.data.applications && response.data.applications.length > 0) {
            const app = response.data.applications[0];
            setHasApplied(true);
            setApplicationId(app._id);
            // Sync localStorage as well
            localStorage.setItem(`applied-${id}`, "true");
            localStorage.setItem(`application-id-${id}`, app._id);
          } else {
            // Only clear if we explicitly checked and found nothing
            // This avoids flickering if the storage has it but the server hasn't synced yet (rare)
            setHasApplied(false);
            setApplicationId(null);
            localStorage.removeItem(`applied-${id}`);
            localStorage.removeItem(`application-id-${id}`);
          }
        } catch (err) {
          console.error("Error checking application status:", err);
        }
      }
    };

    checkApplication();
  }, [id, user]);

  // Fetch pet data
  useEffect(() => {
    const fetchPet = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/pets/${id}`);
        
        // Transform data for compatibility
        const transformedPet = {
          ...response.data,
          id: response.data._id,
          location: formatAddress(response.data.shelter?.location?.formattedAddress || "Location not set by shelter"),
          healthStatus: response.data.medical?.healthStatus || "healthy",
          temperament: response.data.temperament || [],
          personality: response.data.temperament || [],
          compatibility: {
            kids: response.data.compatibility?.goodWithKids || false,
            pets: response.data.compatibility?.goodWithPets || false,
            apartment: response.data.compatibility?.apartmentFriendly || false,
          },
          shelter: {
            ...response.data.shelter,
            contact: response.data.shelter?.phone || "Not provided",
            email: response.data.shelter?.email || "Not provided",
          },
          medical: {
            ...response.data.medical,
            vaccinated: response.data.medical?.isVaccinated || false,
            neutered: response.data.medical?.isNeutered || false,
            microchipped: response.data.medical?.isMicrochipped || false,
          }
        };
        
        setPet(transformedPet);
      } catch (err: any) {
        console.error("Error fetching pet:", err);
        setError(err.response?.data?.message || "Failed to load pet details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);


  
  const handleAdoptClick = () => {
    if (user?.status === 'suspended') return; // Restriction check

    if (hasApplied && applicationId) {
      navigate(`/application-tracking/${applicationId}`);
    } else if (hasApplied) {
      // Fallback
      navigate(`/application-submitted/${id}`);
    } else {
      setShowAdoptionModal(true);
    }
  };
  
  const handleAdoptionSubmit = (appId: string) => {
    localStorage.setItem(`applied-${id}`, "true");
    localStorage.setItem(`application-id-${id}`, appId);
    setHasApplied(true);
    setApplicationId(appId);
    // showToast handled in modal
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "var(--color-background)",
        }}
      >
        <div className="text-center">
          <Loader2
            className="w-16 h-16 mx-auto mb-4 animate-spin"
            style={{
              color: "var(--color-primary)",
            }}
          />
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              color: "var(--color-text)",
            }}
          >
            Loading pet details...
          </h1>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !pet) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "var(--color-background)",
        }}
      >
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{
              color: "var(--color-error)",
            }}
          />
          <h1
            className="text-2xl font-bold mb-4"
            style={{
              color: "var(--color-text)",
            }}
          >
            {error ||  "Pet not found"}
          </h1>
          <Link to="/search">
            <Button variant="primary">Back to Search</Button>
          </Link>
        </div>
      </div>
    );
  }
  

  
  return (
    <div
      className="min-h-screen py-8"
      style={{
        background: "var(--color-background)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/search">
          <Button
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            className="mb-6"
          >
            Back to Search
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
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
            >
              <PetGallery images={pet.images} petName={pet.name} />
            </motion.div>

            {/* Description */}
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
                delay: 0.1,
              }}
              className="p-6"
              style={{
                background: "var(--color-card)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  color: "var(--color-text)",
                }}
              >
                About {pet.name}
              </h2>
              <p
                className="text-lg leading-relaxed"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                {pet.description}
              </p>
            </motion.div>

            {/* Location Map */}
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
                delay: 0.15,
              }}
            >
              <MapView
                location={`${pet.shelter.name}, ${pet.location}`}
                className="h-64"
              />
            </motion.div>

            {/* Personality & Temperament */}
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
                delay: 0.2,
              }}
              className="p-6"
              style={{
                background: "var(--color-card)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Activity
                  className="w-6 h-6"
                  style={{
                    color: "var(--color-primary)",
                  }}
                />
                <h3
                  className="text-xl font-bold"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  Personality & Temperament
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4
                    className="font-semibold mb-2"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Temperament
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pet.temperament?.map((trait: string) => (
                      <Badge key={trait} variant="info">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4
                    className="font-semibold mb-2"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Personality Traits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pet.personality?.map((trait: string) => (
                      <Badge key={trait} variant="neutral">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* COMPATIBILITY PREVIEW CARD & REQUIREMENTS GRID */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >


              {/* Requirements Grid (Replaces old circles) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-gray-400" /> Environment & Needs
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Good w/ Kids", val: pet.compatibility?.kids },
                    { label: "Good w/ Pets", val: pet.compatibility?.pets },
                    { label: "Apartment Friendly", val: pet.compatibility?.apartment },
                    { label: "Home Type Needed", val: pet.environment?.idealEnvironment || "Any" },
                    { label: "Min Space", val: pet.environment?.minSpaceSqm ? `${pet.environment.minSpaceSqm} sqm` : "N/A" },
                    { label: "Est. Monthly Cost", val: pet.financial?.estimatedMonthlyCost ? `£${pet.financial.estimatedMonthlyCost}` : "N/A" },
                    { label: "Energy Level", val: pet.behaviour?.energyScore ? `${pet.behaviour.energyScore}/5` : "N/A" },
                    { label: "Independence", val: pet.behaviour?.independenceTolerance || "N/A" },
                  ].map((req, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">{req.label}</p>
                      {typeof req.val === "boolean" ? (
                        <span className={`text-sm font-bold flex items-center gap-1.5 ${req.val ? "text-green-600" : "text-red-500"}`}>
                          {req.val ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {req.val ? "Yes" : "No"}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-gray-800 capitalize">
                          {String(req.val).replace(/-/g, " ")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Medical Record */}
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
                delay: 0.4,
              }}
            >
              <MedicalRecord medical={pet.medical} />
            </motion.div>

            {/* Behaviour Notes */}
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
                delay: 0.5,
              }}
              className="p-6"
              style={{
                background: "var(--color-card)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h3
                className="text-xl font-bold mb-4"
                style={{
                  color: "var(--color-text)",
                }}
              >
                Behaviour Notes
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-lg mt-1"
                    style={{
                      background: "var(--color-primary)",
                      opacity: 0.1,
                    }}
                  >
                    <Activity
                      className="w-5 h-5"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-semibold mb-1"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Energy Level
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      {pet.temperament.includes("Energetic")
                        ? "High - Needs regular exercise and playtime"
                        : pet.temperament.includes("Calm")
                        ? "Low - Enjoys relaxed activities"
                        : "Medium - Balanced activity level"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-lg mt-1"
                    style={{
                      background: "var(--color-secondary)",
                      opacity: 0.1,
                    }}
                  >
                    <Users
                      className="w-5 h-5"
                      style={{
                        color: "var(--color-secondary)",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-semibold mb-1"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Social Behaviour
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      {pet.temperament.includes("Social") ||
                      pet.temperament.includes("Friendly")
                        ? "Very social and loves meeting new people and pets"
                        : "Prefers familiar faces and calm environments"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Quick Info & CTA */}
          <div className="space-y-6">
            {/* Main Info Card */}
            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="p-6 sticky top-24"
              style={{
                background: "var(--color-card)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    {pet.name}
                  </h1>
                  <p
                    className="text-lg"
                    style={{
                      color: "var(--color-text-light)",
                    }}
                  >
                    {pet.breed}
                  </p>
                </div>
                <FavouriteButton petId={pet.id} size="lg" />
              </div>

              <div className="flex gap-2 mb-6">
                <Badge variant={healthVariant[pet.healthStatus?.toLowerCase() as keyof typeof healthVariant] || "neutral"}>
                  {pet.healthStatus === "special-needs"
                    ? "Special Needs"
                    : pet.healthStatus}
                </Badge>
                {pet.adoptionStatus === "pending" && (
                  <Badge variant="warning">Pending</Badge>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4 mb-6">
                 {/* Breed */}
                 <div className="flex items-center gap-3">
                  <div
                    className="relative p-2 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    <div 
                        className="absolute inset-0 opacity-10"
                        style={{ background: "var(--color-primary)" }}
                    />
                    <Dna
                      className="relative w-5 h-5"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Breed
                    </p>
                    <p
                      className="font-semibold"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      {pet.breed}
                    </p>
                  </div>
                </div>

                {/* Age */}
                <div className="flex items-center gap-3">
                  <div
                    className="relative p-2 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                     <div 
                        className="absolute inset-0 opacity-10"
                        style={{ background: "var(--color-primary)" }}
                    />
                    <Calendar
                      className="relative w-5 h-5"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Age
                    </p>
                    <p
                      className="font-semibold"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      {pet.age}
                    </p>
                  </div>
                </div>

                {/* Weight */}
                <div className="flex items-center gap-3">
                  <div
                    className="relative p-2 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    <div 
                        className="absolute inset-0 opacity-10"
                        style={{ background: "var(--color-secondary)" }}
                    />
                    <Weight
                      className="relative w-5 h-5"
                      style={{
                        color: "var(--color-secondary)",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Weight
                    </p>
                    <p
                      className="font-semibold"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      {pet.weight}
                    </p>
                  </div>
                </div>

                {/* Size */}
                <div className="flex items-center gap-3">
                  <div
                    className="relative p-2 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    <div 
                        className="absolute inset-0 opacity-10"
                        style={{ background: "var(--color-accent)" }}
                    />
                    <Ruler
                      className="relative w-5 h-5"
                      style={{
                        color: "var(--color-accent)",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Size
                    </p>
                    <p
                      className="font-semibold capitalize"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      {pet.size || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <div
                    className="relative p-2 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    <div 
                        className="absolute inset-0 opacity-10"
                        style={{ background: "var(--color-success)" }}
                    />
                    <MapPin
                      className="relative w-5 h-5"
                      style={{
                        color: "var(--color-success)",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Location
                    </p>
                    <p
                      className="font-semibold"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      {pet.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Adoption CTA */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                icon={user?.status === 'suspended' ? <AlertTriangle className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                disabled={pet.adoptionStatus !== "available" || user?.status === "suspended"}
                onClick={handleAdoptClick}
              >
                {user?.status === "suspended"
                  ? "Account Suspended"
                  : hasApplied
                  ? "Track Application"
                  : pet.adoptionStatus === "available"
                  ? "Adopt Me"
                  : "Not Available"}
              </Button>

              {user?.status === "suspended" && (
                <p className="mt-2 text-xs text-center text-red-500 font-medium">
                  Your account is suspended. Actions are restricted.
                </p>
              )}

              {/* Shelter Contact */}
              <div
                className="mt-6 pt-6 space-y-3"
                style={{
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <h4
                  className="font-semibold"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  Contact Shelter
                </h4>
                <p
                  className="font-medium"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  {pet.shelter.name}
                </p>
                <div className="space-y-2">
                  <a
                    href={`tel:${pet.shelter.contact}`}
                    className="flex items-center gap-2 text-sm hover:underline transition-colors"
                    style={{
                      color: "var(--color-primary)",
                    }}
                  >
                    <Phone className="w-4 h-4" />
                    {pet.shelter.contact}
                  </a>
                  <a
                    href={`mailto:${pet.shelter.email}`}
                    className="flex items-center gap-2 text-sm hover:underline transition-colors"
                    style={{
                      color: "var(--color-primary)",
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    {pet.shelter.email}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Adoption Steps */}
            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
              className="p-6"
              style={{
                background: "var(--color-card)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <AdoptionSteps />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Adoption Modal */}
      <AdoptionModal
        pet={pet}
        isOpen={showAdoptionModal}
        onClose={() => setShowAdoptionModal(false)}
        onSubmit={handleAdoptionSubmit}
      />
    </div>
  );
}



