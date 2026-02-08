import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PawPrint,
  Heart,
  User,
  LogOut,
  FileText,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { Button } from "../ui/Button";
import { NotificationCenter } from "../common/NotificationCenter";
import { useAuth } from "../../contexts/AuthContext";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="p-2 rounded-xl group-hover:scale-110 transition-transform"
              style={{
                background: "var(--color-primary)",
              }}
            >
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <span
              className="text-xl font-bold"
              style={{
                color: "var(--color-text)",
              }}
            >
              PetMate
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text)] hover:text-[var(--color-primary)]"
              }`}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={`text-sm font-medium transition-colors ${
                isActive("/search")
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text)] hover:text-[var(--color-primary)]"
              }`}
            >
              Browse Pets
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                isActive("/about")
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text)] hover:text-[var(--color-primary)]"
              }`}
            >
              About
            </Link>
            <Link to="/donate">
              <Button variant="primary" size="sm">
                Donate
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn && <NotificationCenter />}
            {/* Standalone messages icon removed as per request */}

            <Link to="/favourites">
              <button
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{
                  background: isActive("/favourites")
                    ? "var(--color-surface)"
                    : "transparent",
                }}
                aria-label="View favourites"
              >
                <Heart
                  className="w-5 h-5"
                  style={{
                    color: "var(--color-primary)",
                    fill: isActive("/favourites")
                      ? "var(--color-primary)"
                      : "none",
                  }}
                />
              </button>
            </Link>

            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full transition-all hover:opacity-80"
                  style={{ background: "var(--color-primary)" }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {user?.name ? getInitials(user.name) : "U"}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-white transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-2 z-50"
                    style={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      boxShadow: "var(--shadow-lg)",
                    }}
                  >
                    <div
                      className="px-4 py-3 border-b"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-text)" }}
                      >
                        {user?.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface)]"
                      style={{ color: "var(--color-text)" }}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <Link
                      to={
                        user?.type === "shelter"
                          ? "/shelter/messages"
                          : "/messages"
                      }
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface)]"
                      style={{ color: "var(--color-text)" }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      My Messages
                    </Link>

                    <Link
                      to="/my-applications"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface)]"
                      style={{ color: "var(--color-text)" }}
                    >
                      <FileText className="w-4 h-4" />
                      My Applications
                    </Link>

                    <div
                      className="border-t my-1"
                      style={{ borderColor: "var(--color-border)" }}
                    />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm w-full transition-colors hover:bg-red-50"
                      style={{ color: "#ef4444" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<User className="w-4 h-4" />}
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
