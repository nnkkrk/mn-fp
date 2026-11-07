"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  Coins,
  Settings2,
  Trash2,
  Gamepad2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Check,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { SearchInput, SectionTitle } from "@/components/common";

const API_BASE = "https://game-off-ten.vercel.app/api/v1";

export default function PricingTab({
  pricingType,
  setPricingType,
  slabs,
  setSlabs,
  overrides,
  setOverrides,
  gameConfigs,
  setGameConfigs,
  savingPricing,
  onSave,
}) {
  const [pricingMode, setPricingMode] = useState("percent");
  const [games, setGames] = useState([]);
  const [itemsByGame, setItemsByGame] = useState({});
  const [fixedGameFilter, setFixedGameFilter] = useState("");
  const [gameSearch, setGameSearch] = useState("");
  const [loadingFixedPrices, setLoadingFixedPrices] = useState(false);

  // Dropdown & Filter States
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const [gameFilterTab, setGameFilterTab] = useState("all"); // "all" | "with-prices"
  const [itemPriceStatusFilter, setItemPriceStatusFilter] = useState("all"); // "all" | "set" | "auto"
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const gameDropdownRef = useRef(null);

  // Close game dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (gameDropdownRef.current && !gameDropdownRef.current.contains(e.target)) {
        setIsGameDropdownOpen(false);
      }
    };
    if (isGameDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isGameDropdownOpen]);

  // Fetch games list
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/games/list`);
        const json = await res.json();
        if (json.success && json.data?.games) {
          setGames(json.data.games);
        }
      } catch (e) {
        console.error("Game fetch failed", e);
      }
    })();
  }, []);

  // Auto-select initial game once games load
  useEffect(() => {
    if (games.length > 0 && !fixedGameFilter) {
      // Prioritize game with existing price set, otherwise default to first
      const gameWithOverride = games.find((g) =>
        overrides.some((o) => o.gameSlug === g.gameSlug && o.isEnabled)
      );
      setFixedGameFilter(gameWithOverride ? gameWithOverride.gameSlug : games[0].gameSlug);
    }
  }, [games, fixedGameFilter, overrides]);

  // Count active overrides per game
  const overridesCountByGame = useMemo(() => {
    const counts = {};
    overrides.forEach((o) => {
      if (o.isEnabled) {
        counts[o.gameSlug] = (counts[o.gameSlug] || 0) + 1;
      }
    });
    return counts;
  }, [overrides]);

  // Total games that have custom prices set
  const gamesWithPricesCount = useMemo(() => {
    return Object.keys(overridesCountByGame).filter((slug) => overridesCountByGame[slug] > 0).length;
  }, [overridesCountByGame]);

  // Filtered games list inside dropdown
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const q = (gameSearch || "").toLowerCase().trim();
      const matchesSearch =
        !q ||
        (g.gameName || "").toLowerCase().includes(q) ||
        (g.gameSlug || "").toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (gameFilterTab === "with-prices") {
        return (overridesCountByGame[g.gameSlug] || 0) > 0;
      }
      return true;
    });
  }, [games, gameSearch, gameFilterTab, overridesCountByGame]);

  const selectedGame = useMemo(() => {
    return games.find((g) => g.gameSlug === fixedGameFilter) || null;
  }, [games, fixedGameFilter]);

  const fetchItemsForGame = async (gameSlug) => {
    if (!gameSlug) return [];
    if (itemsByGame[gameSlug]) return itemsByGame[gameSlug];

    try {
      const res = await fetch(`${API_BASE}/games/${gameSlug}/items`);
      const json = await res.json();
      if (json.success) {
        let items = json.data.items || [];

        /* ================= INJECT COMBO OFFERS (ADMIN) ================= */
        const weeklyPass = items.find((i) => i.itemSlug === "weekly-pass816");
        if (weeklyPass) {
          const combos = [
            { multiplier: 2, label: "2x" },
            { multiplier: 3, label: "3x" },
          ];

          combos.forEach((combo) => {
            const comboSlug = `${weeklyPass.itemSlug}-${combo.multiplier}x`;
            if (!items.find((i) => i.itemSlug === comboSlug)) {
              items.push({
                ...weeklyPass,
                itemName: `${combo.label} ${weeklyPass.itemName}`,
                itemSlug: comboSlug,
                sellingPrice: Number(weeklyPass.sellingPrice) * combo.multiplier,
                index: weeklyPass.index + combo.multiplier * 0.1,
              });
            }
          });
          items.sort((a, b) => (Number(a.sellingPrice) || 0) - (Number(b.sellingPrice) || 0));
        }

        setItemsByGame((p) => ({ ...p, [gameSlug]: items }));
        return items;
      }
    } catch (e) {
      console.error("Item fetch failed", e);
    }
    return [];
  };

  const hydrateFixedPricing = async (gameSlug) => {
    if (!gameSlug) return;
    setLoadingFixedPrices(true);
    try {
      await fetchItemsForGame(gameSlug);
      setItemSearchQuery("");
    } finally {
      setLoadingFixedPrices(false);
    }
  };

  useEffect(() => {
    if (pricingMode !== "fixed") return;
    if (!fixedGameFilter) return;
    hydrateFixedPricing(fixedGameFilter);
  }, [pricingMode, pricingType, fixedGameFilter]);

  // All items for the currently selected game
  const allGameItems = useMemo(() => {
    if (!fixedGameFilter) return [];
    const items = itemsByGame[fixedGameFilter] || [];

    return items.map((item) => {
      const override = overrides.find(
        (o) => o.gameSlug === fixedGameFilter && o.itemSlug === item.itemSlug
      );
      return {
        gameSlug: fixedGameFilter,
        itemSlug: item.itemSlug,
        itemName: item.itemName,
        fixedPrice: override?.fixedPrice ?? Number(item.sellingPrice) ?? 0,
        isEnabled: override?.isEnabled ?? false,
        isOutOfStock: override?.isOutOfStock ?? false,
      };
    });
  }, [overrides, fixedGameFilter, itemsByGame]);

  // Items stats: total, price set, auto
  const itemStats = useMemo(() => {
    const total = allGameItems.length;
    const priceSetCount = allGameItems.filter((i) => i.isEnabled).length;
    const autoCount = total - priceSetCount;
    return { total, priceSetCount, autoCount };
  }, [allGameItems]);

  // Filtered items based on status filter ("all" | "set" | "auto") and search
  const visibleOverrides = useMemo(() => {
    return allGameItems.filter((o) => {
      // Filter by Price Status
      if (itemPriceStatusFilter === "set" && !o.isEnabled) return false;
      if (itemPriceStatusFilter === "auto" && o.isEnabled) return false;

      // Filter by Search Query
      if (itemSearchQuery.trim()) {
        const q = itemSearchQuery.toLowerCase().trim();
        const matchesName = (o.itemName || "").toLowerCase().includes(q);
        const matchesSlug = (o.itemSlug || "").toLowerCase().includes(q);
        if (!matchesName && !matchesSlug) return false;
      }

      return true;
    });
  }, [allGameItems, itemPriceStatusFilter, itemSearchQuery]);

  const updateOverrideState = (itemSlug, updates) => {
    setOverrides((prev) => {
      const idx = prev.findIndex(
        (o) => o.gameSlug === fixedGameFilter && o.itemSlug === itemSlug
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...updates };
        return next;
      } else {
        const item = itemsByGame[fixedGameFilter]?.find((i) => i.itemSlug === itemSlug);
        return [
          ...prev,
          {
            gameSlug: fixedGameFilter,
            itemSlug,
            itemName: item?.itemName || itemSlug,
            fixedPrice: updates.fixedPrice ?? Number(item?.sellingPrice) ?? 0,
            isEnabled: updates.isEnabled ?? false,
            isOutOfStock: updates.isOutOfStock ?? false,
          },
        ];
      }
    });
  };

  const updateOverridePrice = (itemSlug, value) => {
    updateOverrideState(itemSlug, { fixedPrice: Math.max(0, Number(value) || 0) });
  };

  const toggleOverrideStatus = (itemSlug) => {
    const current = visibleOverrides.find((o) => o.itemSlug === itemSlug);
    updateOverrideState(itemSlug, { isEnabled: !current?.isEnabled });
  };

  const updateSlab = (i, key, value) => {
    const next = [...slabs];
    next[i][key] = Math.max(0, Number(value) || 0);
    setSlabs(next);
  };

  const addSlab = () => setSlabs([...slabs, { min: 0, max: 0, percent: 0 }]);
  const deleteSlab = (i) => setSlabs(slabs.filter((_, idx) => idx !== i));
  const canSave =
    !savingPricing &&
    ((pricingMode === "percent" && slabs.length) || (pricingMode === "fixed" && overrides.length));

  return (
    <div className="space-y-4 pb-20 max-w-full overflow-x-hidden">
      {/* ================= TOP BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <SectionTitle
          size="xs"
          subtitle="Margins & Rates"
          title="Pricing"
          highlight="Config"
          icon={<Settings2 size={13} className="text-[var(--accent)]" />}
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex p-0.5 bg-[var(--border)]/50 border border-[var(--border)] rounded-md gap-0.5">
            {[
              { id: "percent", label: "Markup", icon: <Percent size={11} /> },
              { id: "fixed", label: "Fixed", icon: <Coins size={11} /> },
            ].map((m) => (
              <button
                aria-label="button"
                key={m.id}
                onClick={() => setPricingMode(m.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-sm text-[9.5px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  pricingMode === m.id
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {/* Role Switcher */}
          <div className="flex p-0.5 bg-[var(--border)]/50 border border-[var(--border)] rounded-md gap-0.5">
            {["user", "member", "admin"].map((type) => (
              <button
                aria-label="button"
                key={type}
                onClick={() => setPricingType(type)}
                className={`px-2.5 py-1 rounded-sm text-[9.5px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  pricingType === type
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            aria-label="button"
            onClick={onSave}
            disabled={!canSave || savingPricing}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center ${
              canSave
                ? "bg-[var(--accent)] text-white shadow-sm hover:brightness-110"
                : "bg-[var(--foreground)]/[0.05] text-[var(--muted)]/40 cursor-not-allowed border border-[var(--border)]"
            }`}
          >
            {savingPricing ? (
              <div className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {pricingMode === "percent" ? (
          /* ================= MARKUP MODE ================= */
          <motion.div
            key="markup-pane"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/30 overflow-hidden">
              <div className="px-3.5 sm:px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Percent size={14} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] truncate">
                      Profit Markup
                    </h3>
                    <p className="text-[9.5px] text-[var(--muted)] truncate">
                      Percentage profit based on price ranges
                    </p>
                  </div>
                </div>
                <button
                  aria-label="button"
                  onClick={addSlab}
                  className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-white text-[9.5px] font-black uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 whitespace-nowrap shrink-0"
                >
                  + Add Range
                </button>
              </div>

              <div className="divide-y divide-[var(--border)]">
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[var(--card)]/50 text-[9px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                  <div className="flex-1">Price Range (₹)</div>
                  <div className="w-28 text-left">Profit Margin</div>
                  <div className="w-8 text-center">Action</div>
                </div>

                {slabs.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 sm:px-4 sm:py-2.5 hover:bg-[var(--foreground)]/[0.01] transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--muted)]">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={s.min}
                            onChange={(e) => updateSlab(i, "min", e.target.value)}
                            className="w-full h-8 pl-6 pr-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono font-bold text-xs outline-none focus:border-[var(--accent)]/50 transition-all"
                            placeholder="Min"
                          />
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase text-[var(--muted)]/60 shrink-0">
                        to
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--muted)]">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={s.max}
                            onChange={(e) => updateSlab(i, "max", e.target.value)}
                            className="w-full h-8 pl-6 pr-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono font-bold text-xs outline-none focus:border-[var(--accent)]/50 transition-all"
                            placeholder="Max"
                          />
                        </div>
                      </div>

                      <div className="w-20 sm:w-28 shrink-0">
                        <div className="relative">
                          <input
                            type="number"
                            value={s.percent}
                            onChange={(e) => updateSlab(i, "percent", e.target.value)}
                            className="w-full h-8 pl-2.5 pr-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-black text-xs outline-none focus:border-emerald-500/40 transition-all placeholder:text-emerald-500/40 text-right sm:text-left"
                            placeholder="5"
                          />
                          <Percent
                            size={11}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400/60"
                          />
                        </div>
                      </div>

                      <button
                        aria-label="button"
                        onClick={() => deleteSlab(i)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                        title="Delete range"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {!slabs.length && (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <Percent className="text-[var(--muted)]/20 mb-2" size={24} />
                    <p className="text-[9.5px] font-black uppercase tracking-wider text-[var(--muted)]">
                      No markup ranges defined
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ================= FIXED PRICE OVERRIDE MODE ================= */
          <motion.div
            key="fixed-pane"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-3"
          >
            {/* ================= CONTROLS TOOLBAR (GAME DROPDOWN + ITEM FILTERS) ================= */}
            <div className="p-3 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* 1. GAME SELECTOR DROPDOWN */}
                <div className="flex-1 relative" ref={gameDropdownRef}>
                  <label className="block text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
                    Select Game
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsGameDropdownOpen((prev) => !prev)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${
                      isGameDropdownOpen
                        ? "border-[var(--accent)] bg-[var(--card)] shadow-md ring-1 ring-[var(--accent)]/30"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                        <Gamepad2 size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-tight text-[var(--foreground)] truncate">
                          {selectedGame ? selectedGame.gameName : "Select a game..."}
                        </p>
                        <p className="text-[9px] font-mono text-[var(--muted)]/60 truncate leading-tight">
                          {selectedGame ? selectedGame.gameSlug : "Click to choose from list"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Badge showing count of prices set in this game */}
                      {itemStats.priceSetCount > 0 ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          <CheckCircle2 size={10} />
                          <span>{itemStats.priceSetCount} Set</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-[var(--muted)]/10 text-[var(--muted)]/70">
                          Auto Pricing
                        </span>
                      )}
                      <ChevronDown
                        size={14}
                        className={`text-[var(--muted)] transition-transform duration-200 ${
                          isGameDropdownOpen ? "rotate-180 text-[var(--accent)]" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* GAME DROPDOWN POPOVER */}
                  <AnimatePresence>
                    {isGameDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-1.5 z-40 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl backdrop-blur-xl space-y-2"
                      >
                        {/* Search inside Dropdown */}
                        <SearchInput
                          placeholder="Search games by name or slug..."
                          value={gameSearch}
                          onChange={setGameSearch}
                          size="sm"
                          autoFocus
                        />

                        {/* Dropdown Filter Tabs: All Games vs Games with Prices Set */}
                        <div className="flex items-center gap-1 p-0.5 bg-[var(--border)]/40 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setGameFilterTab("all")}
                            className={`flex-1 py-1 px-2 rounded-md text-[9px] font-black uppercase tracking-wider transition-all text-center ${
                              gameFilterTab === "all"
                                ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                                : "text-[var(--muted)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            All Games ({games.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setGameFilterTab("with-prices")}
                            className={`flex-1 py-1 px-2 rounded-md text-[9px] font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 ${
                              gameFilterTab === "with-prices"
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "text-emerald-400 hover:text-emerald-300"
                            }`}
                          >
                            <span>With Price Set</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[8px] bg-black/20 font-mono">
                              {gamesWithPricesCount}
                            </span>
                          </button>
                        </div>

                        {/* Scrollable Games List */}
                        <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                          {filteredGames.map((g) => {
                            const isSelected = fixedGameFilter === g.gameSlug;
                            const count = overridesCountByGame[g.gameSlug] || 0;

                            return (
                              <button
                                type="button"
                                key={g.gameSlug}
                                onClick={() => {
                                  setFixedGameFilter(g.gameSlug);
                                  setIsGameDropdownOpen(false);
                                }}
                                className={`w-full group flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                                  isSelected
                                    ? "bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--foreground)]"
                                    : "hover:bg-[var(--foreground)]/[0.04] border border-transparent text-[var(--foreground)]/80"
                                }`}
                              >
                                <div className="flex flex-col items-start min-w-0 pr-2">
                                  <span
                                    className={`text-[11px] font-bold uppercase tracking-tight truncate ${
                                      isSelected
                                        ? "text-[var(--accent)] font-black"
                                        : "group-hover:text-[var(--foreground)]"
                                    }`}
                                  >
                                    {g.gameName}
                                  </span>
                                  <span className="text-[8.5px] font-mono text-[var(--muted)]/60 truncate leading-tight">
                                    {g.gameSlug}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {count > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                      {count} set
                                    </span>
                                  )}
                                  {isSelected && (
                                    <Check size={13} className="text-[var(--accent)] shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })}

                          {filteredGames.length === 0 && (
                            <div className="py-6 text-center text-[var(--muted)]">
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                {gameFilterTab === "with-prices"
                                  ? "No games have custom prices set yet"
                                  : "No games found matching search"}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. ITEM SEARCH */}
                <div className="w-full md:w-64">
                  <label className="block text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
                    Search Items
                  </label>
                  <SearchInput
                    placeholder="Search by pack name or slug..."
                    value={itemSearchQuery}
                    onChange={setItemSearchQuery}
                    size="sm"
                  />
                </div>
              </div>

              {/* 3. ITEM PRICE STATUS FILTER PILLS ("know what items price already set to see") */}
              <div className="pt-2 border-t border-[var(--border)]/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] mr-1 flex items-center gap-1">
                    <Filter size={10} />
                    <span>Filter Items:</span>
                  </span>

                  {/* All Items Pill */}
                  <button
                    type="button"
                    onClick={() => setItemPriceStatusFilter("all")}
                    className={`px-2.5 py-1 rounded-md text-[9.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      itemPriceStatusFilter === "all"
                        ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm font-black"
                        : "bg-[var(--foreground)]/[0.04] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
                    }`}
                  >
                    <span>All Items</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-mono bg-black/10 dark:bg-white/10">
                      {itemStats.total}
                    </span>
                  </button>

                  {/* Price Set Pill */}
                  <button
                    type="button"
                    onClick={() => setItemPriceStatusFilter("set")}
                    className={`px-2.5 py-1 rounded-md text-[9.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      itemPriceStatusFilter === "set"
                        ? "bg-emerald-500 text-white shadow-sm font-black"
                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Price Set (Override)</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-mono bg-black/20">
                      {itemStats.priceSetCount}
                    </span>
                  </button>

                  {/* Auto/Default Pill */}
                  <button
                    type="button"
                    onClick={() => setItemPriceStatusFilter("auto")}
                    className={`px-2.5 py-1 rounded-md text-[9.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      itemPriceStatusFilter === "auto"
                        ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm font-black"
                        : "bg-[var(--foreground)]/[0.04] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
                    }`}
                  >
                    <span>Auto / Default</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-mono bg-black/10 dark:bg-white/10">
                      {itemStats.autoCount}
                    </span>
                  </button>
                </div>

                {/* Items showing indicator */}
                <div className="text-[9px] font-bold text-[var(--muted)]">
                  Showing <span className="text-[var(--foreground)]">{visibleOverrides.length}</span> of{" "}
                  {itemStats.total} items
                </div>
              </div>
            </div>

            {/* ================= ITEMS GRID ================= */}
            <div className="space-y-3">
              {loadingFixedPrices ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-60">
                  <Loader2 size={28} className="animate-spin text-[var(--accent)] mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                    Fetching Items for {selectedGame?.gameName || "Game"}...
                  </p>
                </div>
              ) : visibleOverrides.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
                  {visibleOverrides.map((o, idx) => (
                    <motion.div
                      key={o.itemSlug}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.015, 0.2) }}
                      className={`p-2.5 sm:p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        o.isEnabled
                          ? "border-emerald-500/35 bg-emerald-500/[0.03] shadow-sm"
                          : "border-[var(--border)] bg-[var(--card)]/30"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] sm:text-xs font-black uppercase tracking-tight text-[var(--foreground)] truncate" title={o.itemName || o.itemSlug}>
                              {o.itemName || o.itemSlug}
                            </p>
                            <p className="text-[8px] sm:text-[9px] font-mono text-[var(--muted)]/60 truncate" title={o.itemSlug}>
                              {o.itemSlug}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* OVERRIDE TOGGLE */}
                            <div className="flex flex-col items-end gap-0.5">
                              <button
                                type="button"
                                aria-label="Toggle Price Override"
                                onClick={() => toggleOverrideStatus(o.itemSlug)}
                                className={`relative w-7 sm:w-8 h-3.5 sm:h-4 rounded-full transition-colors outline-none flex items-center px-0.5 ${
                                  o.isEnabled ? "bg-emerald-500" : "bg-[var(--border)]"
                                }`}
                              >
                                <div
                                  className={`w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white rounded-full transition-all shadow-sm ${
                                    o.isEnabled ? "translate-x-3.5 sm:translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-[7px] font-black uppercase tracking-wider ${
                                  o.isEnabled ? "text-emerald-400" : "text-[var(--muted)]"
                                }`}
                              >
                                {o.isEnabled ? "Override" : "Auto"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                            <span>Selling Price (INR)</span>
                            {o.isEnabled && (
                              <span className="text-emerald-400 hidden sm:flex items-center gap-1 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Custom
                              </span>
                            )}
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-bold text-[var(--muted)]">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={o.fixedPrice}
                              disabled={!o.isEnabled}
                              onChange={(e) => updateOverridePrice(o.itemSlug, e.target.value)}
                              className={`w-full h-8 sm:h-9 pl-6 sm:pl-7 pr-2 sm:pr-3 rounded-lg border font-mono font-black text-[11px] sm:text-xs tabular-nums outline-none transition-all ${
                                o.isEnabled
                                  ? "bg-[var(--background)] border-emerald-500/40 text-[var(--foreground)] focus:border-emerald-500"
                                  : "bg-[var(--background)]/60 border-[var(--border)] text-[var(--muted)] cursor-not-allowed"
                              }`}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>

                      {o.isEnabled && (
                        <div className="mt-2 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <span className="text-[7.5px] sm:text-[8px] font-black text-emerald-400 uppercase tracking-wider truncate">
                            Fixed Price Active
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* EMPTY STATE FOR FILTER */
                <div className="py-14 rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/20 text-center flex flex-col items-center justify-center p-6 space-y-2">
                  <div className="p-3 rounded-full bg-[var(--foreground)]/[0.03] text-[var(--muted)] mb-1">
                    <Package size={22} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                    {itemPriceStatusFilter === "set"
                      ? "No Custom Prices Set Yet"
                      : itemSearchQuery
                      ? "No Items Matching Search"
                      : "No Items Available"}
                  </h4>
                  <p className="text-[10px] text-[var(--muted)] max-w-sm">
                    {itemPriceStatusFilter === "set"
                      ? `There are no fixed price overrides enabled for ${
                          selectedGame?.gameName || "this game"
                        }. Switch to "All Items" to configure overrides.`
                      : itemSearchQuery
                      ? `No items found matching "${itemSearchQuery}". Try adjusting your search term.`
                      : "Select a game from the dropdown above to view and configure prices."}
                  </p>

                  {(itemPriceStatusFilter !== "all" || itemSearchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setItemPriceStatusFilter("all");
                        setItemSearchQuery("");
                      }}
                      className="mt-2 px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider bg-[var(--accent)] text-white hover:brightness-110 transition-all"
                    >
                      Show All Items
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
