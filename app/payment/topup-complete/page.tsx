"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import api from "@/lib/axios";
import { Icons } from "@/components/icons";
import { CopyButton, LoadingSpinner } from "@/components/common";
import { BuffyMascot } from "@/components/mascots";
import { formatCurrency } from "@/utils";

// --- Types ---
interface OrderData {
  orderId: string;
  gameSlug: string;
  itemName: string;
  price: number;
  playerId: string;
  status: string;
}

export default function TopupComplete() {
  const [status, setStatus] = useState("checking"); // checking | success | failed
  const [message, setMessage] = useState("Verifying payment...");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds timeout
  const [pollInterval, setPollInterval] = useState(3000); // 3 seconds

  // --- Initialization ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlOrderId = urlParams.get("orderId");
    const storedOrderId = urlOrderId || localStorage.getItem("pending_topup_order");
    if (storedOrderId) {
      setOrderId(storedOrderId);
    } else {
      setStatus("failed");
      setMessage("Order not found");
    }
  }, []);

  // --- Fetch Order Details ---
  const fetchOrderDetails = useCallback(async (id: string) => {
    try {
      const { data } = await api.post("/api/order/user", { search: id, limit: 1 });
      if (data.success && data.orders?.length > 0) {
        setOrderData(data.orders[0]);
      }
    } catch (err) {
      console.error("Fetch order details error:", err);
    }
  }, []);

  // --- Verification Logic ---
  useEffect(() => {
    if (!orderId || status === "success" || status === "failed" && message !== "Order not found") return;

    let isMounted = true;
    const startTime = Date.now();

    // Check if wallet payment
    const urlParams = new URLSearchParams(window.location.search);
    const isWalletPayment = urlParams.get("wallet") === "true";
    if (isWalletPayment) {
      setMessage("Almost done...");
    }

    const verify = async () => {
      try {
        const { data } = await api.post("/api/order/verify-topup-payment", { orderId });

        // Update message based on internal state
        if (data.topupStatus === "processing") {
          setMessage("Sending your top-up...");
        }

        return data;
      } catch (err) {
        console.error("Topup verification error:", err);
        return { success: false };
      }
    };

    const poll = async () => {
      if (!isMounted) return;

      const result = await verify();

      if (result.success) {
        if (isMounted) {
          setStatus("success");
          setMessage("Payment done!");
          localStorage.removeItem("pending_topup_order");
          fetchOrderDetails(orderId);
        }
        return;
      }

      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed < 90) {
        const remaining = Math.max(0, 90 - Math.floor(elapsed));
        setTimeLeft(remaining);
        setTimeout(poll, pollInterval);
      } else {
        if (isMounted) {
          setStatus("failed");
          setMessage("Taking too long...");
        }
      }
    };

    poll();

    return () => {
      isMounted = false;
    };
  }, [orderId, pollInterval, fetchOrderDetails]);

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
        console.error("Confetti effect failed:", err);
      }
    }
  }, [status]);

  // --- Variants ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-[var(--background)] relative overflow-hidden px-4 pt-16 sm:pt-24 pb-8">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(var(--accent) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md z-10"
      >
        <div className="relative">
          <AnimatePresence mode="wait">
            {/* --- CHECKING STATE --- */}
            {status === "checking" && (
              <motion.div
                key="checking"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center text-center py-4"
              >
                <div className="relative mb-4 flex items-center justify-center">
                  <div className="relative w-44 h-44 rounded-full border-2 border-[var(--accent)]/15 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[var(--accent)]"
                    />
                    <BuffyMascot mood="loading" size="md" speech="Checking..." />
                  </div>
                </div>

                <h1 className="text-xl font-black italic uppercase tracking-tight mb-2">
                  {message}
                </h1>
                <p className="text-[var(--muted)] text-xs mb-6 px-4">
                  Don't close this page. We are checking your payment.
                </p>

                <div className="w-full max-w-[280px]">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Checking...</span>
                    <span className="text-[10px] font-mono text-[var(--muted)]">{timeLeft}s left</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / 90) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- SUCCESS STATE --- */}
            {status === "success" && (
              <motion.div
                key="success"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                {/* Success Header */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="mb-2">
                    <BuffyMascot mood="happy" size="md" speech="Success!" />
                  </div>
                  <h1 className="text-2xl font-black italic uppercase tracking-tighter text-emerald-500 mb-1">
                    RECHARGE SUCCESSFUL
                  </h1>
                  <p className="text-[var(--muted)] text-xs">
                    Your order is complete. Diamonds have been sent!
                  </p>
                </div>

                {/* Order Details Panel */}
                <div
                  className="w-full py-4 mb-6 space-y-3 border-y border-[var(--border)]/10"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[var(--muted)] font-medium uppercase tracking-wider">Your Order</span>
                    <span className="bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded font-mono">DONE</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-[var(--muted)] uppercase font-bold tracking-widest">Order ID</p>
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-mono truncate">{orderId || "---"}</p>
                        {orderId && <CopyButton text={orderId} size="xs" variant="ghost" className="p-0.5" />}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-[var(--muted)] uppercase font-bold tracking-widest">Item</p>
                      <p className="text-xs font-bold truncate">{orderData?.itemName || "Digital Product"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-[var(--muted)] uppercase font-bold tracking-widest">Player ID</p>
                      <p className="text-xs font-mono">{orderData?.playerId || "---"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-[var(--muted)] uppercase font-bold tracking-widest">You Paid</p>
                      <p className="text-xs font-black text-[var(--accent)]">{orderData?.price ? formatCurrency(orderData.price) : "---"}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-2">
                  <button aria-label="button"
                    onClick={() => (window.location.href = "/dashboard/orders")}
                    className="w-fit px-10 mx-auto group rounded-xl bg-[var(--accent)] py-2.5 font-black italic uppercase tracking-wide !text-white hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20"
                  >
                    <Icons.history className="text-sm" />
                    See My Orders
                    <Icons.arrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button aria-label="button"
                    onClick={() => (window.location.href = "/")}
                    className="w-fit px-10 mx-auto rounded-xl border border-[var(--border)] py-2.5 font-bold text-[var(--foreground)] text-sm hover:bg-[var(--muted)]/5 transition flex items-center justify-center gap-2"
                  >
                    <Icons.home className="text-sm" />
                    Home
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- FAILED / PENDING STATE --- */}
            {status === "failed" && (
              <motion.div
                key="failed"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="mb-2">
                    <BuffyMascot
                      mood="error"
                      size="md"
                      speech={message === "Order not found" ? "Not Found!" : "Oops!"}
                    />
                  </div>
                  <h1 className="text-xl font-black italic uppercase tracking-tighter text-yellow-500 mb-1">
                    {message === "Order not found" ? "ORDER NOT FOUND" : "STILL CHECKING..."}
                  </h1>
                  <p className="text-[var(--muted)] text-xs max-w-[280px]">
                    {message === "Order not found"
                      ? "We could not find this order. Please contact support."
                      : "This is taking longer than usual. Don't worry, your money is safe."}
                  </p>
                </div>

                {/* Support Notice Box */}
                <div
                  className="w-full py-4 mb-6 border-y border-yellow-500/10"
                >
                  <div className="flex items-start gap-3 text-[11px]">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-yellow-500">i</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[var(--foreground)] leading-relaxed">
                        Your top-up will be done within <strong className="text-yellow-500">10–15 mins</strong>. If not, we will refund the money to your wallet.
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[var(--muted)] font-mono text-[9px]">
                          REF: {orderId || "N/A"}
                        </p>
                        {orderId && <CopyButton text={orderId} size="xs" variant="ghost" className="p-0.5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-2">
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}?text=Hi, my order ${orderId} is pending. Please check.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit px-10 mx-auto rounded-xl bg-[#128C7E] py-2.5 font-black italic uppercase tracking-wide !text-white flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                  >
                    <Icons.whatsapp className="text-lg" />
                    Chat on WhatsApp
                  </a>

                  <button aria-label="button"
                    onClick={() => (window.location.href = "/")}
                    className="w-fit px-10 mx-auto rounded-xl border border-[var(--border)] py-2.5 font-bold text-[var(--foreground)] text-sm hover:bg-[var(--muted)]/5 transition flex items-center justify-center gap-2"
                  >
                    <Icons.home className="text-sm" />
                    Home
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
