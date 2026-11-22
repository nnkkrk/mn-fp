"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import staticIds from "@/data/idsOnSell";
import IdCard from "@/components/IdsOnSell/IdCard";
import IdsFilterModal, { SortOption, GAME_CATEGORIES } from "@/components/IdsOnSell/IdsFilterModal";
import SellAccountBanner from "@/components/IdsOnSell/SellAccountBanner";
import { EmptyState, SectionTitle } from "@/components/common";
import { Icons } from "@/components/icons";
import { FiSearch, FiX, FiSliders } from "react-icons/fi";
import { IdsMarketplaceSkeleton } from "@/components/Skeleton/Skeleton";
import AAdsBanner from "@/components/Ads/AAdsBanner";

function IdsOnSellContent() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [idsList, setIdsList] = useState<any[]>(staticIds || []);

  // Filters & Sorting
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [rentOnly, setRentOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  useEffect(() => {
    let isMounted = true;

    async function loadAccounts() {
      try {
        const res = await fetch("/api/trade-ids");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setIdsList(data.data);
        }
      } catch (err) {
        console.error("Error fetching marketplace IDs:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasActiveFilter = rentOnly || sortBy !== "default" || selectedGame !== "all";

  /* ================= FILTER & SORT LOGIC ================= */
  const filteredAndSortedIds = useMemo(() => {
    const q = search.trim().toLowerCase();

    const result = idsList.filter((item: any) => {
      // Game Filter
      if (selectedGame !== "all" && (item.game || "mlbb") !== selectedGame) {
        return false;
      }

      const matchSearch =
        !q ||
        item.id?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.gameName?.toLowerCase().includes(q) ||
        item.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
        item.specs?.some((s: any) => s.label?.toLowerCase().includes(q) || s.value?.toLowerCase().includes(q)) ||
        item.details?.toLowerCase().includes(q);

      const matchRent = !rentOnly || item.rent?.available === true;

      return matchSearch && matchRent;
    });

    if (sortBy === "buy-asc") {
      result.sort((a: any, b: any) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "buy-desc") {
      result.sort((a: any, b: any) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === "rent-asc") {
      result.sort((a: any, b: any) => {
        const pA = a.rent?.available ? (a.rent?.price ?? Infinity) : Infinity;
        const pB = b.rent?.available ? (b.rent?.price ?? Infinity) : Infinity;
        return pA - pB;
      });
    } else if (sortBy === "rent-desc") {
      result.sort((a: any, b: any) => {
        const pA = a.rent?.available ? (a.rent?.price ?? -Infinity) : -Infinity;
        const pB = b.rent?.available ? (b.rent?.price ?? -Infinity) : -Infinity;
        return pB - pA;
      });
    } else {
      // Default: In stock first, then unstocked
      result.sort((a: any, b: any) => {
        const aStock = a.stockStatus !== "unstocked" ? 1 : 0;
        const bStock = b.stockStatus !== "unstocked" ? 1 : 0;
        return bStock - aStock;
      });
    }

    return result;
  }, [idsList, search, selectedGame, rentOnly, sortBy]);

  if (loading) {
    return <IdsMarketplaceSkeleton />;
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-5">
      {/* ================= SELL ACCOUNT BANNER ================= */}
      <SellAccountBanner />

      <SectionTitle
        subtitle="VERIFIED MARKETPLACE"
        title="IDS ON SALE"
        info="Browse verified, competition-ready gaming accounts for sale & rent"
      />

      {/* ================= COMBINED SEARCH & FILTER BAR ================= */}
      <div className="relative flex items-center w-full h-9 sm:h-9.5 rounded-full bg-[var(--card)] border border-[var(--border)] focus-within:border-[var(--accent)]/60 focus-within:ring-2 focus-within:ring-[var(--accent)]/15 transition-all shadow-xs px-3">
        {/* Search Icon */}
        <FiSearch className="text-[var(--muted)]/70 shrink-0 text-sm mr-2" />

        {/* Search Text Input */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            selectedGame === "coc"
              ? "Search Clash of Clans IDs, tags..."
              : selectedGame === "bgmi"
              ? "Search BGMI IDs, tags..."
              : selectedGame === "mlbb"
              ? "Search MLBB IDs, skins, tags..."
              : "Search IDs, skins, tags..."
          }
          className="w-full bg-transparent text-xs sm:text-[13px] text-[var(--foreground)] placeholder-[var(--muted)]/60 focus:outline-none"
        />

        {/* Clear Button (if search has value) */}
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mr-1 cursor-pointer"
            aria-label="Clear search"
          >
            <FiX size={12} />
          </button>
        )}

        {/* Divider */}
        <div className="h-4 w-[1px] bg-[var(--border)] shrink-0 mx-1.5" />

        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setShowFilter(true)}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            hasActiveFilter
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
          }`}
          aria-label="Filter and Sort"
          title="Filter and Sort"
        >
          <FiSliders size={12} />
          <span className="hidden sm:inline text-[10px]">Filter</span>
          {hasActiveFilter && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          )}
        </button>
      </div>

      {/* ================= ACTIVE FILTER CHIPS (IF ANY) ================= */}
      {hasActiveFilter && (
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          {selectedGame !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 font-bold">
              <span>{GAME_CATEGORIES.find((g) => g.id === selectedGame)?.icon}</span>
              <span>{GAME_CATEGORIES.find((g) => g.id === selectedGame)?.label}</span>
              <button
                type="button"
                onClick={() => setSelectedGame("all")}
                className="hover:opacity-70 ml-0.5 cursor-pointer"
                aria-label="Remove game filter"
              >
                <FiX size={10} />
              </button>
            </span>
          )}

          {rentOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 font-bold">
              Rent Available
              <button
                type="button"
                onClick={() => setRentOnly(false)}
                className="hover:opacity-70 ml-0.5 cursor-pointer"
                aria-label="Remove rent filter"
              >
                <FiX size={10} />
              </button>
            </span>
          )}

          {sortBy !== "default" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[var(--foreground)] font-bold">
              {sortBy === "buy-asc" && "Buy: Low → High"}
              {sortBy === "buy-desc" && "Buy: High → Low"}
              {sortBy === "rent-asc" && "Rent: Low → High"}
              {sortBy === "rent-desc" && "Rent: High → Low"}
              <button
                type="button"
                onClick={() => setSortBy("default")}
                className="hover:opacity-70 ml-0.5 cursor-pointer"
                aria-label="Reset sort"
              >
                <FiX size={10} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setSelectedGame("all");
              setRentOnly(false);
              setSortBy("default");
            }}
            className="text-[10px] text-[var(--muted)] hover:text-red-500 font-bold uppercase underline tracking-wider ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ================= GRID ================= */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedIds.length > 0 ? (
          filteredAndSortedIds.map((item: any) => (
            <IdCard key={item._id || item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full py-8">
            <EmptyState
              icon={Icons.search}
              title="No Accounts Found"
              description="Try adjusting your search terms or clearing active filters."
            />
          </div>
        )}
      </div>

      {/* ================= AD BANNER ================= */}
      <div className="w-full flex justify-center pt-3 pb-12 md:pb-6">
        <AAdsBanner adId="2462703" />
      </div>

      {/* ================= FILTER MODAL ================= */}
      {showFilter && (
        <IdsFilterModal
          open={showFilter}
          onClose={() => setShowFilter(false)}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          rentOnly={rentOnly}
          setRentOnly={setRentOnly}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      )}
    </main>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<IdsMarketplaceSkeleton />}>
      <IdsOnSellContent />
    </Suspense>
  );
}
