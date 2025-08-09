import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./auth/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthRedirectHandler } from "./components/AuthRedirectHandler";
import AdminLayout from "./pages/AdminLayout"; // import AdminLayout here
import AdminDashboard from "./pages/AdminDashboard"; // example admin page

import "./App.css";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <Router>
        <div className="App">
          <AuthRedirectHandler />
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Normal user dashboard protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin routes wrapped with AdminLayout */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Nested routes under admin */}
              <Route index element={<AdminDashboard />} />
              {/* Add more admin routes here, e.g.: */}
              {/* <Route path="users" element={<UsersPage />} /> */}
            </Route>

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
