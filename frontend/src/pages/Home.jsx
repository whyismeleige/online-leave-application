// src/pages/Home.jsx
// Public landing page — showcases the app features
// Anyone can view this, whether logged in or not

import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sun, Umbrella, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-orange-200">
      <Navbar />

      <main className="pt-20">

        {/* ── HERO SECTION ── */}
        <section className="container mx-auto border-x border-stone-200 min-h-[80vh] flex flex-col md:flex-row">

          {/* Left: Headline & CTA */}
          <div className="w-full md:w-2/3 p-10 md:p-20 flex flex-col justify-center border-b md:border-b-0 border-stone-200">
            <span className="font-mono text-xs text-orange-600 tracking-widest mb-6">/// WORK-LIFE SYNC</span>
            <h1 className="font-serif text-6xl md:text-8xl leading-[0.9] mb-10 text-stone-900">
              Rest is not <br />
              <span className="italic text-stone-400">idleness.</span>
            </h1>
            <p className="font-serif text-xl md:text-2xl text-stone-600 max-w-lg leading-relaxed mb-12">
              A modern system to manage absence, sabbaticals, and sick leave.
              Because a well-rested team is a high-performing team.
            </p>

            <div className="flex gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="rounded-none bg-orange-600 hover:bg-stone-900 text-white px-10 py-7 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2">
                    Go to Dashboard <ArrowRight size={16} />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button className="rounded-none bg-orange-600 hover:bg-stone-900 text-white px-10 py-7 text-xs font-bold tracking-widest uppercase transition-colors">
                    Start Application
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right: Stats Cards */}
          <div className="w-full md:w-1/3 bg-stone-100 border-l border-stone-200 flex flex-col">
            <div className="flex-1 p-10 border-b border-stone-200 flex flex-col justify-center items-center hover:bg-stone-200 transition-colors group cursor-default">
              <Sun size={48} strokeWidth={1} className="mb-6 text-stone-400 group-hover:text-orange-600 transition-colors" />
              <h3 className="font-serif text-3xl italic mb-2">24 Days</h3>
              <p className="font-mono text-xs tracking-widest text-stone-500">ANNUAL ALLOWANCE</p>
            </div>
            <div className="flex-1 p-10 border-b border-stone-200 flex flex-col justify-center items-center hover:bg-stone-200 transition-colors group cursor-default">
              <Umbrella size={48} strokeWidth={1} className="mb-6 text-stone-400 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-serif text-3xl italic mb-2">Sick Leave</h3>
              <p className="font-mono text-xs tracking-widest text-stone-500">AUTO-APPROVED</p>
            </div>
            <div className="flex-1 p-10 flex flex-col justify-center items-center hover:bg-stone-200 transition-colors group cursor-default">
              <Clock size={48} strokeWidth={1} className="mb-6 text-stone-400 group-hover:text-green-600 transition-colors" />
              <h3 className="font-serif text-3xl italic mb-2">08 Hours</h3>
              <p className="font-mono text-xs tracking-widest text-stone-500">AVG APPROVAL TIME</p>
            </div>
          </div>
        </section>

        {/* ── QUOTE SECTION ── */}
        <section className="bg-stone-900 text-[#FDFBF7] py-24 px-6 text-center">
          <div className="container mx-auto max-w-4xl">
            <p className="font-serif text-4xl md:text-5xl italic leading-tight">
              "To sit with a dog on a hillside on a glorious afternoon is to be back in Eden,
              where doing nothing was not boring—it was peace."
            </p>
            <div className="mt-10 w-20 h-px bg-stone-700 mx-auto"></div>
            <p className="mt-6 font-mono text-xs tracking-[0.3em] text-stone-500 uppercase">Milan Kundera</p>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="container mx-auto border-x border-stone-200 py-24 px-10">
          <span className="font-mono text-xs text-orange-600 tracking-widest mb-8 block">/// THE PROCESS</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-stone-200">
            {[
              { step: "01", title: "Submit Request", desc: "Fill in your leave dates, type, and reason through the portal." },
              { step: "02", title: "Await Review", desc: "Your manager reviews the application and approves or rejects." },
              { step: "03", title: "Track Status", desc: "Get notified and view all your leave history in your ledger." },
            ].map((item, i) => (
              <div key={i} className={`p-12 ${i < 2 ? "border-b md:border-b-0 md:border-r" : ""} border-stone-200 hover:bg-stone-50 transition-colors`}>
                <div className="font-mono text-5xl text-stone-200 mb-6">{item.step}</div>
                <h3 className="font-serif text-2xl italic mb-4">{item.title}</h3>
                <p className="font-mono text-xs text-stone-500 leading-relaxed tracking-wide">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-stone-200 bg-[#FDFBF7] py-12 px-8">
        <div className="container mx-auto flex justify-between items-end">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-2">OFF_SITE</h2>
            <p className="font-mono text-xs text-stone-400 uppercase tracking-wider">Internal HR System v4.0</p>
          </div>
          <p className="font-serif italic text-stone-500 text-sm">© 2026 HR Dept.</p>
        </div>
      </footer>
    </div>
  );
}