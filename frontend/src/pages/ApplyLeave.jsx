// src/pages/ApplyLeave.jsx
// Form page for employees to submit a new leave application

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { leaveApi } from "@/lib/api/leave.api";
import { toast } from "react-hot-toast";

// Leave type options
const LEAVE_TYPES = ["Casual", "Sick", "Paid", "Other"];

export default function ApplyLeave() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple client-side validation
    if (!formData.leaveType) {
      toast.error("Please select a leave type");
      return;
    }
    if (new Date(formData.toDate) < new Date(formData.fromDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    setLoading(true);
    try {
      await leaveApi.applyLeave(formData);
      toast.success("Leave application submitted!");
      navigate("/my-leaves");
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

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
            /// NEW REQUEST
          </span>
          <h1 className="font-serif text-5xl italic text-stone-900">Apply for Leave.</h1>
        </div>

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Leave Type */}
          <div className="group">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-3 group-focus-within:text-orange-600 transition-colors">
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

          {/* Date Range */}
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
                min={new Date().toISOString().split("T")[0]} // Cannot apply for past dates
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
                min={formData.fromDate || new Date().toISOString().split("T")[0]}
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
              placeholder="Briefly explain the reason for your leave..."
              className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 font-serif italic text-lg focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300 resize-none"
            />
            <div className="text-right font-mono text-[10px] text-stone-400 mt-1">
              {formData.reason.length}/500
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-none bg-stone-900 hover:bg-orange-600 text-white h-14 text-xs font-bold tracking-[0.2em] uppercase transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Submit Application"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}