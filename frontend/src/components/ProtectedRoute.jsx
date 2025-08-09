import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/authHook";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  if ((!isAuthenticated || !token) && location.pathname !== "/login") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
