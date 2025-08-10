import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { initializeAuthStart, initializeAuthSuccess, initializeAuthFailure } from "../store/slices/authSlice";
import { authService } from "../services/api";

/**
 * Component that handles authentication state initialization and redirects
 * Attempts silent token refresh on mount to restore user session
 */
export function AuthRedirectHandler() {
  const dispatch = useDispatch();
  const { isAuthenticated, isBootstrapping } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Bootstrap: attempt silent refresh using HTTP-only cookie to get an access token
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      dispatch(initializeAuthStart());
      try {
        // Try silent refresh to get new access token
        const refresh = await authService.refreshToken();
        const { token, user } = refresh || {};
        
        if (token && mounted) {
          dispatch(initializeAuthSuccess({ 
            user, 
            token, 
            permissions: user?.permissions || [] 
          }));
          return;
        }
      } catch (error) {
        // Silent refresh failed, continue to failure state
        console.warn('Silent token refresh failed:', error);
      }
      
      if (mounted) {
        dispatch(initializeAuthFailure());
      }
    };

    initializeAuth();

    return () => { 
      mounted = false; 
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      // Don't redirect here; let ProtectedRoute handle it to avoid double redirects during bootstrap
      return;
    }
  }, [isBootstrapping, isAuthenticated]);

  return null;
}
