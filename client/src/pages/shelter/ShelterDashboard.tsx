import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Grid3X3,
  List,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Dog,
  Cat,
  Heart,
  Activity,
  ChevronRight,
  AlertTriangle,
  Target,
  Zap,
  Timer,
  BarChart2,
  Filter,
  RefreshCw,
  TrendingDown,
  MessageCircle,
  Banknote,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ShelterSidebar } from "../../components/layout/ShelterSidebar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { NotificationCenter } from "../../components/common/NotificationCenter";
import { HamburgerMenu } from "../../components/layout/HamburgerMenu";
import { PriorityAlertsPanel } from "../../components/common/PriorityAlertsPanel";
import { QuickActionsBar } from "../../components/common/QuickActionsBar";
import { useAuth } from "../../contexts/AuthContext";
import { PetDistributionChart } from "../../components/charts/PetDistributionChart";
import { AdoptionTrendsChart } from "../../components/charts/AdoptionTrendsChart";
import { ApplicationStatusChart } from "../../components/charts/ApplicationStatusChart";
import { ActivityTimelineChart } from "../../components/charts/ActivityTimelineChart";
import { AdoptionFunnelChart } from "../../components/charts/AdoptionFunnelChart";
import { IntakeVsAdoptionChart } from "../../components/charts/IntakeVsAdoptionChart";
import { SparklineChart } from "../../components/charts/SparklineChart";

interface Application {
  _id: string;
  petName: string;
  petImage?: string;
  petSpecies: string;
  applicantName: string;
  applicantEmail: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  scheduledDate?: string;
  createdAt: string;
}

interface PetStats {
  available: number;
  pending: number;
  adopted: number;
  pendingReview: number;
}

interface ShelterDonationStats {
  totalReceived: number;
  donationsThisMonth: number;
  donorCount: number;
  perPet: {
    petId: string;
    petName: string;
    petImage: string | null;
    donationCount: number;
    totalAmount: number;
    lastDonation: string;
  }[];
  recentDonations: {
    amount: number;
    petName: string | null;
    message: string | null;
    createdAt: string;
  }[];
}

type DateRange = "7d" | "30d" | "90d";
type ViewMode = "grid" | "list";

// Skeleton loader component
function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
        <div className="h-8 bg-gray-100 rounded-lg w-1/2" />
        <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
      </div>
    </div>
  );
}

function TrendIndicator({ value, suffix = "%" }: { value: string; suffix?: string }) {
  const num = parseFloat(value);
  const isPositive = num >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
      <Icon className="w-3 h-3" />
      {value}{suffix}
    </span>
  );
}

