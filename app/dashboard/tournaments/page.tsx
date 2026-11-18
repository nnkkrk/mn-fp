"use client";

import AuthGuard from "@/components/AuthGuard";
import JoinedTournaments from "@/components/Dashboard/JoinedTournaments";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronLeft, FiAward, FiMessageCircle } from "react-icons/fi";

export default function MyTournamentsPage() {
  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-8 pb-32 space-y-3.5 sm:space-y-5">

        {/* ── COMPACT HEADER ── */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border)]">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-[8px] sm:text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/60 hover:text-[var(--foreground)] transition-colors mb-0.5"
            >
              <FiChevronLeft size={11} /> Dashboard
            </Link>
            <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-[var(--foreground)] leading-none">
              My <span className="text-[var(--accent)]">Tournaments</span>
            </h1>
          </div>

          <Link 
            href="/tournament" 
            style={{ color: "#ffffff", backgroundColor: "var(--accent)" }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[var(--accent)] !text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <FiAward size={11} /> 
            <span>+ Join Event</span>
          </Link>
        </div>

        {/* ── THE LIST COMPONENT ── */}
        <JoinedTournaments hideTitle />
      </div>
    </AuthGuard>
  );
}
