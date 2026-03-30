import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  User,
  Grid3X3,
  List,
  Dog,
  Cat,
  Mail,
  Clock,
  Eye,
  CalendarCheck,
  X,
  FileText,
  Loader2,
  AlertCircle,
  Brain,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { ShelterSidebar } from "../../components/layout/ShelterSidebar";
import { HamburgerMenu } from "../../components/layout/HamburgerMenu";
import { NotificationCenter } from "../../components/common/NotificationCenter";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import api from "../../utils/api";

// Extended Application Interface
interface Application {
  id: string;
  _id: string;
  petName: string;
  petSpecies: "dog" | "cat" | "other";
  petImage: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  status:
    | "pending"
    | "reviewing"
    | "approved"
    | "availability_submitted"
    | "meeting_scheduled"
    | "meeting_completed"
    | "scheduled"
    | "rejected"
    | "completed";
  scheduledDate?: string;
  scheduledTime?: string;
  submittedAt: string;
  nextAction?: string;
  notes?: string;
  pet?: any;
  personalInfo?: any;
  aiInsights?: {
    shelter?: {
      topConcern?: string;
      status: string;
    }
  };
}

interface ApplicationStats {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  availability_submitted?: number;
  meeting_scheduled?: number;
  meeting_completed?: number;
  scheduled?: number; // Keep scheduled as optional for now, or remove if no longer used
  finalizing?: number; // Added finalizing
  rejected: number;
  completed: number;
}

