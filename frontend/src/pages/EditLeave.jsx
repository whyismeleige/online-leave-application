// src/pages/EditLeave.jsx
// Edit an existing pending leave application
// Pre-populates the form with existing data fetched from the API

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { leaveApi } from "@/lib/api/leave.api";
import { toast } from "react-hot-toast";

const LEAVE_TYPES = ["Casual", "Sick", "Paid", "Other"];

export default function EditLeave() {
  const { id } = useParams(); // Get leave ID from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── FETCH EXISTING LEAVE DATA ────────────────────────────────────────────────
  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const response = await leaveApi.getLeave(id);
        const leave = response.data.leave;

        // Cannot edit if not Pending
        if (leave.status !== "Pending") {
          toast.error("Only pending leave applications can be edited");
          navigate("/my-leaves");
          return;
        }

        // Pre-populate the form with existing data
        // Convert ISO date to YYYY-MM-DD format for date inputs
        setFormData({
          leaveType: leave.leaveType,
          fromDate: leave.fromDate.split("T")[0],
          toDate: leave.toDate.split("T")[0],
          reason: leave.reason,
        });
      } catch (error) {
        toast.error("Leave not found");
        navigate("/my-leaves");
      } finally {
        setLoading(false);
      }
    };
    fetchLeave();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.toDate) < new Date(formData.fromDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    setSubmitting(true);
    try {
      await leaveApi.updateLeave(id, formData);
      toast.success("Leave application updated!");
      navigate("/my-leaves");
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-stone-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-900">
      <Navbar />

      <main className="container mx-auto pt-32 pb-20 px-8 max-w-2xl">

        {/* ── HEADER ── */}
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-mono text-xs text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-widest mb-8"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span className="font-mono text-xs text-orange-600 uppercase tracking-widest mb-2 block">
            /// EDIT REQUEST
          </span>
          <h1 className="font-serif text-5xl italic text-stone-900">Update Application.</h1>
        </div>

        {/* ── FORM (same layout as ApplyLeave) ── */}
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Leave Type */}
          <div className="group">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-3">
              Leave Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {LEAVE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, leaveType: type }))}
                  className={`py-3 px-4 border text-xs font-bold uppercase tracking-widest transition-all ${
                    formData.leaveType === type
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-transparent text-stone-600 border-stone-300 hover:border-stone-900"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-orange-600 transition-colors">
                From Date *
              </label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 font-serif text-lg focus:outline-none focus:border-stone-900 transition-colors"
              />
            </div>
            <div className="group">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-orange-600 transition-colors">
                To Date *
              </label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                required
                min={formData.fromDate}
                className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 font-serif text-lg focus:outline-none focus:border-stone-900 transition-colors"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="group">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-orange-600 transition-colors">
              Reason *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={4}
              maxLength={500}
              className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 font-serif italic text-lg focus:outline-none focus:border-stone-900 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-none bg-stone-900 hover:bg-orange-600 text-white h-14 text-xs font-bold tracking-[0.2em] uppercase transition-all disabled:opacity-60"
          >
            {submitting ? <Loader2 className="animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </main>
    </div>
  );
}