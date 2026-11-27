"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FiFilter, FiGrid, FiList, FiZap, FiPackage, FiLayers, FiAward, FiTag, FiSearch, FiX } from "react-icons/fi";
import GameGrid from "@/components/Games/GameGrid";
import GameList from "@/components/Games/GameList";
import FilterModal from "@/components/Games/FilterModal";
import ServiceGridSection from "@/components/Games/ServiceGridSection";
import { ProductCardSkeleton, ProductListSkeleton } from "@/components/Skeleton/Skeleton";
import { EmptyState, SectionTitle } from "@/components/common";
import { Icons } from "@/components/icons";
import api from "@/lib/axios";

export default function GameCatalogSection() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <GameCatalogContent />
    </Suspense>
  );
}

function GameCatalogContent() {
  /* ================= STATE ================= */
  const [category, setCategory] = useState([]);
  const [games, setGames] = useState([]);
  const [outOfStockSlugs, setOutOfStockSlugs] = useState([]);

  const [mlbbVeriant, setMlbbVeriant] = useState([]);

  const [otts, setOtts] = useState(null);
  const [memberships, setMemberships] = useState(null);
  const [vouchers, setVouchers] = useState(null);
  const [services, setServices] = useState(null);

  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState("az");
  const [hideOOS, setHideOOS] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  /* ================= CONFIG ================= */
  const WEEKLY_PASS_SLUG = "mobile-legends114";

  const outOfStockGames = [
    "mobile-legends-backup826",
    "silver-membership",
    "reseller-membership",
    "unipin-voucher",
    "rank-boost",
    "starlight-card-manual",
    "Membership",
    "Reseller",
    "UniPin Voucher",
    "MLBB Rank Boost",
    "Starlight Card",
  ];

  const outOfStockSet = useMemo(
    () => new Set([...outOfStockGames, ...outOfStockSlugs]),
    [outOfStockSlugs]
  );

  const isOutOfStock = useCallback(
    (item) => {
      if (!item) return false;
      const slug = typeof item === "string" ? item : (item.gameSlug || item.slug || "");
      const name = typeof item === "string" ? item : (item.gameName || item.name || "");
      return outOfStockSet.has(slug) || outOfStockSet.has(name);
    },
    [outOfStockSet]
  );

  /* ================= FETCH ================= */
  useEffect(() => {
    let mounted = true;

    const loadGames = async () => {
      try {
        const { data: json } = await api.get("/api/games");
        if (!mounted) return;

        let fetchedGames = json?.data?.games || [];
        let fetchedMlbbVariant = json?.data?.mlbbVariants || [];
        const oos = json?.data?.outOfStockSlugs || [];
        setOutOfStockSlugs(oos);

        // Duplicate Weekly Pass (same slug)
        const weeklyPassSource = fetchedGames.find(
          (g) => g.gameSlug === WEEKLY_PASS_SLUG
        );

        const isWeeklyPassOOS = oos.includes(WEEKLY_PASS_SLUG) || oos.includes("weekly-pass816") || oos.includes("flash-weekly621");
        if (weeklyPassSource && !isWeeklyPassOOS) {
          const alreadyExists = fetchedGames.some(
            (g) =>
              g.gameSlug === WEEKLY_PASS_SLUG &&
              g.gameName === "Weekly Pass",
          );

          if (!alreadyExists) {
            fetchedGames.push({
              ...weeklyPassSource,
              gameName: "Weekly Pass",
              _variant: "weekly-pass",
              gameImageId: {
                image: "/game-assets/weeklypass.jpg",
              },
            });
          }
        }

        setCategory(json?.data?.category || []);
        setGames(fetchedGames);
        setMlbbVeriant(fetchedMlbbVariant);

        setOtts(json?.data?.otts || null);
        setMemberships(json?.data?.memberships || null);
        setVouchers(json?.data?.vouchers || null);
        setServices(json?.data?.services || null);
      } catch (err) {
        console.error("Failed to load games:", err);
      }
    };

    loadGames().finally(() => setLoading(false));
    return () => (mounted = false);
  }, []);

  /* ================= FILTER COUNT ================= */
  const activeFilterCount =
    (sort !== "az" ? 1 : 0) + (hideOOS ? 1 : 0);

  /* ================= PROCESSING ================= */
  const processList = useCallback((list) => {
    let result = [...list];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) => {
        const name = (g.gameName || g.name || "").toLowerCase();
        return name.includes(q);
      });
    }
    if (hideOOS) {
      result = result.filter((g) => !isOutOfStock(g));
    }
    if (sort === "az") {
      result.sort((a, b) => (a.gameName || "").localeCompare(b.gameName || ""));
    } else if (sort === "za") {
      result.sort((a, b) => (b.gameName || "").localeCompare(a.gameName || ""));
    }
    return result;
  }, [searchQuery, hideOOS, sort, isOutOfStock]);

  const processedGames = useMemo(() => processList(games), [games, processList]);
  const processedMlbbGames = useMemo(
    () =>
      processList(mlbbVeriant).filter((g) => {
        const name = g.gameName?.toLowerCase() || "";
        const slug = g.gameSlug?.toLowerCase() || "";
        const isGlobal = name.includes("global") || slug.includes("global");
        const isAllRegion =
          name.includes("all region") ||
          slug.includes("all-region") ||
          slug.includes("allregion");
        return !isGlobal && !isAllRegion;
      }),
    [mlbbVeriant, processList]
  );

  const processedOtts = useMemo(() => otts?.items ? processList(otts.items) : [], [otts, processList]);
  const processedMemberships = useMemo(() => memberships?.items ? processList(memberships.items) : [], [memberships, processList]);
  const processedVouchers = useMemo(() => vouchers?.items ? processList(vouchers.items) : [], [vouchers, processList]);
  const processedServices = useMemo(() => services?.items ? processList(services.items) : [], [services, processList]);

  const isEmpty =
    processedGames.length === 0 &&
    processedMlbbGames.length === 0 &&
    processedOtts.length === 0 &&
    processedMemberships.length === 0 &&
    processedVouchers.length === 0 &&
    processedServices.length === 0;

  /* ================= HANDLERS ================= */
  const clearFilters = () => {
    setSort("az");
    setHideOOS(false);
    setSearchQuery("");
  };

  const isMlbbGame = (game) => {
    const slug = game.gameSlug?.toLowerCase() || "";
    const name = game.gameName?.toLowerCase() || "";
    return slug.includes("mlbb") || name.includes("mlbb") || slug.includes("legends988") || slug.includes("weeklymonthly-bundle");
  };

  /* ================= RENDER COMPONENTS ================= */
  const renderSectionSvg = (variant) => {
    switch (variant) {
      case "mlbb":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path d="M6 4H18L22 9.5L12 20.5L2 9.5L6 4Z" fill="#3b82f6" />
            <path d="M6 4H18L15 9.5H9L6 4Z" fill="#93c5fd" />
            <path d="M9 9.5H15L12 20.5L9 9.5Z" fill="#60a5fa" />
          </svg>
        );
      case "armory":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path
              d="M6.5 7.5H17.5C19.7 7.5 21.5 9.3 21.5 11.5V15C21.5 16.9 19.9 18.5 18 18.5C16.7 18.5 15.6 17.8 15 16.7L14.2 15.2H9.8L9 16.7C8.4 17.8 7.3 18.5 6 18.5C4.1 18.5 2.5 16.9 2.5 15V11.5C2.5 9.3 4.3 7.5 6.5 7.5Z"
              fill="#10b981"
            />
            <path d="M8 10.5V13.5M6.5 12H9.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="15.5" cy="11.2" r="1" fill="#ffffff" />
            <circle cx="17.5" cy="12.8" r="1" fill="#d1fae5" />
          </svg>
        );
      case "memberships":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path d="M3 17L4.8 7.5L9.2 11.2L12 5.5L14.8 11.2L19.2 7.5L21 17H3Z" fill="#ec4899" />
            <rect x="4" y="18" width="16" height="2.2" rx="1.1" fill="#f472b6" />
          </svg>
        );
      case "vouchers":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path
              d="M3.5 7C3.5 5.9 4.4 5 5.5 5H18.5C19.6 5 20.5 5.9 20.5 7V9.8C19.4 9.8 18.5 10.7 18.5 11.8C18.5 12.9 19.4 13.8 20.5 13.8V17C20.5 18.1 19.6 19 18.5 19H5.5C4.4 19 3.5 18.1 3.5 17V13.8C4.6 13.8 5.5 12.9 5.5 11.8C5.5 10.7 4.6 9.8 3.5 9.8V7Z"
              fill="#f59e0b"
            />
            <path d="M9.5 8.5V15.5" stroke="#fef3c7" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
            <circle cx="15" cy="12" r="1.8" fill="#fef3c7" />
          </svg>
        );
      case "services":
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path d="M12 2.5L19.5 5.8V11.5C19.5 16.2 16.3 20.3 12 21.5C7.7 20.3 4.5 16.2 4.5 11.5V5.8L12 2.5Z" fill="#6366f1" />
            <path d="M9.5 12L11.3 13.8L15 10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  const SectionHeader = ({ title, variant, count, dotColor = "bg-[var(--accent)]" }) => (
    <div className="flex items-center gap-2.5 mb-3.5">
      <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.12)] min-w-0">
        {renderSectionSvg(variant)}
        <h2 className="text-[11px] sm:text-xs font-black tracking-wide uppercase text-[var(--foreground)] truncate">
          {title}
        </h2>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-[var(--border)] via-[var(--border)]/40 to-transparent" />
      <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)]/80 text-[9px] sm:text-[10px] font-bold text-[var(--muted)] tabular-nums">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {count} {count === 1 ? "item" : "items"}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] px-2 sm:px-4 py-3 sm:py-6 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="mb-4">
          <SectionTitle
            as="h1"
            size="sm"
            subtitle="INSTANT TOP-UP"
            title="GAME CATALOG"
            highlight="CATALOG"
            pulse
          />
        </div>

        {/* ================= UNIFIED SEARCH & CONTROLS BAR ================= */}
        <div className="relative flex items-center w-full h-10 sm:h-11 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-2 sm:px-2.5 mb-6 shadow-xs transition-all focus-within:border-[var(--accent)]/50 focus-within:ring-2 focus-within:ring-[var(--accent)]/10">
          {/* SEARCH ICON */}
          <FiSearch size={14} className="text-[var(--muted)]/50 shrink-0 ml-1 sm:ml-1.5" />

          {/* SEARCH INPUT */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games, passes & topups..."
            className="flex-1 bg-transparent px-2.5 py-1 text-xs sm:text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/40 min-w-0 font-sans"
          />

          {/* CLEAR (X) BUTTON */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors mr-1 shrink-0 cursor-pointer"
            >
              <FiX size={13} />
            </button>
          )}

          {/* VERTICAL DIVIDER */}
          <div className="w-[1px] h-4.5 bg-[var(--border)] mx-1 shrink-0" />

          {/* VIEW TOGGLE & FILTER CONTROLS */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* VIEW TOGGLE */}
            {[
              { id: "grid", icon: FiGrid, label: "Grid view" },
              { id: "list", icon: FiList, label: "List view" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                aria-label={`Switch to ${mode.label}`}
                title={mode.label}
                className={`w-7.5 h-7.5 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                  viewMode === mode.id
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                }`}
              >
                <mode.icon size={13} />
              </button>
            ))}

            {/* DIVIDER BETWEEN TOGGLE AND FILTER */}
            <div className="w-[1px] h-3.5 bg-[var(--border)]/70 mx-0.5 shrink-0" />

            {/* FILTER BUTTON */}
            <button
              onClick={() => setShowFilter(true)}
              aria-label="Open filter options"
              title="Filter games"
              className={`relative flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl transition-all duration-200 cursor-pointer ${
                activeFilterCount > 0
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
              }`}
            >
              <FiFilter size={13} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center bg-white text-black rounded-full text-[8px] font-black border border-[var(--card)]">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ================= GAME CONTENT ================= */}
        <div className="space-y-6 sm:space-y-8">
          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4" : "flex flex-col gap-3"}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                viewMode === "grid" ? <ProductCardSkeleton key={i} /> : <ProductListSkeleton key={i} />
              ))}
            </div>
          ) : isEmpty ? (
            <div key="empty" className="py-12">
              <EmptyState
                icon={Icons.search}
                title="No Games Found"
                description="Try adjusting your search or filters to find what you're looking for."
                action={{
                  label: "Reset All Filters",
                  onClick: clearFilters,
                }}
              />
            </div>
          ) : (
            <div>
              {/* 2. MLBB VARIANT */}
              {(activeTab === "all" || activeTab === "mlbb") && processedMlbbGames.length > 0 && (
                <div className="mb-6">
                  <SectionHeader
                    title="MLBB Indian Most Used"
                    variant="mlbb"
                    count={processedMlbbGames.length}
                    dotColor="bg-blue-500"
                  />
                  {viewMode === "grid"
                    ? <GameGrid games={processedMlbbGames} isOutOfStock={isOutOfStock} />
                    : <GameList games={processedMlbbGames} isOutOfStock={isOutOfStock} />
                  }
                </div>
              )}

              {/* 3. ALL GAMES */}
              {(activeTab === "all" || activeTab === "others") && (processedGames.filter(g => activeTab !== "others" || !isMlbbGame(g)).length > 0) && (
                <div className="mb-6">
                  <SectionHeader
                    title="Full Armory"
                    variant="armory"
                    count={processedGames.filter(g => activeTab !== "others" || !isMlbbGame(g)).length}
                    dotColor="bg-emerald-500"
                  />
                  {viewMode === "grid"
                    ? <GameGrid games={processedGames.filter(g => activeTab !== "others" || !isMlbbGame(g))} isOutOfStock={isOutOfStock} />
                    : <GameList games={processedGames.filter(g => activeTab !== "others" || !isMlbbGame(g))} isOutOfStock={isOutOfStock} />
                  }
                </div>
              )}

              {/* 5. MEMBERSHIPS SECTION */}
              {(activeTab === "all" || activeTab === "memberships") && processedMemberships.length > 0 && (
                <div className="mb-4 border-t border-[var(--border)]/40 pt-4">
                  <SectionHeader
                    title="Premium Memberships"
                    variant="memberships"
                    count={processedMemberships.length}
                    dotColor="bg-pink-500"
                  />
                  <ServiceGridSection
                    title={null}
                    total={processedMemberships.length}
                    items={processedMemberships}
                    hrefPrefix="/games/membership"
                    isOutOfStock={isOutOfStock}
                  />
                </div>
              )}

              {/* 6. VOUCHERS SECTION */}
              {(activeTab === "all" || activeTab === "vouchers") && processedVouchers.length > 0 && (
                <div className="mb-4 border-t border-[var(--border)]/40 pt-4">
                  <SectionHeader
                    title="Premium Vouchers"
                    variant="vouchers"
                    count={processedVouchers.length}
                    dotColor="bg-amber-500"
                  />
                  <ServiceGridSection
                    title={null}
                    total={processedVouchers.length}
                    items={processedVouchers}
                    hrefPrefix="/games"
                    isOutOfStock={isOutOfStock}
                  />
                </div>
              )}

              {/* 7. SERVICES SECTION */}
              {(activeTab === "all" || activeTab === "services") && processedServices.length > 0 && (
                <div className="mb-4 border-t border-[var(--border)]/40 pt-4">
                  <SectionHeader
                    title="Premium Services"
                    variant="services"
                    count={processedServices.length}
                    dotColor="bg-indigo-500"
                  />
                  <ServiceGridSection
                    title={null}
                    total={processedServices.length}
                    items={processedServices}
                    hrefPrefix="/games"
                    isOutOfStock={isOutOfStock}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FILTER MODAL */}
      <FilterModal
        open={showFilter}
        onClose={() => setShowFilter(false)}
        sort={sort}
        setSort={setSort}
        hideOOS={hideOOS}
        setHideOOS={setHideOOS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
