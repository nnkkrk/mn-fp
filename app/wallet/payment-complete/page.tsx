"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { Icons } from "@/components/icons";
import { BuffyMascot } from "@/components/mascots";

export default function PaymentComplete() {
  const [status, setStatus] = useState("checking"); // checking | success | failed | delayed
  const [message, setMessage] = useState("Checking payment...");

  useEffect(() => {
    const orderId = localStorage.getItem("pending_order");

    if (!orderId) {
      setStatus("failed");
      setMessage("Order not found");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10; // 30 seconds (3s interval)

    async function checkPayment() {
      if (attempts >= maxAttempts) {
        setStatus("delayed");
        setMessage("Verification pending");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/wallet/check-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();

        if (data?.success) {
          setStatus("success");
          setMessage("Payment successful");

          const oldBal = useAuthStore.getState().walletBalance;
          const newBal = oldBal + Number(data.amount || 0);
          useAuthStore.getState().setWalletBalance(newBal);
          localStorage.removeItem("pending_order");
        } else {
          // Retry
          attempts++;
          setTimeout(checkPayment, 3000);
        }
      } catch (err) {
        console.error("Payment check error:", err);
        attempts++;
        setTimeout(checkPayment, 3000);
      }
    }

    checkPayment();
  }, []);

  // --- Confetti Effect ---
  useEffect(() => {
    if (status === "success") {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#10b981', '#3b82f6', '#ffffff']
        });
      } catch (err) {
        console.error("Confetti error:", err);
      }
    }
  }, [status]);

  return (
    <div className="min-h-screen flex items-start justify-center bg-[var(--background)] px-6 pt-16 sm:pt-24 pb-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center text-center"
            >
              {/* MASCOT AREA */}
              <div className="mb-4">
                {status === "checking" && (
                  <div className="relative mx-auto flex items-center justify-center">
                    <div className="relative w-44 h-44 rounded-full border-2 border-[var(--accent)]/15 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[var(--accent)]"
                      />
                      <BuffyMascot mood="loading" size="md" speech="Checking..." />
                    </div>
                  </div>
                )}

                {status === "success" && (
                  <BuffyMascot mood="happy" size="md" speech="Added!" />
                )}

                {status === "failed" && (
                  <BuffyMascot mood="error" size="md" speech="Failed!" />
                )}

                {status === "delayed" && (
                  <BuffyMascot mood="thinking" size="md" speech="Hold on..." />
                )}
              </div>

              {/* STATUS MESSAGE */}
              <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-[var(--foreground)]">
                {status === "checking" ? "CHECKING PAYMENT..." :
                  status === "success" ? "PAYMENT DONE!" :
                    status === "failed" ? "PAYMENT FAILED" : "STILL CHECKING..."}
              </h1>

              {/* DESCRIPTION */}
              <div className="text-[var(--muted)] text-xs leading-relaxed max-w-xs mx-auto mb-8">
                {status === "checking" && <p>Please wait. We are verifying your payment.</p>}
                {status === "success" && <p>Money added to your wallet. You can use it now.</p>}
                {status === "delayed" && <p>It's taking a bit longer. Don't worry, your money is safe.</p>}
                {status === "failed" && <p>We could not find your payment. Contact support if money was cut.</p>}
              </div>

              {/* ACTION BUTTONS */}
              <div className="w-full space-y-2 flex flex-col items-center">
                {status === "checking" ? (
                  <div className="px-6 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 font-bold text-[10px] uppercase tracking-wider text-center animate-pulse">
                    Do not refresh or close screen
                  </div>
                ) : (
                  <Link href="/" className="w-fit">
                    <button aria-label="button" className="px-16 py-2.5 rounded-xl bg-[var(--accent)] !text-white font-black italic uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20 hover:bg-[var(--accent-hover)] transition-all">
                      <span>Home</span>
                      <Icons.arrowRight size={14} />
                    </button>
                  </Link>
                )}

                {(status === "delayed" || status === "failed") && (
                  <Link href="/dashboard/support" className="w-fit">
                    <button aria-label="button" className="w-fit px-10 py-2.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-bold text-sm uppercase tracking-wider hover:bg-[var(--muted)]/5 transition-all flex items-center justify-center gap-2">
                      <Icons.helpCircle size={14} />
                      <span>Support</span>
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer Security Badge */}
          <div className="mt-10 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
            <div className="flex items-center gap-1.5">
              <Icons.shieldCheck size={14} className="text-emerald-500" />
              <span>Safe & Secure</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
