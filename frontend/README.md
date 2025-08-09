# Mini LMS Frontend

A React-based frontend for the Mini LMS application with complete authentication system using Redux Persist.

## Features

- **Authentication System**: Complete login/signup functionality
- **Redux State Management**: Centralized state management with Redux Toolkit
- **Redux Persist**: Automatic state persistence across browser sessions
- **React Query**: Server state management for API calls
- **Protected Routes**: Route protection based on authentication status
- **Toast Notifications**: User-friendly notifications using react-hot-toast
- **Responsive Design**: Modern UI with Tailwind CSS

## Authentication Flow

### Components

1. **Login Component** (`src/auth/Login.jsx`)
   - Handles both login and signup
   - Form validation
   - Error handling
   - Success notifications

2. **Dashboard Component** (`src/components/Dashboard.jsx`)
   - Protected route example
   - User information display
   - Logout functionality

3. **ProtectedRoute Component** (`src/components/ProtectedRoute.jsx`)
   - Route protection
   - Automatic redirect to login

### State Management

#### Auth Slice (`src/store/slices/authSlice.js`)
- User authentication state
- Token management
- Error handling
- Permissions management
- **Redux Persist Integration**: Automatic state persistence

#### Actions Available:
- `setCredentials`: Set user data and token
- `logout`: Clear authentication state
- `setError`: Set error message
- `clearError`: Clear error message
- `updateUser`: Update user information
- `setPermissions`: Set user permissions

#### Redux Persist Configuration (`src/store/store.js`)
- **Storage**: Uses localStorage for persistence
- **Whitelist**: Only persists `user`, `token`, `isAuthenticated`, `permissions`
- **Blacklist**: Excludes `error` and `redirectAfterLogin` from persistence
- **Serialization**: Handles Redux Persist actions in middleware

### Custom Hooks

#### useAuth Hook (`src/hooks/useAuth.js`)
A comprehensive hook that provides:
- **State Access**: `user`, `token`, `isAuthenticated`, `error`, `permissions`
- **Loading States**: `isLoginLoading`, `isRegisterLoading`, `isLogoutLoading`
- **Actions**: `login`, `register`, `logout`, `updateUser`, `setPermissions`, `clearError`
- **Utilities**: `hasPermission`, `hasAnyPermission`

### API Integration

#### API Service (`src/services/api.js`)
- Axios configuration with interceptors
- **Redux State Integration**: Gets token from Redux state instead of localStorage
- Error handling for 401 responses
- Base URL configuration

#### Auth Hooks (`src/hooks/authHook.js`)
- `useLogin`: Login mutation
- `useRegister`: Registration mutation
- `useLogout`: Logout mutation
- `useGetCurrentUser`: Get current user data
- `useRefreshToken`: Token refresh

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @reduxjs/toolkit react-redux redux-persist @tanstack/react-query react-router-dom react-hot-toast axios
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

### 3. Backend API Endpoints

The frontend expects the following API endpoints:

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token

### 4. API Response Format

Expected response format for login/signup:

```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  },
  "token": "jwt_token_here",
  "permissions": ["read", "write"]
}
```

## Usage Examples

### Using the useAuth Hook

```jsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    hasPermission 
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // User is automatically logged in and state is persisted
    } catch (error) {
      // Error handling
    }
  };

  const handleLogout = async () => {
    await logout();
    // User is automatically logged out and state is cleared
  };

  // Check permissions
  if (hasPermission('admin')) {
    // Show admin features
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
};
```

### Login/Signup Form

```jsx
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { login, register, isLoginLoading, isRegisterLoading } = useAuth();

  const handleSubmit = async (credentials) => {
    try {
      await login(credentials);
      // State is automatically persisted
    } catch (error) {
      // Error handling
    }
  };
};
```

### Protected Route

```jsx
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## Redux Persist Benefits

### Automatic State Persistence
- **User Session**: User stays logged in across browser sessions
- **Token Management**: Authentication token is automatically persisted
- **State Recovery**: App state is restored on page refresh

### Selective Persistence
- **Whitelist**: Only important auth data is persisted
- **Blacklist**: Temporary data (errors, redirects) is not persisted
- **Performance**: Minimal storage usage

### Security
- **Token Storage**: Secure token storage in localStorage
- **Automatic Cleanup**: State is cleared on logout
- **Error Handling**: 401 responses automatically clear auth state

## File Structure

```
src/
├── auth/
│   └── Login.jsx              # Login/Signup component
├── components/
│   ├── Dashboard.jsx          # Dashboard component
│   └── ProtectedRoute.jsx     # Route protection
├── hooks/
│   ├── authHook.js            # Authentication hooks
│   └── useAuth.js             # Custom auth hook
├── services/
│   └── api.js                 # API configuration
├── store/
│   ├── slices/
│   │   └── authSlice.js       # Auth state management
│   └── store.js               # Redux store with Persist
└── App.jsx                    # Main app component
```

## Development

### Running the Application

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Notes

- **Redux Persist**: Automatically handles state persistence across sessions
- **Token Management**: Tokens are stored in Redux state and persisted automatically
- **API Integration**: API calls automatically include the authentication token from Redux state
- **401 Handling**: 401 responses automatically clear auth state and redirect to login
- **State Recovery**: User authentication state is restored on app reload
- **Performance**: Only essential auth data is persisted for optimal performance
