import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("adopter" | "shelter" | "admin")[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  // No user logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has permission
  if (allowedRoles && !allowedRoles.includes(user.type)) {
    // Redirect based on their actual role
    if (user.type === "shelter") {
      return <Navigate to="/shelter/dashboard" replace />;
    }
    if (user.type === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Default for adopter or unknown
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