// Status configuration
const statusConfig: Record<
  string,
  {
    variant: "success" | "warning" | "info" | "neutral" | "error";
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  pending: {
    variant: "warning",
    label: "Pending",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  reviewing: {
    variant: "info",
    label: "Reviewing",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  approved: {
    variant: "success",
    label: "Approved",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  availability_submitted: {
    variant: "info",
    label: "Availability Submitted",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  meeting_scheduled: {
    variant: "info",
    label: "Meeting Scheduled",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  meeting_completed: {
    variant: "success",
    label: "Meeting Completed",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  follow_up_required: {
    variant: "warning",
    label: "Follow-Up Required",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  follow_up_scheduled: {
    variant: "info",
    label: "Follow-Up Scheduled",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  scheduled: {
    variant: "info",
    label: "Scheduled",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  rejected: {
    variant: "error",
    label: "Rejected",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  completed: {
    variant: "success",
    label: "Adopted",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  finalization_pending: {
    variant: "warning",
    label: "Finalizing",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  payment_pending: {
    variant: "info",
    label: "Awaiting Payment",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  payment_failed: {
    variant: "error",
    label: "Payment Failed",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  contract_generated: {
    variant: "info",
    label: "Awaiting Signature",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  contract_signed: {
    variant: "success",
    label: "Contract Signed",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  handover_pending: {
    variant: "warning",
    label: "Ready for Pickup",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
};

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    reviewing: 0,
    scheduled: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch applications and stats in parallel
        const [appsResponse, statsResponse] = await Promise.all([
          api.get("/applications/shelter"),
          api.get("/applications/shelter/stats"),
        ]);

        // Transform applications data
        const transformedApps = appsResponse.data.applications.map(
          (app: any) => ({
            id: app._id,
            _id: app._id,
            petName: app.pet?.name || "Unknown Pet",
            petSpecies: app.pet?.species?.toLowerCase() || "other",
            petImage: app.pet?.images?.[0] || "/placeholder-pet.png",
            applicantName: app.personalInfo?.fullName || "Unknown",
            applicantEmail: app.personalInfo?.email || "",
            applicantPhone: app.personalInfo?.phone || "",
            status: app.status,
            scheduledDate: app.scheduledDate,
            scheduledTime: app.scheduledTime,
            submittedAt: app.createdAt,
            notes: app.notes,
            pet: app.pet,
            personalInfo: app.personalInfo,
            aiInsights: app.aiInsights,
            nextAction: app.status === 'pending' ? 'Review application' : 
                       app.status === 'reviewing' ? 'Move to Approval' :
                       app.status === 'approved' ? 'Schedule meeting' :
                       app.status === 'availability_submitted' ? 'Schedule meeting' :
                       app.status === 'meeting_scheduled' ? 'Complete meeting' :
                       app.status === 'meeting_completed' ? 'Finalize adoption' :
                       app.status === 'finalization_pending' ? 'Confirm fee' :
                       app.status === 'payment_pending' ? 'Awaiting payment' :
                       app.status === 'contract_generated' ? 'Awaiting signature' :
                       app.status === 'contract_signed' ? 'Notify pickup' :
                       app.status === 'handover_pending' ? 'Confirm handover' : ''
          })
        );

        setApplications(transformedApps);
        setStats(statsResponse.data);
      } catch (err: any) {
        console.error("Error fetching applications:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load applications. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter applications
  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          selectedStatuses.length === 0 ||
          selectedStatuses.includes(app.status);
        const matchesSpecies =
          selectedSpecies.length === 0 ||
          selectedSpecies.includes(app.petSpecies);

        return matchesSearch && matchesStatus && matchesSpecies;
      })
      .sort((a, b) => {
        const dateA = new Date(a.submittedAt).getTime();
        const dateB = new Date(b.submittedAt).getTime();
        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [applications, searchQuery, selectedStatuses, selectedSpecies, sortBy]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleSpecies = (species: string) => {
    setSelectedSpecies((prev) =>
      prev.includes(species)
        ? prev.filter((s) => s !== species)
        : [...prev, species]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedSpecies([]);
    setSearchQuery("");
  };

  const activeFiltersCount = selectedStatuses.length + selectedSpecies.length;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[var(--color-background)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[var(--color-background)] items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Applications</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Applications
                </h1>
                <p className="text-sm text-gray-500">
                  {filteredApps.length} of {applications.length} applications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-xs font-medium text-gray-500">
                    Pending
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-xs font-medium text-gray-500">
                    Reviewing
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.reviewing}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-xs font-medium text-gray-500">
                    Scheduled
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.scheduled}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <span className="text-xs font-medium text-gray-500">
                    Finalizing
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.finalizing || 0}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium text-gray-500">
                    Adopted
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, pet, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                      showFilters || activeFiltersCount > 0
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-[var(--color-primary)] text-white rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "newest" | "oldest")
                    }
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 focus:border-[var(--color-primary)] focus:outline-none bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "grid"
                          ? "bg-white shadow-sm text-[var(--color-primary)]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "list"
                          ? "bg-white shadow-sm text-[var(--color-primary)]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Status Filter */}
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Status
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(statusConfig).map(
                              ([key, config]) => (
                                <button
                                  key={key}
                                  onClick={() => toggleStatus(key)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    selectedStatuses.includes(key)
                                      ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  {config.label}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Species Filter */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Pet Type
                          </p>
                          <div className="flex gap-2">
                            {["dog", "cat", "other"].map((species) => (
                              <button
                                key={species}
                                onClick={() => toggleSpecies(species)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                  selectedSpecies.includes(species)
                                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] ring-2 ring-offset-1 ring-[var(--color-primary)]"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {species === "dog" && (
                                  <Dog className="w-4 h-4" />
                                )}
                                {species === "cat" && (
                                  <Cat className="w-4 h-4" />
                                )}
                                <span className="capitalize">{species}s</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="mt-4 text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
                        >
                          <X className="w-4 h-4" /> Clear all filters
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Applications View */}
            <AnimatePresence mode="wait">
              {filteredApps.length > 0 ? (
                viewMode === "grid" ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {filteredApps.map((app, index) => {
                      const status = statusConfig[app.status];
                      return (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <Card className="p-4 hover:shadow-lg transition-all group h-full flex flex-col">
                            {/* Header - Pet Info */}
                            <div className="flex items-start gap-3 mb-4">
                              <img
                                src={app.petImage}
                                alt={app.petName}
                                className="w-14 h-14 rounded-xl object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-gray-900 truncate">
                                    {app.petName}
                                  </h3>
                                  <div
                                    className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                                      app.petSpecies === "dog"
                                        ? "bg-amber-100 text-amber-600"
                                        : "bg-purple-100 text-purple-600"
                                    }`}
                                  >
                                    {app.petSpecies === "dog" ? (
                                      <Dog className="w-3 h-3" />
                                    ) : (
                                      <Cat className="w-3 h-3" />
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">
                                  {app.id}
                                </p>
                              </div>
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                            </div>

                            {/* Applicant Info */}
                            <div className="space-y-2 mb-4 flex-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700 font-medium truncate">
                                  {app.applicantName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 truncate">
                                  {app.applicantEmail}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {formatTime(app.submittedAt)}
                                </span>
                              </div>
                              {app.scheduledDate && (
                                <div className="flex items-center gap-2">
                                  <CalendarCheck className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-600 font-medium">
                                    {new Date(
                                      app.scheduledDate
                                    ).toLocaleDateString()}
                                    {app.scheduledTime &&
                                      ` at ${app.scheduledTime}`}
                                  </span>
                                </div>
                              )}
                              
                              {/* AI Insight Quick View */}
                              {app.aiInsights?.shelter?.topConcern && (
                                <div className="mt-2 text-xs flex items-start gap-1.5 p-2 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
                                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span className="line-clamp-2" title={app.aiInsights.shelter.topConcern}>
                                    <span className="font-semibold text-amber-800 uppercase tracking-wider text-[10px] block mb-0.5">AI Flag</span>
                                    {app.aiInsights.shelter.topConcern}
                                  </span>
                                </div>
                              )}
                              {!app.aiInsights?.shelter?.topConcern && app.aiInsights?.shelter?.status === 'success' && (
                                <div className="mt-2 text-xs flex items-center gap-1.5 p-2 bg-green-50 text-green-800 rounded-lg border border-green-200">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                  <span className="font-medium">No major AI concerns</span>
                                </div>
                              )}
                            </div>

                            {/* Next Action */}
                            {app.nextAction && (
                              <div
                                className={`p-2.5 rounded-lg ${status.bgColor} mb-4`}
                              >
                                <p
                                  className={`text-xs font-medium ${status.color}`}
                                >
                                  Next: {app.nextAction}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center pt-3 border-t border-gray-100 mt-auto">
                              <Link
                                to={`/shelter/applications/${app.id}`}
                                className="flex-1"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  icon={<Eye className="w-4 h-4" />}
                                >
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                                ID
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                                Pet
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                                Applicant
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                                Submitted
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                                Scheduled
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredApps.map((app) => {
                              const status = statusConfig[app.status];
                              return (
                                <tr
                                  key={app.id}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="py-3 px-4">
                                    <span className="text-sm font-mono text-gray-500">
                                      {app.id}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={app.petImage}
                                        alt={app.petName}
                                        className="w-10 h-10 rounded-lg object-cover"
                                      />
                                      <div>
                                        <span className="font-medium text-gray-900">
                                          {app.petName}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          {app.petSpecies === "dog" ? (
                                            <Dog className="w-3 h-3" />
                                          ) : (
                                            <Cat className="w-3 h-3" />
                                          )}
                                          <span className="capitalize">
                                            {app.petSpecies}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">
                                          {app.applicantName}
                                        </p>
                                        {app.aiInsights?.shelter?.topConcern && (
                                          <div className="flex items-center justify-center p-1 bg-amber-100 text-amber-600 rounded-full" title={app.aiInsights.shelter.topConcern}>
                                            <AlertCircle className="w-3.5 h-3.5" />
                                          </div>
                                        )}
                                        {!app.aiInsights?.shelter?.topConcern && app.aiInsights?.shelter?.status === 'success' && (
                                          <div className="flex items-center justify-center p-1 bg-green-100 text-green-600 rounded-full" title="No major AI concerns">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        {app.applicantEmail}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 hidden md:table-cell">
                                    <span className="text-sm text-gray-500">
                                      {formatTime(app.submittedAt)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 hidden lg:table-cell">
                                    {app.scheduledDate ? (
                                      <span className="text-sm text-green-600 font-medium">
                                        {new Date(
                                          app.scheduledDate
                                        ).toLocaleDateString()}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-gray-400">
                                        —
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge variant={status.variant}>
                                      {status.label}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <Link
                                      to={`/shelter/applications/${app.id}`}
                                    >
                                      <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors">
                                        <Eye className="w-4 h-4" />
                                      </button>
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </motion.div>
                )
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No applications found"
                  message="Try adjusting your filters or search query"
                />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
