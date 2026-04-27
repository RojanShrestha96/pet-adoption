import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle, XCircle, FileText, User, Home, Phone, Mail,
  Clock, Dog, Cat, MapPin, Heart, CalendarCheck, ChevronDown, Eye,
  Loader2, AlertCircle, AlertTriangle, Activity, Shield, ExternalLink,
  Zap, TrendingUp, PawPrint, Info, RefreshCw, Sparkles, MessageSquare, Edit2, CheckSquare
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ShelterSidebar } from "../../components/layout/ShelterSidebar";
import { HamburgerMenu } from "../../components/layout/HamburgerMenu";
import { ShelterFinalizationPanel } from "../../components/adoption/ShelterFinalizationPanel";
import { NotificationCenter } from "../../components/common/NotificationCenter";
import { EditPetModal } from "../../components/EditPetModal";
import api from "../../utils/api";
import { formatAge } from "../../utils/ageUtils";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { useSettings } from "../../contexts/SettingsContext";

// ── Types ─────────────────────────────────────────────────────────────────────
// ── Helpers ───────────────────────────────────────────────────────────────────
const buildWorkflowSteps = (app: any) => {
  if (!app) return [
    { key: "pending", label: "Pending", icon: FileText, desc: "Application received." },
    { key: "reviewing", label: "Under Review", icon: Eye, desc: "Staff reviewing." },
    { key: "approved", label: "Approved", icon: CheckCircle, desc: "Scheduling meet & greet." },
    { key: "availability_submitted", label: "Availability Sent", icon: Clock, desc: "Applicant submitted availability." },
    { key: "meeting_scheduled", label: "Meeting Scheduled", icon: CalendarCheck, desc: "Meet & Greet scheduled." },
    { key: "meeting_completed", label: "Meeting Complete", icon: CheckCircle, desc: "Meeting done." },
    { key: "finalize", label: "Finalize", icon: Zap, desc: "Adoption finalization in progress." },
    { key: "completed", label: "Adopted", icon: Heart, desc: "Adoption finalized!" },
  ];
  if (app.status === "rejected") return [
    { key: "pending", label: "Pending", icon: FileText, desc: "" },
    { key: "reviewing", label: "Under Review", icon: Eye, desc: "" },
    { key: "rejected", label: "Not Selected", icon: XCircle, desc: "" },
    { key: "closed", label: "Closed", icon: XCircle, desc: "" },
  ];
  const followUpCount = app.meetAndGreet?.followUpCount || 0;
  const steps = [
    { key: "pending", label: "Pending", icon: FileText, desc: "Received." },
    { key: "reviewing", label: "Under Review", icon: Eye, desc: "Reviewing." },
    { key: "approved", label: "Approved", icon: CheckCircle, desc: "Approved." },
    { key: "availability_submitted", label: "Availability Sent", icon: Clock, desc: "" },
    { key: "meeting_scheduled", label: "Meeting Scheduled", icon: CalendarCheck, desc: "" },
    { key: "meeting_completed", label: "Meeting Complete", icon: CheckCircle, desc: "" },
  ];
  if (followUpCount > 0 || app.meetAndGreet?.outcome === "needs_followup") {
    steps.push(
      { key: "follow_up_required", label: "Follow-Up Required", icon: Clock, desc: "" },
      { key: "follow_up_scheduled", label: "Follow-Up Scheduled", icon: CalendarCheck, desc: "" },
      { key: "follow_up_completed", label: "Follow-Up Complete", icon: CheckCircle, desc: "" },
    );
  }
  
  // Add Finalization stage
  steps.push({ key: "finalize", label: "Finalize", icon: Zap, desc: "Payment & Contract" });
  
  steps.push({ key: "completed", label: "Adopted", icon: Heart, desc: "Done!" });
  return steps;
};

const getDisplayStatus = (app: any) => {
  if (!app) return "pending";
  const fu = app.meetAndGreet?.followUpCount || 0;
  if (fu > 0) {
    if (app.status === "availability_submitted") return "follow_up_required";
    if (app.status === "meeting_scheduled") return "follow_up_scheduled";
    if (app.status === "meeting_completed") return "follow_up_completed";
  }

  // Finalization mapping
  const finalizeStatuses = [
    "finalization_pending",
    "payment_pending",
    "payment_failed",
    "contract_generated",
    "contract_signed",
    "handover_pending"
  ];
  if (finalizeStatuses.includes(app.status)) return "finalize";

  return app.status;
};

// Removed local computeCompatibilityBreakdown in favor of backend compatibility score

const getRiskIndicators = (app: any) => {
  if (!app) return [];
  const risks: { label: string; level: "high" | "medium" | "low" }[] = [];
  if (app.household?.rentOwn === "rent") {
    const hasLL = app.household?.landlordPermission === true || 
                 (app.documents || []).some((d: any) => d.name?.toLowerCase().includes("landlord"));
    risks.push(hasLL ? { label: "Renting – Landlord Permission ✓", level: "low" } : { label: "Renting – No Landlord Permission", level: "high" });
  }
  if (app.household?.hasChildren) risks.push({ label: "Children in Home", level: "medium" });
  if (app.household?.existingPets && !["none", "None", ""].includes(app.household.existingPets))
    risks.push({ label: `Existing Pets: ${app.household.existingPets}`, level: "medium" });
  return risks;
};

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";
const fmtDT = (d: string) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";

// ── Sub-components ────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.2 }} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-gray-900" style={{ fontSize: size < 60 ? 12 : 16 }}>{score}</span>
        <span className="text-gray-400" style={{ fontSize: 9 }}>/100</span>
      </div>
    </div>
  );
}

