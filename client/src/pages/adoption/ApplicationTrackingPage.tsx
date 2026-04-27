import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
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
  PawPrint,
  ChevronDown,
  ChevronUp,
  Brain,
  Check,
  Zap,
  Star,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Heart
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  ApplicationTimeline,
  ApplicationStatus,
} from "../../components/adoption/ApplicationTimeline";
import { AvailabilitySubmission } from "../../components/adoption/AvailabilitySubmission";
import { AdoptionFinalizationStepper } from "../../components/adoption/AdoptionFinalizationStepper";
import { useToast } from "../../components/ui/Toast";
import { Navbar } from "../../components/layout/Navbar";
import axios from "axios";
import { formatAge } from "../../utils/ageUtils";

interface Application {
  _id: string;
  status: string;
  pet: {
    _id: string;
    name: string;
    breed: string;
    age: number | string | { years?: number; months?: number };
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
  compatibilityScore?: {
    adjustedPercentage: number;
    grade: string;
    confidenceLevel: string;
    factors: Array<{
      label: string;
      score: number;
      maxScore: number;
      explanation: string;
      flag?: string | null;
    }>;
  };
  aiInsights?: {
    adopter?: {
      summary?: string;
      suggestion?: string;
      status: string;
      error?: string;
    }
  };
  rejectionReason?: string;
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
  const [isStatusExpanded, setIsStatusExpanded] = useState(true);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [showMatchLegend, setShowMatchLegend] = useState(false);

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
        return 'finalize';
      case 'follow_up_required':
      case 'follow_up_scheduled':
        return 'follow-up';
      case 'approved': return 'approved';
      case 'finalization_pending':
      case 'payment_pending':
      case 'payment_failed':
      case 'contract_generated':
        return 'finalize';
      case 'contract_signed':
      case 'handover_pending':
        return 'finalized';
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
      case 'finalization_pending':
        return 'The shelter is preparing the final adoption fee. Please check back shortly.';
      case 'payment_pending':
      case 'payment_failed':
        return `Please complete the payment for the adoption fee to continue the finalization for ${petName}.`;
      case 'contract_generated':
        return 'Payment received! Please sign the adoption contract.';
      case 'contract_signed':
      case 'handover_pending':
        return `Contract signed! The shelter is preparing ${petName} for handover.`;
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
      className="min-h-screen"
      style={{
        background: "var(--color-background)",
      }}
    >
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-10 text-sm font-bold text-gray-400 hover:text-[var(--color-primary)] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </button>

        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold uppercase tracking-[0.2em] text-xs mb-3">
                <PawPrint className="w-4 h-4" /> Adoption Journey
              </div>
              <h1 className="text-5xl font-black mb-3 tracking-tight text-gray-900">
                Track Your Application
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg font-mono text-xs font-bold border border-gray-200">
                  ID: #{application._id.slice(-6).toUpperCase()}
                </span>
                <span className="text-gray-400 text-sm hidden sm:block">•</span>
                <span className="text-gray-500 text-sm font-medium">
                  Applied on {new Date(application.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
            {application.status === 'rejected' && (
               <div className="px-6 py-3 rounded-2xl bg-red-50 text-red-600 font-black text-sm uppercase tracking-wider border-2 border-red-100 shadow-sm">
                 Application Closed
               </div>
            )}
          </div>
        </div>

        {/* Full-Width Application Status Timeline */}
        <Card padding="none" className="overflow-hidden mb-8">
          <div 
            className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
            onClick={() => setIsStatusExpanded(!isStatusExpanded)}
          >
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Application Status
            </h2>
            <button className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500">
              {isStatusExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          <AnimatePresence>
            {isStatusExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-4">
                  <ApplicationTimeline 
                    currentStatus={currentStatus}
                    hasFollowUp={followUpCount > 0}
                    meetingOutcome={application.meetAndGreet?.outcome as 'successful' | 'needs_followup' | 'not_a_match' | undefined}
                    isRejected={application.status === 'rejected'}
                    actualStatus={application.status}
                  />
                  
                  {/* Contextual status message */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-4 rounded-xl border shadow-sm ${
                      application.status === 'rejected' 
                        ? 'bg-red-50 border-red-200' 
                        : application.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {application.status === 'rejected' ? (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      ) : application.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm font-medium leading-relaxed ${
                        application.status === 'rejected' ? 'text-red-900' : application.status === 'completed' ? 'text-green-900' : 'text-blue-900'
                      }`}>
                        {getStatusMessage(application.status, petName)}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">

            {/* Rejection Information Card */}
            {application.status === 'rejected' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <Card padding="lg" className="border-2 border-red-200 bg-red-50/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <XCircle className="w-32 h-32 text-red-600" />
                  </div>
                  
                  <div className="flex items-start gap-4 mb-6 relative">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Application Declined</h3>
                      <p className="text-sm text-gray-600">Feedback from the Shelter</p>
                    </div>
                  </div>

                  <div className="p-5 bg-white border border-red-100 rounded-xl shadow-sm relative">
                    <p className="text-gray-800 leading-relaxed italic">
                      "{application.rejectionReason || "The shelter has decided to move forward with another applicant at this time. We appreciate your interest and encourage you to explore other pets available for adoption."}"
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/pets')}
                      className="bg-gray-900 hover:bg-black text-white px-8"
                    >
                      Browse Other Pets
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* AI Compatibility Card */}
            {application.compatibilityScore && (() => {
              const pct = application.compatibilityScore.adjustedPercentage;
              const matchGrade = pct >= 90
                ? { label: "Perfect Match", emoji: "⭐", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-400" }
                : pct >= 75
                ? { label: "Great Match", emoji: "🎉", bg: "bg-green-100", text: "text-green-700", border: "border-green-200", dot: "bg-green-400" }
                : pct >= 55
                ? { label: "Good Match", emoji: "👍", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-400" }
                : pct >= 35
                ? { label: "Fair Match", emoji: "🤔", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" }
                : { label: "Poor Match", emoji: "⚠️", bg: "bg-red-100", text: "text-red-700", border: "border-red-200", dot: "bg-red-400" };

              const legendItems = [
                { range: "90–100%", label: "Perfect Match", emoji: "⭐", desc: "Exceptional fit — you and this pet are made for each other.", dot: "bg-yellow-400" },
                { range: "75–89%", label: "Great Match", emoji: "🎉", desc: "Strong compatibility — this pet suits your lifestyle well.", dot: "bg-green-400" },
                { range: "55–74%", label: "Good Match", emoji: "👍", desc: "Solid fit — minor adjustments may help you both thrive.", dot: "bg-blue-400" },
                { range: "35–54%", label: "Fair Match", emoji: "🤔", desc: "Some gaps exist — consider whether you can meet this pet's needs.", dot: "bg-amber-400" },
                { range: "0–34%", label: "Poor Match", emoji: "⚠️", desc: "Significant mismatches — another pet may be a better fit.", dot: "bg-red-400" },
              ];

              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 mb-6">
                  <Card padding="lg" className="border-2 border-[var(--color-primary)]/20 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent relative">
                    {/* Background decorative elements contained to card bounds */}
                    <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    </div>

                    <div className="flex items-start gap-4 mb-6 relative">
                      {/* Bigger icon */}
                      <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                        <Brain className="w-8 h-8 text-[var(--color-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Title row with info icon */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900">Compatibility Matching</h3>
                          {/* Info icon with hover legend */}
                          <div className="relative">
                            <button
                              onMouseEnter={() => setShowMatchLegend(true)}
                              onMouseLeave={() => setShowMatchLegend(false)}
                              className="text-gray-400 hover:text-[var(--color-primary)] transition-colors focus:outline-none"
                              aria-label="Match grade legend"
                            >
                              <HelpCircle className="w-5 h-5" />
                            </button>
                            <AnimatePresence>
                              {showMatchLegend && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                  transition={{ duration: 0.18 }}
                                  className="absolute left-0 top-7 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                                  style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
                                >
                                  {/* Tooltip header */}
                                  <div className="px-5 py-4 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-800">How Match Grades Work</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Scores are based on your lifestyle profile vs. this pet's needs.</p>
                                  </div>
                                  {/* Legend items */}
                                  <div className="p-4 space-y-3">
                                    {legendItems.map((item) => (
                                      <div key={item.label} className="flex items-start gap-3">
                                        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${item.dot}`} />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-gray-900">
                                              {item.emoji} {item.label}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                              {item.range}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Grade badge - bigger and clearer */}
                        <div className="mt-2.5">
                          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border-2 shadow-sm ${matchGrade.bg} ${matchGrade.text} ${matchGrade.border}`}>
                            <span className="text-base">{matchGrade.emoji}</span>
                            {matchGrade.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-2">Based on your lifestyle and {petName}'s needs.</p>
                      </div>

                      <div className="ml-auto text-right shrink-0">
                        <div className="text-3xl font-black text-[var(--color-primary)]">
                          {application.compatibilityScore.adjustedPercentage}%
                        </div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Match Score
                        </div>
                      </div>
                    </div>


                    {application.aiInsights?.adopter?.summary && (
                      <div className="p-4 bg-white/60 backdrop-blur-sm border border-[var(--color-primary)]/10 rounded-xl mb-4 text-sm text-gray-700 leading-relaxed shadow-sm">
                        {application.aiInsights.adopter.summary}
                      </div>
                    )}

                    <div className="mt-2">
                      <button
                        onClick={() => setIsAiExpanded(!isAiExpanded)}
                        className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        {isAiExpanded ? 'Hide Factor Breakdown' : 'View Detailed Factor Breakdown'}
                        {isAiExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <AnimatePresence>
                        {isAiExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {application.compatibilityScore.factors.map((factor, idx) => {
                                const fp = Math.round((factor.score / factor.maxScore) * 100);
                                return (
                                  <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-1.5">
                                      <span className="text-sm font-semibold text-gray-800">{factor.label}</span>
                                      <span className={`text-xs font-bold ${fp >= 80 ? 'text-green-600' : fp >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {factor.score}/{factor.maxScore}
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                                      <div
                                        className={`h-full rounded-full transition-all duration-1000 ${fp >= 80 ? 'bg-green-500' : fp >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                        style={{ width: `${fp}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                      {factor.explanation}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              );
            })()}

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

            {/* Finalization Pipeline Stepper */}
            {['finalization_pending', 'payment_pending', 'payment_failed', 'contract_generated', 'contract_signed', 'handover_pending', 'completed'].includes(application.status) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                <AdoptionFinalizationStepper 
                  applicationId={application._id} 
                  application={application} 
                  onRefresh={() => {
                    const token = localStorage.getItem("token");
                    if (token) {
                      axios.get(
                        `http://localhost:5000/api/applications/adopter/${applicationId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      ).then(res => setApplication(res.data)).catch(console.error);
                    }
                  }} 
                />
              </motion.div>
            )}

            {/* Actions */}
            <div className="mt-6 space-y-4">

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
            {/* Pet Quick View */}
            <Card padding="none" className="overflow-hidden border-2 border-[var(--color-primary)]/10">
              {pet ? (
                <div>
                  <div className="relative h-56 group cursor-pointer">
                    <img
                      src={pet.images && pet.images.length > 0 ? pet.images[0] : "/placeholder-pet.png"}
                      alt={pet.name || "Pet"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-2xl font-black text-white leading-tight">{pet.name}</h4>
                      <p className="text-white/80 text-sm font-bold flex items-center gap-1.5 mt-0.5">
                        <PawPrint className="w-3.5 h-3.5" />
                        {pet.breed}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Age</p>
                          <p className="text-xs font-bold text-gray-700">{formatAge(pet.age)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                          <Ruler className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Size</p>
                          <p className="text-xs font-bold text-gray-700 capitalize">{pet.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                          <Heart className="w-4 h-4 text-pink-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Gender</p>
                          <p className="text-xs font-bold text-gray-700 capitalize">{pet.gender}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <Info className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Status</p>
                          <p className="text-xs font-bold text-gray-700">Healthy</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full py-2.5 text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 rounded-xl border border-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/10 transition-colors"
                      onClick={() => navigate(`/pet/${pet._id}`)}
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center bg-gray-50">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-bold">Pet profile no longer available</p>
                </div>
              )}
            </Card>


            {/* Shelter Contact & Actions */}
            <Card padding="lg" className="mt-4 border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Shelter Partner</h3>
                  <p className="text-base font-bold text-gray-900 leading-tight">{application.shelter?.name || "PetMate Shelter"}</p>
                </div>
              </div>

              <div className="space-y-4">
                {application.shelter?.location?.formattedAddress && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                    <MapPin className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-tight mb-1">Location</p>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        {application.shelter.location.formattedAddress}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {application.shelter?.phone && (
                    <a 
                      href={`tel:${application.shelter.phone}`}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-gray-100 bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all group"
                    >
                      <Phone className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-primary)]" />
                      <span className="text-[10px] font-bold text-gray-600">Call</span>
                    </a>
                  )}
                  {application.shelter?.email && (
                    <a 
                      href={`mailto:${application.shelter.email}`}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-gray-100 bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all group"
                    >
                      <Mail className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-primary)]" />
                      <span className="text-[10px] font-bold text-gray-600">Email</span>
                    </a>
                  )}
                </div>

                {application.shelter?.location?.formattedAddress && (
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(application.shelter.location.formattedAddress)}`, '_blank')}
                  >
                    View on Google Maps
                  </Button>
                )}
              </div>
            </Card>

            {/* Message Shelter */}
            <Card padding="lg" className="mt-4 border-2 border-[var(--color-primary)]/10 bg-gradient-to-br from-white to-[var(--color-primary)]/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-bold text-gray-900">Direct Message</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Have questions about {petName}'s transition or need to update the shelter? Reach out directly.
              </p>

              <Button
                variant="primary"
                icon={<MessageSquare className="w-4 h-4" />}
                className="w-full shadow-lg shadow-[var(--color-primary)]/10"
              >
                Send Message
              </Button>

              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg border border-gray-100">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                  Typical response: <span className="text-blue-600">Within 24 hours</span>
                </p>
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



