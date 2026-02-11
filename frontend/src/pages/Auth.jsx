// src/pages/Auth.jsx
// Login and Register page in one component
// Switches between modes based on the current URL path (/login or /register)

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  // Determine mode from the current URL
  const isSignup = location.pathname === "/register";

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);

  // Update form field values
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Register new user
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department: formData.department,
        });
      } else {
        // Login existing user
        await login({
          email: formData.email,
          password: formData.password,
        });
      }
      // On success, redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      // Error toast is shown by the API interceptor — nothing to do here
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row">

      {/* ── LEFT: Brand Panel ── */}
      <div className="hidden md:flex md:w-1/2 bg-stone-900 text-[#FDFBF7] p-16 flex-col justify-between">
        <div className="font-serif font-bold text-2xl italic">O_</div>

        <div>
          <h1 className="font-serif text-6xl italic mb-6 leading-tight">
            Prioritize your <br /> presence.
          </h1>
          <p className="font-mono text-xs tracking-widest text-stone-500 uppercase max-w-xs leading-relaxed">
            Access the OFF_SITE portal to manage leave requests and view team availability.
          </p>
        </div>

        <div className="font-mono text-[10px] text-stone-600">
          © 2026 OFF_SITE SYSTEMS
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="mb-12">
            <span className="font-mono text-xs text-orange-600 uppercase tracking-widest mb-2 block">
              {isSignup ? "New Profile" : "Secure Access"}
            </span>
            <h2 className="font-serif text-4xl text-stone-900">
              {isSignup ? "Join the Team" : "Welcome Back"}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Name — only shown for registration */}
            {isSignup && (
              <div className="group">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-orange-600 transition-colors">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 font-serif italic text-xl focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                  placeholder="John Doe"
                />
              </div>
            )}

            {/* Department — only shown for registration */}
            {isSignup && (
              <div className="group">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-orange-600 transition-colors">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 font-serif italic text-xl focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                  placeholder="Engineering"
                />
              </div>
            )}

            {/* Email */}
            <div className="group">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-orange-600 transition-colors">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 font-serif italic text-xl focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                placeholder="john@company.com"
              />
            </div>

            {/* Password */}
            <div className="group">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-orange-600 transition-colors">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 font-serif italic text-xl focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-none bg-stone-900 hover:bg-orange-600 text-white h-14 text-xs font-bold tracking-[0.2em] uppercase transition-all mt-8 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : isSignup ? (
                "Submit Profile"
              ) : (
                "Enter Portal"
              )}
            </Button>
          </form>

          {/* Toggle between Login / Register */}
          <div className="mt-12 pt-8 border-t border-stone-100 text-center">
            <Link
              to={isSignup ? "/login" : "/register"}
              className="font-serif italic text-stone-500 hover:text-stone-900 transition-colors"
            >
              {isSignup ? "Already registered? Sign in." : "New employee? Create profile."}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}