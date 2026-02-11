// src/components/routes/AdminRoute.jsx
// Restricts access to admin-only pages
// If logged in but not admin, redirects to dashboard

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="animate-spin h-8 w-8 text-stone-400" />
      </div>
    );
  }

  // Not logged in at all → go to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Logged in but not admin → go to dashboard
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}