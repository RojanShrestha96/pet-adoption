import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  List,
  MessageSquare,
  Settings,
  LogOut,
  PawPrint,
  Calendar,
  FileText,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { LogoutConfirmModal } from "../common/LogoutConfirmModal";

export function ShelterSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/shelter/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/shelter/add-pet",
      icon: Plus,
      label: "Add Pet",
    },
    {
      path: "/shelter/manage-pets",
      icon: List,
      label: "Manage Pets",
    },
    {
      path: "/shelter/applications",
      icon: FileText,
      label: "Applications",
    },
    {
      path: "/shelter/meet-and-greet",
      icon: Calendar,
      label: "Meet & Greet",
    },
    {
      path: "/shelter/messages",
      icon: MessageSquare,
      label: "Messages",
    },
    {
      path: "/shelter/settings",
      icon: Settings,
      label: "Settings",
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
        <Link
          to="/shelter/dashboard"
          className="flex items-center gap-3 mb-10 px-2"
        >
          <div
            className="p-2.5 rounded-xl shadow-sm"
            style={{ background: "var(--color-primary)" }}
          >
            <PawPrint className="w-7 h-7 text-white" />
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
              Shelter Portal
            </span>
          </div>
        </Link>

        {/* Menu Items */}
        <nav className="space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  active ? "shadow-sm" : "hover:bg-gray-50"
                }`}
                style={{
                  background: active ? "var(--color-primary)" : "transparent",
                  color: active ? "white" : "var(--color-text)",
                }}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    active
                      ? "text-white"
                      : "text-gray-400 group-hover:text-[var(--color-primary)]"
                  }`}
                />
                <span
                  className={`font-medium ${
                    active ? "" : "text-gray-600 group-hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout Section */}
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
