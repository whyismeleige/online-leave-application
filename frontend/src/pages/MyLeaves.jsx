// src/pages/MyLeaves.jsx
// Full leave history page for the logged-in employee
// Includes the ability to edit or delete pending applications

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import {
  Plus, Calendar, CheckCircle, Clock, XCircle,
  Loader2, Pencil, Trash2
} from "lucide-react";
import { leaveApi } from "@/lib/api/leave.api";
import { toast } from "react-hot-toast";

const STATUS_CONFIG = {
  Approved: { icon: CheckCircle, classes: "border-stone-200 bg-stone-100 text-stone-600" },
  Pending: { icon: Clock, classes: "border-orange-200 bg-orange-50 text-orange-600" },
  Rejected: { icon: XCircle, classes: "border-red-100 bg-red-50 text-red-400" },
};

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLeaves = async () => {
    try {
      const response = await leaveApi.getMyLeaves();
      setLeaves(response.data.leaves || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Handle delete with confirmation
  const handleDelete = async (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel this leave application?")) return;

    setDeletingId(leaveId);
    try {
      await leaveApi.deleteLeave(leaveId);
      toast.success("Leave application cancelled");
      setLeaves((prev) => prev.filter((l) => l._id !== leaveId)); // Remove from UI immediately
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

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
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-stone-200 pb-6">
          <div>
            <span className="font-mono text-xs text-orange-600 tracking-widest mb-2 block">/// HISTORY</span>
            <h1 className="font-serif text-5xl italic text-stone-900">My Applications.</h1>
          </div>
          <Link to="/apply-leave">
            <Button className="rounded-none bg-stone-900 hover:bg-orange-600 text-white px-6 py-5 text-xs font-bold tracking-widest uppercase transition-all flex items-center mt-6 md:mt-0">
              <Plus size={16} className="mr-2" /> New Request
            </Button>
          </Link>
        </div>

        {/* ── FILTER SUMMARY ── */}
        {!loading && leaves.length > 0 && (
          <div className="flex gap-6 mb-8">
            {["All", "Pending", "Approved", "Rejected"].map((filter) => {
              const count =
                filter === "All"
                  ? leaves.length
                  : leaves.filter((l) => l.status === filter).length;
              return (
                <div key={filter} className="text-center">
                  <div className="font-serif text-2xl">{count}</div>
                  <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest">{filter}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── LEAVES LIST ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-stone-400" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-20 border-t border-stone-200">
            <p className="font-serif text-2xl italic text-stone-400 mb-6">
              You haven't applied for any leave yet.
            </p>
            <Link to="/apply-leave">
              <Button className="rounded-none bg-stone-900 hover:bg-orange-600 text-white px-8 py-5 text-xs font-bold tracking-widest uppercase">
                Apply Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="border-t-2 border-stone-200">
            {leaves.map((leave) => {
              const statusConfig = STATUS_CONFIG[leave.status] || STATUS_CONFIG.Pending;
              const StatusIcon = statusConfig.icon;
              const isDeleting = deletingId === leave._id;

              return (
                <div
                  key={leave._id}
                  className="group flex flex-col md:flex-row md:items-center py-6 border-b border-stone-200 hover:bg-white transition-colors px-4 -mx-4"
                >
                  {/* Leave type & ID */}
                  <div className="w-full md:w-1/4 mb-3 md:mb-0">
                    <div className="font-mono text-[10px] text-stone-400 mb-1">
                      #{leave._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="font-serif text-xl italic text-stone-800 group-hover:text-orange-600 transition-colors">
                      {leave.leaveType} Leave
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="w-full md:w-1/3 mb-3 md:mb-0">
                    <div className="flex items-center gap-2 text-stone-600">
                      <Calendar size={14} className="text-stone-400" />
                      <span className="font-medium text-sm">
                        {formatDate(leave.fromDate)} — {formatDate(leave.toDate)}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-1 pl-5">
                      {leave.numberOfDays} day(s) • Applied {formatDate(leave.createdAt)}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="w-full md:w-1/4 mb-3 md:mb-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusConfig.classes}`}>
                      <StatusIcon size={12} />
                      {leave.status}
                    </span>
                    {leave.adminNote && (
                      <p className="text-xs text-stone-400 italic mt-1">"{leave.adminNote}"</p>
                    )}
                  </div>

                  {/* Actions — only for Pending leaves */}
                  <div className="w-full md:w-1/6 flex items-center justify-end gap-3">
                    {leave.status === "Pending" && (
                      <>
                        <Link
                          to={`/edit-leave/${leave._id}`}
                          className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(leave._id)}
                          disabled={isDeleting}
                          className="p-2 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Cancel"
                        >
                          {isDeleting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </>
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