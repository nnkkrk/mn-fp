"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowRight, FiRefreshCw } from "react-icons/fi";
import { BuffyMascot } from "@/components/mascots";

export default function Maintaince() {
  const [show] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggedIn] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("token")
  );

  const handleLoggingOff = () => {
    setIsLoggingOut(true);
    const keysToRemove = [
      "token",
      "userName",
      "email",
      "userId",
      "phone",
      "userType",
      "walletBalance",
      "pending_topup_order",
      "avatar",
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("mlbb_verified_players");
    setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 overflow-y-auto bg-white select-none">
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[360px] p-6 text-center z-10"
          >
            {/* Buff-y Mascot holding the logo (thinking pose) */}
            <div className="flex justify-center mb-4">
              <BuffyMascot mood="thinking" size="md">
                <Image
                  src="/logoBB.png"
                  alt="Logo"
                  width={110}
                  height={32}
                  priority
                  className="h-7 w-auto object-contain"
                />
              </BuffyMascot>
            </div>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-[11px] font-bold tracking-wide mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Maintenance</span>
            </div>

            {/* Minimal Heading & Copy */}
            <h1 className="text-xl font-black text-slate-900 tracking-tight mb-1.5">
              We&apos;ll Be Right Back
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed mb-5 max-w-[270px] mx-auto">
              Quick update in progress. Your orders &amp; diamonds are safe.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full mb-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <FiRefreshCw size={13} />
                <span>Refresh</span>
              </button>

              <a
                href="https://whatsapp.com/channel/0029Vb87jgR17En1n5PKy129"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 hover:shadow-md transition-all active:scale-[0.98] group"
              >
                <FaWhatsapp size={15} />
                <span>WhatsApp Updates</span>
                <FiArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Staff Login / Logout */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              {!isLoggedIn ? (
                <button
                  onClick={handleLogin}
                  className="hover:text-slate-700 transition-colors cursor-pointer font-semibold"
                >
                  Staff login →
                </button>
              ) : !isLoggingOut ? (
                <button
                  onClick={handleLoggingOff}
                  className="hover:text-red-500 transition-colors cursor-pointer font-semibold"
                >
                  Log out
                </button>
              ) : (
                <span className="text-slate-400 animate-pulse">Logging out...</span>
              )}

              <span className="text-[9px] tracking-wider uppercase text-slate-300 font-bold">
                © 2026 MLBBTOPUP
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
