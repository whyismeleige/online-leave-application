// src/components/routes/PublicRoute.jsx
// Redirects already-authenticated users away from login/register pages
// If logged in, sends them to their dashboard

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="animate-spin h-8 w-8 text-stone-400" />
      </div>
    );
  }

  // If already logged in, redirect to dashboard instead of showing login page
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}