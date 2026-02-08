import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Server,
  Database,
  Info,
  Clock,
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
import { useToast } from "../../components/ui/Toast";

type TabType = "dashboard" | "users" | "shelters" | "donations" | "reports" | "logs" | "settings" | "security";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [shelterFilter, setShelterFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [donations, setDonations] = useState<any[]>([]);

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
          const statsRes = await api.get("/admin/stats");
          setDashboardStats(statsRes.data);
          
          // Also fetch shelters for recent activity activity if not already loaded
          if (shelters.length === 0) {
             const sheltersRes = await api.get("/admin/shelters");
             setShelters(sheltersRes.data);
          }
        } else if (activeTab === "users") {
          const adminsRes = await api.get("/admin/all");
          setAdmins(adminsRes.data);
        } else if (activeTab === "shelters") {
          const sheltersRes = await api.get("/admin/shelters");
          setShelters(sheltersRes.data);
        } else if (activeTab === "donations") {
            const donationsRes = await api.get("/admin/donations");
            setDonations(donationsRes.data);
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
        await api.put(
            `/admin/shelter/${id}/verify`,
            { isVerified }
        );
        showToast(isVerified ? "Shelter verified successfully" : "Shelter status updated", "success");
        // Update local state
        setShelters(shelters.map(s => s._id === id ? { ...s, isVerified } : s));
    } catch (error: any) {
        showToast(error.response?.data?.message || "Failed to update shelter status", "error");
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

  // Helper to format time
  const formatTime = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Stats Logic
  const statsCards = [
    {
      label: "Total Users",
      value: dashboardStats?.totalUsers || 0,
      icon: Users,
      trend: "Live",
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active Shelters",
      value: dashboardStats?.activeShelters || 0,
      icon: Building2,
      trend: "Live",
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Pets",
      value: dashboardStats?.totalPets || 0,
      icon: PawPrint,
      trend: "Live",
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Adoptions",
      value: dashboardStats?.adoptedPets || 0,
      icon: Heart,
      trend: "Live",
      color: "bg-pink-100 text-pink-600",
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

    const filteredShelters = shelters.filter(s => {
      if (shelterFilter === 'verified') return s.isVerified;
      if (shelterFilter === 'pending') return !s.isVerified;
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div
          className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%)",
          }}
        >
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold">
              Welcome back, {user?.name || "Admin"}! 
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Monitor platform activity and manage system operations
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
            <Shield className="w-48 h-48" />
          </div>
        </div>

        {/* Charts & Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Platform Analytics</h3>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        System Healthy
                    </div>
                </div>
            </div>
            <div className="h-[300px] w-full relative min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="val" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={50}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Stats & System Health */}
          <div className="space-y-4">
             {/* System Health Widget */}
             <Card className="p-4 bg-gray-900 text-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    System Status
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                            <Server className="w-4 h-4" />
                            <span>Server Load</span>
                        </div>
                        <span className="text-green-400 font-mono">12%</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                            <Database className="w-4 h-4" />
                            <span>Database</span>
                        </div>
                        <span className="text-green-400 font-mono">Connected</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="w-4 h-4" />
                            <span>Uptime</span>
                        </div>
                        <span className="text-white font-mono">99.9%</span>
                    </div>
                </div>
             </Card>

            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recently Registered Shelters */}
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recently Registered Shelters
              </h2>
              <p className="text-sm text-gray-500">Monitor new shelter verifications</p>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {(['all', 'verified', 'pending'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setShelterFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    shelterFilter === filter
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredShelters.slice(0, 5).map((shelter, index) => (
              <motion.div
                key={shelter._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                onClick={() => navigate(`/admin/shelter/${shelter._id}`)}
                role="button"
              >
                <div className="p-3 rounded-lg bg-white shadow-sm text-gray-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {shelter.name}
                    </p>
                    <Badge variant={shelter.isVerified ? "success" : "warning"}>
                      {shelter.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {shelter.contactPerson}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {shelter.email}
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(shelter.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredShelters.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-gray-100 mb-3">
                  <Filter className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No shelters found matching this filter.</p>
              </div>
            )}
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
                background: "linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%)",
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

  const renderSheltersGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shelters.map((shelter) => (
        <Card key={shelter._id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative h-48 bg-gray-100">
            {shelter.coverImage ? (
                <img 
                    src={shelter.coverImage} 
                    alt={shelter.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <Building2 className="w-12 h-12" />
                </div>
            )}
            <div className="absolute top-4 right-4">
                <Badge variant={shelter.isVerified ? "success" : "warning"}>
                    {shelter.isVerified ? "Verified" : "Pending"}
                </Badge>
            </div>
          </div>
          
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{shelter.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                {shelter.city || "Unknown City"}, {shelter.state || "State"}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    {shelter.contactPerson || "No contact person"}
                </div>
                <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {shelter.phone || "No phone"}
                </div>
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Since {new Date(shelter.createdAt).toLocaleDateString()}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                 <div className="text-sm font-medium text-gray-900">
                    {shelter.totalPets || 0} Pets
                 </div>
                 
                 <div className="flex gap-2">
                    {!shelter.isVerified && (
                        <button
                            onClick={() => handleVerifyShelter(shelter._id, true)}
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            title="Verify Shelter"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/admin/shelter/${shelter._id}`, { state: { activeTab: "shelters" } })}
                         className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                         title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                 </div>
            </div>
          </div>
        </Card>
      ))}
       {shelters.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            No shelters found matching your search.
          </div>
        )}
    </div>
  );

  const renderShelters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shelter Monitoring</h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and manage all registered shelters
          </p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                title="List View"
            >
                <List className="w-5 h-5" />
            </button>
            <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid View"
            >
                <LayoutGrid className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search shelters..."
        icon={<Search className="w-5 h-5" />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* View Content */}
      {viewMode === 'grid' ? (
        renderSheltersGrid()
      ) : (
        <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Shelter Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Contact Person
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Active Since
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shelters
                .filter(s => 
                    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((shelter) => (
                <tr key={shelter._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{shelter.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">{shelter.contactPerson}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">{shelter.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={shelter.isVerified ? "success" : "warning"}>
                      {shelter.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-500">
                      {new Date(shelter.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => navigate(`/admin/shelter/${shelter._id}`)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="View Shelter Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );

  const renderDonations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donation History</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track all financial contributions to the platform
          </p>
        </div>
        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium border border-green-100">
             Total Raised: Rs {donations.filter(d => d.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
        </div>
      </div>

       <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Donor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Transaction ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donations.map((donation) => (
                <tr key={donation._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(donation.createdAt).toLocaleDateString()}
                    <span className="block text-xs text-gray-400">{new Date(donation.createdAt).toLocaleTimeString()}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {donation.donorName || "Anonymous"}
                    <span className="block text-xs text-gray-500">{donation.donorEmail}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    Rs {donation.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                     <Badge variant={donation.status === 'completed' ? 'success' : donation.status === 'pending' ? 'warning' : 'error'}>
                        {donation.status.toUpperCase()}
                     </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">
                    {donation.transactionUuid}
                  </td>
                   <td className="py-3 px-4 uppercase text-xs font-semibold text-gray-500">
                    {donation.paymentMethod}
                  </td>
                </tr>
              ))}
               {donations.length === 0 && (
                  <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                          No donations found yet.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
  );

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
                    style={{ background: "linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%)" }}
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
    <div className="flex min-h-screen bg-[var(--color-background)]">
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
                        background: "linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%)",
                    }}
                >
                    Create Admin
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
