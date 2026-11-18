"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import idsOnSellData from "@/data/idsOnSell";
import IdCard from "@/components/IdsOnSell/IdCard";
import { Search, ShieldCheck, Zap, ArrowRight, Sparkles, Filter, CheckCircle2 } from "lucide-react";

export default function HomeMarketplaceSection() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "rent" | "global" | "mythic">("all");

  const filteredIds = useMemo(() => {
    return idsOnSellData.filter((item: any) => {
      const matchSearch =
        search.trim() === "" ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.slug?.toLowerCase().includes(search.toLowerCase()) ||
        item.rank?.current?.toLowerCase().includes(search.toLowerCase()) ||
        item.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase())) ||
        item.skins?.legendList?.some((s: string) => s.toLowerCase().includes(search.toLowerCase())) ||
        item.skins?.grandList?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      if (activeFilter === "rent") {
        return item.rent?.available === true;
      }
      if (activeFilter === "global") {
        return (item.heroTitles?.global?.length ?? 0) > 0;
      }
      if (activeFilter === "mythic") {
        return item.rank?.current?.toLowerCase().includes("mythic");
      }
      return true;
    });
  }, [search, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6 animate-fadeIn">
      {/* ── HEADER BANNER ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] via-[var(--card)]/90 to-[var(--accent)]/10 p-4 sm:p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20">
              <ShieldCheck size={13} className="shrink-0" />
              <span>Verified Account Marketplace</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">
              Buy, Sell & Rent <span className="text-[var(--accent)]">Gaming IDs</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] font-medium max-w-xl">
              100% verified competition-ready MLBB accounts with guaranteed instant delivery, clean Moonton rebind, and 24/7 buyer protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/idsonsell"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] font-black text-xs uppercase tracking-wider shadow-md shadow-[var(--accent)]/20 transition-all active:scale-95 shrink-0"
            >
              <span>Explore All IDs</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/partner"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] text-[var(--foreground)] font-bold text-xs uppercase tracking-wider transition-all shrink-0"
            >
              <span>Sell Your ID</span>
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 pt-4 border-t border-[var(--border)]/60 grid grid-cols-3 gap-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-bold text-[var(--foreground)]">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span className="truncate">100% Safe Rebind</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-bold text-[var(--foreground)]">
            <Sparkles size={13} className="text-amber-500 shrink-0" />
            <span className="truncate">Instant Delivery</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-bold text-[var(--foreground)]">
            <Zap size={13} className="text-[var(--accent)] shrink-0" />
            <span className="truncate">Rent Available</span>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search MLBB IDs, Collector skins, Ranks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none text-xs sm:text-sm text-[var(--foreground)] font-medium placeholder-[var(--muted)] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
              activeFilter === "all"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            }`}
          >
            All IDs ({idsOnSellData.length})
          </button>
          <button
            onClick={() => setActiveFilter("rent")}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
              activeFilter === "rent"
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            }`}
          >
            For Rent
          </button>
          <button
            onClick={() => setActiveFilter("global")}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
              activeFilter === "global"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            }`}
          >
            Global Titles
          </button>
          <button
            onClick={() => setActiveFilter("mythic")}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
              activeFilter === "mythic"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            }`}
          >
            Mythic
          </button>
        </div>
      </div>

      {/* ── ID CARDS GRID ──────────────────────────────────────────── */}
      {filteredIds.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
            <Filter size={22} />
          </div>
          <h3 className="text-base font-black uppercase tracking-tight text-[var(--foreground)]">No Matching Accounts</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            Try tweaking your search term or select "All IDs" to view all available gaming accounts.
          </p>
          <button
            onClick={() => { setSearch(""); setActiveFilter("all"); }}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-black uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIds.map((item: any) => (
            <IdCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* ── FOOTER VIEW FULL MARKETPLACE ───────────────────────────── */}
      <div className="pt-2 text-center">
        <Link
          href="/idsonsell"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] hover:border-[var(--accent)] text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-sm group"
        >
          <span>View All Accounts in Full Marketplace</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
