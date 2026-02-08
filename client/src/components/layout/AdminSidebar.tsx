import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Shield,
  LogOut,
  Flag,
  FileText,
  Heart,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { LogoutConfirmModal } from "../common/LogoutConfirmModal";

type TabType = "dashboard" | "users" | "shelters" | "donations" | "reports" | "logs" | "settings" | "security";

interface AdminSidebarProps {
    activeTab?: TabType;
    setActiveTab?: (tab: TabType) => void;
}

export function AdminSidebar({ activeTab = "dashboard", setActiveTab }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // If internal state management is not passed (e.g. simplified view), fallback to basic behavior
  const handleTabClick = (tab: TabType) => {
      if (setActiveTab) {
          setActiveTab(tab);
      }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/admin-secure-access/login");
  };

  const menuItems = [
    {
      id: "dashboard" as TabType,
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      id: "users" as TabType,
      icon: Users,
      label: "Admin Users",
    },
    {
      id: "shelters" as TabType,
      icon: Building2,
      label: "Shelters",
    },
    {
      id: "donations" as TabType,
      icon: Heart,
      label: "Donations",
    },
    {
      id: "reports" as TabType,
      icon: Flag,
      label: "Moderation",
    },
    {
      id: "logs" as TabType,
      icon: FileText,
      label: "Audit Logs",
    },
    {
      id: "settings" as TabType,
      icon: Settings,
      label: "Settings",
    },
    {
      id: "security" as TabType,
      icon: Shield,
      label: "Security",
    },
  ];

  return (
    <>
      <aside
        className="w-72 min-h-screen p-6 border-r flex flex-col sticky top-0 h-screen overflow-y-auto"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => handleTabClick("dashboard")}>
          <div
            className="p-2.5 rounded-xl shadow-sm"
            style={{
              background: "linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%)",
            }}
          >
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <span
              className="text-xl font-bold block leading-none"
              style={{ color: "var(--color-text)" }}
            >
              PetMate
            </span>
            <span
              className="text-xs font-medium uppercase tracking-wider mt-1 block"
              style={{ color: "var(--color-text-light)" }}
            >
              Admin Portal
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group w-full text-left ${
                  active ? "shadow-sm" : "hover:bg-red-50"
                }`}
                style={{
                  background: active
                    ? "linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%)"
                    : "transparent",
                  color: active ? "white" : "var(--color-text)",
                }}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    active
                      ? "text-white"
                      : "text-gray-400 group-hover:text-red-600"
                  }`}
                />
                <span
                  className={`font-medium ${
                    active ? "" : "text-gray-600 group-hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl w-full transition-all hover:bg-red-50 group"
            style={{ color: "var(--color-text)" }}
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span className="font-medium text-gray-600 group-hover:text-red-600">
              Log Out
            </span>
          </button>
        </div>
      </aside>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}