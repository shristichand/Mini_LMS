import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/authHook';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !token) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
