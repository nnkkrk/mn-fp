"use client";

import { motion } from "framer-motion";
import { Zap, Store } from "lucide-react";

export type HomeTabType = "topup" | "marketplace";

interface HomeTabSwitcherProps {
  activeTab: HomeTabType;
  onChange: (tab: HomeTabType) => void;
}

export default function HomeTabSwitcher({ activeTab, onChange }: HomeTabSwitcherProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 my-2 sm:my-3">
      <div className="flex items-center justify-center">
        {/* Segmented Pill Container */}
        <div 
          role="tablist"
          aria-label="Store Mode Switcher"
          className="relative inline-flex items-center w-full max-w-md p-1 sm:p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm backdrop-blur-md overflow-hidden"
        >
          {/* Animated Sliding Pill Indicator */}
          <motion.div
            className="absolute top-1 sm:top-1.5 bottom-1 sm:bottom-1.5 rounded-xl bg-[var(--accent)] shadow-md shadow-[var(--accent)]/25 pointer-events-none"
            initial={false}
            animate={{
              left: activeTab === "topup" ? "4px" : "calc(50% + 2px)",
              width: "calc(50% - 6px)",
            }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />

          {/* TAB 1: TOP UP */}
          <button
            role="tab"
            aria-selected={activeTab === "topup"}
            onClick={() => onChange("topup")}
            className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-colors duration-200 select-none z-10 cursor-pointer ${
              activeTab === "topup"
                ? "text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="flex items-center gap-1.5 shrink-0">
              <Zap
                size={16}
                strokeWidth={2.4}
                className={`transition-transform duration-200 ${
                  activeTab === "topup" ? "scale-110 text-white" : ""
                }`}
              />
              <span className="hidden sm:inline">Game Topup</span>
              <span className="inline sm:hidden">Top Up</span>
            </span>

            <span
              className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight transition-all shrink-0 ${
                activeTab === "topup"
                  ? "bg-white/20 text-white"
                  : "bg-[var(--foreground)]/5 text-[var(--muted)]"
              }`}
            >
              Instant
            </span>
          </button>

          {/* TAB 2: ID MARKET */}
          <button
            role="tab"
            aria-selected={activeTab === "marketplace"}
            onClick={() => onChange("marketplace")}
            className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-colors duration-200 select-none z-10 cursor-pointer ${
              activeTab === "marketplace"
                ? "text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="flex items-center gap-1.5 shrink-0">
              <Store
                size={16}
                strokeWidth={2.4}
                className={`transition-transform duration-200 ${
                  activeTab === "marketplace" ? "scale-110 text-white" : ""
                }`}
              />
              <span className="hidden sm:inline">ID Marketplace</span>
              <span className="inline sm:hidden">ID Market</span>
            </span>

            <span
              className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight transition-all shrink-0 ${
                activeTab === "marketplace"
                  ? "bg-white/20 text-white"
                  : "bg-[var(--foreground)]/5 text-[var(--muted)]"
              }`}
            >
              Verified
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
