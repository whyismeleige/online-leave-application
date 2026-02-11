// src/App.jsx
// Root component that defines all application routes
// Uses React Router v6 for navigation

import { Routes, Route, Navigate } from "react-router-dom";

// Route Guards
import ProtectedRoute from "@/components/routes/ProtectedRoute";
import PublicRoute from "@/components/routes/PublicRoute";
import AdminRoute from "@/components/routes/AdminRoute";

// Pages
import Home from "@/pages/Home";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ApplyLeave from "@/pages/ApplyLeave";
import MyLeaves from "@/pages/MyLeaves";
import EditLeave from "@/pages/EditLeave";
import AdminPanel from "@/pages/AdminPanel";

export default function App() {
  return (
    <Routes>
      {/* ── PUBLIC PAGES (anyone can access) ── */}
      <Route path="/" element={<Home />} />

      {/* ── AUTH PAGES (redirect to dashboard if already logged in) ── */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
      </Route>

      {/* ── PROTECTED PAGES (must be logged in) ── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apply-leave" element={<ApplyLeave />} />
        <Route path="/my-leaves" element={<MyLeaves />} />
        <Route path="/edit-leave/:id" element={<EditLeave />} />
      </Route>

      {/* ── ADMIN ONLY PAGES (must be logged in as admin) ── */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* ── CATCH-ALL: redirect unknown routes to home ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}