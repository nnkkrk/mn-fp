"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiRefreshCw, FiCalendar } from "react-icons/fi";
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

function formatGameName(slug?: string): string {
  if (!slug) return "";
  const s = slug.toLowerCase();
  if (s.includes("sgmy")) return "SG/MY MLBB";
  if (s.includes("double")) return "MLBB Double";
  if (s.includes("philippines") || s.includes("mlbb-ph")) return "MLBB PH";
  if (s.includes("mobile-legends") || s.includes("mlbb")) return "Mobile Legends";
  if (s.includes("bgmi") || s.includes("pubg")) return "BGMI";
  if (s.includes("honor-of-kings")) return "Honor of Kings";
  if (s.includes("genshin")) return "Genshin Impact";
  if (s.includes("starlight")) return "Starlight";
  return slug
    .replace(/\d+$/, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Compact, user-specific home summary card showing:
 * - Wallet balance (non-clickable stat)
 * - Total order count (non-clickable stat)
 * - Last order item, price, date & one-tap Reorder
 * Only renders for authenticated users.
 */
export default function UserQuickSummary() {
  const { token, user, walletBalance, _hasHydrated } = useAuthStore();
  const [latestOrder, setLatestOrder] = useState<LatestOrder | null>(null);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const isAuthenticated = _hasHydrated && Boolean(token && user);

  useEffect(() => {
    if (!isAuthenticated) {
      setLatestOrder(null);
      setTotalOrders(0);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

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
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

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
        <div className="rounded-2xl border border-[var(--border)]/80 bg-[var(--card)]/95 p-3 sm:p-3.5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          {/* Top / Left: Non-clickable Wallet & Total Orders */}
          <div className="grid grid-cols-2 md:flex md:items-center gap-3 sm:gap-5">
            {/* Wallet */}
            <div className="flex items-center gap-2.5 md:min-w-[150px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 shrink-0"
                aria-hidden="true"
              >
                <rect x="2.5" y="5.5" width="19" height="14" rx="3.5" fill="#3b82f6" fillOpacity="0.16" />
                <path
                  d="M4.5 5.5H17.5C18.88 5.5 20 6.62 20 8V9.5H15.5C14.12 9.5 13 10.62 13 12C13 13.38 14.12 14.5 15.5 14.5H20V16C20 17.38 18.88 18.5 17.5 18.5H4.5C3.12 18.5 2 17.38 2 16V8C2 6.62 3.12 5.5 4.5 5.5Z"
                  fill="#2563eb"
                />
                <rect x="13.5" y="10" width="8" height="4" rx="2" fill="#38bdf8" />
                <circle cx="16" cy="12" r="1" fill="#ffffff" />
              </svg>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-[var(--muted)] leading-none mb-1">
                  Wallet
                </p>
                <p className="text-sm sm:text-base font-black text-[var(--foreground)] tabular-nums truncate">
                  {!isAuthenticated ? "—" : `₹${Number(walletBalance || 0).toFixed(2)}`}
                </p>
              </div>
            </div>

            {/* Total Orders */}
            <div className="flex items-center gap-2.5 md:min-w-[140px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M5 8.5C5 7.67 5.67 7 6.5 7H17.5C18.33 7 19 7.67 19 8.5V18C19 19.66 17.66 21 16 21H8C6.34 21 5 19.66 5 18V8.5Z"
                  fill="#10b981"
                />
                <path
                  d="M8.5 7V5.8C8.5 4.25 9.75 3 11.3 3H12.7C14.25 3 15.5 4.25 15.5 5.8V7"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9.5 14L11.2 15.7L14.8 12"
                  stroke="#ffffff"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-[var(--muted)] leading-none mb-1">
                  Total Orders
                </p>
                <p className="text-sm sm:text-base font-black text-[var(--foreground)] tabular-nums truncate">
                  {!isAuthenticated || loading ? "—" : totalOrders}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom / Right: Last Order + Reorder */}
          <div className="flex items-center justify-between md:justify-end gap-3 pt-2.5 md:pt-0 border-t md:border-t-0 border-[var(--border)]/60">
            {!isAuthenticated ? (
              <div className="flex items-center justify-between w-full md:w-auto gap-3">
                <span className="text-xs text-[var(--muted)] font-medium">Login to view orders</span>
                <Link
                  href="/login"
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[var(--accent)] to-blue-600 text-white text-xs font-semibold hover:brightness-105 transition-all"
                >
                  Login
                </Link>
              </div>
            ) : loading ? (
              <div className="h-8 w-44 rounded-lg bg-[var(--foreground)]/[0.06] animate-pulse" />
            ) : latestOrder ? (
              <>
                <div className="min-w-0 text-left md:text-right">
                  <div className="flex items-center md:justify-end gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.06] text-[var(--muted)] shrink-0">
                      Last
                    </span>
                    <p className="text-xs sm:text-[13px] font-extrabold text-[var(--foreground)] truncate max-w-[130px] sm:max-w-[180px]">
                      {latestOrder.itemName}
                    </p>
                    {latestOrder.gameSlug && (
                      <span className="text-[11px] font-bold text-[var(--accent)] truncate max-w-[110px] shrink-0">
                        · {formatGameName(latestOrder.gameSlug)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--muted)] flex items-center md:justify-end gap-1 mt-0.5">
                    <FiCalendar size={10} />
                    <span>{formattedDate}</span>
                  </p>
                </div>

                <Link
                  href={reorderHref}
                  onClick={handleReorderClick}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[var(--accent)] to-blue-600 text-white text-xs font-semibold hover:brightness-105 active:scale-[0.98] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_12px_-3px_rgba(var(--accent-rgb),0.45)]"
                >
                  <FiRefreshCw size={12} />
                  <span>Reorder</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center justify-between w-full md:w-auto gap-3">
                <span className="text-xs text-[var(--muted)] font-medium">No orders yet</span>
                <Link
                  href="/games"
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[var(--accent)] to-blue-600 text-white text-xs font-semibold hover:brightness-105 transition-all"
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
