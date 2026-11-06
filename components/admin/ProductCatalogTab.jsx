"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Gamepad2,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Save,
  Loader2,
  Layers,
  Sparkles,
  Info,
  SlidersHorizontal,
  Check,
  X
} from "lucide-react";
import { SearchInput, SectionTitle } from "@/components/common";

const API_BASE = "https://game-off-ten.vercel.app/api/v1";

/* ================= STATIC / MANUAL CATALOG FALLBACKS ================= */
const MANUAL_PRODUCTS = [
  {
    gameSlug: "youtube-premium",
    gameName: "YouTube Premium",
    items: [
      { itemSlug: "yt-1m", itemName: "YouTube Premium 1 Month", sellingPrice: 25 },
    ],
  },
  {
    gameSlug: "netflix",
    gameName: "Netflix",
    items: [
      { itemSlug: "nf-1m", itemName: "Netflix 1 Month", sellingPrice: 110 },
    ],
  },
  {
    gameSlug: "spotify",
    gameName: "Spotify Premium",
    items: [
      { itemSlug: "spot-1m", itemName: "Spotify Premium 1 Month", sellingPrice: 30 },
    ],
  },
  {
    gameSlug: "silver-membership",
    gameName: "Silver Membership",
    items: [
      { itemSlug: "silver-1m", itemName: "Silver 1 Month", sellingPrice: 99 },
      { itemSlug: "silver-3m", itemName: "Silver 3 Months", sellingPrice: 249 },
      { itemSlug: "silver-6m", itemName: "Silver 6 Months", sellingPrice: 449 },
      { itemSlug: "silver-12m", itemName: "Silver 12 Months", sellingPrice: 799 },
    ],
  },
  {
    gameSlug: "reseller-membership",
    gameName: "Reseller Membership",
    items: [
      { itemSlug: "reseller-1m", itemName: "Reseller 1 Month", sellingPrice: 69 },
      { itemSlug: "reseller-3m", itemName: "Reseller 3 Months", sellingPrice: 179 },
      { itemSlug: "reseller-6m", itemName: "Reseller 6 Months", sellingPrice: 299 },
      { itemSlug: "reseller-12m", itemName: "Reseller 12 Months", sellingPrice: 549 },
    ],
  },
  {
    gameSlug: "starlight-card-manual",
    gameName: "Starlight Card",
    items: [
      { itemSlug: "starlight-normal", itemName: "Normal Starlight", sellingPrice: 240 },
      { itemSlug: "starlight-premium", itemName: "Premium Starlight", sellingPrice: 500 },
    ],
  },
  {
    gameSlug: "bgmi-manual",
    gameName: "BGMI Manual",
    items: [
      { itemSlug: "bgmi-60", itemName: "60 UC", sellingPrice: 73 },
      { itemSlug: "bgmi-325", itemName: "325 UC", sellingPrice: 365 },
      { itemSlug: "bgmi-660", itemName: "660 UC", sellingPrice: 720 },
      { itemSlug: "bgmi-1800", itemName: "1800 UC", sellingPrice: 1800 },
      { itemSlug: "bgmi-3850", itemName: "3850 UC", sellingPrice: 2650 },
      { itemSlug: "bgmi-8100", itemName: "8100 UC", sellingPrice: 7200 },
    ],
  },
];

