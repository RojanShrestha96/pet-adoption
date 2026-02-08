import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface AdopterOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper that restricts access to adopter-only pages.
 * Shelters and Admins are redirected to their respective dashboards.
 * Visitors (not logged in) and adopters can access these pages.
 */
export const AdopterOnlyRoute: React.FC<AdopterOnlyRouteProps> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  // Not logged in - allow access (public browsing)
  if (!user) {
    return <>{children}</>;
  }

  // Shelter users - redirect to shelter dashboard
  if (user.type === "shelter") {
    return <Navigate to="/shelter/dashboard" replace />;
  }

  // Admin users - redirect to admin dashboard
  if (user.type === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Adopters can access
  return <>{children}</>;
};
