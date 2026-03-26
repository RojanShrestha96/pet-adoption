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
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "../ui/Button";
import { NotificationCenter } from "../common/NotificationCenter";
import { useAuth } from "../../contexts/AuthContext";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  const { user, logout, isLoading } = useAuth();
  const isLoggedIn = !!user;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);



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
    <>
      {/* Account Status Banner */}
      {isLoggedIn && user?.status && user.status !== 'active' && (
        <div 
          className="w-full py-2 px-4 flex items-center justify-center gap-3 text-sm font-medium transition-all"
          style={{ 
            background: user.status === 'suspended' ? '#fee2e2' : '#fef3c7',
            color: user.status === 'suspended' ? '#991b1b' : '#92400e',
            borderBottom: `1px solid ${user.status === 'suspended' ? '#fecaca' : '#fde68a'}`
          }}
        >
          {user.status === 'suspended' ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Info className="w-4 h-4" />
          )}
          <span>
            {user.status === 'suspended' 
              ? `Account Suspended: ${user.statusReason || 'Your actions are restricted.'}`
              : `Account Warning: ${user.statusReason || 'Please review our guidelines.'}`
            }
          </span>
        </div>
      )}

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
            <Link
              to="/donate"
              className={`text-sm font-medium transition-colors ${
                isActive("/donate")
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text)] hover:text-[var(--color-primary)]"
              }`}
            >
              Donate
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

            {!isLoading && (
              <>
                {isLoggedIn ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 p-1 lg:pr-3 rounded-full transition-all hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)]"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm"
                        style={{ background: "var(--color-surface)" }}
                      >
                        {user?.profileImage || user?.logo ? (
                          <img 
                            src={(user?.profileImage || user?.logo)?.startsWith('http') ? (user?.profileImage || user?.logo) : `http://localhost:5000${user?.profileImage || user?.logo}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : user?.name ? (
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=40`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <span className="text-sm font-semibold hidden lg:block" style={{ color: "var(--color-text)" }}>
                        {user?.name ? user.name.split(' ')[0] : "User"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 hidden lg:block transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                        style={{ color: "var(--color-text-light)" }}
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
