import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  User,
  Heart,
  FileText,
  Bell,
  Camera,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  LogOutIcon,
  Lock,
  Settings,
  PawPrint,
  TrendingUp,
  Sparkles,
  X,
  Loader2,
  Home,
  Activity,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";
import { Badge } from "../../components/ui/Badge";
import { FileUpload } from "../../components/forms/FileUpload";

import { useNavigate, Link } from "react-router-dom";
import { LogoutConfirmModal } from "../../components/common/LogoutConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { useToast } from "../../components/ui/Toast";
import { ThemeSwitcher } from "../../components/common/ThemeSwitcher";
import { LocationPicker } from "../../components/forms/LocationPicker";
import { DonationReceiptModal, DonationReceipt } from "../../components/donation/DonationReceiptModal";
import { AdopterProfileEditorModal } from "../../components/user/AdopterProfileEditorModal";

type Tab =
  | "profile"
  | "adoptionProfile"
  | "history"
  | "donations"
  | "preferences"
  | "security"
  | "location";
export function UserProfilePage() {
  const { user, logout, login, token, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || localStorage.getItem("userPhone") || "",
    location: user?.address || localStorage.getItem("userLocation") || "",
    bio: user?.bio || localStorage.getItem("userBio") || "",
    profileImage: user?.profileImage || "",
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast("Only image files (JPEG, PNG, WebP) are allowed", "error");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size too large. Max size is 5MB.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploadingImage(true);
      const res = await axios.post("http://localhost:5000/api/auth/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        const newImageUrl = res.data.profileImage;
        setProfileData((prev) => ({ ...prev, profileImage: newImageUrl }));
        
        // Update user in auth context
        if (user) {
          login({ ...user, profileImage: newImageUrl }, token!);
        }
        
        showToast("Profile picture updated successfully!", "success");
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      showToast(error.response?.data?.message || "Failed to upload image", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    smsAlerts: false,
    applicationStatus: true,
    newPets: true,
    shelterMessages: true,
    adoptionTips: false,
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userDonations, setUserDonations] = useState<any[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visibleDonationsCount, setVisibleDonationsCount] = useState(5);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [savingMessage, setSavingMessage] = useState(false);
  
  // UX IMPROVEMENT: Donor receipt modal state
  const [selectedReceipt, setSelectedReceipt] = useState<DonationReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // ── Adoption Profile state ─────────────────────────────────────
  const [adopterProfile, setAdopterProfile] = useState<any>(null);
  const [loadingAdopterProfile, setLoadingAdopterProfile] = useState(false);
  const [adopterProfileEditing, setAdopterProfileEditing] = useState<string | null>(null); // which section is open
  const [adopterProfileSaving, setAdopterProfileSaving] = useState(false);
  // Tier 2 confirmation modal
  const [tier2Pending, setTier2Pending] = useState<{ payload: any; message: string } | null>(null);
  const [tier2Note, setTier2Note] = useState("");

  // Adopter profile modal state
  const [showAdopterModal, setShowAdopterModal] = useState(false);
  const [adopterModalStep, setAdopterModalStep] = useState(0);

  // Adopter profile section drafts
  const [householdDraft, setHouseholdDraft] = useState<any>({});
  const [lifestyleDraft, setLifestyleDraft] = useState<any>({});
  const [preferencesDraft, setPreferencesDraft] = useState<any>({});
  const [financialDraft, setFinancialDraft] = useState<any>({});
  const [personalInfoDraft, setPersonalInfoDraft] = useState<any>({});

  const handleSaveMessage = async (donationId: string) => {
    try {
      setSavingMessage(true);
      const response = await axios.put(`http://localhost:5000/api/donations/${donationId}/message`, { message: editMessageText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserDonations(prev => prev.map(d => d._id === donationId ? { ...d, message: editMessageText } : d));
        setEditingMessageId(null);
        showToast("Message saved successfully", "success");
      }
    } catch (error: any) {
      console.error("Failed to save message", error);
      showToast(error.response?.data?.message || "Failed to save message", "error");
    } finally {
      setSavingMessage(false);
    }
  };
  const navigate = useNavigate();

  // State for detailed location data (lat/lng)
  const [locationData, setLocationData] = useState<{
    lat: string;
    lng: string;
    formattedAddress: string;
  }>({
    lat: localStorage.getItem("userLat") || "27.7172",
    lng: localStorage.getItem("userLng") || "85.3240",
    formattedAddress:
      user?.address || localStorage.getItem("userLocation") || "",
  });

  const handleLocationSelect = (loc: {
    lat: number;
    lng: number;
    formattedAddress: string;
  }) => {
    setLocationData({
      lat: loc.lat.toString(),
      lng: loc.lng.toString(),
      formattedAddress: loc.formattedAddress,
    });
    // Also update the main profile data for consistency until full migration
    setProfileData((prev) => ({ ...prev, location: loc.formattedAddress }));

    // Save to local storage
    localStorage.setItem("userLat", loc.lat.toString());
    localStorage.setItem("userLng", loc.lng.toString());
    localStorage.setItem("userLocation", loc.formattedAddress);

    // Sync with AdopterProfile backend persistently
    if (token) {
      axios.put("http://localhost:5000/api/auth/adopter-profile", {
        location: {
          lat: loc.lat,
          lng: loc.lng,
          formattedAddress: loc.formattedAddress
        }
      }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        // SUCCESS: Update main profile view and auth context
        setProfileData(prev => ({ ...prev, location: loc.formattedAddress }));
        if (user && login) {
          login({ ...user, address: loc.formattedAddress }, token!);
        }
        showToast("Location updated successfully!", "success");
      })
      .catch(err => {
        console.error("Failed to sync location to profile", err);
        showToast("Failed to save location to server", "error");
      });
    }
  };

  // Legacy geolocation effect removed in favor of LocationPicker tab

  const [adoptionHistory, setAdoptionHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === "history") {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const res = await axios.get("http://localhost:5000/api/applications/adopter/my-applications", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAdoptionHistory(res.data.applications || []);
        } catch (err) {
          console.error("Failed to fetch history", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, token]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  };

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "adoptionProfile" as Tab, label: "Adoption Profile", icon: PawPrint },
    { id: "location" as Tab, label: "Location", icon: MapPin },
    { id: "history" as Tab, label: "Adoption History", icon: FileText },
    { id: "donations" as Tab, label: "Donation History", icon: Heart },
    { id: "preferences" as Tab, label: "Preferences", icon: Settings },
    { id: "security" as Tab, label: "Security", icon: Lock },
  ];
  const statusConfig = {
    approved: {
      variant: "success" as const,
      label: "Approved",
      icon: CheckCircle,
    },
    pending: {
      variant: "warning" as const,
      label: "Pending",
      icon: Clock,
    },
    reviewing: {
      variant: "warning" as const,
      label: "Reviewing",
      icon: FileText,
    },
    availability_submitted: {
      variant: "success" as const,
      label: "Slot Selected",
      icon: Calendar,
    },
    meeting_scheduled: {
      variant: "success" as const,
      label: "Meeting Set",
      icon: Calendar,
    },
    meeting_completed: {
      variant: "success" as const,
      label: "Met Pet",
      icon: Heart,
    },
    finalization_pending: {
      variant: "success" as const,
      label: "Finalizing",
      icon: TrendingUp,
    },
    payment_pending: {
      variant: "warning" as const,
      label: "Payment Due",
      icon: Clock,
    },
    contract_signed: {
      variant: "success" as const,
      label: "Contract Signed",
      icon: CheckCircle,
    },
    rejected: {
      variant: "neutral" as const,
      label: "Rejected",
      icon: XCircle,
    },
    cancelled: {
      variant: "neutral" as const,
      label: "Cancelled",
      icon: X,
    },
    completed: {
      variant: "success" as const,
      label: "Adopted! 🐾",
      icon: PawPrint,
    },
  };
  const handleSaveProfile = async () => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          phone: profileData.phone,
          bio: profileData.bio,
          address: profileData.location,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update auth context with new user data
        login(response.data.user, token!);
        // Also save to localStorage as backup
        localStorage.setItem("userPhone", profileData.phone);
        localStorage.setItem("userLocation", profileData.location);
        localStorage.setItem("userBio", profileData.bio);
        showToast("Profile updated successfully!", "success");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast("Failed to update profile", "error");
    }
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        showToast("Password changed successfully", "success");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      console.error("Failed to change password:", error);
      showToast(
        error.response?.data?.message || "Failed to change password",
        "error"
      );
    }
  };



  // Fetch adopter profile when tab opens
  useEffect(() => {
    if (activeTab === "adoptionProfile" && !adopterProfile) {
      const fetchAdopterProfile = async () => {
        setLoadingAdopterProfile(true);
        try {
          const res = await axios.get("http://localhost:5000/api/auth/adopter-profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data;
          setAdopterProfile(data);
          setHouseholdDraft(data.household ?? {});
          setLifestyleDraft(data.lifestyle ?? {});
          setPreferencesDraft({
            preferredEnergyLevel: data.lifestyle?.preferredEnergyLevel ?? "",
            preferredSize: data.lifestyle?.preferredSize ?? "",
          });
          setFinancialDraft({
            monthlyPetBudget: data.lifestyle?.monthlyPetBudget ?? "",
            upcomingLifeChanges: data.lifestyle?.upcomingLifeChanges ?? [],
          });
          setPersonalInfoDraft(data.personalInfo ?? {
            fullName: "",
            phone: "",
            age: undefined,
            address: "",
            idType: "",
            idNumber: "",
            idDocuments: [],
          });
        } catch (err) {
          console.error("Failed to load adopter profile", err);
        } finally {
          setLoadingAdopterProfile(false);
        }
      };
      fetchAdopterProfile();
    }
  }, [activeTab, token, adopterProfile]);

  const saveAdopterSection = async (section: string, payload: any, force = false) => {
    // Check if section has Tier 2 fields — warn before sending
    const TIER2 = [
      "homeType", 
      "hasFencedYard", 
      "hasChildren", 
      "childrenAgeRange", 
      "existingPets", 
      "housingTenure",
      "landlordPermission",
      "landlordPermissionDocs",
      "proofOfResidence",
      "idDocuments"
    ];
    
    const hasTier2 = (section === "household" || section === "personalInfo") && 
      Object.keys(payload[section] ?? {}).some((k) => TIER2.includes(k));
    if (hasTier2 && !force) {
      setTier2Pending({ payload, message: "Saving this change may notify shelters reviewing your active applications." });
      return;
    }
    setAdopterProfileSaving(true);
    try {
      const finalPayload = tier2Note ? { ...payload, adopterNote: tier2Note } : payload;
      const res = await axios.put("http://localhost:5000/api/auth/adopter-profile", finalPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data.profile;
      setAdopterProfile(updated);

      // Manual sync for draft states to ensure immediate UI consistency
      if (updated.personalInfo) setPersonalInfoDraft(updated.personalInfo);
      if (updated.household) setHouseholdDraft(updated.household);
      if (updated.lifestyle) {
        setLifestyleDraft(updated.lifestyle);
        setPreferencesDraft({
          preferredEnergyLevel: updated.lifestyle.preferredEnergyLevel ?? "",
          preferredSize: updated.lifestyle.preferredSize ?? "",
        });
        setFinancialDraft({
          monthlyPetBudget: updated.lifestyle.monthlyPetBudget ?? "",
          upcomingLifeChanges: updated.lifestyle.upcomingLifeChanges ?? [],
        });
      }

      // UX Sync: If updating personalInfo, reflect in main Profile UI & Auth Context
      if (section === "personalInfo" && payload.personalInfo) {
        setProfileData(prev => ({
          ...prev,
          name: payload.personalInfo.fullName || prev.name,
          phone: payload.personalInfo.phone || prev.phone,
          location: payload.personalInfo.address || prev.location
        }));

        if (user && login) {
          login({
            ...user,
            name: payload.personalInfo.fullName || user.name,
            phone: payload.personalInfo.phone || user.phone,
            address: payload.personalInfo.address || user.address
          }, token!);
        }
      }
      setAdopterProfileEditing(null);
      setTier2Pending(null);
      setTier2Note("");
      const notified = res.data.tier2NotificationSent;
      showToast(
        notified
          ? "Profile updated. Your profile change has been shared with your active shelter(s)."
          : "Profile updated. Your compatibility scores have been refreshed.",
        "success"
      );
    } finally {
      setAdopterProfileSaving(false);
    }
  };

  const handleCancelApplication = async (appId: string) => {
    if (!window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) return;
    
    try {
      const res = await axios.delete(`http://localhost:5000/api/applications/${appId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 200) {
        showToast("Application withdrawn successfully", "success");
        // Update local state
        setAdoptionHistory(prev => prev.map(app => 
          app._id === appId ? { ...app, status: 'cancelled' } : app
        ));
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to withdraw application", "error");
    }
  };

  useEffect(() => {
    if (activeTab === "donations" && userDonations.length === 0) {
      const fetchDonations = async () => {
        setLoadingDonations(true);
        try {
          const response = await axios.get("http://localhost:5000/api/donations/my-donations", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserDonations(response.data.donations);
        } catch (error) {
          console.error("Failed to fetch donations", error);
        } finally {
          setLoadingDonations(false);
        }
      };
      // prevent multiple calls in dev environment simple debounce
      fetchDonations();
    }
  }, [activeTab, token, userDonations.length]);



  return (
    <div
      className="min-h-screen py-8"
      style={{
        background: "var(--color-background)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              color: "var(--color-text)",
            }}
          >
            My Profile
          </h1>
          <p
            style={{
              color: "var(--color-text-light)",
            }}
          >
            Manage your account and adoption applications
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Card */}
          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="lg:col-span-1"
          >
            <Card padding="lg">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden border-4"
                    style={{
                      background: "var(--color-primary)",
                      color: "white",
                      borderColor: "var(--color-card)",
                    }}
                  >
                    {profileData.profileImage ? (
                      <img
                        src={profileData.profileImage.startsWith('http') ? profileData.profileImage : `http://localhost:5000${profileData.profileImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profileData.name.charAt(0)
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleImageClick}
                    className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                    style={{
                      background: "var(--color-card)",
                    }}
                    title="Change Profile Picture"
                  >
                    <Camera
                      className="w-4 h-4"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    />
                  </button>
                </div>

                <h2
                  className="text-xl font-bold mb-1"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  {profileData.name}
                </h2>
                <p
                  className="text-sm mb-4"
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  {profileData.email}
                </p>



                {/* Navigation */}
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                        style={{
                          background:
                            activeTab === tab.id
                              ? "var(--color-primary)"
                              : "transparent",
                          color:
                            activeTab === tab.id
                              ? "white"
                              : "var(--color-text)",
                        }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
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
              delay: 0.2,
            }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="text-2xl font-bold"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Profile Information
                  </h3>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      icon={<Edit2 className="w-4 h-4" />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        icon={<Save className="w-4 h-4" />}
                        onClick={handleSaveProfile}
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        name: e.target.value,
                      })
                    }
                    icon={<User className="w-5 h-5" />}
                    fullWidth
                    disabled={!isEditing}
                  />
                  <Input
                    label="Email (Account ID)"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        email: e.target.value,
                      })
                    }
                    icon={<Mail className="w-5 h-5" />}
                    fullWidth
                    disabled={true}
                    helperText="Email is your unique account identifier and cannot be changed."
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        phone: e.target.value,
                      })
                    }
                    icon={<Phone className="w-5 h-5" />}
                    fullWidth
                    disabled={!isEditing}
                  />
                  {/* Location Field Removed - Now has its own tab */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          bio: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none"
                      style={{
                        borderColor: "var(--color-border)",
                        background: isEditing
                          ? "var(--color-card)"
                          : "var(--color-surface)",
                        color: "var(--color-text)",
                      }}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* ── Adoption Profile Tab ──────────────────────────────────────── */}
            {activeTab === "adoptionProfile" && (
              <div className="space-y-6">
                {loadingAdopterProfile ? (
                  <Card padding="lg"><p style={{ color: "var(--color-text-light)" }}>Loading your adoption profile…</p></Card>
                ) : (
                  <>
                    {/* Profile Health Indicator */}
                    <Card padding="lg">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Profile Health</h3>
                          <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
                            Last updated: {adopterProfile?.lastUpdatedAt ? new Date(adopterProfile.lastUpdatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never"}
                          </p>
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            background: adopterProfile?.completionTier === "enhanced" ? "#dcfce7" : "#fef9c3",
                            color: adopterProfile?.completionTier === "enhanced" ? "#16a34a" : "#a16207",
                          }}
                        >
                          {adopterProfile?.completionTier === "enhanced" ? "✓ Enhanced Profile" : "⚠ Basic Profile"}
                        </span>
                      </div>
                      {adopterProfile?.completionTier !== "enhanced" && (
                        <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "color-mix(in srgb, var(--color-primary) 8%, transparent)", color: "var(--color-primary)" }}>
                          Your compatibility score is partial. Complete Lifestyle &amp; Preferences to see your full match score.
                        </div>
                      )}
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Summary blocks */}
                      <Card className="p-5 border-l-4 border-[var(--color-primary)]">
                        <div className="flex items-center gap-3 mb-2">
                           <User className="w-5 h-5 text-[var(--color-primary)]" />
                           <h4 className="font-bold">Personal Details</h4>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{adopterProfile?.personalInfo?.fullName || "Not provided"}</p>
                        <p className="text-sm text-gray-500">{adopterProfile?.personalInfo?.address || "No address"}</p>
                      </Card>
                      
                      <Card className="p-5 border-l-4 border-[var(--color-primary)]">
                        <div className="flex items-center gap-3 mb-2">
                           <Home className="w-5 h-5 text-[var(--color-primary)]" />
                           <h4 className="font-bold">Household</h4>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{adopterProfile?.household?.homeType || "Not specified"} • {adopterProfile?.household?.rentOwn || "Not specified"}</p>
                        <p className="text-sm text-gray-500">{adopterProfile?.household?.hasChildren ? "Has children" : "No children"} • {adopterProfile?.household?.hasFencedYard ? "Fenced yard" : "No fenced yard"}</p>
                      </Card>

                      <Card className="p-5 border-l-4 border-amber-500">
                        <div className="flex items-center gap-3 mb-2">
                           <Activity className="w-5 h-5 text-amber-500" />
                           <h4 className="font-bold">Lifestyle</h4>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Work: {adopterProfile?.lifestyle?.workStyle || "Not specified"}</p>
                        <p className="text-sm text-gray-500">Activity: {adopterProfile?.lifestyle?.activityLevel || "Not specified"}</p>
                      </Card>

                      <Card className="p-5 border-l-4 border-amber-500">
                        <div className="flex items-center gap-3 mb-2">
                           <Heart className="w-5 h-5 text-amber-500" />
                           <h4 className="font-bold">Preferences</h4>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Energy: {adopterProfile?.lifestyle?.preferredEnergyLevel || "No preference"}</p>
                        <p className="text-sm text-gray-500">Size: {adopterProfile?.lifestyle?.preferredSize || "No preference"}</p>
                      </Card>
                    </div>

                    <div className="flex justify-end mt-4">
                       <Button 
                         variant="primary" 
                         size="lg" 
                         icon={<Edit2 className="w-4 h-4" />}
                         onClick={() => setShowAdopterModal(true)}
                       >
                         {adopterProfile?.completionTier === "enhanced" ? "Update Profile" : "Complete Profile"}
                       </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Location Tab */}
            {activeTab === "location" && (
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text)" }}
                  >
                    My Location
                  </h3>
                  <Button
                    variant="primary"
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSaveProfile}
                  >
                    Save Location
                  </Button>
                </div>
                <p className="text-gray-500 mb-6 text-sm">
                  Set your exact location to help us find pets near you.
                </p>
                <LocationPicker
                  initialLocation={{
                    lat: parseFloat(locationData.lat) || 27.7172,
                    lng: parseFloat(locationData.lng) || 85.324,
                    formattedAddress: locationData.formattedAddress,
                  }}
                  onLocationSelect={handleLocationSelect}
                />

                <div className="mt-6">
                  <Input
                    label="Address"
                    value={locationData.formattedAddress}
                    readOnly
                    fullWidth
                    className="bg-gray-50"
                    icon={<MapPin className="w-5 h-5" />}
                  />
                </div>
              </Card>
            )}



            {/* Donation History Tab */}
            {activeTab === "donations" && (
              <div className="space-y-6">
                {/* Summary Stats */}
                {!loadingDonations && userDonations.length > 0 && (() => {
                  const completed = userDonations.filter(d => d.status === "completed");
                  const totalRs = completed.reduce((sum, d) => sum + d.amount, 0);
                  const petsHelped = completed.filter(d => d.type === "pet" && d.petId).length;
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-5 flex items-center gap-4"
                        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-accent) 10%, transparent))", border: "1.5px solid color-mix(in srgb, var(--color-primary) 20%, transparent)" }}
                      >
                        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}>
                          <TrendingUp className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>Total Donated</p>
                          <p className="text-2xl font-black" style={{ color: "var(--color-text)" }}>Rs {totalRs.toLocaleString()}</p>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                        className="rounded-2xl p-5 flex items-center gap-4"
                        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 10%, transparent), color-mix(in srgb, var(--color-secondary) 10%, transparent))", border: "1.5px solid color-mix(in srgb, var(--color-accent) 20%, transparent)" }}
                      >
                        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}>
                          <PawPrint className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>Pets Helped</p>
                          <p className="text-2xl font-black" style={{ color: "var(--color-text)" }}>{petsHelped}</p>
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}

                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Your Impact</h3>
                    {!loadingDonations && userDonations.length > 0 && (
                      <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: "var(--color-surface)", color: "var(--color-text-light)" }}>
                        {userDonations.length} {userDonations.length === 1 ? "donation" : "donations"}
                      </span>
                    )}
                  </div>

                  {loadingDonations ? (
                    /* Skeleton Loader */
                    <div className="space-y-4">
                      {[0,1,2].map(i => (
                        <div key={i} className="flex gap-4 animate-pulse">
                          <div className="w-20 h-20 rounded-2xl bg-gray-200 flex-shrink-0" />
                          <div className="flex-1 space-y-2 pt-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                          </div>
                          <div className="h-6 w-20 bg-gray-200 rounded-full self-start mt-2" />
                        </div>
                      ))}
                    </div>
                  ) : userDonations.length === 0 ? (
                    /* Empty State */
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 8%, transparent), color-mix(in srgb, var(--color-accent) 8%, transparent))" }}>
                        <PawPrint className="w-12 h-12" style={{ color: "var(--color-primary)" }} />
                      </div>
                      <h4 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>You haven’t helped a pet yet</h4>
                      <p className="mb-6 max-w-xs mx-auto" style={{ color: "var(--color-text-light)" }}>Start making a difference today 🐾</p>
                      <Button variant="primary" onClick={() => window.location.href = "/donate"}>
                        Donate Now
                      </Button>
                    </motion.div>
                  ) : (
                    /* Donation Cards */
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {userDonations.slice(0, visibleDonationsCount).map((donation, index) => {
                        const petImg = donation.petId?.images?.[0] || null;
                        const isPet = donation.type === "pet" && donation.petId;
                        const title = isPet ? `You helped ${donation.petId.name}` : "You helped pets in need";
                        const subtitle = isPet && donation.shelterId ? `At ${donation.shelterId.name}` : "Allocated by PetMate";
                        const statusColors: Record<string, {bg: string; text: string; border: string}> = {
                          completed: { bg: "#22c55e18", text: "#16a34a", border: "#22c55e40" },
                          pending:   { bg: "#f59e0b18", text: "#d97706", border: "#f59e0b40" },
                          failed:    { bg: "#ef444418", text: "#dc2626", border: "#ef444440" },
                        };
                        const sc = statusColors[donation.status] || statusColors.pending;
                        return (
                          <motion.div
                            key={donation._id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.07 }}
                            whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(0,0,0,0.10)" }}
                            className="flex gap-4 p-4 rounded-2xl transition-all border"
                            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                          >
                            {/* Pet Image / Fallback */}
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-accent) 10%, transparent))" }}>
                              {petImg ? (
                                <img src={petImg} alt={donation.petId?.name} className="w-full h-full object-cover" />
                              ) : (
                                <Heart className="w-9 h-9" style={{ color: "var(--color-primary)" }} />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-bold text-base leading-tight" style={{ color: "var(--color-text)" }}>{title}</h4>
                                {/* Status Badge */}
                                <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                  {donation.status === "completed" && <CheckCircle className="w-3 h-3" />}
                                  {donation.status === "pending" && <Clock className="w-3 h-3" />}
                                  {donation.status === "failed" && <XCircle className="w-3 h-3" />}
                                  {donation.status}
                                </span>
                              </div>
                              <p className="text-sm mb-2" style={{ color: "var(--color-text-light)" }}>{subtitle}</p>
                              <div className="flex items-center gap-4">
                                <span className="font-black text-lg" style={{ color: "var(--color-primary)" }}>Rs {donation.amount.toLocaleString()}</span>
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-light)" }}>
                                  <Calendar className="w-3 h-3" />
                                  {new Date(donation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </div>
                              {donation.status === "completed" && (
                                <div className="mt-3">
                                  {editingMessageId === donation._id ? (
                                    <div className="flex flex-col gap-2 mt-2">
                                      <textarea 
                                        value={editMessageText}
                                        onChange={(e) => setEditMessageText(e.target.value.slice(0, 150))}
                                        placeholder="Write a short supportive message..."
                                        className="w-full text-sm p-3 rounded-xl border focus:border-[var(--color-primary)] outline-none resize-none bg-gray-50"
                                        rows={2}
                                      />
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">{editMessageText.length}/150</span>
                                        <div className="flex gap-2">
                                          <Button variant="outline" size="sm" onClick={() => setEditingMessageId(null)} disabled={savingMessage}>Cancel</Button>
                                          <Button variant="primary" size="sm" onClick={() => handleSaveMessage(donation._id)} disabled={savingMessage}>{savingMessage ? "Saving..." : "Save"}</Button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="rounded-xl p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                                      <div className="flex-1">
                                        {donation.message ? (
                                          <p className="text-sm italic" style={{ color: "var(--color-text)" }}>"{donation.message}"</p>
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <Sparkles className="w-3 h-3 text-[var(--color-primary)]" />
                                            <p className="text-sm" style={{ color: "var(--color-text-light)" }}>Leave a message for the rescue story...</p>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex gap-2 flex-shrink-0">
                                        <button 
                                          onClick={() => {
                                            setSelectedReceipt({
                                              transactionUuid: donation.transactionUuid,
                                              petName: donation.petId?.name || null,
                                              shelterName: donation.shelterId?.name || null,
                                              shelterAddress: donation.shelterId?.address || donation.shelterId?.city || null,
                                              amount: donation.amount,
                                              createdAt: donation.createdAt,
                                              donorName: donation.userId?.name || user?.name || "Anonymous",
                                            });
                                            setIsReceiptModalOpen(true);
                                          }}
                                          className="text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
                                          style={{ color: "var(--color-text)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}
                                        >
                                          View Receipt
                                        </button>
                                        {!donation.message && (
                                          <button 
                                            onClick={() => { setEditingMessageId(donation._id); setEditMessageText(""); }}
                                            className="text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
                                            style={{ color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)", backgroundColor: "var(--color-card)" }}
                                          >
                                            Leave a Message 💬
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                      </div>

                      {/* Pagination Content */}
                      <div className="pt-4 flex flex-col items-center justify-center border-t border-dashed" style={{ borderColor: "var(--color-border)" }}>
                        {visibleDonationsCount < userDonations.length ? (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="text-center"
                          >
                            <Button 
                              variant="outline" 
                              onClick={() => setVisibleDonationsCount(prev => prev + 5)}
                              className="group"
                            >
                              <span className="flex items-center gap-2">
                                See more of your impact
                                <TrendingUp className="w-4 h-4 transition-transform group-hover:translate-y-[-2px] group-hover:translate-x-[2px]" />
                              </span>
                            </Button>
                            <p className="mt-3 text-xs" style={{ color: "var(--color-text-light)" }}>
                              Viewing {Math.min(visibleDonationsCount, userDonations.length)} of {userDonations.length} lives touched
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full"
                            style={{ background: "var(--color-surface)" }}
                          >
                            <span className="text-sm font-medium" style={{ color: "var(--color-text-light)" }}>
                              You’ve seen all your contributions 💛
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === "history" && (
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                    Adoption History ({adoptionHistory.length})
                  </h3>
                  {loadingHistory && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                </div>

                {loadingHistory ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-20 h-20 rounded-xl bg-gray-200" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : adoptionHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-gray-300" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">No applications yet</h4>
                    <p className="text-gray-500 mb-6">Start your journey by applying to adopt a pet!</p>
                    <Button variant="primary" onClick={() => navigate("/pets")}>Browse Pets</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adoptionHistory.map((application, index) => {
                      const statusKey = application.status as keyof typeof statusConfig;
                      const config = statusConfig[statusKey] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      
                      const petName = application.pet?.name || "Unknown Pet";
                      const petImage = application.pet?.images?.[0] || "https://via.placeholder.com/200";
                      const shelterName = application.shelter?.name || "Private Rescuer";

                      return (
                        <motion.div
                          key={application._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card padding="md">
                            <div className="flex items-center gap-4">
                              <img
                                src={petImage}
                                alt={petName}
                                className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-bold" style={{ color: "var(--color-text)" }}>
                                      {petName}
                                    </h4>
                                    <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
                                      {shelterName}
                                    </p>
                                  </div>
                                  <Badge variant={config.variant}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {config.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-text-light)" }}>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Applied on {new Date(application.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <Link 
                                    to={`/application-tracking/${application._id}`}
                                    className="text-primary font-semibold hover:underline"
                                  >
                                    Track Status →
                                  </Link>
                                  {(application.status === 'pending' || application.status === 'reviewing') && (
                                    <button 
                                      onClick={() => handleCancelApplication(application._id)}
                                      className="text-red-500 font-semibold hover:text-red-600 transition-colors"
                                    >
                                      Withdraw
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}



            {/* Preferences Tab (was Notifications) */}
            {activeTab === "preferences" && (
              <Card padding="lg">
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  Notification Preferences
                </h3>
                <p
                  className="mb-6"
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  Choose how you want to receive updates from PetMate
                </p>

                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div>
                    <h4
                      className="font-semibold mb-4"
                      style={{ color: "var(--color-text)" }}
                    >
                      Visual Theme
                    </h4>
                    <div
                      className="flex items-center justify-between p-4 rounded-xl border"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-surface)",
                      }}
                    >
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: "var(--color-text)" }}
                        >
                          Current Theme
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--color-text-light)" }}
                        >
                          Customize the look and feel of PetMate
                        </p>
                      </div>
                      <ThemeSwitcher />
                    </div>
                  </div>

                  {/* Email Notifications */}
                  <div>
                    <h4
                      className="font-semibold mb-4"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Email Notifications
                    </h4>
                    <div className="space-y-3">
                      <ToggleSwitch
                        checked={notifications.emailUpdates}
                        onChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            emailUpdates: checked,
                          })
                        }
                        label="Email Updates"
                        description="Receive general updates and newsletters"
                      />
                      <ToggleSwitch
                        checked={notifications.applicationStatus}
                        onChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            applicationStatus: checked,
                          })
                        }
                        label="Application Status"
                        description="Get notified about your adoption application status"
                      />
                      <ToggleSwitch
                        checked={notifications.newPets}
                        onChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            newPets: checked,
                          })
                        }
                        label="New Pets"
                        description="Be the first to know when new pets are listed"
                      />
                      <ToggleSwitch
                        checked={notifications.shelterMessages}
                        onChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            shelterMessages: checked,
                          })
                        }
                        label="Shelter Messages"
                        description="Receive messages from shelters"
                      />
                      <ToggleSwitch
                        checked={notifications.adoptionTips}
                        onChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            adoptionTips: checked,
                          })
                        }
                        label="Adoption Tips"
                        description="Get helpful tips and guides for pet adoption"
                      />
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div>
                    <h4
                      className="font-semibold mb-4"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      SMS Notifications
                    </h4>
                    <div className="space-y-3">
                      <ToggleSwitch
                        checked={notifications.smsAlerts}
                        onChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            smsAlerts: checked,
                          })
                        }
                        label="SMS Alerts"
                        description="Receive important updates via text message"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="primary" fullWidth>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Card padding="lg">
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  Security Settings
                </h3>
                <p
                  className="mb-6"
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  Update your password and manage account security
                </p>

                <div className="space-y-5 max-w-lg">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    icon={<Lock className="w-5 h-5" />}
                    fullWidth
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    icon={<Lock className="w-5 h-5" />}
                    fullWidth
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    icon={<Lock className="w-5 h-5" />}
                    fullWidth
                  />

                  <div className="pt-4">
                    <Button variant="primary" onClick={handlePasswordChange}>
                      Change Password
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>

        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />

        <AdopterProfileEditorModal
          isOpen={showAdopterModal}
          onClose={() => setShowAdopterModal(false)}
          onComplete={(updatedProfile) => {
            setAdopterProfile(updatedProfile);
            setShowAdopterModal(false);
          }}
          token={token || ""}
          initialStep={adopterModalStep}
          profileData={adopterProfile}
        />

        <DonationReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          receipt={selectedReceipt}
        />

        {/* Tier 2 Change Confirmation Modal */}
        {tier2Pending && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ background: "var(--color-card)" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>Confirm Profile Change</h3>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-light)" }}>{tier2Pending.message}</p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>Add a note for the shelter (optional)</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border-2 rounded-xl resize-none"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
                  placeholder="E.g. We just moved to a larger apartment — updated details above."
                  value={tier2Note}
                  onChange={(e) => setTier2Note(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => { setTier2Pending(null); setTier2Note(""); }}>Cancel</Button>
                <Button variant="primary" fullWidth onClick={() => saveAdopterSection("household", tier2Pending.payload, true)} disabled={adopterProfileSaving}>Confirm & Save</Button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
          >
            <LogOutIcon className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}



