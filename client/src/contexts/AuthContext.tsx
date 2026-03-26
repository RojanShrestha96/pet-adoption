import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

interface User {
  id: string;
  _id?: string; // MongoDB ID
  email: string;
  name: string;
   phone?: string;
  bio?: string;
  address?: string;
  profileImage?: string;
  logo?: string;
  type: "adopter" | "shelter" | "admin";
  role?: "super_admin" | "admin" | "moderator";
  theme?: string;
  status: "active" | "warned" | "suspended" | "banned";
  statusReason?: string;
  favoritePets?: any[]; // Using any[] for now to avoid circular dependency
  adoptedPets?: any[];
  applicationsSent?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

import { useTheme } from "./ThemeContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const { changeTheme } = useTheme();

  // Initialize auth from localStorage
  useEffect(() => {
    // Check local storage for user/token on load
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);
      // Sync theme if preference exists
      if (parsedUser.theme) {
        changeTheme(parsedUser.theme);
      }
      // Immediately verify status with the server to catch bans/suspensions
      refreshUser();
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    // Sync theme on fresh login
    if (userData.theme) {
      changeTheme(userData.theme as any);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Helper to re-fetch user profile (useful after favorites update)
  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else if (response.status === 401 || response.status === 403) {
        // If forbidden or unauthorized (e.g. banned mid-session), force logout
        const errorData = await response.json();
        if (errorData.isBanned) {
          logout();
          window.location.href = '/login?error=banned&reason=' + encodeURIComponent(errorData.message);
        }
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout, refreshUser, updateUser }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
