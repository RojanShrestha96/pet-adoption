import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
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

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsOpen(false);
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
  const sidebarVariants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };
  const itemVariants = {
    closed: {
      opacity: 0,
      x: -20,
    },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
  };
  return (
    <>
      {/* Hamburger Button - Only visible on mobile/tablet */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-[#FF6B35]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                    <PawPrint className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg text-gray-900">
                    PetMate
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                  {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.li
                        key={item.path}
                        custom={index}
                        variants={itemVariants}
                        initial="closed"
                        animate="open"
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isActive
                              ? "bg-[var(--color-primary)] text-white shadow-md"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-100">
                <motion.button
                  custom={menuItems.length}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log Out</span>
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
