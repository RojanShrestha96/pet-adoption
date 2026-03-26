import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
  Users,
  Building2,
  PawPrint,
  CheckCircle,
  TrendingUp,
  Heart,
  Settings as SettingsIcon,
  Shield,
  Search,
  Plus,
  Eye,
  Trash2,
  X,
  Lock,
  Mail,
  User,
  LayoutGrid,
  List,
  MapPin,
  Calendar,
  Phone,
  Filter,
  Bell,
  Globe,
  Activity,
  Smartphone,
  Key,
  AlertTriangle,
  FileText,
  Flag,
  Info,
  Clock,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  XCircle,
  UserCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AdminSidebar } from "../../components/layout/AdminSidebar";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { NotificationCenter } from "../../components/common/NotificationCenter";
import { HamburgerMenu } from "../../components/layout/HamburgerMenu";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useToast } from "../../components/ui/Toast";

import { AdminModerationAlert } from "../../components/admin/AdminModerationAlert";
import { AdminDonations } from "../../components/admin/AdminDonations";
type TabType = "dashboard" | "platform_users" | "users" | "shelters" | "donations" | "reports" | "logs" | "settings" | "security";
type ShelterFilterType = "all" | "verified" | "pending" | "suspended";
type PetFilterType = "all" | "dog" | "cat" | "other";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { settings, refreshSettings } = useSettings();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [shelterFilter, setShelterFilter] = useState<ShelterFilterType>('all');
  const [donations, setDonations] = useState<any[]>([]);
  const [pendingPets, setPendingPets] = useState<any[]>([]);
  const [petModerationFilter, setPetModerationFilter] = useState<PetFilterType>('all');
  const [selectedModerationPet, setSelectedModerationPet] = useState<any>(null);

  // Platform Users States
  const [platformUsers, setPlatformUsers] = useState<any[]>([]);
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'warned' | 'suspended' | 'banned'>('all');
  const [selectedPlatformUser, setSelectedPlatformUser] = useState<any>(null);
  const [showPlatformUserModal, setShowPlatformUserModal] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingUserStatus, setIsUpdatingUserStatus] = useState(false);

  // Pagination
  const [shelterPage, setShelterPage] = useState(1);
  const [petModPage, setPetModPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Featured Pet States
  const [currentFeaturedPet, setCurrentFeaturedPet] = useState<any>(null);
  const [showPetPicker, setShowPetPicker] = useState(false);
  const [availablePets, setAvailablePets] = useState<any[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);

  // Add Admin Modal State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "admin", // Default role
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Password Update State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update local state when user changes (e.g. on mount)
  useEffect(() => {
    if (user) {
        setSettingsForm({
            name: user.name || "",
            email: user.email || "",
        });
    }
  }, [user]);

  const tabs = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: TrendingUp },
    { id: "platform_users" as TabType, label: "Platform Users", icon: UserCheck },
    { id: "users" as TabType, label: "Admin Users", icon: Users },
    { id: "shelters" as TabType, label: "Shelters", icon: Building2 },
    { id: "donations" as TabType, label: "Donations", icon: Heart },
    { id: "reports" as TabType, label: "Moderation", icon: Flag },
    { id: "logs" as TabType, label: "Audit Logs", icon: FileText },
    { id: "settings" as TabType, label: "Settings", icon: SettingsIcon },
    { id: "security" as TabType, label: "Security", icon: Shield },
  ];

  // Fetch Data based on active tab
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "dashboard") {
          const [statsRes, sheltersRes, petsRes] = await Promise.all([
            api.get("/admin/stats"),
            shelters.length === 0 ? api.get("/admin/shelters") : Promise.resolve(null),
            pendingPets.length === 0 ? api.get("/admin/moderation/pets") : Promise.resolve(null),
          ]);
          setDashboardStats(statsRes.data);
          if (sheltersRes) setShelters(sheltersRes.data);
          if (petsRes) setPendingPets(petsRes.data);
        } else if (activeTab === "platform_users") {
          const res = await api.get("/admin/users");
          setPlatformUsers(res.data);
        } else if (activeTab === "users") {
          const adminsRes = await api.get("/admin/all");
          setAdmins(adminsRes.data);
        } else if (activeTab === "shelters") {
          const sheltersRes = await api.get("/admin/shelters");
          setShelters(sheltersRes.data);
          setShelterPage(1);
        } else if (activeTab === "donations") {
          const donationsRes = await api.get("/admin/donations");
          setDonations(donationsRes.data);
          try {
            const featuredRes = await api.get("/donations/featured-pet");
            if (featuredRes.data.success) {
              setCurrentFeaturedPet(featuredRes.data.pet);
            }
          } catch (e) {
            setCurrentFeaturedPet(null);
          }
        } else if (activeTab === "reports") {
          const petsRes = await api.get("/admin/moderation/pets");
          setPendingPets(petsRes.data);
          setPetModPage(1);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, token]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/create", newAdminData);
      showToast("Admin created successfully", "success");
      setShowAddAdminModal(false);
      setNewAdminData({ name: "", username: "", email: "", password: "", role: "admin" });
      // Refresh list
      const res = await api.get("/admin/all");
      setAdmins(res.data);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to create admin", "error");
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await api.delete(`/admin/${id}`);
      showToast("Admin deleted successfully", "success");
      setAdmins(admins.filter((a) => a._id !== id));
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete admin", "error");
    }
  };

  const handleVerifyShelter = async (id: string, isVerified: boolean) => {
    try {
      await api.patch(`/admin/shelters/${id}/status`, { isVerified });
      showToast(isVerified ? "Shelter verified successfully" : "Shelter status updated", "success");
      setShelters(shelters.map(s => s._id === id ? { ...s, isVerified } : s));
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to update shelter status", "error");
    }
  };

  const handlePetModerationAction = async (petId: string, action: "approve" | "reject") => {
    try {
      await api.post(`/pets/admin/review/${petId}`, { action });
      showToast(`Pet ${action === 'approve' ? 'approved' : 'rejected'} successfully`, "success");
      setPendingPets(prev => prev.filter(p => p._id !== petId));
      setSelectedModerationPet(null);
    } catch (error: any) {
      showToast(error.response?.data?.message || `Failed to ${action} pet`, "error");
    }
  };

  const handleViewUserDetails = async (userId: string) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedPlatformUser(res.data);
      setStatusReason("");
      setShowPlatformUserModal(true);
    } catch (error) {
      showToast("Failed to fetch user details", "error");
    }
  };

  const handleUserStatusChange = async (userId: string, status: string) => {
    if (status !== 'active' && !statusReason.trim()) {
      showToast("A reason is required to issue a warning, suspension, or ban.", "error");
      return;
    }
    
    setIsUpdatingUserStatus(true);
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        status,
        statusReason: statusReason.trim()
      });
      
      showToast(`User successfully marked as ${status}`, "success");
      
      // Update local state for lists
      setPlatformUsers(prev => prev.map(u => u._id === userId ? { ...u, status, statusReason } : u));
      
      // Update modal state if open
      if (selectedPlatformUser && selectedPlatformUser.user?._id === userId) {
        setSelectedPlatformUser({
          ...selectedPlatformUser,
          user: { ...selectedPlatformUser.user, status, statusReason }
        });
      }
      
      setStatusReason("");
      
      // Close modal on ban/suspend if desired, or keep it open so they see the badge change
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to update user status", "error");
    } finally {
      setIsUpdatingUserStatus(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          // In a real app, we'd update context using the response, but here we'll just reload mostly
          await api.put("/admin/profile", 
            { name: settingsForm.name, email: settingsForm.email }
          );
          showToast("Profile updated successfully", "success");
          // Optionally trigger a user reload from context here if available, or just rely on local state
      } catch (error: any) {
          showToast(error.response?.data?.message || "Failed to update profile", "error");
      }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          showToast("New passwords do not match", "error");
          return;
      }
      try {
          await api.put("/admin/profile", 
            { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }
          );
          showToast("Password updated successfully", "success");
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } catch (error: any) {
          showToast(error.response?.data?.message || "Failed to update password", "error");
      }
  };

  const handleOpenPetPicker = async () => {
    setShowPetPicker(true);
    setLoadingPets(true);
    try {
      const res = await api.get("/donations/pets?limit=50");
      setAvailablePets(res.data.pets || []);
    } catch (error) {
       showToast("Failed to fetch pets", "error");
    } finally {
      setLoadingPets(false);
    }
  };

  const handleSetFeaturedPet = async (pet: any) => {
    try {
       await api.post("/donations/admin/set-featured", { petId: pet._id });
       showToast(`Set ${pet.name} as featured pet!`, "success");
       setCurrentFeaturedPet(pet);
       setShowPetPicker(false);
    } catch (error) {
       showToast("Failed to set featured pet", "error");
    }
  };

  const handleToggleSetting = async (key: string, value: boolean) => {
    try {
      await api.put("/settings", { [key]: value });
      await refreshSettings();
      showToast(`${key} is now ${value ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      showToast("Failed to update setting", "error");
    }
  };

  // Helper to format time
  const formatTime = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Stats Logic — 6 KPI cards
  const statsCards = [
    {
      label: "Total Users",
      value: dashboardStats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      sub: "Registered adopters",
    },
    {
      label: "Active Shelters",
      value: dashboardStats?.activeShelters || 0,
      icon: Building2,
      color: "bg-green-100 text-green-600",
      sub: "Verified & operating",
    },
    {
      label: "Total Pets",
      value: dashboardStats?.totalPets || 0,
      icon: PawPrint,
      color: "bg-orange-100 text-orange-600",
      sub: `${dashboardStats?.adoptedPets || 0} adopted`,
    },
    {
      label: "Adoptions",
      value: dashboardStats?.adoptedPets || 0,
      icon: Heart,
      color: "bg-pink-100 text-pink-600",
      sub: "Completed adoptions",
    },
    {
      label: "Pending Shelters",
      value: dashboardStats?.pendingShelters || 0,
      icon: Clock,
      color: (dashboardStats?.pendingShelters || 0) > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400",
      sub: "Awaiting verification",
      urgent: (dashboardStats?.pendingShelters || 0) > 0,
    },
    {
      label: "Pending Pet Reviews",
      value: dashboardStats?.pendingPetReviews || 0,
      icon: Flag,
      color: (dashboardStats?.pendingPetReviews || 0) > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400",
      sub: "Pets awaiting approval",
      urgent: (dashboardStats?.pendingPetReviews || 0) > 0,
    },
  ];

  const renderDashboard = () => {
    const chartData = [
      { name: 'Users', val: dashboardStats?.totalUsers || 0 },
      { name: 'Shelters', val: dashboardStats?.activeShelters || 0 },
      { name: 'Pets', val: dashboardStats?.totalPets || 0 },
      { name: 'Adoptions', val: dashboardStats?.adoptedPets || 0 },
    ];
    const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#ec4899'];
    const pendingSheltersList = shelters.filter(s => !s.isVerified && !s.isSuspended).slice(0, 6);

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" }}>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Welcome back, {user?.name || "Admin"}!</h2>
              <p className="text-white/80 text-sm mt-1">Monitor platform activity and manage system operations</p>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
            <Shield className="w-48 h-48" />
          </div>
        </div>

        {/* Moderation Alert Banner */}
        <AdminModerationAlert
          pendingShelters={dashboardStats?.pendingShelters || 0}
          pendingPets={dashboardStats?.pendingPetReviews || 0}
          onViewShelters={() => setActiveTab("shelters")}
          onViewPets={() => setActiveTab("reports")}
        />

        {/* 6 KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
              <Card
                className={`p-4 interactive-card transition-all border ${stat.urgent ? '' : ''}`}
                style={{
                  background: "var(--color-card)",
                  borderColor: stat.urgent ? "rgba(245, 158, 11, 0.4)" : "var(--color-border)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  {stat.urgent && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
                      style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}
                    >
                      Action needed
                    </span>
                  )}
                </div>
                <p className="text-3xl font-black" style={{ color: "var(--color-text)" }}>{stat.value}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: "var(--color-text-light)" }}>{stat.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{stat.sub}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Platform Analytics</h3>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-light)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-success)" }}></span> Live Data
              </div>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3348" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8892a4' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8892a4' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{
                      borderRadius: '10px',
                      background: '#1e2130',
                      border: '1px solid #2d3348',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#8892a4', fontWeight: 600 }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="val" radius={[8, 8, 0, 0]} barSize={50}>
                    {chartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <Activity className="w-4 h-4" style={{ color: "var(--color-success)" }} /> Platform Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2" style={{ color: "var(--color-text-light)" }}>
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">Pending Shelters</span>
                </div>
                <span className="text-sm font-bold" style={{ color: (dashboardStats?.pendingShelters || 0) > 0 ? "#f59e0b" : "var(--color-success)" }}>
                  {dashboardStats?.pendingShelters || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2" style={{ color: "var(--color-text-light)" }}>
                  <Flag className="w-4 h-4" />
                  <span className="text-sm">Pending Pet Reviews</span>
                </div>
                <span className="text-sm font-bold" style={{ color: (dashboardStats?.pendingPetReviews || 0) > 0 ? "var(--color-primary)" : "var(--color-success)" }}>
                  {dashboardStats?.pendingPetReviews || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2" style={{ color: "var(--color-text-light)" }}>
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Total Users</span>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--color-info)" }}>
                  {dashboardStats?.totalUsers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2" style={{ color: "var(--color-text-light)" }}>
                  <PawPrint className="w-4 h-4" />
                  <span className="text-sm">Total Pets</span>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--color-accent)" }}>
                  {dashboardStats?.totalPets || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2" style={{ color: "var(--color-text-light)" }}>
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">Total Donations</span>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--color-success)" }}>
                  Rs {(dashboardStats?.totalDonationsAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

        </div>

        {/* Pending Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Shelters */}
          <Card padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Pending Shelters
                  {pendingSheltersList.length > 0 && (
                     <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">
                        {pendingSheltersList.length}
                     </span>
                  )}
               </h2>
              <p className="text-sm text-gray-500">Awaiting verification</p>
            </div>
            <button onClick={() => setActiveTab("shelters")} className="text-sm text-red-600 hover:underline font-medium">View All →</button>
          </div>
          <div className="space-y-3">
            {pendingSheltersList.map((shelter, index) => (
              <motion.div key={shelter._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white transition-all cursor-pointer"
                onClick={() => navigate(`/admin/shelter/${shelter._id}`)}>
                <div className={`p-2.5 rounded-lg shadow-sm ${shelter.isSuspended ? 'bg-red-100 text-red-500' : shelter.isVerified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-gray-900 truncate">{shelter.name}</p>
                    <Badge variant={shelter.isSuspended ? "error" : shelter.isVerified ? "success" : "warning"}>
                      {shelter.isSuspended ? "Suspended" : shelter.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{shelter.city || "—"}</span>
                    <span className="flex items-center gap-1"><PawPrint className="w-3 h-3" />{shelter.totalPets || 0} pets</span>
                    <span className="hidden sm:flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(shelter.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {pendingSheltersList.length === 0 && (
              <div className="text-center py-10">
                <div className="inline-flex p-4 rounded-full bg-gray-100 mb-3"><Building2 className="w-6 h-6 text-gray-400" /></div>
                <p className="text-gray-500 font-medium">No pending shelters requiring attention.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pending Pet Reviews */}
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Pending Pet Reviews
                  {pendingPets.length > 0 && (
                     <span className={`flex h-5 items-center justify-center rounded-full px-2 text-xs font-bold ${
                       pendingPets.length > 10 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                     }`}>
                        {pendingPets.length > 10 ? 'High' : pendingPets.length}
                     </span>
                  )}
               </h2>
              <p className="text-sm text-gray-500">Awaiting approval to publish</p>
            </div>
          </div>
          <div className="space-y-3">
            {pendingPets.slice(0, 5).map((pet, index) => (
              <motion.div key={pet._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white transition-all cursor-pointer"
                onClick={() => navigate(`/admin/shelter/${pet.shelter?._id}`)}>
                {pet.images?.[0] ? (
                  <img src={pet.images[0]} alt={pet.name} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm flex-shrink-0">
                    <PawPrint className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-gray-900 truncate">{pet.name}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 truncate"><Building2 className="w-3 h-3 flex-shrink-0" />{pet.shelter?.name || "—"}</span>
                    <span className="hidden sm:flex items-center gap-1 flex-shrink-0"><Clock className="w-3 h-3" />{new Date(pet.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/admin/shelter/${pet.shelter?._id}`)}>
                  Review
                </Button>
              </motion.div>
            ))}
            {pendingPets.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center">
                <div className="inline-flex p-4 rounded-full bg-gray-100 mb-3"><PawPrint className="w-6 h-6 text-gray-400" /></div>
                <p className="text-gray-500 font-medium">No pets waiting for review.</p>
              </div>
            )}
          </div>
        </Card>
        </div>
      </div>
    );
  };

  const renderPlatformUsers = () => {
    const filteredUsers = platformUsers.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone?.includes(searchQuery);
      const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Users</h2>
            <p className="text-sm text-gray-500 mt-1">Manage adopters and regular accounts</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name, email or phone..."
              icon={<Search className="w-5 h-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {['all', 'active', 'warned', 'suspended', 'banned'].map(status => (
              <button
                key={status}
                onClick={() => setUserStatusFilter(status as any)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                  userStatusFilter === status ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Apps</th>
                <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Donated</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {u.profileImage ? (
                        <img src={u.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold min-w-[40px]">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">{u.email}</p>
                    <p className="text-xs text-gray-500">{u.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-medium text-gray-900">{u.applicationsCount || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-medium text-gray-900">Rs. {u.totalDonated?.toLocaleString() || 0}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={u.status === 'active' ? 'success' : u.status === 'warned' ? 'warning' : 'error'}>
                      {u.status?.toUpperCase() || 'ACTIVE'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewUserDetails(u._id)}>
                       Manage
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                 <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">No users found matching your filters.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        </Card>
      </div>
    );
  };

  const renderAdminUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage administrator accounts and permissions
          </p>
        </div>
        {user?.role === "super_admin" && (
            <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddAdminModal(true)}
            style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
            }}
            >
            Add Admin
            </Button>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Search admins by name, username or email..."
        icon={<Search className="w-5 h-5" />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Username
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Last Login
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins
                .filter(a => 
                    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.username?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{admin.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">@{admin.username}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">{admin.email || '-'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        admin.role === "super_admin"
                          ? "info"
                          : admin.role === "moderator"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {admin.role?.replace("_", " ").toUpperCase() || "ADMIN"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={admin.isActive ? "success" : "neutral"}>
                      {admin.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-500">
                      {formatTime(admin.lastLogin)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {user?.role === "super_admin" && (
                        <div className="flex items-center justify-end gap-1">
                        <button 
                            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => handleDeleteAdmin(admin._id)}
                            title="Delete Admin"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                  <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                          {user?.role === "super_admin" 
                            ? "No admins found."
                            : "Access restricted: Only Super Admins can view the full admin list."
                          }
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderShelters = () => {
    const filtered = shelters.filter(s => {
      const matchesSearch = !searchQuery ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        shelterFilter === 'all' ||
        (shelterFilter === 'verified' && s.isVerified && !s.isSuspended) ||
        (shelterFilter === 'pending' && !s.isVerified && !s.isSuspended) ||
        (shelterFilter === 'suspended' && s.isSuspended);

      return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((shelterPage - 1) * ITEMS_PER_PAGE, shelterPage * ITEMS_PER_PAGE);

    const filterCounts = {
      all: shelters.length,
      verified: shelters.filter(s => s.isVerified && !s.isSuspended).length,
      pending: shelters.filter(s => !s.isVerified && !s.isSuspended).length,
      suspended: shelters.filter(s => s.isSuspended).length,
    };

    const filterConfig = [
      { key: 'all', label: 'All', color: '' },
      { key: 'verified', label: 'Verified', color: 'text-green-600' },
      { key: 'pending', label: 'Pending', color: 'text-amber-600' },
      { key: 'suspended', label: 'Suspended', color: 'text-red-600' },
    ] as const;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shelter Monitoring</h2>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage all registered shelters</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`} title="List View"><List className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`} title="Grid View"><LayoutGrid className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filterConfig.map(({ key, label, color }) => (
            <button key={key}
              onClick={() => { setShelterFilter(key); setShelterPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                shelterFilter === key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
              }`}>
              {label}
              <span className={`ml-1.5 text-xs ${shelterFilter === key ? 'opacity-70' : color}`}>
                ({filterCounts[key]})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <Input placeholder="Search by name, email, or city..." icon={<Search className="w-5 h-5" />}
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        {/* Table or Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((shelter) => (
              <Card key={shelter._id} className={`overflow-hidden hover:shadow-md transition-shadow border-l-4 ${shelter.isSuspended ? 'border-l-red-400' : shelter.isVerified ? 'border-l-green-400' : 'border-l-amber-400'}`}>
                <div className="relative h-36 bg-gray-100">
                  {shelter.coverImage ? <img src={shelter.coverImage} alt={shelter.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Building2 className="w-10 h-10" /></div>}
                  <div className="absolute top-3 right-3">
                    <Badge variant={shelter.isSuspended ? "error" : shelter.isVerified ? "success" : "warning"}>
                      {shelter.isSuspended ? "Suspended" : shelter.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{shelter.name}</h3>
                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {shelter.city ? `${shelter.city}${shelter.state ? `, ${shelter.state}` : ''}` : (shelter.address || shelter.location?.formattedAddress || "—")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1"><PawPrint className="w-3 h-3" />{shelter.totalPets || 0} pets listed</div>
                      {shelter.pendingPetsCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                          </span>
                          {shelter.pendingPetsCount} NEW
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => navigate(`/admin/shelter/${shelter._id}`)}
                    className="w-full text-center text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-lg py-1.5 transition-colors">
                    Review Shelter
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Shelter', 'Location', 'Contact', 'Pets', 'Status', 'Joined'].map(h => (
                      <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((shelter) => (
                    <tr key={shelter._id} 
                      onClick={() => navigate(`/admin/shelter/${shelter._id}`)}
                      className="hover:bg-red-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-8 rounded-full flex-shrink-0 ${shelter.isSuspended ? 'bg-red-400' : shelter.isVerified ? 'bg-green-400' : 'bg-amber-400'}`} />
                          <span className="font-medium text-gray-900">{shelter.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {shelter.city ? `${shelter.city}${shelter.state ? `, ${shelter.state}` : ''}` : (shelter.address || "—")}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{shelter.email}</td>
                      <td className="py-3 px-4 text-gray-700 font-medium">
                        <div className="flex items-center gap-2">
                          {shelter.totalPets || 0}
                          {shelter.pendingPetsCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                              </span>
                              {shelter.pendingPetsCount} PENDING
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={shelter.isSuspended ? "error" : shelter.isVerified ? "success" : "warning"}>
                          {shelter.isSuspended ? "Suspended" : shelter.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{new Date(shelter.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="w-8 h-8 text-gray-300" />
                        <p>No shelters match your current filter.</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing {Math.min((shelterPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(shelterPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setShelterPage(p => Math.max(1, p - 1))} disabled={shelterPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => setShelterPage(i + 1)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${shelterPage === i + 1 ? 'bg-gray-900 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setShelterPage(p => Math.min(totalPages, p + 1))} disabled={shelterPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };




  const renderDonations = () => <AdminDonations />;

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Audit Logs
                <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Audit logs track all critical actions taken within the admin panel for security and accountability.
                    </div>
                </div>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
                Track system activities and administrator actions
            </p>
         </div>
         <Button variant="outline" icon={<Filter className="w-4 h-4" />}>Filter</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-500">Timestamp</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-500">Admin</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-500">Action</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-500">Target</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-500">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {[
                        { time: "Just now", admin: "You", action: "UPDATE", target: "Platform Settings", detail: "Updated notification preferences", type: "info" },
                        { time: "10 mins ago", admin: "Super Admin", action: "DELETE", target: "User: john_doe", detail: "Deleted account due to violation", type: "danger" },
                        { time: "2 hours ago", admin: " Moderator A", action: "VERIFY", target: "Shelter: Happy Paws", detail: "Approved verification request", type: "success" },
                        { time: "5 hours ago", admin: "System", action: "BACKUP", target: "Database", detail: "Automated daily backup completed", type: "system" },
                    ].map((log, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{log.time}</td>
                            <td className="py-3 px-4 font-medium text-gray-900">{log.admin}</td>
                            <td className="py-3 px-4">
                                <Badge variant={log.type === 'danger' ? 'error' : log.type === 'success' ? 'success' : 'neutral'}>
                                    {log.action}
                                </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{log.target}</td>
                            <td className="py-3 px-4 text-gray-500">{log.detail}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
            <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
            <p className="text-sm text-gray-500 mt-1">
                Review and act on user-reported content
            </p>
            </div>
            <div className="flex gap-2">
                <Badge variant="warning">3 Pending</Badge>
                <Badge variant="success">12 Resolved Today</Badge>
            </div>
        </div>

        <div className="space-y-4">
             {[
                { type: "Pet Listing", reason: "Misleading Information", reporter: "user123", target: "Golden Retriever (Max)", time: "2 hours ago" },
                { type: "Shelter Profile", reason: "Suspicious Activity", reporter: "anon", target: "City Rescue Center", time: "5 hours ago" },
                { type: "User Comment", reason: "Harassment", reporter: "sarah_k", target: "Comment ID #8823", time: "1 day ago" },
             ].map((report, i) => (
                <Card key={i} className="p-4 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="error">Reported</Badge>
                                <span className="text-gray-500 text-xs">{report.time}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">{report.type}: {report.target}</h3>
                            <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Reason:</span> {report.reason}</p>
                            <p className="text-xs text-gray-400">Reported by: {report.reporter}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Delete Content</Button>
                            <Button size="sm" variant="ghost">Ignore</Button>
                        </div>
                    </div>
                </Card>
             ))}
             <p className="text-center text-gray-400 text-sm py-4">End of moderation queue</p>
        </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 max-w-4xl">
        <div className="mb-6">
           <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
           <p className="text-gray-500">Manage your admin profile and system preferences</p>
        </div>

      <Card padding="lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
                <p className="text-gray-500 text-sm capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Display Name"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                    icon={<User className="w-5 h-5" />}
                    fullWidth
                />
                <Input
                    label="Email Address"
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                    icon={<Mail className="w-5 h-5" />}
                    fullWidth
                />
            </div>
            
            <div className="flex justify-end pt-4">
                <Button 
                    variant="primary" 
                    type="submit"
                    style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" }}
                >
                    Save Changes
                </Button>
            </div>
        </form>
      </Card>

      <Card padding="lg">
         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-500" />
            Notification Preferences
         </h3>
         <div className="space-y-4">
            {[
                { label: "Email Notifications for New Shelters", desc: "Get notified when a new shelter registers" },
                { label: "System Alerts", desc: "Receive critical system health alerts" },
                { label: "Weekly Reports", desc: "Receive a weekly summary of platform activity" }
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                    <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    {/* Mock Toggle */}
                    <div className="w-11 h-6 bg-red-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                </div>
            ))}
         </div>
      </Card>

      <Card padding="lg">
         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-500" />
            System Features
         </h3>
         <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                  <div>
                      <p className="font-medium text-gray-900">Compatibility Intelligence</p>
                      <p className="text-xs text-gray-500">Enable compatability matching scores between adopters and pets.</p>
                  </div>
                  <div 
                      onClick={() => handleToggleSetting("compatibilityIntelligenceEnabled", !settings.compatibilityIntelligenceEnabled)}
                      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${settings.compatibilityIntelligenceEnabled ? "bg-green-500" : "bg-gray-300"}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.compatibilityIntelligenceEnabled ? "translate-x-6 right-auto" : "translate-x-1 left-0"}`}></div>
                  </div>
              </div>
         </div>
      </Card>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 max-w-4xl">
       <div className="mb-6">
           <h2 className="text-2xl font-bold text-gray-900">Security & Authentication</h2>
           <p className="text-gray-500">Manage security settings and monitor login activity</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="lg">
             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-gray-500" />
                Change Password
             </h3>
             <form onSubmit={handleUpdatePassword} className="space-y-4">
                <Input
                    type="password"
                    label="Current Password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    placeholder="••••••••"
                    fullWidth
                />
                <Input
                    type="password"
                    label="New Password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="••••••••"
                    fullWidth
                />
                <Input
                    type="password"
                    label="Confirm New Password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    fullWidth
                />
                <div className="pt-2">
                    <Button variant="outline" type="submit" className="w-full">
                        Update Password
                    </Button>
                </div>
             </form>
        </Card>

        <div className="space-y-6">
            <Card padding="lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Shield className="w-5 h-5 text-gray-500" />
                   Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Add an extra layer of security to your account by enabling 2FA.
                </p>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                             <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Text Message (SMS)</p>
                            <p className="text-xs text-gray-500">Not configured</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => showToast("2FA setup not available in development", "info")}>
                        Enable
                    </Button>
                </div>
            </Card>

             <Card padding="lg" className="bg-red-50 border-red-100">
                <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                   <AlertTriangle className="w-5 h-5 text-red-600" />
                   Danger Zone
                </h3>
                <p className="text-sm text-red-700/80 mb-4">
                    Actions here can have irreversible consequences.
                </p>
                <Button 
                    variant="outline" 
                    className="w-full border-red-200 text-red-600 hover:bg-red-100"
                    onClick={() => {
                        window.confirm("Are you sure you want to delete your account? This action cannot be undone.") && 
                        showToast("Account deletion requires Super Admin approval", "error");
                    }}
                >
                    Delete My Account
                </Button>
            </Card>
        </div>
      </div>

      <Card padding="lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
           <Activity className="w-5 h-5 text-gray-500" />
           Recent Login Activity
        </h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-3 font-medium">Device</th>
                        <th className="pb-3 font-medium">Location</th>
                        <th className="pb-3 font-medium">IP Address</th>
                        <th className="pb-3 font-medium text-right">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {[
                        { device: "Chrome / Windows 11", location: "Kathmandu, Nepal", ip: "192.168.1.1", time: "Active now" },
                        { device: "Safari / iPhone 13", location: "Kathmandu, Nepal", ip: "192.168.1.5", time: "2 hours ago" },
                        { device: "Firefox / Windows 10", location: "Lalitpur, Nepal", ip: "10.0.0.45", time: "Yesterday" },
                    ].map((log, i) => (
                        <tr key={i}>
                            <td className="py-3 flex items-center gap-2">
                                {log.device.includes("iPhone") ? <Smartphone className="w-4 h-4 text-gray-400" /> : <Globe className="w-4 h-4 text-gray-400" />}
                                <span className="text-gray-900">{log.device}</span>
                            </td>
                            <td className="py-3 text-gray-600">{log.location}</td>
                            <td className="py-3 text-gray-500 font-mono text-xs">{log.ip}</td>
                            <td className="py-3 text-right">
                                <Badge variant={i === 0 ? "success" : "neutral"}>{log.time}</Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="admin-layout flex min-h-screen">
      <div className="hidden lg:block">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <HamburgerMenu />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Platform management and monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role?.replace('_', ' ') || 'Admin'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
                <div className="flex justify-center p-12">
                     <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                {activeTab === "dashboard" && renderDashboard()}
                {activeTab === "platform_users" && renderPlatformUsers()}
                {activeTab === "users" && renderAdminUsers()}
                {activeTab === "shelters" && renderShelters()}
                {activeTab === "donations" && renderDonations()}
                {activeTab === "reports" && renderReports()}
                {activeTab === "logs" && renderAuditLogs()}
                {activeTab === "settings" && renderSettings()}
                {activeTab === "security" && renderSecurity()}
                </>
            )}
          </div>
        </main>
      </div>

       {/* Platform User Detail Modal */}
       <AnimatePresence>
        {showPlatformUserModal && selectedPlatformUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">User Profile & Activity</h3>
                <button onClick={() => setShowPlatformUserModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {/* Profile Header */}
                <div className="flex items-start gap-6 border-b pb-6 mb-6">
                  {selectedPlatformUser.user?.profileImage ? (
                      <img src={selectedPlatformUser.user.profileImage} alt="" className="w-20 h-20 rounded-full object-cover shadow-sm" />
                  ) : (
                      <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                        {selectedPlatformUser.user?.name?.charAt(0).toUpperCase()}
                      </div>
                  )}
                  <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{selectedPlatformUser.user?.name}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                              <span className="flex items-center gap-1"><Mail className="w-4 h-4"/> {selectedPlatformUser.user?.email}</span>
                              <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> {selectedPlatformUser.user?.phone}</span>
                            </div>
                        </div>
                        <Badge variant={selectedPlatformUser.user?.status === 'active' ? 'success' : selectedPlatformUser.user?.status === 'warned' ? 'warning' : 'error'}>
                            {selectedPlatformUser.user?.status?.toUpperCase()}
                        </Badge>
                      </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Account Actions Section */}
                  <div>
                      <h4 className="font-bold text-gray-900 mb-4 border-b pb-2">Account Actions</h4>
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Status Change</label>
                            <Input placeholder="E.g., Fraudulent applications, spam, etc." value={statusReason} onChange={e => setStatusReason(e.target.value)} />
                            <p className="text-xs text-gray-500 mt-1">Required when issuing a warning, suspension or ban.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button variant={selectedPlatformUser.user?.status === 'active' ? 'primary' : 'outline'} size="sm" onClick={() => handleUserStatusChange(selectedPlatformUser.user?._id, 'active')} disabled={isUpdatingUserStatus}>Set Active</Button>
                            <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => handleUserStatusChange(selectedPlatformUser.user?._id, 'warned')} disabled={isUpdatingUserStatus}>Warn</Button>
                            <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => handleUserStatusChange(selectedPlatformUser.user?._id, 'suspended')} disabled={isUpdatingUserStatus}>Suspend</Button>
                            <Button variant="outline" size="sm" className="border-red-200 hover:bg-red-50 text-red-600" onClick={() => handleUserStatusChange(selectedPlatformUser.user?._id, 'banned')} disabled={isUpdatingUserStatus}>Ban Account</Button>
                        </div>
                        {selectedPlatformUser.user?.status !== 'active' && (
                            <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div>
                                  <p className="font-semibold capitalize">Currently {selectedPlatformUser.user?.status}</p>
                                  <p className="mt-1 font-medium">{selectedPlatformUser.user?.statusReason}</p>
                                  <p className="mt-1 text-xs opacity-80">By {selectedPlatformUser.user?.statusUpdatedBy?.name || 'Admin'} on {new Date(selectedPlatformUser.user?.statusUpdatedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                        )}
                      </div>
                  </div>

                  {/* Activity Overview Section */}
                  <div>
                      <h4 className="font-bold text-gray-900 mb-4 border-b pb-2">Activity Overview</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText className="w-5 h-5"/></div>
                              <span className="font-medium text-gray-700">Adoption Apps Sent</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{selectedPlatformUser.user?.applicationsSent?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-50 rounded-lg text-green-600"><Heart className="w-5 h-5"/></div>
                              <span className="font-medium text-gray-700">Total Funds Donated</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Rs. {selectedPlatformUser.totalDonated?.toLocaleString() || 0}</span>
                        </div>
                      </div>

                      {selectedPlatformUser.user?.applicationsSent?.length > 0 && (
                        <div className="mt-6">
                            <h5 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Recent Applications</h5>
                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                              {selectedPlatformUser.user.applicationsSent.slice(0, 5).map((app: any) => (
                                  <div key={app._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">Pet: {app.pet?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'error' : 'neutral'}>
                                        {app.status}
                                    </Badge>
                                  </div>
                              ))}
                            </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
       </AnimatePresence>

       {/* Add Admin Modal */}
       {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Add New Admin</h3>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <Input
                label="Full Name"
                value={newAdminData.name}
                onChange={(e) => setNewAdminData({...newAdminData, name: e.target.value})}
                icon={<User className="w-5 h-5" />}
                required
                fullWidth
              />
              <Input
                label="Username"
                value={newAdminData.username}
                onChange={(e) => setNewAdminData({...newAdminData, username: e.target.value})}
                icon={<User className="w-5 h-5" />}
                required
                fullWidth
              />
               <Input
                type="password"
                label="Password"
                value={newAdminData.password}
                onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                icon={<Lock className="w-5 h-5" />}
                required
                fullWidth
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                  value={newAdminData.role}
                  onChange={(e) => setNewAdminData({...newAdminData, role: e.target.value})}
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <p className="text-xs text-gray-500">Super Admins can create and delete other admin accounts.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowAddAdminModal(false)}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1"
                    style={{
                        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
                    }}
                >
                    Create Admin
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Pet Picker Modal */}
      <AnimatePresence>
       {showPetPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Select Featured Pet</h3>
                  <p className="text-sm text-gray-500">Pick a pet to highlight on the public Donate page.</p>
               </div>
              <button onClick={() => setShowPetPicker(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
               {loadingPets ? (
                 <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
               ) : availablePets.length === 0 ? (
                 <div className="text-center py-12 text-gray-500">
                    <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No pets available for donation.
                 </div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availablePets.map(pet => (
                       <button key={pet._id} onClick={() => handleSetFeaturedPet(pet)} className="bg-white rounded-xl overflow-hidden border-2 border-transparent hover:border-red-400 hover:shadow-md transition-all text-left flex flex-col relative group" style={{ borderColor: currentFeaturedPet?._id === pet._id ? "#ef4444" : "transparent" }}>
                          {currentFeaturedPet?._id === pet._id && (
                             <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10"><CheckCircle className="w-4 h-4" /></div>
                          )}
                          <div className="h-32 relative overflow-hidden bg-gray-100">
                             <img src={pet.images?.[0] || "/rescue-hero.png"} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="p-3">
                             <h4 className="font-bold text-gray-900 truncate">{pet.name}</h4>
                             <p className="text-xs text-gray-500 truncate mt-0.5">{pet.shelter?.name}</p>
                             <div className="text-[10px] mt-2 text-gray-400 font-bold uppercase tracking-wider">{pet.species}</div>
                          </div>
                      </button>
                    ))}
                 </div>
               )}
            </div>
          </motion.div>
        </div>
       )}
      </AnimatePresence>
    </div>
  );
}
