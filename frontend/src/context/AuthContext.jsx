// src/context/AuthContext.jsx
// Global authentication state using React Context API
// Provides user data, login/logout functions to all components

import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/lib/api/auth.api";
import { toast } from "react-hot-toast";

// Create the context — components will consume this via useAuth()
const AuthContext = createContext(null);

// ── AUTH PROVIDER ──────────────────────────────────────────────────────────────
// Wrap your entire app in this so all components can access auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Prevents flash of login page on refresh

  // ── CHECK SESSION ON APP LOAD ────────────────────────────────────────────────
  // Runs once when the app starts — checks if user has a valid session cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authApi.getProfile();
        if (response.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch {
        // 401 means not logged in — that's fine, silently ignore
      } finally {
        setLoading(false); // Always stop loading
      }
    };
    initAuth();
  }, []);

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    setUser(response.data.user);
    setIsAuthenticated(true);
    toast.success(`Welcome back, ${response.data.user.name}!`);
    return response.data.user; // Return user so caller can redirect based on role
  };

  // ── REGISTER ─────────────────────────────────────────────────────────────────
  const register = async (credentials) => {
    const response = await authApi.register(credentials);
    setUser(response.data.user);
    setIsAuthenticated(true);
    toast.success("Account created successfully!");
    return response.data.user;
  };

  // ── LOGOUT ───────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear local state even if API fails
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
    }
  };

  // ── HELPERS ───────────────────────────────────────────────────────────────────
  // Convenience check so components can do: if (isAdmin) ...
  const isAdmin = user?.role === "admin";

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render children until session check completes (avoids flash) */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ── USE AUTH HOOK ──────────────────────────────────────────────────────────────
// Custom hook for easy access to auth state in any component
// Usage: const { user, login, logout, isAdmin } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};