export function ShelterDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [shelterData, setShelterData] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [petStats, setPetStats] = useState<PetStats>({
    available: 0,
    pending: 0,
    adopted: 0,
    pendingReview: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  // UX IMPROVEMENT: Shelter donation visibility state
  const [donationStats, setDonationStats] = useState<ShelterDonationStats | null>(null);
  const [isLoadingDonations, setIsLoadingDonations] = useState(true);

  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { token, user } = useAuth();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setIsLoadingDonations(true);
    try {
      const [shelterRes, analyticsRes, appsRes, donationsRes] = await Promise.all([
        fetch("http://localhost:5000/api/shelter/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/shelter/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/applications/shelter?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/shelter/donations/my-stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (shelterRes.ok) setShelterData(await shelterRes.json());

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalyticsData(data);
        setPetStats({
          available: data.petStatusDistribution.available,
          pending: data.petStatusDistribution.pending,
          adopted: data.petStatusDistribution.adopted,
          pendingReview: data.petStatusDistribution.pendingReview,
        });
      }

      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(
          data.applications.map((app: any) => ({
            _id: app._id,
            petName: app.pet?.name || "Unknown Pet",
            petImage: app.pet?.images?.[0] || "",
            petSpecies: app.pet?.species || "other",
            applicantName:
              app.personalInfo?.fullName || app.adopter?.name || "Unknown Applicant",
            applicantEmail: app.personalInfo?.email || app.adopter?.email || "",
            status: app.status,
            scheduledDate: app.scheduledDate,
            createdAt: app.createdAt,
          }))
        );
      }
      
      if (donationsRes.ok) {
        setDonationStats(await donationsRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
      setIsLoadingDonations(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

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

  const getDaysSince = (dateString: string) => {
    return Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { variant: "success" | "warning" | "info" | "neutral"; label: string }> = {
      pending: { variant: "warning", label: "Pending" },
      reviewing: { variant: "info", label: "Reviewing" },
      approved: { variant: "success", label: "Approved" },
      rejected: { variant: "neutral", label: "Rejected" },
      // Finalization Pipeline
      finalization_pending: { variant: "info", label: "Setting Fee" },
      payment_pending: { variant: "warning", label: "Payment Due" },
      payment_failed: { variant: "neutral", label: "Pay Failed" },
      contract_generated: { variant: "info", label: "Awaiting Sign" },
      contract_signed: { variant: "success", label: "Signed" },
      handover_pending: { variant: "warning", label: "Ready Pickup" },
      completed: { variant: "success", label: "Adopted" },
    };
    return configs[status] || configs.pending;
  };

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    const speciesMatch = speciesFilter === "all" || app.petSpecies === speciesFilter;
    const statusMatch = statusFilter === "all" || app.status === statusFilter;
    if (dateRange === "7d") {
      return speciesMatch && statusMatch && getDaysSince(app.createdAt) <= 7;
    }
    if (dateRange === "30d") {
      return speciesMatch && statusMatch && getDaysSince(app.createdAt) <= 30;
    }
    return speciesMatch && statusMatch;
  });

  // Derived sparkline data (mock trend from analytics activity timeline)
  const sparklineData = analyticsData?.activityTimeline?.map((d: any) => d.activities) || [0, 1, 0, 2, 1, 3, 2];

  // Compute adoption rate trend label
  const adoptionRate = analyticsData?.adoptionRate ?? 0;
  const pendingCount = analyticsData?.applicationStats?.pending ?? 0;
  const scheduledCount = analyticsData?.scheduledMeetGreets ?? 0;
  const totalPets = analyticsData?.totalPets ?? shelterData?.stats?.totalPets ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <ShelterSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-16 bg-white border-b border-gray-200" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <SkeletonCard className="h-32" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <SkeletonCard className="h-48" />
                <SkeletonCard className="h-48" />
              </div>
            </div>
          </main>
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
        {/* ─── HEADER ─────────────────────────────────────────────────── */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <HamburgerMenu />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                Shelter Dashboard
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchDashboardData()}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link to="/shelter/add-pet">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Add Pet</span>
              </Button>
            </Link>
            <div className="h-7 w-px bg-gray-200 hidden sm:block" />
            <NotificationCenter />
            {/* Profile */}
            <div className="relative group">
              <button className="flex items-center gap-2 pl-2 py-1 pr-1 hover:bg-gray-50 rounded-full transition-colors">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">
                    {shelterData?.contactPerson || shelterData?.name || "Shelter Admin"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Shelter Manager</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/20 overflow-hidden">
                  {shelterData?.logo ? (
                    <img src={shelterData.logo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">
                      {(shelterData?.name || user?.name || "S")
                        .split(" ")
                        .map((w: any) => w[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
              </button>
              <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                  <Link to="/shelter/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <Link to="/login" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Log Out
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ─── MAIN CONTENT ────────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-7xl mx-auto space-y-5"
          >
            {/* ── 1. HERO BANNER ─────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-secondary)] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg sm:text-xl font-bold">
                      Welcome back, {shelterData?.name || "Partner"}!
                    </h2>
                    {shelterData?.isVerified ? (
                      <span className="bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-white/75 text-sm">
                    {pendingCount > 0
                      ? `${pendingCount} application${pendingCount !== 1 ? "s" : ""} waiting for your review`
                      : "All caught up — no pending applications"}
                    {scheduledCount > 0 && ` · ${scheduledCount} meet & greet${scheduledCount !== 1 ? "s" : ""} scheduled`}
                  </p>
                </div>
                {/* Primary KPI Hero Number */}
                <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-6 py-4 text-center flex-shrink-0">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">Active Pipeline</p>
                  <p className="text-4xl sm:text-5xl font-black text-white">
                    {analyticsData?.totalApplications ?? applications.length}
                  </p>
                  <p className="text-white/60 text-xs mt-1">Total Applications</p>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-[0.07] transform translate-x-8 translate-y-8">
                <PawPrint className="w-56 h-56" />
              </div>
            </div>

            {/* ── 2. SECONDARY KPIs ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Pets */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Card className="p-4 hover:shadow-md transition-all border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-xl bg-orange-100">
                      <PawPrint className="w-4 h-4 text-orange-600" />
                    </div>
                    <TrendIndicator value="+12" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{totalPets}</p>
                  <p className="text-xs text-gray-500 mb-2">Total Pets</p>
                  <SparklineChart data={sparklineData} color="#f97316" positive={true} />
                </Card>
              </motion.div>

              {/* Pending Applications */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-4 hover:shadow-md transition-all border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-xl bg-blue-100">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <TrendIndicator value={pendingCount > 0 ? `+${pendingCount}` : "0"} suffix="" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{pendingCount}</p>
                  <p className="text-xs text-gray-500 mb-2">Pending Applications</p>
                  <SparklineChart
                    data={[...sparklineData].reverse()}
                    color="#3b82f6"
                    positive={pendingCount === 0}
                  />
                </Card>
              </motion.div>

              {/* Adoption Rate */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card className="p-4 hover:shadow-md transition-all border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-xl bg-green-100">
                      <Heart className="w-4 h-4 text-green-600" />
                    </div>
                    <TrendIndicator value="+5" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{adoptionRate}%</p>
                  <p className="text-xs text-gray-500 mb-2">Adoption Rate</p>
                  <SparklineChart data={sparklineData} color="#22c55e" positive={true} />
                </Card>
              </motion.div>

              {/* Meet & Greets */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-4 hover:shadow-md transition-all border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-xl bg-violet-100">
                      <Calendar className="w-4 h-4 text-violet-600" />
                    </div>
                    <TrendIndicator value={scheduledCount > 0 ? `+${scheduledCount}` : "0"} suffix="" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{scheduledCount}</p>
                  <p className="text-xs text-gray-500 mb-2">Meet & Greets</p>
                  <SparklineChart data={sparklineData} color="#8b5cf6" positive={true} />
                </Card>
              </motion.div>
            </div>

            {/* ── 3. QUICK ACTIONS ────────────────────────────────────────── */}
            <div>
              <QuickActionsBar />
            </div>

            {/* ── 4. PRIORITY ALERTS ─────────────────────────────────────── */}
            {analyticsData?.priorityAlerts && (
              <PriorityAlertsPanel alerts={analyticsData.priorityAlerts} />
            )}

            {/* ── 5. FILTER BAR ──────────────────────────────────────────── */}
            <Card className="p-3 border border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Filter</span>
                </div>

                {/* Date Range */}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                  {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setDateRange(r)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        dateRange === r
                          ? "bg-white shadow-sm text-[var(--color-primary)]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {r === "7d" ? "Last 7 days" : r === "30d" ? "Last 30 days" : "Last 90 days"}
                    </button>
                  ))}
                </div>

                {/* Species Filter */}
                <select
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                >
                  <option value="all">All Species</option>
                  <option value="dog">Dogs</option>
                  <option value="cat">Cats</option>
                  <option value="other">Other</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {filteredApplications.length} result{filteredApplications.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </Card>

            {/* ── 6. RECENT APPLICATIONS ─────────────────────────────────── */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Recent Applications</h3>
                  <p className="text-xs text-gray-400">
                    Showing {filteredApplications.length} of {applications.length} applications
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === "grid"
                          ? "bg-white shadow-sm text-[var(--color-primary)]"
                          : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      <Grid3X3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === "list"
                          ? "bg-white shadow-sm text-[var(--color-primary)]"
                          : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Link
                    to="/shelter/applications"
                    className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium"
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {filteredApplications.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="p-8 text-center border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="font-semibold text-gray-700 mb-1">No Applications Found</h4>
                      <p className="text-sm text-gray-400">
                        Try adjusting your filters or date range
                      </p>
                    </Card>
                  </motion.div>
                ) : viewMode === "grid" ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {filteredApplications.map((app, index) => {
                      const statusConfig = getStatusConfig(app.status);
                      const daysSince = getDaysSince(app.createdAt);
                      const isUrgent = app.status === "pending" && daysSince > 3;
                      return (
                        <motion.div
                          key={app._id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                        >
                          <Card
                            className={`p-4 hover:shadow-md transition-all group ${
                              isUrgent ? "border-red-200 bg-red-50/30" : "border-gray-100"
                            }`}
                          >
                            {isUrgent && (
                              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mb-2 bg-red-100 rounded-lg px-2 py-1">
                                <AlertTriangle className="w-3 h-3" />
                                Pending {daysSince} days — needs review
                              </div>
                            )}
                            <div className="flex items-center gap-3 mb-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                  app.petSpecies === "dog"
                                    ? "bg-amber-100 text-amber-600"
                                    : "bg-violet-100 text-violet-600"
                                }`}
                              >
                                {app.petSpecies === "dog" ? (
                                  <Dog className="w-4 h-4" />
                                ) : (
                                  <Cat className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate text-sm">{app.petName}</h4>
                                <p className="text-xs text-gray-400 capitalize">{app.petSpecies}</p>
                              </div>
                              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                            </div>
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center gap-2 text-xs">
                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-gray-600 truncate">{app.applicantName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-gray-400">{formatTime(app.createdAt)}</span>
                              </div>
                              {app.scheduledDate && (
                                <div className="flex items-center gap-2 text-xs">
                                  <Calendar className="w-3.5 h-3.5 text-green-500" />
                                  <span className="text-green-600 font-medium">
                                    {new Date(app.scheduledDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <Link to={`/shelter/applications/${app._id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full text-xs" icon={<Eye className="w-3 h-3" />}>
                                  Review
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
                    <Card className="overflow-hidden border border-gray-100">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Pet</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Applicant</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Submitted</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Meet & Greet</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {filteredApplications.map((app) => {
                              const statusConfig = getStatusConfig(app.status);
                              const daysSince = getDaysSince(app.createdAt);
                              const isUrgent = app.status === "pending" && daysSince > 3;
                              return (
                                <tr
                                  key={app._id}
                                  className={`hover:bg-gray-50 transition-colors ${
                                    isUrgent ? "bg-red-50/40" : ""
                                  }`}
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                          app.petSpecies === "dog"
                                            ? "bg-amber-100 text-amber-600"
                                            : "bg-violet-100 text-violet-600"
                                        }`}
                                      >
                                        {app.petSpecies === "dog" ? (
                                          <Dog className="w-3.5 h-3.5" />
                                        ) : (
                                          <Cat className="w-3.5 h-3.5" />
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-gray-900 text-sm">{app.petName}</span>
                                        {isUrgent && (
                                          <span className="ml-2 text-xs text-red-500 font-medium">
                                            ⚠ {daysSince}d
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">{app.applicantName}</td>
                                  <td className="py-3 px-4 hidden sm:table-cell text-xs text-gray-400">{formatTime(app.createdAt)}</td>
                                  <td className="py-3 px-4 hidden md:table-cell">
                                    {app.scheduledDate ? (
                                      <span className="text-green-600 text-xs font-medium">
                                        {new Date(app.scheduledDate).toLocaleDateString()}
                                      </span>
                                    ) : (
                                      <span className="text-gray-300 text-xs">—</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Link to={`/shelter/applications/${app._id}`}>
                                        <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors">
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                      </Link>
                                      {app.status === "pending" && (
                                        <>
                                          <button className="p-1.5 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                          </button>
                                          <button className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                            <XCircle className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── 7. ADOPTION FUNNEL + TIME TO ADOPTION ─────────────────── */}
            <div className="grid lg:grid-cols-2 gap-5">
              {/* Adoption Funnel */}
              <Card className="p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Adoption Funnel</h3>
                    <p className="text-xs text-gray-400">Applications to adoption pipeline</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                {analyticsData ? (
                  <AdoptionFunnelChart data={analyticsData.adoptionFunnel || []} />
                ) : (
                  <div className="h-[220px] flex items-center justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                )}
              </Card>

              {/* Time to Adoption Stats */}
              <Card className="p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Time-to-Adoption</h3>
                    <p className="text-xs text-gray-400">Average days from application to adoption</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Timer className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                {analyticsData ? (
                  <div className="space-y-4">
                    {/* Average */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                      <p className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-1">Average</p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-amber-700">
                          {analyticsData.avgTimeToAdoption ?? 0}
                        </span>
                        <span className="text-amber-500 font-medium mb-1">days</span>
                      </div>
                    </div>

                    {/* Fastest / Slowest */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Fastest</span>
                        </div>
                        <p className="text-2xl font-black text-green-700">
                          {analyticsData.fastestAdoption ?? 0}
                          <span className="text-sm font-medium text-green-500 ml-1">d</span>
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs text-red-500 font-medium">Slowest</span>
                        </div>
                        <p className="text-2xl font-black text-red-600">
                          {analyticsData.slowestAdoption ?? 0}
                          <span className="text-sm font-medium text-red-400 ml-1">d</span>
                        </p>
                      </div>
                    </div>

                    {/* Pet Status Breakdown */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-medium mb-2">Pet Status Breakdown</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Available", value: petStats.available, color: "bg-green-500" },
                          { label: "Pending", value: petStats.pending, color: "bg-amber-500" },
                          { label: "Adopted", value: petStats.adopted, color: "bg-blue-500" },
                          { label: "In Review", value: petStats.pendingReview, color: "bg-gray-400" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-xs text-gray-500">{item.label}</span>
                            <span className="text-xs font-semibold text-gray-700 ml-auto">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                )}
              </Card>
            </div>

            {/* ── 8. INTAKE VS ADOPTION ──────────────────────────────────── */}
            <Card className="p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Intake vs. Adoption</h3>
                  <p className="text-xs text-gray-400">Monthly comparison of pets added vs adopted</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              {analyticsData ? (
                <IntakeVsAdoptionChart data={analyticsData.intakeVsAdoption || []} />
              ) : (
                <div className="h-[280px] flex items-center justify-center">
                  <LoadingSpinner size="md" />
                </div>
              )}
            </Card>

            {/* ── 9. ANALYTICS SECTION ───────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-[var(--color-primary)]" />
                <h3 className="font-bold text-gray-900">Analytics Overview</h3>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {/* Pet Distribution */}
                <Card className="p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Pet Distribution</h3>
                      <p className="text-xs text-gray-400">By species</p>
                    </div>
                    <Link
                      to="/shelter/manage-pets"
                      className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium"
                    >
                      Manage <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  {analyticsData ? (
                    <PetDistributionChart data={analyticsData.petDistribution} />
                  ) : (
                    <div className="h-[280px] flex items-center justify-center">
                      <LoadingSpinner size="md" />
                    </div>
                  )}
                </Card>

                {/* Application Status */}
                <Card className="p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Application Status</h3>
                      <p className="text-xs text-gray-400">Distribution by stage</p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </div>
                  {analyticsData ? (
                    <ApplicationStatusChart data={analyticsData.applicationStats} />
                  ) : (
                    <div className="h-[280px] flex items-center justify-center">
                      <LoadingSpinner size="md" />
                    </div>
                  )}
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-5 mt-5">
                {/* Adoption Trends */}
                <Card className="p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Adoption Trends</h3>
                      <p className="text-xs text-gray-400">Monthly adoptions (last 6 months)</p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    </div>
                  </div>
                  {analyticsData ? (
                    <AdoptionTrendsChart data={analyticsData.monthlyAdoptions} />
                  ) : (
                    <div className="h-[280px] flex items-center justify-center">
                      <LoadingSpinner size="md" />
                    </div>
                  )}
                </Card>

                {/* Activity Timeline */}
                <Card className="p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Activity Timeline</h3>
                      <p className="text-xs text-gray-400">Daily activities (last 7 days)</p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                  </div>
                  {analyticsData ? (
                    <ActivityTimelineChart data={analyticsData.activityTimeline} />
                  ) : (
                    <div className="h-[280px] flex items-center justify-center">
                      <LoadingSpinner size="md" />
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* ── 10. DONATIONS TRACKING (UX IMPROVEMENT) ───────────────── */}
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-[var(--color-accent)]" />
                <h3 className="font-bold text-gray-900">Donation Tracking</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Read-only</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              {isLoadingDonations ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} className="h-28" />)}
                  </div>
                  <SkeletonCard className="h-64" />
                </div>
              ) : !donationStats ? (
                <Card className="p-8 text-center border-dashed border-2">
                  <p className="text-sm text-gray-500">Failed to load donation statistics. Please try again later.</p>
                </Card>
              ) : (
                <div className="space-y-5">
                  {/* Summary Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Received */}
                    <Card className="p-4 hover:shadow-md transition-all border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-xl bg-green-100">
                          <Banknote className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                        Rs {donationStats.totalReceived.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">Total Received (All Time)</p>
                    </Card>

                    {/* This Month */}
                    <Card className="p-4 hover:shadow-md transition-all border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-xl bg-blue-100">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                        Rs {donationStats.donationsThisMonth.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">Donations This Month</p>
                    </Card>

                    {/* Total Donors */}
                    <Card className="p-4 hover:shadow-md transition-all border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-xl bg-purple-100">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                        {donationStats.donorCount}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">Unique Donors</p>
                    </Card>
                  </div>

                  {/* Per-Pet Breakdown Table */}
                  <Card className="overflow-hidden border border-gray-100">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                      <h4 className="font-bold text-gray-900 text-sm">Donations by Pet</h4>
                      <p className="text-xs text-gray-400">Breakdown of support for individual animals</p>
                    </div>
                    {donationStats.perPet.length === 0 ? (
                      <div className="p-8 text-center">
                        <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">No donations received yet.</p>
                        <p className="text-xs text-gray-400">Share your pet profiles to start receiving donations!</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pet</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Donations</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Amount</th>
                              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Donation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {donationStats.perPet.map((pet) => (
                              <tr key={pet.petId} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                      {pet.petImage ? (
                                        <img src={pet.petImage} alt={pet.petName} className="w-full h-full object-cover" />
                                      ) : (
                                        <PawPrint className="w-4 h-4 text-gray-400 m-2" />
                                      )}
                                    </div>
                                    <span className="font-medium text-sm text-gray-900">{pet.petName}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {pet.donationCount}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-bold text-[var(--color-primary)] text-sm">
                                    Rs {pet.totalAmount.toLocaleString('en-IN')}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right text-xs text-gray-500">
                                  {new Date(pet.lastDonation).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>

                  {/* Recent Donor Messages */}
                  {/* PRIVACY: No donor PII exposed */}
                  {donationStats.recentDonations.filter(d => d.message).length > 0 && (
                    <div className="pt-2">
                      <h4 className="font-bold text-gray-900 text-sm mb-3">What donors are saying</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {donationStats.recentDonations
                          .filter(d => d.message)
                          .slice(0, 6)
                          .map((donation, idx) => (
                            <Card key={idx} className="p-4 border border-[var(--color-primary)]/10 bg-[var(--color-primary)]/5">
                              <MessageCircle className="w-4 h-4 text-[var(--color-primary)]/40 mb-2" />
                              <p className="text-sm text-gray-700 italic mb-3 line-clamp-3">"{donation.message}"</p>
                              <div className="flex items-center justify-between text-xs mt-auto pt-2 border-t border-[var(--color-primary)]/10">
                                <span className="font-medium text-gray-500">
                                  Rs {donation.amount.toLocaleString()} for {donation.petName || "Shelter"}
                                </span>
                                <span className="text-gray-400">
                                  {new Date(donation.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
