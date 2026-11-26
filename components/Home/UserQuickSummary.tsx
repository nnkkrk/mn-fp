"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCreditCard, FiPackage, FiRefreshCw, FiCalendar } from "react-icons/fi";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useBuyStore } from "@/store/useBuyStore";

interface LatestOrder {
  orderId: string;
  gameSlug: string;
  itemSlug?: string;
  itemName: string;
  price: number;
  createdAt: string;
}

/**
 * Compact, user-specific home summary card showing:
 * - Wallet balance
 * - Total order count
 * - Last order date & item with one-tap Reorder
 * Only renders for authenticated users.
 */
export default function UserQuickSummary() {
  const { token, walletBalance, setWalletBalance, _hasHydrated } = useAuthStore();
  const [latestOrder, setLatestOrder] = useState<LatestOrder | null>(null);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const authToken =
    token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  useEffect(() => {
    if (!authToken) return;

    let mounted = true;

    // Fetch fresh wallet balance + latest order & total count in parallel
    Promise.all([
      api
        .get("/api/auth/me")
        .then((res) => {
          if (!mounted) return;
          const bal = res.data?.user?.wallet ?? res.data?.user?.walletBalance;
          if (typeof bal === "number") {
            setWalletBalance(bal);
          }
        })
        .catch(() => {}),
      api
        .post("/api/order/user", {
          page: 1,
          limit: 1,
          sortBy: "newest",
        })
        .then((res) => {
          if (!mounted || !res.data?.success) return;
          const first = res.data.orders?.[0] || null;
          setLatestOrder(first);
          setTotalOrders(Number(res.data.totalCount) || 0);
        })
        .catch(() => {}),
    ]).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [authToken, setWalletBalance]);

  if (!_hasHydrated && !authToken) return null;
  if (!authToken) return null;

  const formattedDate = latestOrder?.createdAt
    ? new Date(latestOrder.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const reorderHref = latestOrder?.gameSlug
    ? latestOrder.itemSlug
      ? `/games/${latestOrder.gameSlug}/buy/${latestOrder.itemSlug}`
      : `/games/${latestOrder.gameSlug}`
    : "/games";

  const handleReorderClick = () => {
    if (latestOrder?.gameSlug && latestOrder?.itemSlug) {
      useBuyStore.getState().setSelectedBuyItem({
        slug: latestOrder.gameSlug,
        itemSlug: latestOrder.itemSlug,
        name: latestOrder.itemName,
        price: latestOrder.price,
      });
    }
  };

  return (
    <section className="relative py-2 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-3 sm:p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Wallet & Total Orders */}
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <Link
              href="/wallet"
              className="flex items-center gap-2.5 pr-3 sm:pr-5 border-r border-[var(--border)]/70 group"
            >
              <span className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                <FiCreditCard size={16} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] leading-none mb-1">
                  Wallet
                </p>
                <p className="text-sm sm:text-base font-black text-[var(--foreground)] tabular-nums group-hover:text-[var(--accent)] transition-colors">
                  ₹{Number(walletBalance || 0).toFixed(2)}
                </p>
              </div>
            </Link>

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <FiPackage size={16} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] leading-none mb-1">
                  Total Orders
                </p>
                <p className="text-sm sm:text-base font-black text-[var(--foreground)] tabular-nums group-hover:text-[var(--accent)] transition-colors">
                  {loading ? "—" : totalOrders}
                </p>
              </div>
            </Link>
          </div>

          {/* Last Order + Reorder */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]/60">
            {loading ? (
              <div className="h-8 w-44 rounded-xl bg-[var(--foreground)]/[0.06] animate-pulse" />
            ) : latestOrder ? (
              <>
                <div className="min-w-0 text-left sm:text-right">
                  <p className="text-xs font-extrabold text-[var(--foreground)] truncate max-w-[180px] sm:max-w-[220px]">
                    {latestOrder.itemName}
                  </p>
                  <p className="text-[10px] text-[var(--muted)] flex items-center sm:justify-end gap-1 mt-0.5">
                    <FiCalendar size={10} />
                    <span>Last order · {formattedDate}</span>
                  </p>
                </div>

                <Link
                  href={reorderHref}
                  onClick={handleReorderClick}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-sm"
                >
                  <FiRefreshCw size={12} />
                  <span>Reorder</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted)] font-medium">No orders yet</span>
                <Link
                  href="/games"
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:brightness-110 transition-all"
                >
                  Shop Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
