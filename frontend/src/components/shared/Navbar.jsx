// src/components/shared/Navbar.jsx
// Main navigation bar — adapts based on login state and user role
// Shows different links for: guest / employee / admin

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_CONFIG } from "@/config";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FDFBF7] border-b border-stone-200">
      <div className="container mx-auto px-8 h-20 flex items-center justify-between">

        {/* ── BRAND ── */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-stone-900 text-[#FDFBF7] flex items-center justify-center rounded-none group-hover:bg-orange-600 transition-colors duration-300">
            <span className="font-serif font-bold text-xl italic">O_</span>
          </div>
          <span className="font-serif font-bold text-2xl tracking-tighter text-stone-900">
            {APP_CONFIG.name}
          </span>
        </Link>

        {/* ── DESKTOP LINKS ── */}
        <div className="hidden md:flex items-center gap-10 text-xs font-bold tracking-[0.2em] text-stone-500 uppercase">
          <Link to="/" className="hover:text-stone-900 transition-colors border-b border-transparent hover:border-stone-900 pb-1">
            Home
          </Link>

          {/* Only show these if logged in */}
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="hover:text-stone-900 transition-colors border-b border-transparent hover:border-stone-900 pb-1">
                Dashboard
              </Link>
              <Link to="/my-leaves" className="hover:text-stone-900 transition-colors border-b border-transparent hover:border-stone-900 pb-1">
                My Leaves
              </Link>
              {/* Admin-only link */}
              {isAdmin && (
                <Link to="/admin" className="hover:text-orange-600 transition-colors border-b border-transparent hover:border-orange-600 pb-1 text-orange-500">
                  Admin Panel
                </Link>
              )}
            </>
          )}
        </div>

        {/* ── DESKTOP ACTIONS ── */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Show user's name */}
              <span className="font-serif italic text-stone-500 text-sm">
                {user?.name}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="rounded-none border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900 px-6 py-5 text-xs font-bold tracking-widest uppercase transition-all"
              >
                <LogOut size={14} className="mr-2" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-serif italic text-stone-600 hover:text-orange-600 transition-colors text-lg">
                Sign In
              </Link>
              <Link to="/register">
                <Button className="bg-stone-900 hover:bg-orange-700 text-[#FDFBF7] rounded-none px-8 py-6 font-sans text-xs font-bold tracking-widest uppercase transition-all">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* ── MOBILE TOGGLE ── */}
        <button className="md:hidden text-stone-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
        </button>
      </div>

      {/* ── MOBILE MENU ── */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-[#FDFBF7] border-b border-stone-200 p-8 flex flex-col gap-6 animate-in slide-in-from-top-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 font-serif text-3xl text-stone-900 border-b border-stone-100 pb-4">
                <LayoutDashboard size={24} strokeWidth={1} /> Dashboard
              </Link>
              <Link to="/my-leaves" onClick={() => setIsOpen(false)} className="font-serif text-3xl text-stone-700 border-b border-stone-100 pb-4">
                My Leaves
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 font-serif text-3xl text-orange-600 border-b border-stone-100 pb-4">
                  <ShieldCheck size={24} strokeWidth={1} /> Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="text-left font-serif text-2xl text-stone-500 flex items-center gap-3">
                <LogOut size={20} strokeWidth={1} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="font-serif text-3xl text-stone-900 border-b border-stone-100 pb-4">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="font-serif text-3xl text-orange-600 pb-4">
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}