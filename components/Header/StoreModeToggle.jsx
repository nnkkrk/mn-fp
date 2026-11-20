"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2, Store } from "lucide-react";

export default function StoreModeToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTradeActive = Boolean(pathname?.startsWith("/idsonsell"));
  const isTopupActive = !isTradeActive;

  const handleToggle = (mode) => {
    if (mode === "topup" && !isTopupActive) {
      router.push("/");
    } else if (mode === "trade" && !isTradeActive) {
      router.push("/idsonsell");
    }
  };

  return (
    <div
      role="group"
      aria-label="Mode Switcher"
      className="relative inline-flex items-center p-1 rounded-full bg-[var(--foreground)]/[0.04] dark:bg-white/[0.06] border border-[var(--border)] shadow-xs select-none backdrop-blur-md"
    >
      {/* Sliding Active Pill Background */}
      {mounted && (
        <motion.div
          className="absolute top-1 bottom-1 rounded-full bg-[var(--accent)] shadow-sm shadow-[var(--accent)]/30 pointer-events-none"
          initial={false}
          animate={{
            left: isTradeActive ? "calc(50% + 1px)" : "4px",
            right: isTradeActive ? "4px" : "calc(50% + 1px)",
          }}
          transition={{ type: "spring", stiffness: 450, damping: 32 }}
        />
      )}

      {/* Button 1: Game Store (🎮 Store) */}
      <button
        onClick={() => handleToggle("topup")}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer whitespace-nowrap ${
          isTopupActive
            ? "text-white"
            : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
        }`}
        aria-label="Game Store"
        title="Game Store"
      >
        <Gamepad2
          size={13}
          strokeWidth={2.4}
          className={`shrink-0 transition-transform duration-200 ${
            isTopupActive ? "scale-110 text-white fill-white/20" : ""
          }`}
        />
        <span className="whitespace-nowrap">Store</span>
      </button>

      {/* Button 2: Trade / ID Marketplace (🏷️ Trade) */}
      <button
        onClick={() => handleToggle("trade")}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer whitespace-nowrap ${
          isTradeActive
            ? "text-white"
            : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
        }`}
        aria-label="ID Marketplace / Trade"
        title="ID Marketplace / Trade"
      >
        <Store
          size={13}
          strokeWidth={2.4}
          className={`shrink-0 transition-transform duration-200 ${
            isTradeActive ? "scale-110 text-white fill-white/20" : ""
          }`}
        />
        <span className="whitespace-nowrap">Trade</span>
      </button>
    </div>
  );
}
