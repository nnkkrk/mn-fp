"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  Coins,
  Settings2,
  Trash2,
  RefreshCcw,
  Gamepad2,
  Save,
  ChevronDown,
  Info,
  Shield,
  IndianRupee,
  Loader2,
  Package
} from "lucide-react";
import { SearchInput, InfoTooltip, SectionTitle } from "@/components/common";

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
  const [fixedItemFilter, setFixedItemFilter] = useState("");
  const [loadingFixedPrices, setLoadingFixedPrices] = useState(false);
  const [bulkPercent, setBulkPercent] = useState("");
  const [isAutoSaving, setIsAutoSaving] = useState(false);



  const filteredGames = useMemo(() => {
    return games.filter(g => 
      g.gameName.toLowerCase().includes(gameSearch.toLowerCase()) || 
      g.gameSlug.toLowerCase().includes(gameSearch.toLowerCase())
    );
  }, [games, gameSearch]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/games/list`);
        const json = await res.json();
        if (json.success) setGames(json.data.games);
      } catch (e) {
        console.error("Game fetch failed", e);
      }
    })();
  }, []);

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
      setFixedItemFilter("");
    } finally {
      setLoadingFixedPrices(false);
    }
  };

  useEffect(() => {
    if (pricingMode !== "fixed") return;
    if (!fixedGameFilter) return;
    hydrateFixedPricing(fixedGameFilter);
  }, [pricingMode, pricingType, fixedGameFilter]);

  const visibleOverrides = useMemo(() => {
    if (!fixedGameFilter) return [];
    const items = itemsByGame[fixedGameFilter] || [];
    
    return items.map(item => {
      const override = overrides.find(o => o.gameSlug === fixedGameFilter && o.itemSlug === item.itemSlug);
      return {
        gameSlug: fixedGameFilter,
        itemSlug: item.itemSlug,
        itemName: item.itemName,
        fixedPrice: override?.fixedPrice ?? Number(item.sellingPrice) ?? 0,
        isEnabled: override?.isEnabled ?? false,
        isOutOfStock: override?.isOutOfStock ?? false,
      };
    }).filter(o => {
      if (fixedItemFilter && o.itemSlug !== fixedItemFilter) return false;
      return true;
    });
  }, [overrides, fixedGameFilter, fixedItemFilter, itemsByGame]);

  const updateOverrideState = (itemSlug, updates) => {
    setOverrides(prev => {
      const idx = prev.findIndex(o => o.gameSlug === fixedGameFilter && o.itemSlug === itemSlug);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...updates };
        // Optional: filter out if both are false/default? 
        // But let's keep it simple for now, the user wants to save what they edit.
        return next;
      } else {
        const item = itemsByGame[fixedGameFilter]?.find(i => i.itemSlug === itemSlug);
        return [...prev, {
          gameSlug: fixedGameFilter,
          itemSlug,
          itemName: item?.itemName || itemSlug,
          fixedPrice: updates.fixedPrice ?? Number(item?.sellingPrice) ?? 0,
          isEnabled: updates.isEnabled ?? false,
          isOutOfStock: updates.isOutOfStock ?? false,
        }];
      }
    });
  };

  const updateOverridePrice = (itemSlug, value) => {
    updateOverrideState(itemSlug, { fixedPrice: Math.max(0, Number(value) || 0) });
  };

  const toggleOverrideStatus = (itemSlug) => {
    const current = visibleOverrides.find(o => o.itemSlug === itemSlug);
    updateOverrideState(itemSlug, { isEnabled: !current?.isEnabled });
  };



  const applyBulkPercentage = () => {
    const percent = Number(bulkPercent);
    if (!Number.isFinite(percent) || percent === 0) return;
    const multiplier = 1 + percent / 100;
    const next = overrides.map((o) => {
      if ((fixedGameFilter && o.gameSlug !== fixedGameFilter) || (fixedItemFilter && o.itemSlug !== fixedItemFilter)) {
        return o;
      }
      return { ...o, fixedPrice: Math.round(o.fixedPrice * multiplier) };
    });
    setOverrides(next);
    setBulkPercent("");
  };

  const updateSlab = (i, key, value) => {
    const next = [...slabs];
    next[i][key] = Math.max(0, Number(value) || 0);
    setSlabs(next);
  };

  const addSlab = () => setSlabs([...slabs, { min: 0, max: 0, percent: 0 }]);
  const deleteSlab = (i) => setSlabs(slabs.filter((_, idx) => idx !== i));
  const canSave = !savingPricing && ((pricingMode === "percent" && slabs.length) || (pricingMode === "fixed" && overrides.length));

  return (
    <div className="space-y-6 pb-20 max-w-full overflow-x-hidden">
      {/* ================= TOP BAR ================= */}
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
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
            {[{ id: "percent", label: "Markup", icon: <Percent size={11} /> }, { id: "fixed", label: "Fixed", icon: <Coins size={11} /> }].map((m) => (
              <button aria-label="button"
                key={m.id}
                onClick={() => setPricingMode(m.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-sm text-[9.5px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${pricingMode === m.id
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
              <button aria-label="button"
                key={type}
                onClick={() => setPricingType(type)}
                className={`px-2.5 py-1 rounded-sm text-[9.5px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${pricingType === type
                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button aria-label="button"
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
            ) : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 min-h-[500px]">
        {/* ================= LEFT SIDEBAR (GAMES) ================= */}
        {pricingMode === "fixed" && (
          <div className="w-full lg:w-72 flex flex-col gap-3">
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">Games</h3>
                <Gamepad2 size={13} className="text-[var(--accent)]" />
              </div>
              <SearchInput
                placeholder="Search games..."
                value={gameSearch}
                onChange={setGameSearch}
                size="sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-48 sm:max-h-56 lg:max-h-[550px] space-y-0.5 p-1 rounded-xl border border-[var(--border)] bg-[var(--card)]/30 custom-scrollbar">
              {filteredGames.map((g) => (
                <button aria-label="button"
                  key={g.gameSlug}
                  onClick={() => setFixedGameFilter(g.gameSlug)}
                  className={`w-full group relative flex items-center justify-between px-2 py-1.5 rounded-md transition-all ${
                    fixedGameFilter === g.gameSlug
                      ? "bg-[var(--accent)]/10 border border-[var(--accent)]/20"
                      : "hover:bg-[var(--foreground)]/[0.02] border border-transparent"
                  }`}
                >
                  <div className="flex flex-col items-start min-w-0">
                    <span className={`text-[11px] font-bold uppercase tracking-tight truncate ${fixedGameFilter === g.gameSlug ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
                      {g.gameName}
                    </span>
                    <span className="text-[8.5px] font-mono text-[var(--muted)]/50 truncate leading-none">{g.gameSlug}</span>
                  </div>


                </button>
              ))}
              {filteredGames.length === 0 && (
                <div className="py-8 text-center opacity-30">
                  <p className="text-[10px] font-bold uppercase tracking-widest">No games found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="flex-1 space-y-4">
          <AnimatePresence mode="wait">
            {pricingMode === "percent" ? (
              <motion.div
                key="markup-pane"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                {/* Clean Flat Markup Table Container */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/30 overflow-hidden">
                  <div className="px-3.5 sm:px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                        <Percent size={14} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] truncate">Profit Markup</h3>
                        <p className="text-[9.5px] text-[var(--muted)] truncate">Percentage profit based on price ranges</p>
                      </div>
                    </div>
                    <button aria-label="button"
                      onClick={addSlab}
                      className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-white text-[9.5px] font-black uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 whitespace-nowrap shrink-0"
                    >
                      + Add Range
                    </button>
                  </div>

                  <div className="divide-y divide-[var(--border)]">
                    {/* Header Columns */}
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
                          {/* Min Price */}
                          <div className="flex-1 min-w-0">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--muted)]">₹</span>
                              <input
                                type="number"
                                value={s.min}
                                onChange={(e) => updateSlab(i, "min", e.target.value)}
                                className="w-full h-8 pl-6 pr-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono font-bold text-xs outline-none focus:border-[var(--accent)]/50 transition-all"
                                placeholder="Min"
                              />
                            </div>
                          </div>

                          <span className="text-[10px] font-bold uppercase text-[var(--muted)]/60 shrink-0">to</span>

                          {/* Max Price */}
                          <div className="flex-1 min-w-0">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--muted)]">₹</span>
                              <input
                                type="number"
                                value={s.max}
                                onChange={(e) => updateSlab(i, "max", e.target.value)}
                                className="w-full h-8 pl-6 pr-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono font-bold text-xs outline-none focus:border-[var(--accent)]/50 transition-all"
                                placeholder="Max"
                              />
                            </div>
                          </div>

                          {/* Profit % */}
                          <div className="w-20 sm:w-28 shrink-0">
                            <div className="relative">
                              <input
                                type="number"
                                value={s.percent}
                                onChange={(e) => updateSlab(i, "percent", e.target.value)}
                                className="w-full h-8 pl-2.5 pr-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-black text-xs outline-none focus:border-emerald-500/40 transition-all placeholder:text-emerald-500/40 text-right sm:text-left"
                                placeholder="5"
                              />
                              <Percent size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                            </div>
                          </div>

                          {/* Delete */}
                          <button aria-label="button"
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
                        <p className="text-[9.5px] font-black uppercase tracking-wider text-[var(--muted)]">No markup ranges defined</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="fixed"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="space-y-4"
              >
                {/* ITEMS GRID */}

                {/* ITEMS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <AnimatePresence>
                    {loadingFixedPrices ? (
                      <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-40">
                        <Loader2 size={28} className="animate-spin text-[var(--accent)] mb-3" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Fetching Prices...</p>
                      </div>
                    ) : (
                      visibleOverrides.map((o, idx) => (
                        <motion.div
                          key={o.itemSlug}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.01 }}
                          className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                            o.isEnabled 
                              ? "border-[var(--accent)]/30 bg-[var(--card)]/60 shadow-sm" 
                              : "border-[var(--border)] bg-[var(--card)]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="min-w-0">
                              <p className="text-xs font-black uppercase tracking-tight text-[var(--foreground)] truncate">
                                {o.itemName || o.itemSlug}
                              </p>
                              <p className="text-[9px] font-mono text-[var(--muted)]/60 truncate">{o.itemSlug}</p>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                              {/* OVERRIDE TOGGLE */}
                              <div className="flex flex-col items-end gap-0.5">
                                <button aria-label="button"
                                  onClick={() => toggleOverrideStatus(o.itemSlug)}
                                  className={`relative w-8 h-4 rounded-full transition-colors outline-none flex items-center px-0.5 ${
                                    o.isEnabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                                  }`}
                                >
                                  <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${
                                    o.isEnabled ? "translate-x-4" : "translate-x-0"
                                  }`} />
                                </button>
                                <span className="text-[7px] font-black uppercase tracking-wider text-[var(--muted)]">
                                  {o.isEnabled ? "Override" : "Auto"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-wider text-[var(--muted)]">Selling Price (INR)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)]">₹</span>
                              <input
                                type="number"
                                value={o.fixedPrice}
                                disabled={!o.isEnabled}
                                onChange={(e) => updateOverridePrice(o.itemSlug, e.target.value)}
                                className={`w-full h-9 pl-7 pr-3 rounded-lg border font-mono font-black text-xs tabular-nums outline-none transition-all ${
                                  o.isEnabled 
                                    ? "bg-[var(--background)] border-[var(--accent)]/40 text-[var(--foreground)] focus:border-[var(--accent)]" 
                                    : "bg-[var(--background)]/60 border-[var(--border)] text-[var(--muted)] cursor-not-allowed"
                                }`}
                                placeholder="0"
                              />
                            </div>
                          </div>
                          
                          {o.isEnabled && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider">Fixed Price Active</span>
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
