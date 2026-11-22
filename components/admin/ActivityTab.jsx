"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiRefreshCw,
  FiFilter,
  FiShoppingCart,
  FiPocket,
  FiUsers,
  FiMessageSquare,
  FiSmartphone,
  FiZap,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCalendar,
  FiArrowUpRight,
} from "react-icons/fi";
import { formatCurrency } from "@/utils";
import { InfoTooltip, SectionTitle, SearchInput, Pagination, EmptyState } from "@/components/common";

const FILTER_TYPES = [
  { id: "all", label: "All Activity", icon: FiZap },
  { id: "orders", label: "Orders", icon: FiShoppingCart },
  { id: "wallet", label: "Wallet Txns", icon: FiPocket },
  { id: "users", label: "Signups", icon: FiUsers },
  { id: "support", label: "Support", icon: FiMessageSquare },
  { id: "pwa", label: "PWA App", icon: FiSmartphone },
];

const TIME_RANGES = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "7 Days" },
  { id: "month", label: "30 Days" },
  { id: "all", label: "All Time" },
];

export default function ActivityTab({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("today");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const isFilterActive = type !== "all" || timeRange !== "today";

  useEffect(() => {
    setPage(1);
  }, [search]);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("token") || "") : "";
      const adminPin = typeof window !== "undefined" ? (sessionStorage.getItem("adminPin") || "") : "";

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "30",
        type,
      });

      if (search.trim()) params.append("search", search.trim());

      // Timezone-accurate IST filtering
      if (timeRange === "today") {
        const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const y = nowIST.getUTCFullYear();
        const m = nowIST.getUTCMonth();
        const d = nowIST.getUTCDate();
        const startOfTodayIST = new Date(Date.UTC(y, m, d) - 5.5 * 60 * 60 * 1000);
        params.append("startDate", startOfTodayIST.toISOString());
      } else if (timeRange === "yesterday") {
        const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const y = nowIST.getUTCFullYear();
        const m = nowIST.getUTCMonth();
        const d = nowIST.getUTCDate();
        const startOfYesterdayIST = new Date(Date.UTC(y, m, d - 1) - 5.5 * 60 * 60 * 1000);
        const endOfYesterdayIST = new Date(Date.UTC(y, m, d) - 5.5 * 60 * 60 * 1000 - 1);
        params.append("startDate", startOfYesterdayIST.toISOString());
        params.append("endDate", endOfYesterdayIST.toISOString());
      } else if (timeRange === "week") {
        const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        params.append("startDate", last7d.toISOString());
      } else if (timeRange === "month") {
        const last30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        params.append("startDate", last30d.toISOString());
      }

      const res = await fetch(`/api/admin/activity?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-admin-pin": adminPin,
        },
      });

      const data = await res.json();
      if (data && data.success) {
        setEvents(data.events || []);
        setTotalPages(data.totalPages || 1);
        setTotalEvents(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load activity stream", err);
    } finally {
      setLoading(false);
    }
  }, [page, type, search, timeRange]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const formatTimeAgo = (dateInput) => {
    if (!dateInput) return "Just now";
    const date = new Date(dateInput);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const getEventBadge = (event) => {
    if (event.type === "order") {
      if (event.status === "success") {
        return (
          <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            <FiCheckCircle size={9} /> Paid & Delivered
          </span>
        );
      }
      if (event.status === "failed") {
        return (
          <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
            <FiXCircle size={9} /> Failed
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          <FiClock size={9} /> Pending
        </span>
      );
    }

    if (event.type === "wallet") {
      const isCredit = event.statusText?.includes("+");
      return (
        <span
          className={`inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
            isCredit
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-rose-400 bg-rose-500/10 border-rose-500/20"
          }`}
        >
          <FiPocket size={9} /> {event.statusText}
        </span>
      );
    }

    if (event.type === "user") {
      return (
        <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
          <FiUsers size={9} /> Joined
        </span>
      );
    }

    if (event.type === "support") {
      return (
        <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
          <FiMessageSquare size={9} /> Support
        </span>
      );
    }

    if (event.type === "pwa") {
      return (
        <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
          <FiSmartphone size={9} /> Installed
        </span>
      );
    }

    return null;
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "order":
        return <FiShoppingCart size={13} className="text-emerald-400" />;
      case "wallet":
        return <FiPocket size={13} className="text-amber-400" />;
      case "user":
        return <FiUsers size={13} className="text-purple-400" />;
      case "support":
        return <FiMessageSquare size={13} className="text-blue-400" />;
      case "pwa":
        return <FiSmartphone size={13} className="text-cyan-400" />;
      default:
        return <FiZap size={13} className="text-[var(--accent)]" />;
    }
  };

  return (
    <div className="w-full space-y-3 pb-8 max-w-7xl mx-auto">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 px-1 py-1">
        {/* Search, Filter Toggle & Refresh */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search user, product, email..."
              size="sm"
            />
          </div>

          {/* Date / Filter Toggle Button showing active selection */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              showFilters || isFilterActive
                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                : "text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06]"
            }`}
            title="Change timeframe or filter"
          >
            <FiCalendar size={13} className="text-[var(--accent)]" />
            <span>
              {TIME_RANGES.find((t) => t.id === timeRange)?.label || "Today"}
            </span>
            {type !== "all" && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => fetchActivity()}
            disabled={loading}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0"
            title="Refresh feed"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>
        </div>
      </div>

      {/* ── Collapsible Filters Drawer ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--card)]/80 border border-[var(--border)] rounded-2xl p-3 space-y-3 backdrop-blur-md">
              {/* Type Filter Chips */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Event Category:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
                  {FILTER_TYPES.map((f) => {
                    const Icon = f.icon;
                    const active = type === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setType(f.id);
                          setPage(1);
                        }}
                        className={`h-7 px-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
                          active
                            ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-xs"
                            : "bg-[var(--background)]/60 border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <Icon size={11} className={active ? "text-[var(--background)]" : "text-[var(--muted)]"} />
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Range Pills & Reset */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[var(--border)]/50">
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)] mr-1 shrink-0">
                    Timeframe:
                  </span>
                  {TIME_RANGES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTimeRange(t.id);
                        setPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        timeRange === t.id
                          ? "bg-[var(--accent)] text-white shadow-xs"
                          : "bg-[var(--background)]/80 text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]/70"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {isFilterActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setType("all");
                      setTimeRange("today");
                      setSearch("");
                      setPage(1);
                    }}
                    className="text-[9px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-wider transition-colors cursor-pointer self-end sm:self-auto"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Activity List Stream (Flat, High Density) ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {loading && events.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--muted)] flex flex-col items-center gap-2">
            <FiRefreshCw size={18} className="animate-spin text-[var(--accent)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Loading activity stream...</span>
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No Activity Found"
            description="No event records matched your current filters."
            size="sm"
            variant="plain"
          />
        ) : (
          <div className="divide-y divide-[var(--border)]/50">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-2.5 sm:px-3.5 sm:py-2.5 hover:bg-[var(--foreground)]/[0.02] transition-colors flex items-center justify-between gap-2.5"
              >
                {/* Left Side: Icon + Title & Subtitle */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7.5 h-7.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center justify-center shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-[var(--foreground)] truncate tracking-tight">
                        {event.title}
                      </h4>
                      {getEventBadge(event)}
                    </div>
                    <p className="text-[10px] text-[var(--muted)] truncate font-mono mt-0.5">
                      {event.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Side: Amount + Time Ago + Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    {event.amount !== null && event.amount !== undefined && (
                      <div
                        className={`text-xs font-black tabular-nums tracking-tight ${
                          event.status === "failed" ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {formatCurrency(event.amount)}
                      </div>
                    )}
                    <span className="text-[9px] text-[var(--muted)] font-mono block">
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>

                  {event.type === "order" && onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate("orders")}
                      className="w-6.5 h-6.5 rounded-lg border border-[var(--border)] hover:bg-[var(--foreground)]/[0.06] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center cursor-pointer"
                      title="View in Orders"
                    >
                      <FiArrowUpRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalEvents}
          itemLabel="Events"
          onPageChange={setPage}
          size="sm"
          hideOnSinglePage
          className="px-3.5 py-2.5"
        />
      </div>
    </div>
  );
}
