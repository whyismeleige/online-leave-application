// src/components/routes/ProtectedRoute.jsx
// Redirects unauthenticated users to the login page
// Wrap any private page/route with this component

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Show a spinner while checking session on first load
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="animate-spin h-8 w-8 text-stone-400" />
      </div>
    );
  }

  // Render children if authenticated, otherwise redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}