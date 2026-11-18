"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, Store } from "lucide-react";

export default function HomeMarketplaceSection() {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "916383038691";
  const sellWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi, I want to sell my MLBB account on your marketplace."
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 space-y-3">
      {/* ── HEADER BANNER ─────────────────────────────────────────── */}
      <div className="rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-tight text-[var(--foreground)]">
              Buy, Sell & Rent <span className="text-[var(--accent)]">Gaming IDs</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-[var(--muted)] font-medium">
              Verified MLBB accounts with instant delivery & buyer protection
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={sellWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-black text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              <MessageCircle size={14} />
              <span>Sell Your ID</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── VIEW ALL ACCOUNTS IN MARKETPLACE CTA ────────────────────── */}
      <div className="text-center pt-1">
        <Link
          href="/idsonsell"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-2xl bg-[var(--card)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] hover:border-[var(--accent)] text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-xs group"
        >
          <Store size={16} />
          <span>View All Accounts in Full Marketplace</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