function RiskChip({ label, level }: { label: string; level: "high" | "medium" | "low" }) {
  const s = { high: "bg-red-50 border-red-200 text-red-700", medium: "bg-amber-50 border-amber-200 text-amber-700", low: "bg-green-50 border-green-200 text-green-700" }[level];
  const I = { high: AlertTriangle, medium: Info, low: CheckCircle }[level];
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s}`}><I className="w-3 h-3" />{label}</span>;
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; danger?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className={`flex items-start gap-3 p-4 rounded-xl ${danger ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"}`}>
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${danger ? "text-red-500" : "text-amber-500"}`} />
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className={danger ? "bg-red-600 hover:bg-red-700" : ""} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

function SectionCollapsible({ icon: Icon, iconBg, title, count, expanded, onToggle, children }: {
  icon: any; iconBg: string; title: string; count?: number; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border border-gray-100 shadow-sm">
      <button onClick={onToggle} className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors group">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${iconBg}`}><Icon className="w-4 h-4" /></div>
          <span className="text-sm font-bold text-gray-800">{title}</span>
          {count !== undefined && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{count}</span>}
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ApplicationDetailPage() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const { showToast } = useToast();
  const { settings } = useSettings();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ aiInsights: true, petDetails: false, applicant: true, documents: true, activity: false, profileDelta: false });
  const [regenerating, setRegenerating] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [isEditPetModalOpen, setIsEditPetModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; confirmLabel: string; danger: boolean; action: () => void }>({ open: false, title: "", message: "", confirmLabel: "Confirm", danger: false, action: () => {} });
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "application", label: "Application", icon: User, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "pet", label: "Pet Details", icon: PawPrint, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "docs", label: "Documents", icon: FileText, color: "text-green-500", bg: "bg-green-50" },
    { id: "activity", label: "Activity", icon: Activity, color: "text-violet-500", bg: "bg-violet-50" },
    { id: "finalize", label: "Finalize", icon: CheckSquare, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  const confirm = (title: string, message: string, action: () => void, opts?: { confirmLabel?: string; danger?: boolean }) =>
    setConfirmModal({ open: true, title, message, confirmLabel: opts?.confirmLabel || "Confirm", danger: opts?.danger || false, action });

  const toggle = (k: string) => setExpanded(p => ({ ...p, [k]: !p[k] }));

  const loadApplication = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/applications/${applicationId}`);
      const docs = [
        ...(data.personalInfo?.idDocuments || []).map((url: string, i: number) => ({ id: `id-${i}`, name: `ID Document ${i + 1}`, url, status: data.documentStatus?.find((s: any) => s.url === url)?.status || "pending", uploadedAt: data.createdAt })),
        ...(data.household?.proofOfResidence || []).map((url: string, i: number) => ({ id: `res-${i}`, name: `Proof of Residence ${i + 1}`, url, status: data.documentStatus?.find((s: any) => s.url === url)?.status || "pending", uploadedAt: data.createdAt })),
        ...(data.household?.landlordPermission || []).map((url: string, i: number) => ({ id: `land-${i}`, name: `Landlord Permission ${i + 1}`, url, status: data.documentStatus?.find((s: any) => s.url === url)?.status || "pending", uploadedAt: data.createdAt })),
      ];
      setApplication({ ...data, documents: docs });

      // Fetch current profile for delta comparison
      if (data.adopter?._id) {
        try {
          const profRes = await api.get(`/profiles/${data.adopter._id}`);
          setCurrentProfile(profRes.data);
        } catch (e) {
          console.log("Could not fetch current profile for delta", e);
        }
      }

    } catch (err: any) { setError(err.response?.data?.message || "Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (applicationId) loadApplication();
  }, [applicationId]);

  const handleRegenerateAI = async () => {
    try {
      setRegenerating(true);
      const { data } = await api.post(`/applications/${applicationId}/regenerate-insights`);
      setApplication((p: any) => ({ ...p, aiInsights: data.aiInsights }));
      showToast("AI Insights regenerated successfully", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to regenerate insights", "error");
    } finally {
      setRegenerating(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status: newStatus });
      setApplication((p: any) => ({ ...p, status: newStatus }));
      showToast(`Status updated to ${newStatus}`, "success");
      return true;
    } catch (err: any) { showToast(err.response?.data?.message || "Failed", "error"); return false; }
  };

  const verifyDoc = async (docId: string, status: "verified" | "rejected") => {
    const doc = application.documents.find((d: any) => d.id === docId);
    if (!doc) return;
    try {
      await api.put(`/applications/${applicationId}/documents/status`, { documentUrl: doc.url, status });
      setApplication((p: any) => ({ ...p, documents: p.documents.map((d: any) => d.id === docId ? { ...d, status } : d) }));
      setSelectedDoc(null);
      showToast(status === "verified" ? "Document verified" : "Document rejected", status === "verified" ? "success" : "error");
    } catch { showToast("Failed to update document", "error"); }
  };

  const handlePetSave = async (updatedPet: any) => {
    try {
      setLoading(true);
      await api.put(`/pets/${application.pet._id}`, updatedPet);
      showToast("Pet details updated successfully", "success");
      loadApplication(); // Reload to reflect changes
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update pet", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[var(--color-background)] items-center justify-center">
      <div className="flex flex-col items-center gap-3"><Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" /><p className="text-gray-400 text-sm">Loading application…</p></div>
    </div>
  );
  if (error || !application) return (
    <div className="flex min-h-screen bg-[var(--color-background)] items-center justify-center p-4">
      <div className="text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Error</h2><p className="text-gray-500 mb-4">{error || "Application not found"}</p><Button onClick={() => navigate("/shelter/applications")} variant="outline">Back</Button></div>
    </div>
  );

  const workflowSteps = buildWorkflowSteps(application);
  const displayStatus = getDisplayStatus(application);
  const currentStepIdx = workflowSteps.findIndex(s => s.key === displayStatus);
  const compatibility = application.compatibilityScore || { factors: [], percentage: 0 };
  const factors = compatibility.factors || [];
  const finalScore = compatibility.percentage || 0;
  const confidenceLevel = compatibility.confidenceLevel || "low";
  const aiInsights = application.aiInsights?.shelter;
  const risks = getRiskIndicators(application);
  const docs = application.documents || [];
  const verifiedDocs = docs.filter((d: any) => d.status === "verified").length;
  const checklistPct = docs.length > 0 ? Math.round((verifiedDocs / docs.length) * 100) : 0;
  const initials = (application.personalInfo?.fullName || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const scoreColor = finalScore >= 75 ? "text-green-600" : finalScore >= 50 ? "text-amber-600" : "text-red-600";
  const scoreLabel = finalScore >= 75 ? "Excellent" : finalScore >= 50 ? "Moderate" : "Low";
  const scoreBadgeCls = finalScore >= 75 ? "bg-green-100 text-green-700" : finalScore >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";

  const activityLog = [
    { date: application.createdAt, label: "Application Submitted", icon: FileText, cls: "text-blue-500 bg-blue-50" },
    ...(application.status !== "pending" ? [{ date: application.updatedAt, label: `Status → ${(application.status || "").replace(/_/g, " ")}`, icon: Activity, cls: "text-violet-500 bg-violet-50" }] : []),
    // V2.1 Issue 14: Fixed schema path — new path is confirmedSlot.date, legacy fallback to top-level scheduledDate
    ...((application.meetAndGreet?.confirmedSlot?.date || application.scheduledDate) ? [{ date: application.meetAndGreet?.confirmedSlot?.date || application.scheduledDate, label: "Meet & Greet Scheduled", icon: CalendarCheck, cls: "text-green-500 bg-green-50" }] : []),
    ...(application.meetAndGreet?.completedAt ? [{ date: application.meetAndGreet.completedAt, label: "Meet & Greet Completed", icon: CheckCircle, cls: "text-green-600 bg-green-50" }] : []),
  ].filter(e => e.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const colorMap = { green: { bar: "bg-green-500", text: "text-green-700" }, amber: { bar: "bg-amber-400", text: "text-amber-700" }, red: { bar: "bg-red-500", text: "text-red-600" } };

  // Profile Delta Logic
  const snapshot = application.profileSnapshot;
  const buildDeltas = () => {
    if (!snapshot || !currentProfile) return [];
    const fields = [
      { label: "Home Type", key: "homeType", old: snapshot.household?.homeType, new: currentProfile.household?.homeType },
      { label: "Ownership", key: "ownershipStatus", old: snapshot.household?.ownershipStatus || snapshot.household?.rentOwn, new: currentProfile.household?.ownershipStatus || currentProfile.household?.rentOwn },
      { label: "Existing Pets", key: "hasExistingPets", old: snapshot.household?.hasExistingPets?.toString(), new: currentProfile.household?.hasExistingPets?.toString() },
      { label: "Children", key: "hasChildren", old: snapshot.household?.hasChildren?.toString(), new: currentProfile.household?.hasChildren?.toString() },
      { label: "Activity Level", key: "activityLevel", old: snapshot.lifestyle?.activityLevel, new: currentProfile.lifestyle?.activityLevel },
      { label: "Work Style", key: "workStyle", old: snapshot.lifestyle?.workStyle, new: currentProfile.lifestyle?.workStyle },
      { label: "Max Alone Time (hrs)", key: "maxContinuousAloneTime", old: snapshot.lifestyle?.maxContinuousAloneTime, new: currentProfile.lifestyle?.maxContinuousAloneTime },
      { label: "Budget Tier", key: "budgetTier", old: snapshot.lifestyle?.budgetTier || snapshot.lifestyle?.monthlyPetBudget, new: currentProfile.lifestyle?.budgetTier || currentProfile.lifestyle?.monthlyPetBudget },
    ];
    return fields.filter(f => f.old !== f.new && f.new !== undefined && f.old !== undefined);
  };
  const deltas = buildDeltas();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block"><ShelterSidebar /></div>
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Header ── */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="lg:hidden"><HamburgerMenu /></div>
              <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold text-gray-900">Application Review</h1>
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{application._id.substring(0, 8)}</span>
                  {application.status === "rejected" && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Rejected</span>}
                  {application.status === "completed" && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Adopted</span>}
                </div>
                <p className="text-xs text-gray-400">Submitted {fmtDate(application.createdAt)}</p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <NotificationCenter />
              {application.status === "pending" && <Button variant="primary" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => confirm("Start Review", "Mark this application as under review?", () => updateStatus("reviewing"), { confirmLabel: "Start Review" })}>Start Review</Button>}
              {displayStatus === "reviewing" && <>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" icon={<XCircle className="w-4 h-4" />} onClick={() => confirm("Reject Application", "This cannot be undone. The applicant will be notified.", async () => { const ok = await updateStatus("rejected"); if (ok) navigate("/shelter/applications"); }, { confirmLabel: "Reject", danger: true })}>Reject</Button>
                <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-700" icon={<CheckCircle className="w-4 h-4" />} onClick={() => confirm("Approve Application", "Move application to meet & greet scheduling?", () => updateStatus("approved"), { confirmLabel: "Approve" })}>Approve</Button>
              </>}
              {(displayStatus === "approved" || displayStatus === "availability_submitted") && <Button variant="primary" size="sm" icon={<CalendarCheck className="w-4 h-4" />} onClick={() => navigate(`/shelter/meet-and-greet?applicationId=${application._id}&action=schedule`)}>Schedule Meet &amp; Greet</Button>}
              {displayStatus === "meeting_scheduled" && <Button variant="primary" size="sm" icon={<CheckCircle className="w-4 h-4" />} onClick={() => navigate(`/shelter/meet-and-greet?applicationId=${application._id}&action=complete`)}>Complete Meeting</Button>}
              {displayStatus === "follow_up_required" && <Button variant="primary" size="sm" icon={<CalendarCheck className="w-4 h-4" />} onClick={() => navigate(`/shelter/meet-and-greet?applicationId=${application._id}&action=schedule`)}>Schedule Follow-Up</Button>}
              {displayStatus === "follow_up_scheduled" && <Button variant="primary" size="sm" icon={<CheckCircle className="w-4 h-4" />} onClick={() => navigate(`/shelter/meet-and-greet?applicationId=${application._id}&action=complete`)}>Complete Follow-Up</Button>}
              {(displayStatus === "meeting_completed" || displayStatus === "follow_up_completed") && <>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" icon={<XCircle className="w-4 h-4" />} onClick={() => confirm("Reject", "Reject after meeting? Cannot be undone.", async () => { await updateStatus("rejected"); navigate("/shelter/applications"); }, { confirmLabel: "Reject", danger: true })}>Reject</Button>
                {displayStatus === "meeting_completed" && <Button variant="outline" size="sm" icon={<CalendarCheck className="w-4 h-4" />} onClick={() => confirm("Revert to Approved", "Reset to Approved, requiring new meeting scheduling.", () => updateStatus("approved"))}>Revert</Button>}
                {displayStatus === "follow_up_completed" && <Button variant="outline" size="sm" icon={<CalendarCheck className="w-4 h-4" />} onClick={() => confirm("Re-Schedule Follow-Up", "Revert to Follow-Up Required.", () => updateStatus("follow_up_required"))}>Re-Schedule</Button>}
                <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-700" icon={<Heart className="w-4 h-4" />} onClick={() => confirm("Finalize Adoption", "This marks the pet as adopted. A significant action.", () => updateStatus("completed"), { confirmLabel: "Finalize" })}>Finalize Adoption</Button>
              </>}
              {application.status === "completed" && <Button variant="outline" size="sm" icon={<CalendarCheck className="w-4 h-4" />} onClick={() => confirm("Revert Adoption", "Pet will be marked available again.", () => updateStatus("meeting_completed"), { confirmLabel: "Revert", danger: true })}>Revert Adoption</Button>}
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="max-w-7xl mx-auto space-y-4">

            {/* ═══ SECTION A: DECISION HEADER ═══ */}
            <Card className="overflow-hidden border border-gray-200 shadow-sm">
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Pet side (dominant) */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={application.pet?.images?.[0] || application.pet?.image || "/placeholder-pet.png"}
                      alt={application.pet?.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1 rounded-lg ${application.pet?.species === "dog" ? "bg-amber-50 text-amber-500" : "bg-purple-50 text-purple-500"}`}>
                          {application.pet?.species === "dog" ? <Dog className="w-3.5 h-3.5" /> : <Cat className="w-3.5 h-3.5" />}
                        </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{application.pet?.name || "Unknown Pet"}</h2>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {application.pet?.medical?.isSpecialNeeds || application.pet?.medical?.healthStatus === "special-needs" ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold flex items-center gap-1"><Heart className="w-3 h-3" />Special Needs</span>
                        ) : null}
                        {application.pet?.environment?.idealEnvironment === "garden-required" ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold flex items-center gap-1"><Home className="w-3 h-3" />Garden Required</span>
                        ) : null}
                        {[application.pet?.breed, application.pet?.age ? formatAge(application.pet.age) : null, application.pet?.gender, application.pet?.size].filter(Boolean).map((chip, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{chip}</span>
                        ))}
                        <Link to={`/pet/${application.pet?._id}`} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium hover:bg-blue-100 transition-colors">
                          <ExternalLink className="w-3 h-3" /> View Profile
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px bg-gray-150 my-1" />
                  <div className="sm:hidden h-px bg-gray-100" />

                  {/* Applicant side */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-slate-200">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Applicant</p>
                      <p className="text-base font-bold text-gray-800 truncate">{application.personalInfo?.fullName || "Unknown"}</p>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <a href={`mailto:${application.personalInfo?.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />{application.personalInfo?.email}
                        </a>
                        {application.personalInfo?.phone && <a href={`tel:${application.personalInfo?.phone}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                          <Phone className="w-3 h-3" />{application.personalInfo?.phone}
                        </a>}
                      </div>
                    </div>
                  </div>

                  {/* Score side */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <ScoreRing score={finalScore} size={64} />
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">Compatibility</p>
                    </div>
                    <div className="space-y-2 min-w-[100px]">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Status</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          application.status === "completed" ? "bg-green-100 text-green-700" :
                          application.status === "rejected" ? "bg-red-100 text-red-700" :
                          application.status === "pending" ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700"
                        }`}>{application.status?.replace(/_/g, " ")}</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Docs</p>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div className={`h-full rounded-full ${checklistPct === 100 ? "bg-green-500" : checklistPct > 50 ? "bg-amber-400" : "bg-blue-500"}`}
                              initial={{ width: 0 }} animate={{ width: `${checklistPct}%` }} transition={{ duration: 1 }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600">{checklistPct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ═══ Main Grid ═══ */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Left column (B + C) */}
              <div className="lg:col-span-2 space-y-4">
                {/* ═══ Tab Navigation (Equal Spacing & Width) ═══ */}
                <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm mb-4 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 min-w-fit ${
                          isActive ? tab.color : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTabBackground"
                            className={`absolute inset-0 ${tab.bg} rounded-xl`}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <Icon className={`relative z-10 w-4 h-4 ${isActive ? tab.color : "text-gray-400"}`} />
                        <span className="relative z-10">{tab.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeTabUnderline"
                            className={`absolute bottom-1 left-4 right-4 h-0.5 ${tab.color.replace('text', 'bg')} rounded-full`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* ═══ SECTION B: RISK & COMPATIBILITY INTELLIGENCE ═══ */}
                      {settings.compatibilityIntelligenceEnabled && (
                        <Card className="overflow-hidden border border-gray-100 shadow-sm">
                          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-violet-50 text-violet-600"><Zap className="w-4 h-4" /></div>
                              <h2 className="text-sm font-bold text-gray-800">Compatibility Intelligence</h2>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-black ${scoreColor}`}>{finalScore}</span>
                              <div>
                                <p className="text-[10px] text-gray-400">/100</p>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${scoreBadgeCls}`}>{scoreLabel}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-5">
                            {/* Compatibility Table */}
                            <table className="w-full text-sm mb-4">
                              <thead>
                                <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                  <th className="text-left pb-2 font-semibold">Factor</th>
                                  <th className="text-center pb-2 font-semibold w-20">Score</th>
                                  <th className="text-left pb-2 font-semibold pl-3">Priority</th>
                                </tr>
                              </thead>
                              <tbody>
                                {factors.map((factor: any) => {
                                  const pct = factor.maxScore > 0 ? (factor.score / factor.maxScore) * 100 : 0;
                                  const grade = pct >= 75 ? 'excellent' : pct >= 50 ? 'moderate' : 'low';
                                  const gradeColor = grade === 'excellent' ? 'green' : grade === 'moderate' ? 'amber' : 'red';
                                  const c = colorMap[gradeColor as keyof typeof colorMap] || colorMap.red;
                                  return (
                                    <tr key={factor.label || factor.name || Math.random().toString()} className="border-b border-gray-50 group hover:bg-gray-50/50 transition-colors">
                                      <td className="py-2.5 pr-3 font-medium text-gray-700" title={factor.explanation}>{factor.label || factor.name || "Unknown Factor"}</td>
                                      <td className="py-2.5 text-center">
                                        <span className={`font-bold ${c.text}`}>{factor.score}/{factor.maxScore}</span>
                                      </td>
                                      <td className="py-2.5 pl-3">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                                            <motion.div className={`h-full rounded-full ${c.bar}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                                          </div>
                                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${gradeColor === 'green' ? 'bg-green-50 text-green-600 border-green-200' : gradeColor === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'} capitalize`}>{grade}</span>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2 border-gray-200">
                                  <td className="pt-3 font-black text-gray-900 text-sm">Final Score</td>
                                  <td className="pt-3 text-center">
                                    <span className={`font-black text-lg ${scoreColor}`}>{finalScore}/100</span>
                                  </td>
                                  <td className="pt-3 pl-3 flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${scoreBadgeCls}`}>{scoreLabel}</span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${confidenceLevel === "high" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                      {confidenceLevel === "high" ? "High Confidence" : "Low Confidence"}
                                    </span>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>

                            {/* Risk Indicators */}
                            {risks.length > 0 && (
                              <div className="pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 mb-2.5">
                                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                                  <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">Risk Indicators</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {risks.map((r, i) => <RiskChip key={i} label={r.label} level={r.level} />)}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}

                      {/* ═══ SECTION B.5: AI INSIGHTS ═══ */}
                      {settings.compatibilityIntelligenceEnabled && (
                        <Card className="overflow-hidden border border-[var(--color-primary)] shadow-sm bg-indigo-50/10">
                          <div className="px-5 py-4 border-b border-indigo-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-[var(--color-primary)] text-white"><Sparkles className="w-4 h-4" /></div>
                              <h2 className="text-sm font-bold text-gray-800">Analyst AI Insights</h2>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />}
                              onClick={handleRegenerateAI}
                              disabled={regenerating}
                              className="text-indigo-600 hover:bg-indigo-50"
                            >
                              {regenerating ? "Generating..." : "Regenerate"}
                            </Button>
                          </div>

                          <div className="p-5">
                            {(!aiInsights || aiInsights.status === 'generating' || aiInsights.status === 'none') ? (
                               <div className="flex flex-col items-center justify-center py-6 text-indigo-400">
                                 <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                 <p className="text-sm font-medium">Analyzing compatibility data...</p>
                               </div>
                            ) : aiInsights.status === 'error' ? (
                              <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                  <div>
                                    <p className="text-sm font-bold text-red-900">AI Generation Failed</p>
                                    <p className="text-xs text-red-700 mt-1">{aiInsights.error || "The AI service encountered an error."}</p>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    icon={<RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />}
                                    onClick={handleRegenerateAI}
                                    disabled={regenerating}
                                  >
                                    Try Again
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Top Concern Box */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                  <div>
                                    <p className="text-[10px] text-amber-700 uppercase font-black tracking-wider mb-0.5">Primary Concern</p>
                                    <p className="text-sm text-amber-900 font-medium">{aiInsights.topConcern}</p>
                                  </div>
                                </div>
                                
                                {/* Explanation */}
                                <div>
                                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                    {aiInsights.explanation}
                                  </p>
                                </div>

                                {/* Suggested Interview Prompts */}
                                <div className="pt-4 mt-2 border-t border-indigo-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                      <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-bold text-indigo-900">Suggested Interview Prompts</h3>
                                      <p className="text-[10px] text-indigo-600/80 uppercase tracking-widest font-semibold">For the Meet & Greet</p>
                                    </div>
                                  </div>
                                  
                                  <div className="p-3 mb-4 bg-white/50 border border-indigo-100/50 rounded-lg text-xs text-indigo-800 font-medium">
                                    💡 We recommend asking these specific questions during the interview to address the AI's top compatibility concerns.
                                  </div>

                                  <ul className="space-y-2.5">
                                    {aiInsights.questions?.map((q: string, i: number) => (
                                      <li key={i} className="group flex items-start gap-3 bg-white rounded-xl p-3 border border-indigo-100 shadow-sm hover:border-indigo-300 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                          {i+1}
                                        </div>
                                        <span className="text-sm text-gray-700 font-medium leading-relaxed">{q}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* ═══ Professional Advisor Disclaimer (System Matched) ═══ */}
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-xl bg-[var(--color-primary)] text-white">
                                        <Info className="w-4.5 h-4.5" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">AI ADVISORY</p>
                                        <p className="text-[13px] font-bold text-gray-700 leading-tight">
                                          Insights are advisory and do not replace human judgment.
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-center sm:text-right shrink-0">
                                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-tighter">Generated At</span>
                                      <span className="text-xs font-black text-[var(--color-primary)]">
                                        {fmtDT(aiInsights.generatedAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}
                    </motion.div>
                  )}

                {/* ═══ SECTION C: STRUCTURED REVIEW DATA ═══ */}

                  {activeTab === "pet" && (
                    <motion.div
                      key="pet-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Pet Requirements & Traits */}
                      <SectionCollapsible 
                        icon={PawPrint} 
                        iconBg="bg-amber-50 text-amber-600" 
                        title="Pet Requirements & Traits" 
                        expanded={expanded.petDetails} 
                        onToggle={() => toggle("petDetails")}
                      >
                        <div className="flex justify-end -mt-8 mb-2">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              icon={<Edit2 className="w-3.5 h-3.5" />}
                              className="text-amber-600 hover:bg-amber-50"
                              onClick={() => setIsEditPetModalOpen(true)}
                            >
                              Edit Pet
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4 pt-1">
                          
                          {/* Medical details */}
                          {application.pet?.medical && (
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2 flex items-center gap-1.5"><Heart className="w-3 h-3" />Medical & Health</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                  { l: "Health Status", v: application.pet.medical.healthStatus || "N/A" },
                                  { l: "Sterilized", v: application.pet.medical.isNeutered ? "Yes" : "No" },
                                  { l: "Vaccinated", v: application.pet.medical.isVaccinated ? "Yes" : "No" },
                                  { l: "Microchipped", v: application.pet.medical.isMicrochipped ? "Yes" : "No" },
                                  { l: "Dewormed", v: application.pet.medical.isDewormed ? "Yes" : "No" },
                                  { l: "Special Needs", v: application.pet.medical.isSpecialNeeds ? "Yes" : application.pet.medical.healthStatus === "special-needs" ? "Yes" : "No" },
                                ].map(({ l, v }) => (
                                  <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">{l}</p>
                                    <p className={`text-sm font-semibold capitalize ${v === "Yes" ? "text-amber-600" : "text-gray-800"}`}>{String(v).replace(/-/g, ' ')}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Behaviour */}
                          {application.pet?.behaviour && (
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2 flex items-center gap-1.5"><Activity className="w-3 h-3" />Behaviour Traits</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                  { l: "Energy (1-5)", v: application.pet.behaviour.energyScore || "N/A" },
                                  { l: "Separation Anxiety", v: application.pet.behaviour.separationAnxiety || "N/A" },
                                  { l: "Attachment Style", v: application.pet.behaviour.attachmentStyle || "N/A" },
                                  { l: "Training Difficulty", v: application.pet.behaviour.trainingDifficulty || "N/A" },
                                  { l: "Noise Level", v: application.pet.behaviour.noiseLevel || "N/A" },
                                  { l: "Shedding Level", v: application.pet.behaviour.sheddingLevel || "N/A" },
                                ].map(({ l, v }) => (
                                  <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">{l}</p>
                                    <p className="text-sm font-semibold text-gray-800 capitalize">{String(v).replace(/-/g, ' ')}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Environment & Compatibility */}
                           <div className="pt-2 border-t border-gray-100">
                              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2 flex items-center gap-1.5"><Home className="w-3 h-3" />Environment & Match</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                  { l: "Ideal Home", v: application.pet?.environment?.idealEnvironment || "N/A" },
                                  { l: "Min Space", v: application.pet?.environment?.minSpaceSqm ? `${application.pet.environment.minSpaceSqm} sqm` : "N/A" },
                                  { l: "Good w/ Kids", v: application.pet?.compatibility?.goodWithKids === undefined ? "N/A" : String(application.pet.compatibility.goodWithKids).replace(/-/g, ' ') },
                                  { l: "Good w/ Pets", v: application.pet?.compatibility?.goodWithPets === undefined ? "N/A" : String(application.pet.compatibility.goodWithPets).replace(/-/g, ' ') },
                                ].map(({ l, v }) => (
                                  <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">{l}</p>
                                    <p className="text-sm font-semibold text-gray-800 capitalize">{v}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                        </div>
                      </SectionCollapsible>
                    </motion.div>
                  )}

                  {activeTab === "application" && (
                    <motion.div
                      key="application-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Applicant Details */}
                      <SectionCollapsible icon={User} iconBg="bg-blue-50 text-blue-600" title="Applicant Details" expanded={expanded.applicant} onToggle={() => toggle("applicant")}>
                        <div className="space-y-4 pt-1">
                          {application.personalInfo?.address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{application.personalInfo.address}</p>
                            </div>
                          )}
                          {application.household && (
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2 flex items-center gap-1.5"><Home className="w-3 h-3" />Home &amp; Lifestyle</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                  { l: "Home Type", v: application.household.homeType },
                                  { l: "Ownership", v: application.household.rentOwn },
                                  { l: "Fenced Yard", v: application.household.hasFencedYard ? "Yes ✓" : "No" },
                                  { l: "Existing Pets", v: application.household.existingPets || "None" },
                                  { l: "Children", v: application.household.hasChildren ? "Yes" : "No" },
                                  { l: "Routine", v: application.adoptionIntent?.typicalWeekdayRoutine || "N/A" },
                                ].map(({ l, v }) => (
                                  <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">{l}</p>
                                    <p className="text-sm font-semibold text-gray-800">{v}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {application.adoptionIntent && (
                            <div className="pt-2 border-t border-gray-100 space-y-2">
                              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide flex items-center gap-1.5"><PawPrint className="w-3 h-3" />Experience &amp; Intent</p>
                              {application.adoptionIntent.petExperience && <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Pet Experience</p><p className="text-sm text-gray-700 leading-relaxed">{application.adoptionIntent.petExperience}</p></div>}
                              {application.adoptionIntent.specificPetMotivation && <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Specific Motivation</p><p className="text-sm text-gray-700 leading-relaxed">{application.adoptionIntent.specificPetMotivation}</p></div>}
                              {application.adoptionIntent.typicalWeekdayRoutine && <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Weekday Routine</p><p className="text-sm text-gray-700 leading-relaxed">{application.adoptionIntent.typicalWeekdayRoutine}</p></div>}
                              {application.adoptionIntent.emergencyCarePlan && <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Emergency Care Plan</p><p className="text-sm text-gray-700 leading-relaxed">{application.adoptionIntent.emergencyCarePlan}</p></div>}
                              {application.adoptionIntent.monthlyBudgetEstimate && <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Monthly Budget Estimate</p><p className="text-sm text-gray-700 leading-relaxed">{application.adoptionIntent.monthlyBudgetEstimate}</p></div>}
                              {application.adoptionIntent.lifeChangesExplanation && <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Anticipated Life Changes</p><p className="text-sm text-gray-700 leading-relaxed">{application.adoptionIntent.lifeChangesExplanation}</p></div>}
                            </div>
                          )}
                          <div className="flex gap-2 pt-1">
                            <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${application.personalInfo?.email}`)} icon={<Mail className="w-3.5 h-3.5" />}>Email</Button>
                            <Button variant="outline" size="sm" onClick={() => window.open(`tel:${application.personalInfo?.phone}`)} icon={<Phone className="w-3.5 h-3.5" />}>Call</Button>
                          </div>
                        </div>
                      </SectionCollapsible>

                      {/* Profile Delta / Snapshot comparison */}
                      {snapshot && currentProfile && (
                        <SectionCollapsible icon={Clock} iconBg="bg-orange-50 text-orange-600" title="Profile Updates Since Application" count={deltas.length} expanded={expanded.profileDelta} onToggle={() => toggle("profileDelta")}>
                          <div className="pt-1">
                            {deltas.length === 0 ? (
                              <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <CheckCircle className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 font-medium">Profile completely unchanged since application.</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-xs text-gray-500 mb-2">The applicant has updated their profile since submitting this application. Here are the differences:</p>
                                <div className="space-y-2">
                                  {deltas.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3 border border-orange-100">
                                      <span className="font-semibold text-gray-700 w-1/3 truncate" title={d.label}>{d.label}</span>
                                      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                                        <span className="text-gray-400 line-through truncate max-w-[40%]" title={d.old}>{d.old || "None"}</span>
                                        <ArrowLeft className="w-3 h-3 text-orange-400 shrink-0 rotate-180" />
                                        <span className="font-bold text-orange-600 truncate max-w-[40%]" title={d.new}>{d.new || "None"}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </SectionCollapsible>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "docs" && (
                    <motion.div
                      key="docs-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Documents */}
                      {docs.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {docs.map((doc: any) => (
                            <button key={doc.id} onClick={() => setSelectedDoc(doc)}
                              className={`p-3 border rounded-xl text-left transition-all hover:shadow-sm group ${doc.status === "verified" ? "border-green-200 bg-green-50/40" : doc.status === "rejected" ? "border-red-200 bg-red-50/40" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/20"}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="p-1.5 bg-white rounded-lg border border-gray-100"><FileText className="w-4 h-4 text-blue-500" /></div>
                                {doc.status === "verified" && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {doc.status === "rejected" && <XCircle className="w-4 h-4 text-red-500" />}
                                {doc.status === "pending" && <Clock className="w-4 h-4 text-amber-400" />}
                              </div>
                              <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                              <p className={`text-xs mt-0.5 ${doc.status === "verified" ? "text-green-600" : doc.status === "rejected" ? "text-red-600" : "text-gray-400"}`}>
                                {doc.status === "pending" ? "Click to review →" : doc.status}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "activity" && (
                    <motion.div
                      key="activity-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Activity Log */}
                      <SectionCollapsible icon={Activity} iconBg="bg-violet-50 text-violet-600" title="Activity Log" count={activityLog.length} expanded={expanded.activity} onToggle={() => toggle("activity")}>
                        {activityLog.length === 0
                          ? <p className="text-sm text-gray-400 py-2 text-center">No activity recorded yet.</p>
                          : <div className="relative pt-1">
                              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
                              <div className="space-y-3">
                                {activityLog.map((e, i) => {
                                  const Icon = e.icon;
                                  return (
                                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative flex items-start gap-3 pl-1">
                                      <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${e.cls}`}><Icon className="w-3.5 h-3.5" /></div>
                                      <div className="pt-0.5">
                                        <p className="text-sm font-semibold text-gray-800 capitalize">{e.label}</p>
                                        <p className="text-xs text-gray-400">{fmtDT(e.date)}</p>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>}
                      </SectionCollapsible>
                    </motion.div>
                  )}
                  {activeTab === "finalize" && (
                    <motion.div
                      key="finalize-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* ═══ SECTION: FINALIZATION PANEL (DEDICATED TAB) ═══ */}
                      <div className="bg-rose-50/30 border border-rose-100 rounded-3xl p-1">
                        <ShelterFinalizationPanel 
                          applicationId={application._id} 
                          application={application} 
                          onRefresh={loadApplication} 
                        />
                      </div>
                      
                      <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <CheckSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Ready to close the adoption?</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                          Use this area to generate the digital contract, process final payments, and record the physical handover of the pet to their new family.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ════ SECTION D: DECISION CONTROLS & AUDIT TRAIL ════ */}
              <div className="space-y-4">

                {/* Workflow Stepper */}
                <Card className="border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Progress</h3>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-gray-100" />
                    <div className="space-y-0.5">
                      {workflowSteps.map((step, idx) => {
                        const done = idx < currentStepIdx;
                        const curr = idx === currentStepIdx;
                        const isRej = step.key === "rejected" || step.key === "closed";
                        const Icon = step.icon;
                        return (
                          <div key={step.key} title={step.desc} className={`relative flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors ${curr ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                            <motion.div
                              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${isRej && done ? "bg-red-500 border-red-500 text-white" : done ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white" : curr ? "bg-white border-[var(--color-primary)] text-[var(--color-primary)]" : "bg-white border-gray-200 text-gray-300"}`}
                              animate={curr ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 1.5, repeat: curr ? Infinity : 0, repeatDelay: 2 }}>
                              {done ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold leading-tight ${isRej && done ? "text-red-600" : done ? "text-gray-600" : curr ? "text-[var(--color-primary)]" : "text-gray-300"}`}>{step.label}</p>
                              {curr && <span className="text-[10px] text-blue-500 font-medium">● Current</span>}
                              {done && !isRej && <span className="text-[10px] text-green-500">✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* Quick Summary */}
                <Card className="border border-gray-100 shadow-sm p-4 space-y-3">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Quick Summary</h3>
                  <div className="space-y-2.5 text-sm">
                    {[
                      { l: "Application ID", v: <span className="font-mono text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">#{application._id.substring(0, 8)}</span> },
                      { l: "Submitted", v: fmtDate(application.createdAt) },
                      { l: "Docs Verified", v: `${verifiedDocs}/${docs.length}` },
                      // V2.1 Issue 14: Use new confirmedSlot.date path, fallback to legacy field
                      ...((application.meetAndGreet?.confirmedSlot?.date || application.scheduledDate) ? [{ l: "Meeting", v: fmtDate(application.meetAndGreet?.confirmedSlot?.date || application.scheduledDate) }] : []),
                      ...(application.meetAndGreet?.followUpCount > 0 ? [{ l: "Follow-Ups", v: <span className="text-amber-600 font-semibold">{application.meetAndGreet.followUpCount}</span> }] : []),
                    ].map(({ l, v }) => (
                      <div key={l} className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">{l}</span>
                        <span className="font-medium text-gray-800 text-xs">{v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Document Modal */}
      <Modal isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} title={selectedDoc?.name || "Document Review"}>
        {selectedDoc && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex justify-center">
              {selectedDoc.url ? <img src={selectedDoc.url} alt={selectedDoc.name} className="max-h-[55vh] object-contain rounded-lg" /> : <div className="h-40 flex flex-col items-center justify-center text-gray-400 gap-2"><FileText className="w-8 h-8" /><span className="text-sm">No preview</span></div>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 text-xs">Uploaded: {fmtDate(selectedDoc.uploadedAt)}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${selectedDoc.status === "verified" ? "bg-green-100 text-green-700" : selectedDoc.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{selectedDoc.status}</span>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" icon={<XCircle className="w-4 h-4" />} onClick={() => verifyDoc(selectedDoc.id, "rejected")}>Reject</Button>
              <Button variant="primary" className="bg-green-600 hover:bg-green-700" icon={<CheckCircle className="w-4 h-4" />} onClick={() => verifyDoc(selectedDoc.id, "verified")}>Verify</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal isOpen={confirmModal.open} onClose={() => setConfirmModal(p => ({ ...p, open: false }))} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} confirmLabel={confirmModal.confirmLabel} danger={confirmModal.danger} />

      {/* Edit Pet Modal */}
      {application?.pet && (
        <EditPetModal 
          pet={{
            ...application.pet,
            id: application.pet._id
          }}
          isOpen={isEditPetModalOpen}
          onClose={() => setIsEditPetModalOpen(false)}
          onSave={handlePetSave}
        />
      )}
    </div>
  );
}
