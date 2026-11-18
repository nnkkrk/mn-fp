"use client";

import { motion } from "framer-motion";
import { Zap, Store, ShieldCheck, Gamepad2 } from "lucide-react";

export type HomeTabType = "topup" | "marketplace";

interface HomeTabSwitcherProps {
  activeTab: HomeTabType;
  onChange: (tab: HomeTabType) => void;
}

export default function HomeTabSwitcher({ activeTab, onChange }: HomeTabSwitcherProps) {
  const tabs = [
    {
      id: "topup" as const,
      label: "Game Topup",
      shortLabel: "Top Up",
      badge: "Instant",
      icon: Zap,
    },
    {
      id: "marketplace" as const,
      label: "ID Marketplace",
      shortLabel: "ID Market",
      badge: "Verified",
      icon: Store,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 my-2 sm:my-3">
      <div className="flex items-center justify-center">
        {/* Segmented Pill Container */}
        <div 
          role="tablist"
          aria-label="Store Mode Switcher"
          className="relative inline-flex items-center w-full max-w-md p-1 sm:p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm backdrop-blur-md"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-colors duration-200 select-none z-10 cursor-pointer ${
                  isActive
                    ? "text-white"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {/* Active Sliding Pill Background */}
                {isActive && (
                  <motion.div
                    layoutId="home-active-tab-indicator"
                    className="absolute inset-0 rounded-xl bg-[var(--accent)] shadow-md shadow-[var(--accent)]/25"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}

                {/* Content */}
                <span className="relative z-10 flex items-center gap-1.5 shrink-0">
                  <Icon
                    size={16}
                    strokeWidth={2.4}
                    className={`transition-transform duration-200 ${
                      isActive ? "scale-110 text-white" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="inline sm:hidden">{tab.shortLabel}</span>
                </span>

                {/* Micro Badge */}
                <span
                  className={`relative z-10 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight transition-all shrink-0 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--foreground)]/5 text-[var(--muted)]"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
