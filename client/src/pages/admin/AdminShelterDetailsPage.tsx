import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/ui/Toast";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  PawPrint,
  FileText,
  ExternalLink,
  AlertTriangle,
  Check
} from "lucide-react";

interface Shelter {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  website?: string;
  description?: string;
  isVerified: boolean;
  createdAt: string;
  totalPets?: number;
  adoptionsSheltered?: number;
  documentation?: {
    _id: string;
    title: string;
    url: string;
    type: string;
    uploadedAt: string;
  }[];
  location?: {
    formattedAddress?: string;
  };
}

interface Pet {
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: string;
    gender: string;
    adoptionStatus: string;
    reviewStatus: string;
    images: string[];

    createdAt: string;
    medical?: {
        isVaccinated: boolean;
        vaccinationDate?: string;
        isNeutered: boolean;
        isMicrochipped: boolean;
        healthStatus: string;
        medicalNotes?: string;
        medicalDocuments?: string[];
    };
}

export function AdminShelterDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Confirmation Dialog States
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  useEffect(() => {
    const fetchShelterData = async () => {
      try {
        setIsLoading(true);
        // Fetch Shelter Details
        const shelterRes = await axios.get(`http://localhost:5000/api/admin/shelters/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShelter(shelterRes.data);

        // Fetch Shelter Pets
        const petsRes = await axios.get(`http://localhost:5000/api/admin/shelters/${id}/pets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPets(petsRes.data);

      } catch (error: any) {
        showToast(error.response?.data?.message || "Failed to fetch shelter details", "error");
        navigate("/admin/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && token) {
      fetchShelterData();
    }
  }, [id, token, navigate, showToast]);

  const handlePetReview = async (petId: string, action: "approve" | "reject") => {
      try {
          await axios.post(
              `http://localhost:5000/api/pets/admin/review/${petId}`,
              { action },
              { headers: { Authorization: `Bearer ${token}` } }
          );
          
          showToast(`Pet ${action}d successfully`, "success");
          
          // Update local state
          setPets(pets.map(p => 
              p._id === petId 
                  ? { ...p, reviewStatus: action === "approve" ? "approved" : "rejected" }
                  : p
          ));

      } catch (error: any) {
          showToast(error.response?.data?.message || `Failed to ${action} pet`, "error");
      }
  };

  const handleVerifyShelter = async () => {
    if (!shelter) return;
    
    // Safety check: Don't allow verifying if no docs (backend checks this too, but good for UI)
    if (!shelter.documentation || shelter.documentation.length === 0) {
        showToast("Cannot verify shelter: No documents submitted.", "error");
        return;
    }

    try {
        await axios.patch(
            `http://localhost:5000/api/admin/shelters/${id}/status`,
            { isVerified: true },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setShelter({ ...shelter, isVerified: true });
        showToast("Shelter verified successfully", "success");
    } catch (error: any) {
        showToast(error.response?.data?.message || "Failed to verify shelter", "error");
    }
  };

  const openPetModal = (pet: Pet) => {
      setSelectedPet(pet);
      setIsModalOpen(true);
  };

  const closePetModal = () => {
      setIsModalOpen(false);
      setSelectedPet(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!shelter) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shelter Not Found</h2>
            <p className="text-gray-500 mb-6">The requested shelter could not be found or has been removed.</p>
            <Button onClick={() => navigate("/admin/dashboard", { state: { activeTab: "shelters" } })}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate("/admin/dashboard", { state: { activeTab: "shelters" } })}
            className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{shelter.name}</h1>
            <div className="flex items-center gap-3">
              {!shelter.isVerified && (
                  <Button 
                    onClick={handleVerifyShelter}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-none"
                  >
                    <Check className="w-4 h-4" />
                    Verify Shelter
                  </Button>
              )}
              <Badge variant={shelter.isVerified ? "success" : "warning"}>
                {shelter.isVerified ? (
                  <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" /> Verified Shelter
                  </div>
                ) : (
                  "Pending Verification"
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* Shelter Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About Shelter</h2>
                    <p className="text-gray-600 leading-relaxed">
                        {shelter.description || "No description provided."}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                            <p className="font-medium text-gray-900">{shelter.email}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                            <p className="font-medium text-gray-900">{shelter.phone}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Location</p>
                            <p className="font-medium text-gray-900">
                                {shelter.location?.formattedAddress || [shelter.address, shelter.city, shelter.state].filter(Boolean).join(", ") || "Location not provided"}
                            </p>
                        </div>
                     </div>
                     <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Website</p>
                            {shelter.website ? (
                                <a href={shelter.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                                    {shelter.website}
                                </a>
                            ) : (
                                <p className="text-gray-400">Not provided</p>
                            )}
                        </div>
                     </div>
                </div>
            </Card>

            {/* Verification Documents */}
            <Card className="md:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Verification Documents
                </h2>
                
                {shelter.documentation && shelter.documentation.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {shelter.documentation.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-gray-900 truncate" title={doc.title || `Document ${index + 1}`}>
                                            {doc.title || `Document ${index + 1}`}
                                        </p>
                                        <p className="text-xs text-gray-500 uppercase">{doc.type}</p>
                                    </div>
                                </div>
                                <a 
                                    href={doc.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View Document"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <AlertTriangle className="w-8 h-8 text-orange-400 mb-2" />
                        <p className="text-gray-900 font-medium">No Documents Submitted</p>
                        <p className="text-sm text-gray-500">This shelter hasn't uploaded any verification documents yet.</p>
                    </div>
                )}
            </Card>

            <div className="space-y-6">
                <Card>
                    <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Joined</span>
                            <span className="font-medium">{new Date(shelter.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Pets Listed</span>
                            <span className="font-medium">{pets.length}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>

        {/* Pets Management */}
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Listed Pets</h2>
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Pet Info</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Review Status</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date Added</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pets.map((pet) => (
                                <tr key={pet._id} className="hover:bg-gray-50">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            {pet.images?.[0] ? (
                                                <img 
                                                    src={pet.images[0]} 
                                                    alt={pet.name} 
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <PawPrint className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{pet.name}</p>
                                                <p className="text-sm text-gray-500">{pet.breed || pet.species} • {pet.age} old</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-6">
                                        <Badge variant={
                                            pet.adoptionStatus === 'available' ? 'success' :
                                            pet.adoptionStatus === 'adopted' ? 'neutral' : 'warning'
                                        }>
                                            {pet.adoptionStatus}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            {pet.reviewStatus === 'approved' ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : pet.reviewStatus === 'rejected' ? (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-orange-500" />
                                            )}
                                            <span className={`text-sm font-medium capitalize ${
                                                pet.reviewStatus === 'approved' ? 'text-green-700' :
                                                pet.reviewStatus === 'rejected' ? 'text-red-700' : 'text-orange-700'
                                            }`}>
                                                {pet.reviewStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        {new Date(pet.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => openPetModal(pet)}
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {pets.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        No pets listed yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>



      {/* Pet Details Modal */}
      {isModalOpen && selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Pet Verification Details</h2>
                <button 
                  onClick={closePetModal}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Basic Info */}
              <div className="flex gap-6">
                {selectedPet.images?.[0] ? (
                  <img 
                    src={selectedPet.images[0]} 
                    alt={selectedPet.name} 
                    className="w-32 h-32 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <PawPrint className="w-12 h-12" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedPet.name}</h3>
                  <p className="text-gray-500">{selectedPet.breed || selectedPet.species} • {selectedPet.age}</p>
                  <p className="text-gray-500 capitalize">{selectedPet.gender}</p>
                </div>
              </div>

              {/* Medical Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                   <Shield className="w-4 h-4" /> Medical Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">Health Status:</span>
                        <Badge variant={selectedPet.medical?.healthStatus === 'healthy' ? 'success' : 'warning'}>
                            {selectedPet.medical?.healthStatus || 'Not specified'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">Vaccinated:</span>
                        {selectedPet.medical?.isVaccinated ? (
                            <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Yes</span>
                        ) : (
                            <span className="text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4"/> No</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">Neutered/Spayed:</span>
                        {selectedPet.medical?.isNeutered ? (
                            <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Yes</span>
                        ) : (
                            <span className="text-gray-500">No</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">Microchipped:</span>
                        {selectedPet.medical?.isMicrochipped ? (
                            <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Yes</span>
                        ) : (
                            <span className="text-gray-500">No</span>
                        )}
                    </div>
                </div>
                {selectedPet.medical?.medicalNotes && (
                    <div className="mt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase">Medical Notes</p>
                        <p className="text-gray-700 bg-white p-2 rounded border border-gray-200 text-sm">
                            {selectedPet.medical.medicalNotes}
                        </p>
                    </div>
                )}
              </div>

              {/* Documents */}
              <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Medical Documents
                  </h3>
                   {selectedPet.medical?.medicalDocuments && selectedPet.medical.medicalDocuments.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                          {selectedPet.medical.medicalDocuments.map((doc, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                  <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-blue-500" />
                                      <span className="text-sm font-medium">Medical Document {idx + 1}</span>
                                  </div>
                                  <a 
                                      href={doc} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                  >
                                      View <ExternalLink className="w-3 h-3" />
                                  </a>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-gray-500 italic text-sm">No medical documents uploaded.</p>
                  )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button variant="ghost" onClick={closePetModal}>Cancel</Button>
                  {selectedPet.reviewStatus === 'pending' && (
                      <>
                        <Button 
                            variant="outline" 
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setShowRejectConfirm(true)}
                        >
                            Reject
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => setShowApproveConfirm(true)}
                        >
                            Approve & Publish
                        </Button>
                      </>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={() => {
            if (selectedPet) {
                handlePetReview(selectedPet._id, 'approve');
                closePetModal();
            }
        }}
        title="Approve Pet?"
        message={`Are you sure you want to approve "${selectedPet?.name}"? This will make the pet visible to adopters immediately.`}
        confirmText="Yes, Approve"
        variant="success"
      />

       <ConfirmationDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={() => {
            if (selectedPet) {
                handlePetReview(selectedPet._id, 'reject');
                closePetModal();
            }
        }}
        title="Reject Pet?"
        message={`Are you sure you want to reject "${selectedPet?.name}"? The shelter will be notified to make changes.`}
        confirmText="Yes, Reject"
        variant="danger"
      />
    </div>
    </div>
  );
}
