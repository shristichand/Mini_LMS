import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,  
  error: null,
  redirectAfterLogin: null,
  permissions: []
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, permissions } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.permissions = permissions || [];
      state.error = null;
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.permissions = [];
      state.error = null;
      state.redirectAfterLogin = null;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setRedirectAfterLogin: (state, action) => {
      state.redirectAfterLogin = action.payload;
    },
    
    clearRedirectAfterLogin: (state) => {
      state.redirectAfterLogin = null;
    },
    
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    
    // Initialize auth state from persisted state
    initializeAuth: (state) => {
      // This will be handled by Redux Persist automatically
      // No manual localStorage handling needed
    }
  }
});

export const {
  setCredentials,
  logout,
  setError,
  clearError,
  setRedirectAfterLogin,
  clearRedirectAfterLogin,
  updateUser,
  setPermissions,
  initializeAuth
} = authSlice.actions;

export default authSlice.reducer;

