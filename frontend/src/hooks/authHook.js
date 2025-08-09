import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/api';
import { setCredentials, logout as logoutAction, setError } from '../store/slices/authSlice';
import toast from "react-hot-toast";

// Hook to get current auth state from Redux
export const useAuth = () => {
  return useSelector((state) => state.auth);
};

// Login Hook
export const useLogin = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Save user and token to Redux store
      dispatch(setCredentials({
        user: data.user,
        token: data.token,
        permissions: data.user?.permissions || []
      }));
      
      // Clear any cached queries
      queryClient.invalidateQueries();
      toast.success('Login successful!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Login failed';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    },
  });
};

// Register/Signup Hook
export const useRegister = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      // Save user and token to Redux store
      dispatch(setCredentials({
        user: data.user,
        token: data.token,
        permissions: data.user?.permissions || []
      }));
      
      // Clear any cached queries
      queryClient.invalidateQueries();
      toast.success('Registration successful!');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Registration failed';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    },
  });
};

// Logout Hook
export const useLogout = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear Redux state
      dispatch(logoutAction());
      
      // Clear all queries from cache
      queryClient.clear();
      toast.success('Logged out successfully');
      
      // Redirect to login
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      dispatch(logoutAction());
      queryClient.clear();
      toast.error('Logged out (with errors)');
      window.location.href = '/login';
    },
  });
};

// Get Current User Hook (as a query, not mutation)
export const useGetCurrentUser = () => {
  const { token, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: !!token && isAuthenticated, // Only run if user is authenticated
    retry: false, // Don't retry on failure
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Refresh Token Hook
export const useRefreshToken = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authService.refreshToken,
    onSuccess: (data) => {
      // Update token in Redux store
      dispatch(setCredentials({
        user: data.user,
        token: data.token,
        permissions: data.user?.permissions || []
      }));
    },
    onError: (error) => {
      console.error('Token refresh error:', error);
      // Clear auth state and redirect to login
      dispatch(logoutAction());
      window.location.href = '/login';
    },
  });
};

// Helper hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { isAuthenticated, token } = useAuth();
  return isAuthenticated && !!token;
};

// Helper hook to get user permissions
export const useUserPermissions = () => {
  const { permissions } = useAuth();
  return permissions || [];
};

// Helper hook to check if user has specific permission
export const useHasPermission = (permission) => {
  const permissions = useUserPermissions();
  return permissions.includes(permission);
};


