// src/pages/Dashboard.jsx
// Employee dashboard — shows leave balance overview and recent leave history
// Fetches real data from the API

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { leaveApi } from "@/lib/api/leave.api";

// ── STATUS CONFIG ──────────────────────────────────────────────────────────────
// Maps status values to display styles and icons
const STATUS_CONFIG = {
  Approved: {
    icon: CheckCircle,
    classes: "border-stone-200 bg-stone-100 text-stone-600",
  },
  Pending: {
    icon: Clock,
    classes: "border-orange-200 bg-orange-50 text-orange-600",
  },
  Rejected: {
    icon: XCircle,
    classes: "border-red-100 bg-red-50 text-red-400",
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the employee's leave history on mount
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await leaveApi.getMyLeaves();
        setLeaves(response.data.leaves || []);
      } catch (error) {
        console.error("Failed to fetch leaves:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  // ── STATS CALCULATION ────────────────────────────────────────────────────────
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;
  const pendingCount = leaves.filter((l) => l.status === "Pending").length;
  const totalDaysUsed = leaves
    .filter((l) => l.status === "Approved")
    .reduce((sum, l) => sum + (l.numberOfDays || 0), 0);

  // Format a date to a readable string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-900">
      <Navbar />

      <main className="container mx-auto pt-32 pb-20 px-8 max-w-5xl">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-stone-900 pb-6">
          <div>
            <h1 className="font-serif text-5xl italic text-stone-900 mb-2">The Ledger.</h1>
            <p className="font-mono text-xs tracking-widest text-stone-500 uppercase">
              {user?.name} • {user?.department}
            </p>
          </div>

          {/* Summary stats */}
          <div className="flex gap-8 mt-6 md:mt-0">
            <div className="text-right">
              <span className="block font-serif text-3xl">{approvedCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Approved</span>
            </div>
            <div className="text-right">
              <span className="block font-serif text-3xl text-orange-500">{pendingCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Pending</span>
            </div>
            <div className="text-right">
              <span className="block font-serif text-3xl text-stone-400">{totalDaysUsed}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Days Used</span>
            </div>
          </div>
        </div>

        {/* ── ACTION BAR ── */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-mono text-xs text-stone-400 uppercase tracking-widest">Recent Applications</h2>
          <Link to="/apply-leave">
            <Button className="rounded-none bg-stone-900 hover:bg-orange-600 text-white px-6 py-5 text-xs font-bold tracking-widest uppercase transition-all flex items-center">
              <Plus size={16} className="mr-2" /> Submit Request
            </Button>
          </Link>
        </div>

        {/* ── LEAVES LIST ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-stone-400" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-20 border-t-2 border-stone-200">
            <p className="font-serif text-2xl italic text-stone-400 mb-4">No leave applications yet.</p>
            <Link to="/apply-leave">
              <Button variant="outline" className="rounded-none border-stone-300 text-stone-600 hover:border-stone-900 text-xs tracking-widest uppercase">
                Apply for Leave
              </Button>
            </Link>
          </div>
        ) : (
          <div className="border-t-2 border-stone-200">
            {leaves.map((leave) => {
              const statusConfig = STATUS_CONFIG[leave.status] || STATUS_CONFIG.Pending;
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={leave._id}
                  className="group flex flex-col md:flex-row md:items-center py-6 border-b border-stone-200 hover:bg-white transition-colors px-4 -mx-4"
                >
                  {/* Type */}
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <div className="font-mono text-[10px] text-stone-400 mb-1">
                      {leave._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="font-serif text-xl italic text-stone-800 group-hover:text-orange-600 transition-colors">
                      {leave.leaveType}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="w-full md:w-1/3 mb-2 md:mb-0">
                    <div className="flex items-center gap-2 text-stone-600 font-medium">
                      <Calendar size={16} className="text-stone-400" />
                      {formatDate(leave.fromDate)} — {formatDate(leave.toDate)}
                    </div>
                    <div className="text-xs text-stone-400 mt-1 pl-6">
                      Duration: {leave.numberOfDays} day(s)
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusConfig.classes}`}>
                      <StatusIcon size={12} />
                      {leave.status}
                    </span>
                  </div>

                  {/* Actions for Pending leaves */}
                  <div className="w-full md:w-1/6 text-right">
                    {leave.status === "Pending" && (
                      <Link
                        to={`/edit-leave/${leave._id}`}
                        className="font-mono text-[10px] text-stone-400 hover:text-orange-600 transition-colors tracking-widest uppercase"
                      >
                        Edit
                      </Link>
                    )}
                    {leave.status !== "Pending" && (
                      <span className="font-serif italic text-stone-300 text-sm">
                        {leave.adminNote || "—"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}