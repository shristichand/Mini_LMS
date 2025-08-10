import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/authHook";

/**
 * Protected route component that handles authentication and role-based access
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} [props.requiredRole] - Required role for access (optional)
 * @returns {React.ReactNode|null} Protected content or redirect
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, token, isBootstrapping, user } = useAuth();
  const location = useLocation();

  // Wait for auth bootstrap to complete before deciding
  if (isBootstrapping) {
    return null; // or a loader component
  }

  // Check if user is authenticated
  if ((!isAuthenticated || !token) && location.pathname !== "/login") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based guard (if requiredRole provided)
  if (requiredRole && user?.role !== requiredRole) {
    // Non-admin attempting admin route → send to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