export default function ProductCatalogTab({ onStockUpdated }) {
  const [games, setGames] = useState([]);
  const [itemsByGame, setItemsByGame] = useState({});
  const [selectedGameSlug, setSelectedGameSlug] = useState("");
  
  // Stock state maps
  const [gameConfigs, setGameConfigs] = useState([]); // [{ gameSlug, isOutOfStock }]
  const [itemOverrides, setItemOverrides] = useState([]); // [{ gameSlug, itemSlug, isOutOfStock }]
  
  // Clean reference copy to track unsaved changes
  const [initialGameConfigs, setInitialGameConfigs] = useState([]);
  const [initialItemOverrides, setInitialItemOverrides] = useState([]);

  // Filters & Search
  const [gameSearch, setGameSearch] = useState("");
  const [gameStatusFilter, setGameStatusFilter] = useState("all"); // 'all' | 'instock' | 'oos'
  const [itemSearch, setItemSearch] = useState("");
  const [itemStatusFilter, setItemStatusFilter] = useState("all"); // 'all' | 'instock' | 'oos'

  // Loading & Saving states
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [savingStock, setSavingStock] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");

  /* ================= FETCH STOCK FROM BACKEND ================= */
  const fetchCatalogStock = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/admin/catalog", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const gc = data.data.gameConfigs || [];
        const ov = data.data.overrides || [];
        setGameConfigs(gc);
        setItemOverrides(ov);
        setInitialGameConfigs(JSON.parse(JSON.stringify(gc)));
        setInitialItemOverrides(JSON.parse(JSON.stringify(ov)));
      }
    } catch (err) {
      console.error("Failed to load catalog stock from backend:", err);
    }
  }, []);

  /* ================= FETCH GAMES LIST ================= */
  useEffect(() => {
    let isMounted = true;

    async function loadGames() {
      setLoadingGames(true);
      try {
        await fetchCatalogStock();

        const res = await fetch(`${API_BASE}/games/list`);
        const json = await res.json();
        
        let apiGames = [];
        if (json.success && Array.isArray(json.data?.games)) {
          apiGames = json.data.games;
        }

        // Merge with manual games if not already present
        const gameMap = new Map();
        apiGames.forEach((g) => gameMap.set(g.gameSlug, g));

        MANUAL_PRODUCTS.forEach((mg) => {
          if (!gameMap.has(mg.gameSlug)) {
            gameMap.set(mg.gameSlug, {
              gameSlug: mg.gameSlug,
              gameName: mg.gameName,
              isManual: true,
            });
          }
        });

        const mergedGames = Array.from(gameMap.values());
        if (isMounted) {
          setGames(mergedGames);
          if (mergedGames.length > 0 && !selectedGameSlug) {
            setSelectedGameSlug(mergedGames[0].gameSlug);
          }
        }
      } catch (err) {
        console.error("Failed to fetch games list:", err);
        // Fallback to manual products
        if (isMounted) {
          const fallbackGames = MANUAL_PRODUCTS.map((m) => ({
            gameSlug: m.gameSlug,
            gameName: m.gameName,
            isManual: true,
          }));
          setGames(fallbackGames);
          if (fallbackGames.length > 0) setSelectedGameSlug(fallbackGames[0].gameSlug);
        }
      } finally {
        if (isMounted) setLoadingGames(false);
      }
    }

    loadGames();

    return () => {
      isMounted = false;
    };
  }, [fetchCatalogStock]);

  /* ================= FETCH ITEMS FOR SELECTED GAME ================= */
  const fetchItemsForGame = useCallback(async (gameSlug) => {
    if (!gameSlug) return [];
    if (itemsByGame[gameSlug]) return itemsByGame[gameSlug];

    setLoadingItems(true);
    try {
      // Check manual catalog first
      const manualProduct = MANUAL_PRODUCTS.find((p) => p.gameSlug === gameSlug);
      if (manualProduct) {
        setItemsByGame((prev) => ({ ...prev, [gameSlug]: manualProduct.items }));
        return manualProduct.items;
      }

      // Fetch from API
      const res = await fetch(`${API_BASE}/games/${gameSlug}/items`);
      const json = await res.json();

      let items = [];
      if (json.success && Array.isArray(json.data?.items)) {
        items = json.data.items;

        /* Injected MLBB Combos */
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
                index: (weeklyPass.index || 0) + combo.multiplier * 0.1,
              });
            }
          });
          items.sort((a, b) => (Number(a.sellingPrice) || 0) - (Number(b.sellingPrice) || 0));
        }
      }

      setItemsByGame((prev) => ({ ...prev, [gameSlug]: items }));
      return items;
    } catch (err) {
      console.error(`Failed to fetch items for ${gameSlug}:`, err);
      return [];
    } finally {
      setLoadingItems(false);
    }
  }, [itemsByGame]);

  useEffect(() => {
    if (selectedGameSlug) {
      fetchItemsForGame(selectedGameSlug);
    }
  }, [selectedGameSlug, fetchItemsForGame]);

  /* ================= STOCK TOGGLE HELPERS ================= */
  const isGameOOS = useCallback((slug) => {
    const config = gameConfigs.find((g) => g.gameSlug === slug);
    return !!config?.isOutOfStock;
  }, [gameConfigs]);

  const isItemOOS = useCallback((gameSlug, itemSlug) => {
    const override = itemOverrides.find(
      (o) => o.gameSlug === gameSlug && o.itemSlug === itemSlug
    );
    return !!override?.isOutOfStock;
  }, [itemOverrides]);

  const toggleProductStock = (gameSlug) => {
    setGameConfigs((prev) => {
      const idx = prev.findIndex((g) => g.gameSlug === gameSlug);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], isOutOfStock: !next[idx].isOutOfStock };
        return next;
      }
      return [...prev, { gameSlug, isOutOfStock: true }];
    });
  };

  const setProductStockExplicit = (gameSlug, shouldBeOOS) => {
    setGameConfigs((prev) => {
      const idx = prev.findIndex((g) => g.gameSlug === gameSlug);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], isOutOfStock: shouldBeOOS };
        return next;
      }
      return [...prev, { gameSlug, isOutOfStock: shouldBeOOS }];
    });
  };

  const toggleItemStock = (gameSlug, itemSlug) => {
    setItemOverrides((prev) => {
      const idx = prev.findIndex((o) => o.gameSlug === gameSlug && o.itemSlug === itemSlug);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], isOutOfStock: !next[idx].isOutOfStock };
        return next;
      }
      return [...prev, { gameSlug, itemSlug, isOutOfStock: true }];
    });
  };

  const bulkSetItemsStock = (gameSlug, shouldBeOOS) => {
    const currentItems = itemsByGame[gameSlug] || [];
    if (currentItems.length === 0) return;

    setItemOverrides((prev) => {
      const map = new Map();
      prev.forEach((o) => map.set(`${o.gameSlug}::${o.itemSlug}`, { ...o }));

      currentItems.forEach((item) => {
        const key = `${gameSlug}::${item.itemSlug}`;
        const existing = map.get(key) || { gameSlug, itemSlug: item.itemSlug };
        map.set(key, { ...existing, isOutOfStock: shouldBeOOS });
      });

      return Array.from(map.values());
    });
  };

  /* ================= UNSAVED CHANGES CHECK ================= */
  const hasUnsavedChanges = useMemo(() => {
    const gcChanged = JSON.stringify(gameConfigs) !== JSON.stringify(initialGameConfigs);
    const ovChanged = JSON.stringify(itemOverrides) !== JSON.stringify(initialItemOverrides);
    return gcChanged || ovChanged;
  }, [gameConfigs, initialGameConfigs, itemOverrides, initialItemOverrides]);

  const unsavedCount = useMemo(() => {
    let count = 0;
    // Count changed games
    gameConfigs.forEach((gc) => {
      const init = initialGameConfigs.find((g) => g.gameSlug === gc.gameSlug);
      if (!!init?.isOutOfStock !== !!gc.isOutOfStock) count++;
    });
    // Count changed items
    itemOverrides.forEach((ov) => {
      const init = initialItemOverrides.find((o) => o.gameSlug === ov.gameSlug && o.itemSlug === ov.itemSlug);
      if (!!init?.isOutOfStock !== !!ov.isOutOfStock) count++;
    });
    return count;
  }, [gameConfigs, initialGameConfigs, itemOverrides, initialItemOverrides]);

  /* ================= SAVE CHANGES ================= */
  const handleSaveStock = async () => {
    try {
      setSavingStock(true);
      setSaveSuccessMessage("");
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameConfigs,
          overrides: itemOverrides,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to save stock updates");
      } else {
        setInitialGameConfigs(JSON.parse(JSON.stringify(gameConfigs)));
        setInitialItemOverrides(JSON.parse(JSON.stringify(itemOverrides)));
        setSaveSuccessMessage("Stock updated successfully across all store roles!");
        setTimeout(() => setSaveSuccessMessage(""), 4000);

        if (typeof onStockUpdated === "function") {
          onStockUpdated();
        }
      }
    } catch (err) {
      console.error("Save stock error:", err);
      alert("Error saving stock updates: " + err.message);
    } finally {
      setSavingStock(false);
    }
  };

  /* ================= FILTERED LISTS & STATS ================= */
  const filteredGames = useMemo(() => {
    const query = gameSearch.trim().toLowerCase();
    return games.filter((g) => {
      const matchesQuery =
        !query ||
        g.gameName?.toLowerCase().includes(query) ||
        g.gameSlug?.toLowerCase().includes(query);

      if (!matchesQuery) return false;

      const oos = isGameOOS(g.gameSlug);
      if (gameStatusFilter === "instock") return !oos;
      if (gameStatusFilter === "oos") return oos;
      return true;
    });
  }, [games, gameSearch, gameStatusFilter, isGameOOS]);

  const activeGame = useMemo(() => {
    return games.find((g) => g.gameSlug === selectedGameSlug) || null;
  }, [games, selectedGameSlug]);

  const activeGameItems = useMemo(() => {
    if (!selectedGameSlug) return [];
    return itemsByGame[selectedGameSlug] || [];
  }, [itemsByGame, selectedGameSlug]);

  const filteredItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    return activeGameItems.filter((i) => {
      const matchesQuery =
        !query ||
        i.itemName?.toLowerCase().includes(query) ||
        i.itemSlug?.toLowerCase().includes(query);

      if (!matchesQuery) return false;

      const oos = isItemOOS(selectedGameSlug, i.itemSlug);
      if (itemStatusFilter === "instock") return !oos;
      if (itemStatusFilter === "oos") return oos;
      return true;
    });
  }, [activeGameItems, itemSearch, itemStatusFilter, isItemOOS, selectedGameSlug]);

  // Overall catalog counts
  const totalProductsCount = games.length;
  const oosProductsCount = useMemo(() => {
    return games.filter((g) => isGameOOS(g.gameSlug)).length;
  }, [games, isGameOOS]);
  const inStockProductsCount = totalProductsCount - oosProductsCount;

  // Selected product items counts
  const activeItemsTotal = activeGameItems.length;
  const activeItemsOOS = useMemo(() => {
    if (!selectedGameSlug) return 0;
    return activeGameItems.filter((i) => isItemOOS(selectedGameSlug, i.itemSlug)).length;
  }, [activeGameItems, isItemOOS, selectedGameSlug]);
  const activeItemsInStock = activeItemsTotal - activeItemsOOS;

  const currentProductIsOOS = selectedGameSlug ? isGameOOS(selectedGameSlug) : false;

  return (
    <div className="space-y-6 pb-20 max-w-full overflow-x-hidden text-[var(--foreground)]">
      {/* ================= HEADER BAR ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]/40">
        <div>
          <SectionTitle
            size="xs"
            subtitle="Inventory & Stock Availability"
            title="Product"
            highlight="Catalog"
            icon={<Package size={13} className="text-[var(--accent)]" />}
          />
          <p className="text-[11px] text-[var(--muted)] mt-1">
            Toggle in-stock or out-of-stock status for products and individual catalog items across the store.
          </p>
        </div>

        {/* Global Action / Stats & Save */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Products Summary Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--card)]/60 border border-[var(--border)] text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded text-[var(--muted)]">
              {totalProductsCount} Products
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {inStockProductsCount} In Stock
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {oosProductsCount} Out of Stock
            </span>
          </div>

          {/* Unsaved indicator */}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{unsavedCount} Unsaved {unsavedCount === 1 ? "Change" : "Changes"}</span>
            </div>
          )}

          {/* Save Button */}
          <button
            aria-label="Save Catalog Stock"
            onClick={handleSaveStock}
            disabled={!hasUnsavedChanges || savingStock}
            className={`px-4 py-2 rounded-lg text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm ${
              hasUnsavedChanges
                ? "bg-[var(--accent)] text-white hover:brightness-110 active:scale-95 shadow-[var(--accent)]/20 cursor-pointer"
                : "bg-[var(--foreground)]/[0.04] text-[var(--muted)]/40 border border-[var(--border)] cursor-not-allowed"
            }`}
          >
            {savingStock ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Saving Stock...</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      <AnimatePresence>
        {saveSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-emerald-400 text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{saveSuccessMessage}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMessage("")}
              className="text-emerald-400/80 hover:text-emerald-300"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAIN SPLIT VIEW ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[600px]">
        {/* ================= LEFT COLUMN: PRODUCTS LIST ================= */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-3">
          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 size={15} className="text-[var(--accent)]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                  Products ({filteredGames.length})
                </h3>
              </div>
              <button
                title="Refresh product list"
                onClick={() => fetchCatalogStock()}
                className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] transition-all"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Search Games */}
            <SearchInput
              placeholder="Search products or slugs..."
              value={gameSearch}
              onChange={setGameSearch}
              size="sm"
            />

            {/* Filter Pills */}
            <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-[var(--background)]/80 border border-[var(--border)]/60 text-[9px] font-black uppercase tracking-wider">
              {[
                { id: "all", label: "All" },
                { id: "instock", label: "In Stock" },
                { id: "oos", label: "OOS" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setGameStatusFilter(f.id)}
                  className={`py-1 rounded-md transition-all text-center ${
                    gameStatusFilter === f.id
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Scrollable List */}
          <div className="flex-1 overflow-y-auto max-h-[580px] space-y-1.5 p-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/30 custom-scrollbar">
            {loadingGames ? (
              <div className="py-20 flex flex-col items-center justify-center opacity-40">
                <Loader2 size={24} className="animate-spin text-[var(--accent)] mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Loading Catalog...</p>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="py-16 text-center opacity-40">
                <Package size={28} className="mx-auto mb-2 text-[var(--muted)]" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No products match filter</p>
              </div>
            ) : (
              filteredGames.map((g) => {
                const isSelected = selectedGameSlug === g.gameSlug;
                const oos = isGameOOS(g.gameSlug);

                return (
                  <div
                    key={g.gameSlug}
                    onClick={() => setSelectedGameSlug(g.gameSlug)}
                    className={`w-full group relative flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--accent)]/10 border-[var(--accent)]/40 shadow-sm"
                        : "bg-[var(--background)]/40 hover:bg-[var(--foreground)]/[0.03] border-[var(--border)]/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-2 h-8 rounded-full transition-all shrink-0 ${
                          oos ? "bg-rose-500 shadow-sm shadow-rose-500/40" : "bg-emerald-400 shadow-sm shadow-emerald-400/40"
                        }`}
                      />
                      <div className="flex flex-col items-start min-w-0">
                        <span
                          className={`text-[11.5px] font-bold uppercase tracking-tight truncate leading-tight ${
                            isSelected ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                          }`}
                        >
                          {g.gameName || g.gameSlug}
                        </span>
                        <span className="text-[9px] font-mono text-[var(--muted)]/60 truncate">
                          {g.gameSlug}
                        </span>
                      </div>
                    </div>

                    {/* Stock Status Pill + Toggle */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          oos
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {oos ? "OOS" : "In Stock"}
                      </span>

                      {/* Interactive Toggle Switch */}
                      <button
                        type="button"
                        aria-label={`Toggle stock for ${g.gameName}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProductStock(g.gameSlug);
                        }}
                        title={oos ? "Click to set IN STOCK" : "Click to set OUT OF STOCK"}
                        className={`w-8 h-4.5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer outline-none ${
                          oos
                            ? "bg-rose-500"
                            : "bg-emerald-500/30 border border-emerald-500/50 hover:bg-emerald-500/40"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm ${
                            oos ? "translate-x-3.5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ITEMS OF SELECTED PRODUCT ================= */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-4">
          {!activeGame ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-xl border border-[var(--border)] bg-[var(--card)]/30 text-center opacity-40">
              <Package size={36} className="text-[var(--muted)] mb-3" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                No Product Selected
              </h4>
              <p className="text-xs text-[var(--muted)] max-w-sm mt-1">
                Select a product from the left catalog panel to manage its inventory and item stock statuses.
              </p>
            </div>
          ) : (
            <>
              {/* Product Info Card & Master Product Stock Switch */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[var(--foreground)] truncate">
                        {activeGame.gameName || activeGame.gameSlug}
                      </h2>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--muted)]">
                        {activeGame.gameSlug}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">
                      {activeItemsTotal} items in this product • {activeItemsInStock} in stock • {activeItemsOOS} out of stock
                    </p>
                  </div>

                  {/* MASTER PRODUCT STOCK CONTROL */}
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--background)]/80 border border-[var(--border)] shrink-0 self-start sm:self-auto">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black uppercase tracking-wider text-[var(--muted)]">
                        Product Stock
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase ${
                          currentProductIsOOS ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {currentProductIsOOS ? "Out of Stock" : "In Stock"}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label="Toggle entire product stock"
                      onClick={() => toggleProductStock(activeGame.gameSlug)}
                      title={currentProductIsOOS ? "Mark Product In Stock" : "Mark Product Out of Stock"}
                      className={`w-11 h-6 rounded-full transition-all flex items-center px-1 cursor-pointer outline-none shadow-sm ${
                        currentProductIsOOS
                          ? "bg-rose-500 shadow-rose-500/20"
                          : "bg-emerald-500 shadow-emerald-500/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-all shadow-md ${
                          currentProductIsOOS ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* WARNING BANNER IF WHOLE PRODUCT IS OUT OF STOCK */}
                {currentProductIsOOS && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs"
                  >
                    <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black uppercase tracking-wider text-rose-400 block text-[10px] mb-0.5">
                        Product Marked Out of Stock
                      </span>
                      <span className="text-[11px] leading-relaxed">
                        This product is currently disabled on the store catalog. All items below are effectively out of stock for customers until the product is stocked back. You can still manage item-level stock below.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* ITEM CONTROLS & BULK ACTIONS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2 border-t border-[var(--border)]/40">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    {/* Item Search */}
                    <div className="w-full sm:w-56">
                      <SearchInput
                        placeholder="Filter items..."
                        value={itemSearch}
                        onChange={setItemSearch}
                        size="sm"
                      />
                    </div>

                    {/* Item Status Filters */}
                    <div className="flex p-0.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[9px] font-black uppercase tracking-wider">
                      {[
                        { id: "all", label: "All Items" },
                        { id: "instock", label: "In Stock" },
                        { id: "oos", label: "OOS" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setItemStatusFilter(f.id)}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            itemStatusFilter === f.id
                              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                              : "text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Set Items */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => bulkSetItemsStock(activeGame.gameSlug, false)}
                      className="px-2.5 py-1 rounded-lg text-[9.5px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Check size={11} />
                      <span>Stock All</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => bulkSetItemsStock(activeGame.gameSlug, true)}
                      className="px-2.5 py-1 rounded-lg text-[9.5px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <X size={11} />
                      <span>OOS All</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= ITEMS GRID ================= */}
              <div className="flex-1 overflow-y-auto max-h-[520px] custom-scrollbar p-1">
                {loadingItems ? (
                  <div className="py-20 flex flex-col items-center justify-center opacity-40">
                    <Loader2 size={24} className="animate-spin text-[var(--accent)] mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Loading Items...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="py-20 text-center rounded-xl border border-[var(--border)] bg-[var(--card)]/20 opacity-40">
                    <Layers size={28} className="mx-auto mb-2 text-[var(--muted)]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      {activeGameItems.length === 0 ? "No items found for this product" : "No items match current filter"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filteredItems.map((item, idx) => {
                      const itemOOS = isItemOOS(activeGame.gameSlug, item.itemSlug);
                      const effectivelyOOS = currentProductIsOOS || itemOOS;

                      return (
                        <motion.div
                          key={item.itemSlug}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.015, 0.2) }}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                            itemOOS
                              ? "bg-rose-500/[0.04] border-rose-500/30 shadow-sm"
                              : "bg-[var(--card)]/40 hover:bg-[var(--card)]/60 border-[var(--border)]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black uppercase tracking-tight text-[var(--foreground)] truncate">
                                {item.itemName || item.itemSlug}
                              </p>
                              <p className="text-[9.5px] font-mono text-[var(--muted)]/60 truncate mt-0.5">
                                {item.itemSlug}
                              </p>
                              {item.sellingPrice != null && (
                                <p className="text-[10.5px] font-mono font-bold text-[var(--accent)] mt-1.5">
                                  ₹ {item.sellingPrice}
                                </p>
                              )}
                            </div>

                            {/* ITEM STOCK TOGGLE BUTTON & BADGE */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span
                                className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  itemOOS
                                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                }`}
                              >
                                {itemOOS ? "OOS" : "In Stock"}
                              </span>

                              <button
                                type="button"
                                aria-label={`Toggle item stock for ${item.itemName}`}
                                onClick={() => toggleItemStock(activeGame.gameSlug, item.itemSlug)}
                                title={itemOOS ? "Mark Item In Stock" : "Mark Item Out of Stock"}
                                className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5 cursor-pointer outline-none ${
                                  itemOOS
                                    ? "bg-rose-500 shadow-sm shadow-rose-500/30"
                                    : "bg-emerald-500/30 border border-emerald-500/50 hover:bg-emerald-500/40"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                                    itemOOS ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Footer status notice if parent product is OOS */}
                          {currentProductIsOOS && !itemOOS && (
                            <div className="pt-2 border-t border-[var(--border)]/30 flex items-center gap-1.5 text-[8.5px] font-medium text-amber-400/90">
                              <Info size={11} className="shrink-0" />
                              <span className="truncate">Marked In Stock, but parent product is OOS</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
