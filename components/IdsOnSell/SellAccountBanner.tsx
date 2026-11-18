"use client";

import Link from "next/link";
import { FiDollarSign, FiShield, FiZap, FiChevronRight } from "react-icons/fi";
import { MessageCircle } from "lucide-react";

export default function SellAccountBanner() {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "919178521537";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hello MT Topup! I want to sell my gaming account. Please guide me with the valuation and verification process."
  )}`;

  return (
    <aside aria-label="Sell Account Banner" className="w-full">
      <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <div className="group relative flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500/40 transition-all duration-500 overflow-hidden shadow-xs cursor-pointer">
          {/* Subtle Ambient Glow on Hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/[0.05] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

          <div className="relative z-10 flex items-center gap-2.5 sm:gap-4 min-w-0">
            {/* Overlapping Badges/Icons */}
            <div className="flex items-center -space-x-2 sm:-space-x-2.5 shrink-0 ml-0.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--background)] flex items-center justify-center border-[2px] border-[var(--card)] text-emerald-400 z-30 shadow-xs transition-transform group-hover:scale-105">
                <FiDollarSign size={13} />
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--background)] flex items-center justify-center border-[2px] border-[var(--card)] text-amber-400 z-20 shadow-xs transition-transform group-hover:scale-105 delay-75">
                <FiZap size={13} />
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--background)] flex items-center justify-center border-[2px] border-[var(--card)] text-[var(--accent)] z-10 shadow-xs transition-transform group-hover:scale-105 delay-150">
                <FiShield size={13} />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col justify-center min-w-0">
              <h3 className="text-[12px] sm:text-[14px] font-black italic tracking-wide text-[var(--foreground)] leading-tight uppercase drop-shadow-xs truncate">
                Want to sell your account? Contact Us
              </h3>
              <p className="text-[8px] sm:text-[10px] font-bold text-[var(--muted)] mt-0.5 tracking-[0.08em] uppercase flex items-center gap-1.5 truncate">
                Instant Valuation <span className="text-[var(--muted)]/50 text-[6px]">●</span> Fast Payout <span className="text-[var(--muted)]/50 text-[6px]">●</span> 100% Safe Escrow
              </p>
            </div>
          </div>

          {/* Action Button (Desktop) */}
          <div className="relative z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-colors uppercase tracking-wider shrink-0 ml-2">
            <MessageCircle size={13} />
            <span>Sell on WhatsApp</span>
            <FiChevronRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Action Button (Mobile) */}
          <div className="sm:hidden relative z-10 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0 ml-1">
            <FiChevronRight size={14} />
          </div>
        </div>
      </Link>
    </aside>
  );
}
