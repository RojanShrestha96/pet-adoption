import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Upload, 
  MessageSquare, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  Calendar, 
  Clock,
  MapPin,
  CheckCircle,
  Building2,
  Phone,
  Mail,
  Ruler,
  Info,
  PawPrint
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  ApplicationTimeline,
  ApplicationStatus,
} from "../../components/adoption/ApplicationTimeline";
import { AvailabilitySubmission } from "../../components/adoption/AvailabilitySubmission";
import { useToast } from "../../components/ui/Toast";
import axios from "axios";

interface Application {
  _id: string;
  status: string;
  pet: {
    _id: string;
    name: string;
    breed: string;
    age: number;
    gender: string;
    images: string[];
    size: string;
    adoptionStatus: string;
  };
  shelter: {
    name: string;
    email: string;
    phone: string;
    location?: {
      formattedAddress: string;
    };
    contact?: string;
  };
  meetAndGreet?: {
    availabilitySlots?: Array<{
      date: string;
      timeSlot: string;
      notes?: string;
    }>;
    confirmedSlot?: {
      date: string;
      timeSlot: string;
      specificTime?: string;
    };
    location?: string;
    outcome?: string;
    followUpCount: number;
  };
  followUpCount?: number;
  followUpDetails?: {
    requiredByDate?: string;
    notes?: string;
    secondMeetingScheduled?: boolean;
  };
  createdAt: string;
}

