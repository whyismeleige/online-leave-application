// src/pages/AdminPanel.jsx
// Admin-only page for managing all leave applications and users
// Admins can Approve or Reject pending leaves, and view all employees

import { useState, useEffect } from "react";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, XCircle, Clock, Loader2,
  Users, FileText, ShieldCheck, Calendar
} from "lucide-react";
import { leaveApi } from "@/lib/api/leave.api";
import { userApi } from "@/lib/api/user.api";
import { toast } from "react-hot-toast";

// ── TAB CONFIGURATION ──────────────────────────────────────────────────────────
const TABS = ["All Leaves", "Pending", "Approved", "Rejected", "Users"];

const STATUS_CONFIG = {
  Approved: { icon: CheckCircle, classes: "border-stone-200 bg-stone-100 text-stone-600" },
  Pending: { icon: Clock, classes: "border-orange-200 bg-orange-50 text-orange-600" },
  Rejected: { icon: XCircle, classes: "border-red-100 bg-red-50 text-red-400" },
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("All Leaves");
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionId, setActionId] = useState(null); // Track which leave is being actioned

  // ── FETCH ALL LEAVES ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await leaveApi.getAllLeaves();
        setLeaves(response.data.leaves || []);
      } catch (error) {
        console.error("Fetch leaves error:", error);
      } finally {
        setLoadingLeaves(false);
      }
    };
    fetchLeaves();
  }, []);

  // ── FETCH USERS WHEN TAB SWITCHES TO USERS ────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "Users" || users.length > 0) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await userApi.getAllUsers();
        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Fetch users error:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [activeTab, users.length]);

  // ── APPROVE / REJECT HANDLER ─────────────────────────────────────────────────
  const handleStatusUpdate = async (leaveId, status) => {
    const adminNote = status === "Rejected"
      ? window.prompt("Optional: Enter a reason for rejection") || ""
      : "";

    setActionId(leaveId);
    try {
      await leaveApi.updateLeaveStatus(leaveId, { status, adminNote });
      toast.success(`Leave ${status.toLowerCase()} successfully`);

      // Update the leave in local state without re-fetching
      setLeaves((prev) =>
        prev.map((l) =>
          l._id === leaveId ? { ...l, status, adminNote } : l
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setActionId(null);
    }
  };

  // ── DELETE USER HANDLER ───────────────────────────────────────────────────────
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await userApi.deleteUser(userId);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Delete user error:", error);
    }
  };

  // ── FILTERED LEAVES ───────────────────────────────────────────────────────────
  const filteredLeaves =
    activeTab === "All Leaves"
      ? leaves
      : leaves.filter((l) => l.status === activeTab);

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

      <main className="container mx-auto pt-32 pb-20 px-8 max-w-6xl">

        {/* ── HEADER ── */}
        <div className="flex items-end justify-between mb-12 border-b border-stone-900 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck size={24} className="text-orange-600" strokeWidth={1.5} />
              <span className="font-mono text-xs text-orange-600 tracking-widest uppercase">Admin Control</span>
            </div>
            <h1 className="font-serif text-5xl italic text-stone-900">Command Centre.</h1>
          </div>

          {/* Summary stats */}
          <div className="hidden md:flex gap-8">
            <div className="text-right">
              <div className="font-serif text-3xl">{leaves.length}</div>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest">Total</div>
            </div>
            <div className="text-right">
              <div className="font-serif text-3xl text-orange-500">
                {leaves.filter((l) => l.status === "Pending").length}
              </div>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest">Pending</div>
            </div>
            <div className="text-right">
              <div className="font-serif text-3xl text-stone-400">
                {users.length || "—"}
              </div>
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-widest">Users</div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 mb-8 border-b border-stone-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                activeTab === tab
                  ? "text-stone-900 border-b-2 border-stone-900 -mb-px"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {tab}
              {tab === "Pending" && (
                <span className="ml-2 bg-orange-100 text-orange-600 rounded-full px-1.5 py-0.5 text-[9px]">
                  {leaves.filter((l) => l.status === "Pending").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── LEAVE TABLES ── */}
        {activeTab !== "Users" && (
          <>
            {loadingLeaves ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-stone-400" />
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="text-center py-20">
                <FileText size={48} strokeWidth={1} className="mx-auto text-stone-200 mb-4" />
                <p className="font-serif text-2xl italic text-stone-400">No applications found.</p>
              </div>
            ) : (
              <div className="border-t-2 border-stone-200">
                {filteredLeaves.map((leave) => {
                  const statusConfig = STATUS_CONFIG[leave.status] || STATUS_CONFIG.Pending;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={leave._id}
                      className="flex flex-col md:flex-row md:items-center py-5 border-b border-stone-200 hover:bg-white transition-colors px-4 -mx-4 gap-3"
                    >
                      {/* Employee info */}
                      <div className="w-full md:w-1/5">
                        <div className="font-semibold text-sm">{leave.user?.name}</div>
                        <div className="font-mono text-[10px] text-stone-400">{leave.user?.department}</div>
                      </div>

                      {/* Leave type */}
                      <div className="w-full md:w-1/5">
                        <div className="font-serif italic text-lg text-stone-700">{leave.leaveType}</div>
                        <div className="font-mono text-[10px] text-stone-400">{leave.numberOfDays} day(s)</div>
                      </div>

                      {/* Dates */}
                      <div className="w-full md:w-1/5">
                        <div className="flex items-center gap-1.5 text-sm text-stone-600">
                          <Calendar size={13} className="text-stone-300" />
                          {formatDate(leave.fromDate)}
                        </div>
                        <div className="font-mono text-[10px] text-stone-400 pl-5">
                          to {formatDate(leave.toDate)}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="w-full md:w-1/5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusConfig.classes}`}>
                          <StatusIcon size={11} />
                          {leave.status}
                        </span>
                        {leave.adminNote && (
                          <p className="text-xs text-stone-400 italic mt-1">"{leave.adminNote}"</p>
                        )}
                      </div>

                      {/* Action Buttons — only for Pending */}
                      <div className="w-full md:w-1/5 flex items-center justify-end gap-2">
                        {leave.status === "Pending" && (
                          <>
                            <Button
                              onClick={() => handleStatusUpdate(leave._id, "Approved")}
                              disabled={actionId === leave._id}
                              size="sm"
                              className="rounded-none bg-stone-800 hover:bg-green-700 text-white text-[10px] uppercase tracking-widest py-4 px-4 h-auto"
                            >
                              {actionId === leave._id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <><CheckCircle size={12} className="mr-1" /> Approve</>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleStatusUpdate(leave._id, "Rejected")}
                              disabled={actionId === leave._id}
                              size="sm"
                              variant="outline"
                              className="rounded-none border-red-200 text-red-400 hover:bg-red-50 text-[10px] uppercase tracking-widest py-4 px-4 h-auto"
                            >
                              <XCircle size={12} className="mr-1" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── USERS TABLE ── */}
        {activeTab === "Users" && (
          <>
            {loadingUsers ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-stone-400" />
              </div>
            ) : (
              <div className="border-t-2 border-stone-200">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-col md:flex-row md:items-center py-5 border-b border-stone-200 hover:bg-white transition-colors px-4 -mx-4"
                  >
                    <div className="w-full md:w-1/4">
                      <div className="font-semibold">{user.name}</div>
                      <div className="font-mono text-[10px] text-stone-400">{user.email}</div>
                    </div>
                    <div className="w-full md:w-1/4 font-mono text-xs text-stone-500">
                      {user.department}
                    </div>
                    <div className="w-full md:w-1/4">
                      <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${
                        user.role === "admin"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-stone-100 text-stone-500"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="w-full md:w-1/4 flex justify-end">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="font-mono text-[10px] text-stone-300 hover:text-red-400 transition-colors uppercase tracking-widest"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}