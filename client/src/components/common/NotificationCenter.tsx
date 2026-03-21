import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  FileText,
  PawPrint,
  User,
  Check,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles,
  ExternalLink,
  Clock,
  Trash2,
} from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";
import { Link } from "react-router-dom";

interface Notification {
  _id: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "system"
    | "application"
    | "pet";
  title: string;
  message: string;
  read: boolean;
  relatedLink?: string;
  createdAt: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    flashCount,
    markRead,
    markAllRead,
    deleteNotif,
  } = useNotifications();

  // Animate bell when a new real-time notification arrives
  const [bellPulse, setBellPulse] = useState(false);
  const prevFlash = useRef(flashCount);
  useEffect(() => {
    if (flashCount > prevFlash.current) {
      setBellPulse(true);
      const t = setTimeout(() => setBellPulse(false), 700);
      prevFlash.current = flashCount;
      return () => clearTimeout(t);
    }
  }, [flashCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleMarkRead = async (id: string) => {
    await markRead(id);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await deleteNotif(id);
  };

  // Enhanced icon configurations with gradients
  const getIconConfig = (type: string) => {
    const configs: Record<
      string,
      { icon: React.ReactNode; gradient: string; shadow: string }
    > = {
      application: {
        icon: <FileText className="w-4 h-4" />,
        gradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
        shadow: "rgba(99, 102, 241, 0.3)",
      },
      pet: {
        icon: <PawPrint className="w-4 h-4" />,
        gradient: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
        shadow: "rgba(249, 115, 22, 0.3)",
      },
      user: {
        icon: <User className="w-4 h-4" />,
        gradient: "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)",
        shadow: "rgba(168, 85, 247, 0.3)",
      },
      success: {
        icon: <CheckCircle className="w-4 h-4" />,
        gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        shadow: "rgba(16, 185, 129, 0.3)",
      },
      warning: {
        icon: <AlertTriangle className="w-4 h-4" />,
        gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        shadow: "rgba(245, 158, 11, 0.3)",
      },
      error: {
        icon: <XCircle className="w-4 h-4" />,
        gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
        shadow: "rgba(239, 68, 68, 0.3)",
      },
      system: {
        icon: <Sparkles className="w-4 h-4" />,
        gradient:
          "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        shadow: "rgba(177, 156, 217, 0.3)",
      },
      info: {
        icon: <Info className="w-4 h-4" />,
        gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        shadow: "rgba(59, 130, 246, 0.3)",
      },
    };
    return configs[type] || configs.info;
  };

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl transition-all"
        style={{
          background: isOpen ? "var(--color-surface)" : "transparent",
        }}
        animate={bellPulse ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Notifications"
      >
        <Bell
          className="w-5 h-5 transition-colors"
          style={{
            color: isOpen ? "var(--color-primary)" : "var(--color-text-light)",
          }}
        />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0 -right-0 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
              style={{
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-3 w-[340px] sm:w-[380px] rounded-2xl overflow-hidden z-50"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              boxShadow:
                "0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.02)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                background: "var(--color-surface)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
                    boxShadow: "0 4px 12px rgba(177, 156, 217, 0.3)",
                  }}
                >
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3
                    className="font-bold text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      {unreadCount} unread
                    </p>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <motion.button
                  onClick={handleMarkAllRead}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: "var(--color-card)",
                    color: "var(--color-primary)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all read
                </motion.button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div>
                  {notifications.map((notification, index) => {
                    const iconConfig = getIconConfig(notification.type);

                    return (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group relative"
                      >
                        <Link
                          to={notification.relatedLink || "#"}
                          className="block px-5 py-4 transition-all duration-200"
                          style={{
                            background: !notification.read
                              ? "rgba(99, 102, 241, 0.03)"
                              : "transparent",
                            borderBottom: "1px solid var(--color-border)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "var(--color-surface)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              !notification.read
                                ? "rgba(99, 102, 241, 0.03)"
                                : "transparent";
                          }}
                          onClick={() => {
                            if (!notification.read)
                              handleMarkRead(notification._id);
                            setIsOpen(false);
                          }}
                        >
                          <div className="flex gap-3.5">
                            {/* Icon */}
                            <div
                              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105"
                              style={{
                                background: iconConfig.gradient,
                                boxShadow: `0 4px 12px ${iconConfig.shadow}`,
                              }}
                            >
                              {iconConfig.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4
                                  className={`text-sm leading-snug ${
                                    !notification.read
                                      ? "font-bold"
                                      : "font-medium"
                                  }`}
                                  style={{ color: "var(--color-text)" }}
                                >
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span
                                    className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                                    style={{
                                      background: "var(--color-primary)",
                                    }}
                                  />
                                )}

                                <button
                                  onClick={(e) => handleDelete(notification._id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                                  title="Delete notification"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p
                                className="text-xs leading-relaxed line-clamp-2 mb-2"
                                style={{ color: "var(--color-text-light)" }}
                              >
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3">
                                <span
                                  className="flex items-center gap-1 text-[10px] font-medium"
                                  style={{
                                    color: "var(--color-text-light)",
                                    opacity: 0.7,
                                  }}
                                >
                                  <Clock className="w-3 h-3" />
                                  {formatTime(notification.createdAt)}
                                </span>
                                {notification.relatedLink && (
                                  <span
                                    className="flex items-center gap-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ color: "var(--color-primary)" }}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View details
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 px-8 text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <Bell
                      className="w-7 h-7"
                      style={{ color: "var(--color-text-light)", opacity: 0.4 }}
                    />
                  </div>
                  <h4
                    className="font-semibold text-sm mb-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    All caught up!
                  </h4>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    No new notifications at the moment
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3 text-center"
              style={{
                background: "var(--color-surface)",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <Link
                to="/profile?tab=notifications"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all hover:gap-2"
                style={{ color: "var(--color-primary)" }}
              >
                Notification settings
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