export function ApplicationTrackingPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [submittingAvailability, setSubmittingAvailability] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/applications/adopter/${applicationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApplication(response.data);
      } catch (err: any) {
        console.error("Error fetching application:", err);
        setError(err.response?.data?.message || "Failed to load application details.");
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId, navigate]);

  // Map backend status to frontend timeline status
  const getTimelineStatus = (status: string, followUpCount: number = 0): ApplicationStatus => {
    switch (status) {
      case 'pending': return 'submitted';
      case 'reviewing': return 'under-review';
      case 'availability_submitted':
      case 'meeting_scheduled':
        // If followUpCount > 0, it means we are in the follow-up loop
        return followUpCount > 0 ? 'follow-up' : 'meet-greet';
      case 'meeting_completed':
        // If followUpCount > 0, we are at follow-up complete stage
        return followUpCount > 0 ? 'follow-up-completed' : 'meet-greet';
      case 'follow_up_required':
      case 'follow_up_scheduled':
        return 'follow-up';
      case 'approved': return 'approved';
      case 'completed': return 'adopted';
      case 'rejected': return 'closed'; // Show as final "closed" state
      default: return 'submitted';
    }
  };

  // Get contextual message for current status
  const getStatusMessage = (status: string, petName: string): string => {
    switch (status) {
      case 'pending':
        return `We've received your application for ${petName} and will begin reviewing it shortly.`;
      case 'reviewing':
        return `The shelter is carefully reviewing your application for ${petName}.`;
      case 'approved':
        return `Great news! The shelter would like to schedule a meet & greet with ${petName}.`;
      case 'availability_submitted':
        return 'The shelter will review your availability and confirm a meeting time within 2-3 business days.';
      case 'meeting_scheduled':
        return `You're all set! Get ready to meet ${petName} in person.`;
      case 'meeting_completed':
        return 'Thank you for visiting! The shelter will contact you about the next steps.';
      case 'follow_up_required':
        return `The shelter would like to schedule a follow-up discussion regarding your application for ${petName}.`;
      case 'follow_up_scheduled':
        return `A follow-up meeting has been scheduled for your application with ${petName}.`;
      case 'completed':
        return `Congratulations on adopting ${petName}! 🎉`;
      case 'rejected':
        return 'We appreciate your interest. Please explore other wonderful pets looking for homes.';
      default:
        return '';
    }
  };


  // Handle availability submission
  const handleAvailabilitySubmit = async (slots: any[]) => {
    try {
      setSubmittingAvailability(true);
      const token = localStorage.getItem("token");
      
      await axios.post(
        `http://localhost:5000/api/applications/${application?._id}/availability`,
        { availabilitySlots: slots },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Availability submitted successfully!", "success");
      setShowAvailabilityForm(false);
      
      // Refresh application data
      const response = await axios.get(
        `http://localhost:5000/api/applications/adopter/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplication(response.data);
    } catch (err: any) {
      console.error("Error submitting availability:", err);
      showToast(err.response?.data?.message || "Failed to submit availability", "error");
    } finally {
      setSubmittingAvailability(false);
    }
  };

  // Handle reschedule request
  const handleRescheduleRequest = async (slots: any[]) => {
    try {
      setSubmittingAvailability(true);
      const token = localStorage.getItem("token");
      
      await axios.put(
        `http://localhost:5000/api/applications/${application?._id}/reschedule-request`,
        { availabilitySlots: slots, reason: "Requested new availability" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Reschedule request submitted!", "success");
      setShowAvailabilityForm(false);
      
      // Refresh application data
      const response = await axios.get(
        `http://localhost:5000/api/applications/adopter/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplication(response.data);
    } catch (err: any) {
      console.error("Error requesting reschedule:", err);
      showToast(err.response?.data?.message || "Failed to request reschedule", "error");
    } finally {
      setSubmittingAvailability(false);
    }
  };

  // Handle cancel / withdraw application
  const handleCancelApplication = async () => {
    try {
      setCancelling(true);
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/applications/${application?._id}/cancel`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Your application has been withdrawn.", "success");
      setShowCancelModal(false);
      navigate("/");
    } catch (err: any) {
      console.error("Error cancelling application:", err);
      showToast(err.response?.data?.message || "Failed to cancel application", "error");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-[var(--color-error)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
          <p className="text-[var(--color-text-light)] mb-6">{error || "We couldn't find the application you're looking for."}</p>
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  const pet = application.pet;
  const petName = pet?.name || "the pet";
  const followUpCount = application.meetAndGreet?.followUpCount || application.followUpCount || 0;
  const currentStatus = getTimelineStatus(application.status, followUpCount);

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background: "var(--color-background)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-6 transition-colors"
          style={{
            color: "var(--color-text-light)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-4xl font-bold mb-2"
                style={{
                  color: "var(--color-text)",
                }}
              >
                Track Your Application
              </h1>
              <p
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                Application ID: <span className="font-mono">#{application._id.slice(-6)}</span>
              </p>
            </div>
            {application.status === 'rejected' && (
               <div className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium">
                 Application Rejected
               </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  color: "var(--color-text)",
                }}
              >
                Application Status
              </h2>
              <ApplicationTimeline 
                currentStatus={currentStatus}
                hasFollowUp={followUpCount > 0}
                meetingOutcome={application.meetAndGreet?.outcome as 'successful' | 'needs_followup' | 'not_a_match' | undefined}
                isRejected={application.status === 'rejected'}
                actualStatus={application.status}
              />
              
              {/* Contextual status message */}
              {application.status !== 'completed' && application.status !== 'rejected' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <p className="text-sm text-blue-900">
                    {getStatusMessage(application.status, petName)}
                  </p>
                </motion.div>
              )}
            </Card>

            {/* Meet & Greet Section - Status-based Display */}
            {/* Status: approved OR follow_up_required - Show availability submission */}
            {['approved', 'follow_up_required'].includes(application.status) && !showAvailabilityForm && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card padding="lg" className="mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {application.status === 'approved' 
                        ? "🎉 Great News! Let's Schedule a Meet & Greet" 
                        : "📅 Schedule Follow-Up Meeting"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {application.status === 'approved'
                        ? `The shelter would like to meet you and ${petName}`
                        : "The shelter would like to schedule a second meeting"}
                    </p>
                  </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-900">
                    {application.status === 'approved'
                      ? `The shelter has reviewed your application and would like to schedule a meet & greet with ${petName}! Please share 2-3 time slots when you're available.`
                      : "To proceed with your application, the shelter requests a follow-up meeting. Please submit your availability for another visit."}
                  </p>
                </div>
                  <Button
                    variant="primary"
                    icon={<Calendar className="w-4 h-4" />}
                    onClick={() => setShowAvailabilityForm(true)}
                  >
                    Submit Your Availability
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Show availability submission form */}
            {showAvailabilityForm && ['approved', 'follow_up_required'].includes(application.status) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <AvailabilitySubmission
                  onSubmit={handleAvailabilitySubmit}
                  onCancel={() => setShowAvailabilityForm(false)}
                  isLoading={submittingAvailability}
                />
              </motion.div>
            )}

            {/* Status: availability_submitted - Waiting for shelter confirmation */}
            {application.status === 'availability_submitted' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card padding="lg" className="mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {followUpCount > 0 ? "Follow-Up Availability Submitted" : "Availability Submitted"}
                      </h3>
                      <p className="text-sm text-gray-600">Waiting for shelter confirmation</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <h4 className="font-semibold text-gray-700">
                      {followUpCount > 0 ? "Your Proposed Follow-Up Times:" : "Your Proposed Times:"}
                    </h4>
                    {application.meetAndGreet?.availabilitySlots?.map((slot, index) => {
                      const timeSlotDisplay = {
                        morning: '9:00 AM - 12:00 PM',
                        afternoon: '12:00 PM - 3:00 PM',
                        evening: '3:00 PM - 6:00 PM'
                      };
                      return (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-900 font-medium">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span className="mx-2">•</span>
                            <Clock className="w-4 h-4" />
                            {/* @ts-ignore */}
                            <span>{timeSlotDisplay[slot.timeSlot] || slot.timeSlot}</span>
                          </div>
                          {slot.notes && (
                            <p className="text-sm text-gray-600 mt-1 ml-6">{slot.notes}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      The shelter will review your availability and confirm a meeting time soon.
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}



            {/* Status: follow_up_scheduled - Show schedule */}
            {application.status === 'follow_up_scheduled' && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                 <Card padding="lg" className="mt-6">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="p-3 bg-purple-100 rounded-xl">
                       <Calendar className="w-6 h-6 text-purple-600" />
                     </div>
                     <div>
                       <h3 className="text-xl font-bold text-gray-900">Follow-Up Scheduled</h3>
                       <p className="text-sm text-gray-600">Upcoming discussion</p>
                     </div>
                   </div>

                   {application.followUpDetails?.secondMeetingScheduled && (
                     <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                       <p className="text-sm text-purple-900">
                         A follow-up meeting has been confirmed. Please check your email for details.
                       </p>
                     </div>
                   )}
                 </Card>
               </motion.div>
            )}

            {/* Status: meeting_scheduled - Show confirmed meeting details */}
            {application.status === 'meeting_scheduled' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card padding="lg" className="mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {followUpCount > 0 ? "Follow-Up Meeting Scheduled!" : "Meet & Greet Scheduled!"}
                      </h3>
                      <p className="text-sm text-gray-600">See you soon!</p>
                    </div>
                  </div>

                  {application.meetAndGreet?.confirmedSlot && (
                    <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Date</p>
                          <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                            <Calendar className="w-5 h-5 text-green-600" />
                            <span>
                              {new Date(application.meetAndGreet.confirmedSlot.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Time</p>
                          <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                            <Clock className="w-5 h-5 text-green-600" />
                            <span>
                              {application.meetAndGreet.confirmedSlot.specificTime || 
                                (() => {
                                  const timeSlotDisplay: any = {
                                    morning: '9:00 AM - 12:00 PM',
                                    afternoon: '12:00 PM - 3:00 PM',
                                    evening: '3:00 PM - 6:00 PM'
                                  };
                                  return timeSlotDisplay[application.meetAndGreet.confirmedSlot.timeSlot] || application.meetAndGreet.confirmedSlot.timeSlot;
                                })()
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {application.meetAndGreet.location && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Location</p>
                          <div className="flex items-center gap-2 text-gray-900 font-medium">
                            <MapPin className="w-5 h-5 text-green-600" />
                            <span>{application.meetAndGreet.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowAvailabilityForm(true)}
                      className="flex-1"
                    >
                      Request Reschedule
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Show reschedule form */}
            {showAvailabilityForm && application.status === 'meeting_scheduled' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <Card padding="lg">
                  <h3 className="text-lg font-bold mb-4">Request New Availability</h3>
                  <AvailabilitySubmission
                    onSubmit={handleRescheduleRequest}
                    onCancel={() => setShowAvailabilityForm(false)}
                    isLoading={submittingAvailability}
                  />
                </Card>
              </motion.div>
            )}

            {/* Status: meeting_completed - Show outcome */}
            {application.status === 'meeting_completed' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card padding="lg" className="mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {followUpCount > 0 ? "Follow-Up Completed" : "Meet & Greet Completed"}
                      </h3>
                      <p className="text-sm text-gray-600">Thank you for visiting!</p>
                    </div>
                  </div>

                  {application.meetAndGreet?.outcome && (
                    <div className={`p-4 rounded-lg border-2 ${
                      application.meetAndGreet.outcome === 'successful' ? 'bg-green-50 border-green-200' :
                      application.meetAndGreet.outcome === 'needs_followup' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <p className="text-sm font-medium">
                        {application.meetAndGreet.outcome === 'successful' && followUpCount > 0 &&
                          'Great news! The follow-up went well. The shelter will contact you soon about finalizing the adoption.'}
                        {application.meetAndGreet.outcome === 'successful' && followUpCount === 0 &&
                          'Great news! The meet & greet went well. The shelter will contact you soon about next steps.'}
                        {application.meetAndGreet.outcome === 'needs_followup' && 
                          'The shelter would like to schedule a follow-up discussion. They will contact you soon.'}
                        {application.meetAndGreet.outcome === 'not_a_match' && 
                          'Thank you for taking the time to meet. While this wasn\'t the perfect match, we appreciate your interest in adoption.'}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Actions */}
            <div className="mt-6 space-y-4">
              <Card padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Upload Additional Documents
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Add any supporting files
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    icon={<Upload className="w-4 h-4" />}
                  >
                    Upload
                  </Button>
                </div>
              </Card>

              <Card padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Message Shelter
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Ask questions or provide updates
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    icon={<MessageSquare className="w-4 h-4" />}
                  >
                    Message
                  </Button>
                </div>
              </Card>

              {/* Cancel Request Card – hidden for terminal statuses */}
              {!['completed', 'rejected', 'cancelled'].includes(application.status) && (
              <Card padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{
                        color: "var(--color-error)",
                      }}
                    >
                      Cancel Request
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Withdraw your application
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    icon={<XCircle className="w-4 h-4" />}
                    onClick={() => setShowCancelModal(true)}
                    style={{
                      borderColor: "var(--color-error)",
                      color: "var(--color-error)",
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
              )}
            </div>
          </div>

          {/* Pet Info Sidebar */}
          <div>
            {pet ? (
            <Card padding="lg">
              <h3
                className="font-semibold mb-4"
                style={{
                  color: "var(--color-text)",
                }}
              >
                Pet Details
              </h3>
              <img
                src={pet.images && pet.images.length > 0 ? pet.images[0] : "/placeholder-pet.png"}
                alt={pet.name || "Pet"}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h4
                className="text-xl font-bold mb-2"
                style={{
                  color: "var(--color-text)",
                }}
              >
                {pet.name}
              </h4>
              <p
                className="flex items-center gap-2 mb-4"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                <PawPrint className="w-4 h-4" />
                <span>{pet.breed} • {pet.age} years</span>
              </p>
              <div
                className="space-y-3 text-sm"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                {pet.size && (
                  <p className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-gray-400" />
                    <strong>Size:</strong> <span className="capitalize">{pet.size}</span>
                  </p>
                )}
                {pet.gender && (
                  <p className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-400" />
                    <strong>Gender:</strong> <span className="capitalize">{pet.gender}</span>
                  </p>
                )}
              </div>
            </Card>
            ) : (
              <Card padding="lg" className="mb-4 bg-gray-50 border-gray-200">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">Pet profile no longer available</p>
                </div>
              </Card>
            )}

            <Card padding="lg" className="mt-4">
              <h3
                className="font-semibold mb-3"
                style={{
                  color: "var(--color-text)",
                }}
              >
                Shelter Contact
              </h3>
              <div
                className="space-y-3 text-sm"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                <p className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <strong>{application.shelter?.name || "Shelter"}</strong>
                </p>
                {application.shelter?.location?.formattedAddress && (
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>{application.shelter.location.formattedAddress}</span>
                  </p>
                )}
                {application.shelter?.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{application.shelter.phone}</span>
                  </p>
                )}
                {application.shelter?.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{application.shelter.email}</span>
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCancelModal(false); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Withdraw Application?
            </h2>

            {/* Pet name hint */}
            <p className="text-center text-gray-500 mb-1 text-sm">
              Application for
            </p>
            <p className="text-center font-semibold text-gray-800 text-lg mb-5">
              {petName}
            </p>

            {/* Warning text */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 leading-relaxed">
                Are you sure you want to withdraw your adoption application? This action
                <strong> cannot be undone</strong> and the shelter will be notified. If you
                change your mind later, you will need to submit a new application.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Application
              </button>
              <button
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                onClick={handleCancelApplication}
                disabled={cancelling}
              >
                {cancelling ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Withdrawing...</>
                ) : (
                  <><XCircle className="w-4 h-4" /> Yes, Withdraw</>  
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}



