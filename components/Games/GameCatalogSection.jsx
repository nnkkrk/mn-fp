"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FiFilter, FiGrid, FiList, FiZap, FiPackage, FiLayers, FiAward, FiTag } from "react-icons/fi";
import GameGrid from "@/components/Games/GameGrid";
import GameList from "@/components/Games/GameList";
import FilterModal from "@/components/Games/FilterModal";
import ServiceGridSection from "@/components/Games/ServiceGridSection";
import { ProductCardSkeleton, ProductListSkeleton } from "@/components/Skeleton/Skeleton";
import { EmptyState, SectionTitle, SearchInput } from "@/components/common";
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
    "mobile-legends-backup826"
  ];

  const outOfStockSet = useMemo(() => new Set(outOfStockGames), []);

  const isOutOfStock = useCallback(
    (name) => outOfStockSet.has(name),
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
      result = result.filter((g) => !isOutOfStock(g.gameName));
    }
    if (sort === "az") {
      result.sort((a, b) => (a.gameName || "").localeCompare(b.gameName || ""));
    } else if (sort === "za") {
      result.sort((a, b) => (b.gameName || "").localeCompare(a.gameName || ""));
    }
    return result;
  }, [searchQuery, hideOOS, sort, isOutOfStock]);

  const processedGames = useMemo(() => processList(games), [games, processList]);
  const processedMlbbGames = useMemo(() => processList(mlbbVeriant), [mlbbVeriant, processList]);

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
  const SectionHeader = ({ title, icon: Icon, count, gradient }) => (
    <div className="group flex items-center justify-between gap-2 mb-3 border-b border-[var(--border)]/30 pb-2">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${gradient}`} />
        <div className="flex flex-col">
          <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-[var(--foreground)] leading-tight flex items-center gap-1.5">
            {Icon && <Icon size={13} className="text-[var(--foreground)] opacity-75 shrink-0" />}
            <span>{title}</span>
          </h2>
          <span className="text-[8.5px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5">
            {count} Items Found
          </span>
        </div>
      </div>
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

        {/* ================= COMPACT SEARCH & CONTROLS ================= */}
        <div className="flex items-center gap-2 mb-6">
          {/* SEARCH */}
          <div className="flex-1 min-w-0">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search games, passes & topups..."
              size="sm"
            />
          </div>

          {/* ACTION CONTROLS */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* VIEW TOGGLE */}
            <div className="flex p-0.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] gap-0.5">
              {[
                { id: "grid", icon: FiGrid, label: "Grid view" },
                { id: "list", icon: FiList, label: "List view" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  aria-label={`Switch to ${mode.label}`}
                  title={mode.label}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
                    viewMode === mode.id
                      ? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
                >
                  <mode.icon size={13} />
                </button>
              ))}
            </div>

            {/* FILTER BUTTON */}
            <button
              onClick={() => setShowFilter(true)}
              aria-label="Open filter options"
              title="Filter games"
              className={`relative flex items-center justify-center w-9 h-9 rounded-2xl border transition-all duration-200 ${
                activeFilterCount > 0
                  ? "border-transparent bg-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
                    title="MLBB Special"
                    icon={FiZap}
                    count={processedMlbbGames.length}
                    gradient="from-blue-500 to-indigo-600"
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
                    icon={FiLayers}
                    count={processedGames.filter(g => activeTab !== "others" || !isMlbbGame(g)).length}
                    gradient="from-[var(--accent)] to-cyan-600"
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
                    icon={FiAward}
                    count={processedMemberships.length}
                    gradient="from-pink-500 to-rose-600"
                  />
                  <ServiceGridSection
                    title={null}
                    total={processedMemberships.length}
                    items={processedMemberships}
                    hrefPrefix="/games/membership"
                  />
                </div>
              )}

              {/* 6. VOUCHERS SECTION */}
              {(activeTab === "all" || activeTab === "vouchers") && processedVouchers.length > 0 && (
                <div className="mb-4 border-t border-[var(--border)]/40 pt-4">
                  <SectionHeader
                    title="Premium Vouchers"
                    icon={FiTag}
                    count={processedVouchers.length}
                    gradient="from-amber-400 to-orange-600"
                  />
                  <ServiceGridSection
                    title={null}
                    total={processedVouchers.length}
                    items={processedVouchers}
                    hrefPrefix="/games"
                  />
                </div>
              )}

              {/* 7. SERVICES SECTION */}
              {(activeTab === "all" || activeTab === "services") && processedServices.length > 0 && (
                <div className="mb-4 border-t border-[var(--border)]/40 pt-4">
                  <SectionHeader
                    title="Premium Services"
                    icon={FiPackage}
                    count={processedServices.length}
                    gradient="from-blue-400 to-indigo-600"
                  />
                  <ServiceGridSection
                    title={null}
                    total={processedServices.length}
                    items={processedServices}
                    hrefPrefix="/games"
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
