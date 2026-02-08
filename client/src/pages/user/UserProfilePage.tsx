import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";
import { Badge } from "../../components/ui/Badge";

import { useNavigate, Link } from "react-router-dom";
import { LogoutConfirmModal } from "../../components/common/LogoutConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { useToast } from "../../components/ui/Toast";
import { ThemeSwitcher } from "../../components/common/ThemeSwitcher";
import { LocationPicker } from "../../components/forms/LocationPicker";

type Tab =
  | "profile"
  | "saved"
  | "history"
  | "notifications"
  | "preferences"
  | "security"
  | "location";
export function UserProfilePage() {
  const { user, logout, login, token, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || localStorage.getItem("userPhone") || "",
    location: user?.address || localStorage.getItem("userLocation") || "",
    bio: user?.bio || localStorage.getItem("userBio") || "",
  });
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    smsAlerts: false,
    applicationStatus: true,
    newPets: true,
    shelterMessages: true,
    adoptionTips: false,
  });
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
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
  };

  // Legacy geolocation effect removed in favor of LocationPicker tab

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  };

  // Mock adoption history
  const adoptionHistory = [
    {
      id: "1",
      petName: "Luna",
      petImage:
        "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=200&h=200&fit=crop",
      status: "approved",
      date: "2024-01-15",
      shelter: "Kathmandu Animal Shelter",
    },
    {
      id: "2",
      petName: "Max",
      petImage:
        "https://images.unsplash.com/photo-1568572933382-74d440642117?w=200&h=200&fit=crop",
      status: "pending",
      date: "2024-01-20",
      shelter: "Patan Pet Rescue",
    },
    {
      id: "3",
      petName: "Bella",
      petImage:
        "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=200&h=200&fit=crop",
      status: "rejected",
      date: "2024-01-10",
      shelter: "Bhaktapur Animal Care",
    },
  ];
  const tabs = [
    {
      id: "profile" as Tab,
      label: "Profile",
      icon: User,
    },
    {
      id: "location" as Tab,
      label: "Location",
      icon: MapPin,
    },
    {
      id: "saved" as Tab,
      label: "Saved Pets",
      icon: Heart,
    },
    {
      id: "history" as Tab,
      label: "Adoption History",
      icon: FileText,
    },
    {
      id: "notifications" as Tab,
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "preferences" as Tab,
      label: "Preferences",
      icon: Settings,
    },
    {
      id: "security" as Tab,
      label: "Security",
      icon: Lock,
    },
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
    rejected: {
      variant: "neutral" as const,
      label: "Rejected",
      icon: XCircle,
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

  useEffect(() => {
    if (activeTab === "notifications") {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/notifications",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setNotificationList(response.data.notifications);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      fetchNotifications();
    }
  }, [activeTab, token]);

  const markAsRead = async (id: string) => {
    try {
      setNotificationList((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      await axios.put(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

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
            Manage your account, saved pets, and adoption applications
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
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold"
                    style={{
                      background: "var(--color-primary)",
                      color: "white",
                    }}
                  >
                    {profileData.name.charAt(0)}
                  </div>
                  <button
                    className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg"
                    style={{
                      background: "var(--color-card)",
                    }}
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

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: "var(--color-surface)",
                    }}
                  >
                    <p
                      className="text-2xl font-bold"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    >
                      {user?.favoritePets?.length || 0}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Saved Pets
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: "var(--color-surface)",
                    }}
                  >
                    <p
                      className="text-2xl font-bold"
                      style={{
                        color: "var(--color-secondary)",
                      }}
                    >
                      {adoptionHistory.length}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Applications
                    </p>
                  </div>
                </div>

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
                    label="Email"
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
                    disabled={!isEditing}
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

            {/* Saved Pets Tab */}
            {activeTab === "saved" && (
              <Card padding="lg">
                <h3
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--color-text)" }}
                >
                  Saved Pets ({user?.favoritePets?.length || 0})
                </h3>

                {user?.favoritePets?.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart
                      className="w-16 h-16 mx-auto mb-4"
                      style={{ color: "var(--color-text-light)" }}
                    />
                    <h4
                      className="text-xl font-semibold mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      No saved pets yet
                    </h4>
                    <p style={{ color: "var(--color-text-light)" }}>
                      Start browsing and save your favorite pets!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user?.favoritePets?.map((pet: any, index: number) => (
                      <motion.div
                        key={pet._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link to={`/pet/${pet._id}`} className="block">
                          <Card padding="md" hover>
                            <div className="flex gap-4 relative">
                              <img
                                src={
                                  pet.images?.[0] ||
                                  "https://via.placeholder.com/150"
                                }
                                alt={pet.name}
                                className="w-24 h-24 rounded-xl object-cover"
                              />
                              <div className="flex-1">
                                <h4
                                  className="font-bold mb-1"
                                  style={{ color: "var(--color-text)" }}
                                >
                                  {pet.name}
                                </h4>
                                <p
                                  className="text-sm mb-2"
                                  style={{ color: "var(--color-text-light)" }}
                                >
                                  {pet.breed} • {pet.age}{" "}
                                  {pet.age === 1 ? "Year" : "Years"}
                                </p>
                                <div className="flex gap-2">
                                  <Badge variant="info">{pet.gender}</Badge>
                                  <Badge variant="neutral">{pet.size}</Badge>
                                </div>
                              </div>
                              <button
                                onClick={async (e) => {
                                  e.preventDefault(); // Prevent navigation
                                  e.stopPropagation();
                                  try {
                                    const response = await axios.put(
                                      `http://localhost:5000/api/auth/profile/favorites/${pet._id}`,
                                      {},
                                      {
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
                                      }
                                    );
                                    if (response.status === 200) {
                                      showToast(
                                        "Removed from favorites",
                                        "success"
                                      );
                                      await refreshUser();
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error removing favorite:",
                                      error
                                    );
                                    showToast(
                                      "Failed to remove favorite",
                                      "error"
                                    );
                                  }
                                }}
                                className="absolute top-0 right-0 p-2 rounded-full hover:bg-red-50 transition-colors group z-10"
                              >
                                <Heart className="w-5 h-5 fill-current text-red-500 transition-transform group-hover:scale-110" />
                              </button>
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Adoption History Tab */}
            {activeTab === "history" && (
              <Card padding="lg">
                <h3
                  className="text-2xl font-bold mb-6"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  Adoption History ({adoptionHistory.length})
                </h3>

                <div className="space-y-4">
                  {adoptionHistory.map((application, index) => {
                    const config =
                      statusConfig[
                        application.status as keyof typeof statusConfig
                      ];
                    const StatusIcon = config.icon;
                    return (
                      <motion.div
                        key={application.id}
                        initial={{
                          opacity: 0,
                          x: -20,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * 0.1,
                        }}
                      >
                        <Card padding="md">
                          <div className="flex items-center gap-4">
                            <img
                              src={application.petImage}
                              alt={application.petName}
                              className="w-20 h-20 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4
                                    className="font-bold"
                                    style={{
                                      color: "var(--color-text)",
                                    }}
                                  >
                                    {application.petName}
                                  </h4>
                                  <p
                                    className="text-sm"
                                    style={{
                                      color: "var(--color-text-light)",
                                    }}
                                  >
                                    {application.shelter}
                                  </p>
                                </div>
                                <Badge variant={config.variant}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {config.label}
                                </Badge>
                              </div>
                              <div
                                className="flex items-center gap-2 text-sm"
                                style={{
                                  color: "var(--color-text-light)",
                                }}
                              >
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Applied on{" "}
                                  {new Date(
                                    application.date
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Notifications List Tab */}
            {activeTab === "notifications" && (
              <Card padding="lg">
                <h3
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--color-text)" }}
                >
                  Notifications
                </h3>
                <div className="space-y-4">
                  {notificationList.length > 0 ? (
                    notificationList.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 rounded-xl border transition-all ${
                          !notification.read
                            ? "bg-blue-50 border-blue-100"
                            : "bg-[var(--color-surface)] border-transparent"
                        }`}
                        onClick={() =>
                          !notification.read && markAsRead(notification._id)
                        }
                      >
                        <div className="flex gap-4">
                          <div
                            className={`p-2 rounded-full h-fit ${
                              !notification.read
                                ? "bg-white text-blue-500"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <Bell className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4
                                className={`font-medium mb-1 ${
                                  !notification.read
                                    ? "text-[var(--color-text)] font-bold"
                                    : "text-[var(--color-text-light)]"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <span className="text-xs text-[var(--color-text-light)]">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--color-text-light)]">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bell
                        className="w-12 h-12 mx-auto mb-3 opacity-20"
                        style={{ color: "var(--color-text)" }}
                      />
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        No notifications yet
                      </p>
                    </div>
                  )}
                </div>
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



