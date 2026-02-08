import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Route that only allows unauthenticated users to access
 * Redirects authenticated users to their dashboard
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    if (user.type === "shelter") {
      return <Navigate to="/shelter/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
