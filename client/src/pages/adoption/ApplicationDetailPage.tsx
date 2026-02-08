import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Home,
  Phone,
  Mail,
  Clock,
  Dog,
  Cat,
  MapPin,
  Heart,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ShelterSidebar } from "../../components/layout/ShelterSidebar";
import { HamburgerMenu } from "../../components/layout/HamburgerMenu";
import { NotificationCenter } from "../../components/common/NotificationCenter";
import api from "../../utils/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";


const workflowSteps = [
  { key: "pending", label: "Pending", icon: FileText },
  { key: "reviewing", label: "Under Review", icon: Eye },
  { key: "approved", label: "Approved", icon: CheckCircle },
  { key: "availability_submitted", label: "Availability Submitted", icon: Clock },
  { key: "meeting_scheduled", label: "Meeting Scheduled", icon: CalendarCheck },
  { key: "meeting_completed", label: "Meeting Complete", icon: CheckCircle },
  { key: "completed", label: "Adopted", icon: Heart },
];

export function ApplicationDetailPage() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const { showToast } = useToast();
  
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDoc, setSelectedDoc] = useState<any>(null); // Preserving


  const [expandedSections, setExpandedSections] = useState<string[]>([
    "applicant",
    "pet",
    "documents",
    "timeline",
    "meeting" // Add meeting section to auto-expand
  ]);

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/applications/${applicationId}`);
        
        // Transform backend data to frontend structure if needed
        const data = response.data;
        
        // Aggregate documents
        const docs = [
          ...(data.personalInfo?.idDocuments || []).map((url: string, i: number) => ({
            id: `id-${i}`,
            name: `ID Document ${i + 1}`,
            type: "document",
            url,
            verified: false,
            status: data.documentStatus?.find((s: any) => s.url === url)?.status || 'pending',
            uploadedAt: data.createdAt
          })),
          ...(data.household?.proofOfResidence || []).map((url: string, i: number) => ({
            id: `res-${i}`,
            name: `Proof of Residence ${i + 1}`,
            type: "document",
            url,
            verified: false,
            status: data.documentStatus?.find((s: any) => s.url === url)?.status || 'pending',
            uploadedAt: data.createdAt
          })),
          ...(data.household?.landlordPermission || []).map((url: string, i: number) => ({
            id: `land-${i}`,
            name: `Landlord Permission ${i + 1}`,
            type: "document",
            url,
            verified: false,
            status: data.documentStatus?.find((s: any) => s.url === url)?.status || 'pending',
            uploadedAt: data.createdAt
          }))
        ];
        
        setApplication({
          ...data,
          documents: docs
        });
      } catch (err: any) {
        console.error("Error fetching application:", err);
        setError(err.response?.data?.message || "Failed to load application details");
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const updateStatus = async (newStatus: string) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status: newStatus });
      setApplication((prev: any) => ({ ...prev, status: newStatus }));
      showToast(`Application status updated to ${newStatus}`, "success");
      return true;
    } catch (err: any) {
      console.error("Error updating status:", err);
      showToast(err.response?.data?.message || "Failed to update status", "error");
      return false;
    }
  };

  const handleVerifyDoc = async (docId: string) => {
    const docToVerify = application.documents.find((d: any) => d.id === docId);
    if (!docToVerify) return;

    try {
      await api.put(`/applications/${applicationId}/documents/status`, {
        documentUrl: docToVerify.url,
        status: 'verified'
      });

      setApplication((prev: any) => ({
        ...prev,
        documents: prev.documents.map((doc: any) => 
          doc.id === docId ? { ...doc, status: 'verified' } : doc
        )
      }));
      setSelectedDoc(null);
      showToast("Document verified", "success");
    } catch (err: any) {
      console.error("Error verifying document:", err);
      showToast("Failed to verify document", "error");
    }
  };

  const handleRejectDoc = async (docId: string) => {
    const docToReject = application.documents.find((d: any) => d.id === docId);
    if (!docToReject) return;

    try {
      await api.put(`/applications/${applicationId}/documents/status`, {
        documentUrl: docToReject.url,
        status: 'rejected'
      });

      setApplication((prev: any) => ({
        ...prev,
        documents: prev.documents.map((doc: any) => 
          doc.id === docId ? { ...doc, status: 'rejected' } : doc
        )
      }));
      setSelectedDoc(null);
      showToast("Document rejected", "error");
    } catch (err: any) {
      console.error("Error rejecting document:", err);
      showToast("Failed to reject document", "error");
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("Are you sure you want to approve this application?")) return;
    await updateStatus("approved");
  };

  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to reject this application? This action cannot be undone.")) return;
    
    // Optional: Ask for rejection reason
    // const reason = window.prompt("Please provide a reason for rejection (optional):");
    
    const success = await updateStatus("rejected");
    if (success) {
      navigate("/shelter/applications");
    }
  };
  
  const handleStartReview = async () => {
    await updateStatus("reviewing");
  };

  const handleCompleteAdoption = async () => {
    if (!window.confirm("Are you sure you want to finalize this adoption? This will mark the pet as adopted.")) return;
    await updateStatus("completed");
  };

  const handleRevertToApproved = async () => {
    if (!window.confirm("Are you sure you want to move this application back to 'Approved' status? You will need to schedule a new meeting.")) return;
    await updateStatus("approved");
  };

  const handleRevertToMeetingComplete = async () => {
    if (!window.confirm("Are you sure you want to revert this adoption? The pet will be marked as available again.")) return;
    await updateStatus("meeting_completed");
  };



  const currentStepIndex = application 
    ? workflowSteps.findIndex((s) => s.key === application.status)
    : 0;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[var(--color-background)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex min-h-screen bg-[var(--color-background)] items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-4">{error || "Application not found"}</p>
          <Button onClick={() => navigate("/shelter/applications")} variant="outline">
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <div className="hidden lg:block">
        <ShelterSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Application Review
                  </h1>
                  <Badge variant="info">#{application._id.substring(0, 8)}</Badge>
                  {application.status === 'rejected' && (
                    <Badge variant="error" className="bg-red-100 text-red-700">Rejected</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Submitted {formatDate(application.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationCenter />
              
              {application.status === "pending" && (
                <Button
                    variant="primary"
                    onClick={handleStartReview}
                    icon={<Eye className="w-4 h-4" />}
                  >
                    Start Review
                </Button>
              )}
              
              {(application.status === "reviewing") && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleReject}
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    <span className="hidden sm:inline">Reject</span>
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    icon={<CheckCircle className="w-4 h-4" />}
                  >
                    <span className="hidden sm:inline">Approve</span>
                  </Button>
                </>
              )}
              {application.status === "approved" && (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/shelter/meet-and-greet?applicationId=${application._id}&action=schedule`)}
                  icon={<CalendarCheck className="w-4 h-4" />}
                >
                  Schedule Meet & Greet
                </Button>
              )}
              {application.status === "availability_submitted" && (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/shelter/meet-and-greet?applicationId=${application._id}&action=schedule`)}
                  icon={<CalendarCheck className="w-4 h-4" />}
                >
                  Schedule Meet & Greet
                </Button>
              )}
              {application.status === "meeting_scheduled" && (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/shelter/meet-and-greet?applicationId=${application._id}&action=complete`)}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Complete Meeting
                </Button>
              )}
              {application.status === "meeting_completed" && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleReject}
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRevertToApproved}
                    icon={<CalendarCheck className="w-4 h-4" />}
                  >
                    Revert to Approved
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleCompleteAdoption}
                    icon={<Heart className="w-4 h-4" />}
                  >
                    Finalize Adoption
                  </Button>
                </>
              )}
              {application.status === "completed" && (
                <Button
                  variant="outline"
                  onClick={handleRevertToMeetingComplete}
                  icon={<CalendarCheck className="w-4 h-4" />}
                >
                  Revert to Meeting Complete
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Progress Stepper */}
            {application.status !== 'rejected' && (
            <Card className="p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Application Progress
              </h2>

              {/* Desktop: Horizontal Stepper */}
              <div className="hidden md:block">
                <div className="flex items-center justify-between relative">
                  {/* Progress Line Background */}
                  <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" />
                  {/* Progress Line Active */}
                  <motion.div
                    className="absolute left-0 top-5 h-0.5 bg-[var(--color-primary)]"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (currentStepIndex / (workflowSteps.length - 1)) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />

                  {workflowSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center relative z-10"
                      >
                        <motion.div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted
                              ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                              : isCurrent
                              ? "bg-white border-[var(--color-primary)] text-[var(--color-primary)]"
                              : "bg-gray-100 border-gray-200 text-gray-400"
                          }`}
                          animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                          transition={{
                            duration: 0.8,
                            repeat: isCurrent ? Infinity : 0,
                            repeatDelay: 2,
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </motion.div>
                        <p
                          className={`text-xs mt-2 text-center max-w-[80px] ${
                            isCurrent
                              ? "text-[var(--color-primary)] font-semibold"
                              : isCompleted
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile: Vertical Compact Stepper */}
              <div className="md:hidden">
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {workflowSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium ${
                          isCompleted
                            ? "bg-green-100 text-green-700"
                            : isCurrent
                            ? "bg-[var(--color-primary)] text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isCompleted && <CheckCircle className="w-3 h-3" />}
                        {step.label.split(" ")[0]}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Pet Information Card */}
                <Card className="overflow-hidden">
                  <button
                    onClick={() => toggleSection("pet")}
                    className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          application.pet?.species === "dog"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {application.pet?.species === "dog" ? (
                          <Dog className="w-5 h-5" />
                        ) : (
                          <Cat className="w-5 h-5" />
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Pet Information
                      </h2>
                    </div>
                    {expandedSections.includes("pet") ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedSections.includes("pet") && application.pet && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-0">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <img
                              src={application.pet.images?.[0] || application.pet.image || "/placeholder-pet.png"}
                              alt={application.pet.name}
                              className="w-full sm:w-32 h-32 rounded-xl object-cover"
                            />
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                  Name
                                </p>
                                <p className="font-bold text-gray-900 text-lg">
                                  {application.pet.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                  Breed
                                </p>
                                <p className="font-medium text-gray-900">
                                  {application.pet.breed}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                  Age
                                </p>
                                <p className="font-medium text-gray-900">
                                  {application.pet.age} years
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                  Gender
                                </p>
                                <p className="font-medium text-gray-900">
                                  {application.pet.gender}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Link to={`/pet/${application.pet._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              icon={<Eye className="w-4 h-4" />}
                            >
                              View Pet Profile
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Applicant Information Card */}
                <Card className="overflow-hidden">
                  <button
                    onClick={() => toggleSection("applicant")}
                    className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                        <User className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Applicant Information
                      </h2>
                    </div>
                    {expandedSections.includes("applicant") ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedSections.includes("applicant") && application.personalInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-0 space-y-6">
                          {/* Contact Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                Full Name
                              </p>
                              <p className="font-medium text-gray-900">
                                {application.personalInfo.fullName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                Email
                              </p>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <p className="font-medium text-gray-900">
                                  {application.personalInfo.email}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                Phone
                              </p>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <p className="font-medium text-gray-900">
                                  {application.personalInfo.phone}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Address */}
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                              Address
                            </p>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <p className="font-medium text-gray-900">
                                {application.personalInfo.address}
                              </p>
                            </div>
                          </div>

                          {/* Home & Lifestyle */}
                          {application.household && (
                          <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Home className="w-4 h-4 text-[var(--color-primary)]" />
                              Home & Lifestyle
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-500">
                                  Home Type
                                </p>
                                <p className="font-medium text-gray-900 text-sm">
                                  {application.household.homeType}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Ownership
                                </p>
                                <p className="font-medium text-gray-900 text-sm">
                                  {application.household.rentOwn}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Has Yard
                                </p>
                                <p className="font-medium text-gray-900 text-sm">
                                  {application.household.hasFencedYard ? "Yes" : "No"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Existing Pets
                                </p>
                                <p className="font-medium text-gray-900 text-sm">
                                  {application.household.existingPets || "None"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Children
                                </p>
                                <p className="font-medium text-gray-900 text-sm">
                                  {application.household.hasChildren
                                    ? "Yes"
                                    : "No"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Work Schedule
                                </p>
                                <p className="font-medium text-gray-900 text-sm">
                                  {application.household.dailyRoutine || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                          )}

                          {/* Experience & Reason */}
                          {application.adoptionIntent && (
                          <div className="pt-4 border-t border-gray-100">
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                Pet Experience
                              </p>
                              <p className="text-gray-700 text-sm">
                                {application.adoptionIntent.petExperience}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                Reason for Adoption
                              </p>
                              <p className="text-gray-700 text-sm">
                                {application.adoptionIntent.whyAdopt}
                              </p>
                            </div>
                          </div>
                          )}

                          {/* Quick Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`mailto:${application.personalInfo.email}`)}
                              icon={<Mail className="w-4 h-4" />}
                            >
                              Email
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`tel:${application.personalInfo.phone}`)}
                              icon={<Phone className="w-4 h-4" />}
                            >
                              Call
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Documents Card */}
                {application.documents && application.documents.length > 0 && (
                <Card className="overflow-hidden">
                  <button
                    onClick={() => toggleSection("documents")}
                    className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">
                          Documents
                        </h2>
                        <Badge variant="info">
                          {application.documents.length}
                        </Badge>
                      </div>
                    </div>
                    {expandedSections.includes("documents") ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedSections.includes("documents") && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {application.documents.map((doc: any) => (
                              <div
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className={`p-4 border rounded-xl cursor-pointer transition-all group relative ${
                                  doc.status === 'verified' 
                                    ? 'border-green-200 bg-green-50/50' 
                                    : doc.status === 'rejected'
                                      ? 'border-red-200 bg-red-50/50'
                                      : 'border-gray-200 hover:border-[var(--color-primary)] hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="p-2 bg-white rounded-lg border border-gray-100">
                                    <FileText className="w-6 h-6 text-blue-500" />
                                  </div>
                                  {doc.status === 'verified' && (
                                    <div className="bg-green-100 p-1 rounded-full">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                  )}
                                  {doc.status === 'rejected' && (
                                    <div className="bg-red-100 p-1 rounded-full">
                                      <XCircle className="w-4 h-4 text-red-600" />
                                    </div>
                                  )}
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1 truncate">
                                  {doc.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {doc.status === 'pending' ? 'Click to review' : doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.name || "Document Review"}
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-2 flex justify-center">
              {selectedDoc.url ? (
                <img
                  src={selectedDoc.url}
                  alt={selectedDoc.name}
                  className="max-h-[60vh] object-contain rounded"
                />
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-500">
                  No preview available
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
               <span>Uploaded: {formatDate(selectedDoc.uploadedAt)}</span>
               <span className={`px-2 py-0.5 rounded-full ${
                   selectedDoc.status === 'verified' ? 'bg-green-100 text-green-700' :
                   selectedDoc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                   'bg-yellow-100 text-yellow-700'
               }`}>
                   {selectedDoc.status.charAt(0).toUpperCase() + selectedDoc.status.slice(1)}
               </span>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button 
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleRejectDoc(selectedDoc.id)}
                icon={<XCircle className="w-4 h-4" />}
              >
                Reject
              </Button>
              <Button 
                variant="primary"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleVerifyDoc(selectedDoc.id)}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Verify
              </Button>
            </div>
          </div>

        )}
      </Modal>


      </div>
    </div>
  );
}
