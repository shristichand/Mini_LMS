import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';

// Persist configuration for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  // Only persist non-sensitive data for security
  whitelist: ['user', 'permissions'],
  blacklist: ['error', 'redirectAfterLogin', 'token', 'isAuthenticated', 'isBootstrapping']
};

// Create persisted reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Configure store with proper middleware and serialization checks
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['auth.user'], // Ignore user object serialization issues
      },
      // Add custom middleware if needed
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor for Redux Persist
export const persistor = persistStore(store);

export default store;
