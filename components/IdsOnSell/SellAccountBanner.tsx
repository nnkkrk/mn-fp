"use client";

import Link from "next/link";
import { FiDollarSign, FiShield, FiZap, FiChevronRight } from "react-icons/fi";
import { MessageCircle } from "lucide-react";

export default function SellAccountBanner() {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "918118090547";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hello MT Topup! I want to sell my gaming account. Please guide me with the valuation and verification process."
  )}`;

  return (
    <aside aria-label="Sell Account Banner" className="w-full">
      <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <div className="group relative flex items-center justify-between px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500/40 transition-all duration-500 overflow-hidden shadow-xs cursor-pointer">
          {/* Subtle Ambient Glow on Hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/[0.05] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

          <div className="relative z-10 flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
            {/* Overlapping Badges/Icons (Compact) */}
            <div className="flex items-center -space-x-2 shrink-0 ml-0.5">
              <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-full bg-[var(--background)] flex items-center justify-center border-[2px] border-[var(--card)] text-emerald-400 z-30 shadow-xs transition-transform group-hover:scale-105">
                <FiDollarSign size={10} className="sm:w-3 sm:h-3" />
              </div>
              <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-full bg-[var(--background)] flex items-center justify-center border-[2px] border-[var(--card)] text-amber-400 z-20 shadow-xs transition-transform group-hover:scale-105 delay-75">
                <FiZap size={10} className="sm:w-3 sm:h-3" />
              </div>
              <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-full bg-[var(--background)] flex items-center justify-center border-[2px] border-[var(--card)] text-[var(--accent)] z-10 shadow-xs transition-transform group-hover:scale-105 delay-150">
                <FiShield size={10} className="sm:w-3 sm:h-3" />
              </div>
            </div>

            {/* Text Content (Responsive Font Size - Never truncates) */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <h3 className="text-[9.5px] min-[390px]:text-[10.5px] sm:text-[13px] font-black italic tracking-tight sm:tracking-wide text-[var(--foreground)] leading-tight uppercase drop-shadow-xs truncate">
                <span className="hidden min-[360px]:inline">Want to sell your account? Contact Us</span>
                <span className="min-[360px]:hidden">Sell Account? Contact Us</span>
              </h3>
              <p className="text-[7px] min-[390px]:text-[8px] sm:text-[9.5px] font-bold text-[var(--muted)] mt-0.5 tracking-tight uppercase flex items-center gap-1 truncate">
                Instant Valuation <span className="text-[var(--muted)]/50 text-[4px] sm:text-[5px]">●</span> Fast Payout <span className="text-[var(--muted)]/50 text-[4px] sm:text-[5px]">●</span> Safe Escrow
              </p>
            </div>
          </div>

          {/* Action Button (Desktop) */}
          <div className="relative z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-colors uppercase tracking-wider shrink-0 ml-2">
            <MessageCircle size={12} />
            <span>Sell on WhatsApp</span>
            <FiChevronRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Action Button (Mobile) */}
          <div className="sm:hidden relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0 ml-1.5">
            <FiChevronRight size={13} />
          </div>
        </div>
      </Link>
    </aside>
  );
}
