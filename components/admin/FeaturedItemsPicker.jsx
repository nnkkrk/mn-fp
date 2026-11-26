"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Check, Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";

/**
 * Owner-panel picker to select individual game items (e.g. Weekly Pass, 86 Diamonds)
 * for the Home quick-product strip (StorySlider replacement).
 */
export default function FeaturedItemsPicker({ initialItems, onSaved }) {
  const [selectedItems, setSelectedItems] = useState(Array.isArray(initialItems) ? initialItems : []);
  const [games, setGames] = useState([]);
  const [selectedGameSlug, setSelectedGameSlug] = useState("");
  const [gameItems, setGameItems] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    if (Array.isArray(initialItems)) {
      setSelectedItems(initialItems);
      return;
    }
    let mounted = true;
    const token = localStorage.getItem("token");
    fetch("/api/admin/settings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        if (json?.success && Array.isArray(json?.data?.featuredStoryItems)) {
          setSelectedItems(json.data.featuredStoryItems);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [initialItems]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/games")
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        const list = json?.data?.games || [];
        setGames(list);
        if (list.length > 0) {
          setSelectedGameSlug(list[0].gameSlug);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingGames(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedGameSlug) return;
    let mounted = true;
    setLoadingItems(true);
    fetch(`/api/games/${selectedGameSlug}`)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        const raw = json?.data?.itemId || [];
        const sorted = [...raw].sort((a, b) => (a.sellingPrice || 0) - (b.sellingPrice || 0));
        setGameItems(sorted);
      })
      .catch(() => {
        if (mounted) setGameItems([]);
      })
      .finally(() => {
        if (mounted) setLoadingItems(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedGameSlug]);

  const activeGame = games.find((g) => g.gameSlug === selectedGameSlug);

  const isSelected = (gameSlug, itemSlug) =>
    selectedItems.some((s) => s.gameSlug === gameSlug && s.itemSlug === itemSlug);

  const handleAddItem = (item) => {
    if (!activeGame || isSelected(activeGame.gameSlug, item.itemSlug)) return;
    const img = item?.itemImageId?.image || activeGame.gameImageId?.image || "/game-assets/weeklypass.webp";
    setSelectedItems((prev) => [
      ...prev,
      {
        gameSlug: activeGame.gameSlug,
        gameName: activeGame.gameName || "",
        itemSlug: item.itemSlug,
        itemName: item.itemName,
        sellingPrice: Number(item.sellingPrice) || 0,
        dummyPrice: Number(item.dummyPrice) || 0,
        image: img,
      },
    ]);
    setStatus({ type: "", text: "" });
  };

  const handleRemoveItem = (idx) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== idx));
    setStatus({ type: "", text: "" });
  };

  const handleMove = (idx, dir) => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= selectedItems.length) return;
    setSelectedItems((prev) => {
      const copy = [...prev];
      [copy[idx], copy[nextIdx]] = [copy[nextIdx], copy[idx]];
      return copy;
    });
    setStatus({ type: "", text: "" });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setStatus({ type: "", text: "" });
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featuredStoryItems: selectedItems }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus({ type: "success", text: "Featured items saved!" });
        if (onSaved && json.data) onSaved(json.data);
      } else {
        setStatus({ type: "error", text: json.message || "Failed to save" });
      }
    } catch {
      setStatus({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--accent)]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
              Featured Quick Items (Home Strip)
            </h3>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Pick individual items to show on the home strip. Clicking an item opens its game with that item pre-selected.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Items ({selectedItems.length})
        </button>
      </div>

      {status.text && (
        <div
          className={`px-3 py-2 rounded-xl text-xs font-semibold ${
            status.type === "success"
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {status.text}
        </div>
      )}

      {/* Selected Items List */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Selected Items ({selectedItems.length})
        </p>
        {selectedItems.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--muted)] text-center">
            No items selected yet. Choose a game below and add items.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {selectedItems.map((item, idx) => (
              <div
                key={`${item.gameSlug}-${item.itemSlug}-${idx}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)]/60"
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[var(--foreground)]/[0.04]">
                  <Image
                    src={item.image || "/game-assets/weeklypass.webp"}
                    alt={item.itemName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--foreground)] truncate">{item.itemName}</p>
                  <p className="text-[10px] text-[var(--muted)] truncate">
                    {item.gameName || item.gameSlug} · <span className="text-[var(--accent)] font-bold">₹{item.sellingPrice}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded-md hover:bg-[var(--foreground)]/10 disabled:opacity-30 text-[var(--muted)]"
                    title="Move left"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === selectedItems.length - 1}
                    className="p-1 rounded-md hover:bg-[var(--foreground)]/10 disabled:opacity-30 text-[var(--muted)]"
                    title="Move right"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 rounded-md hover:bg-red-500/10 text-red-500"
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Game & Item Picker */}
      <div className="pt-3 border-t border-[var(--border)]/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-xs font-bold text-[var(--foreground)] shrink-0">
            Browse Game Items:
          </label>
          <select
            value={selectedGameSlug}
            onChange={(e) => setSelectedGameSlug(e.target.value)}
            disabled={loadingGames}
            className="flex-1 max-w-sm text-xs px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
          >
            {games.map((g) => (
              <option key={g.gameSlug} value={g.gameSlug}>
                {g.gameName} ({g.gameSlug})
              </option>
            ))}
          </select>
        </div>

        {loadingItems ? (
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] py-3">
            <Loader2 size={14} className="animate-spin" /> Loading items...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
            {gameItems.map((item) => {
              const added = isSelected(selectedGameSlug, item.itemSlug);
              const img = item?.itemImageId?.image || activeGame?.gameImageId?.image || "/game-assets/weeklypass.webp";
              return (
                <button
                  key={item.itemSlug}
                  type="button"
                  onClick={() => handleAddItem(item)}
                  disabled={added}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    added
                      ? "border-emerald-500/40 bg-emerald-500/5 opacity-75 cursor-default"
                      : "border-[var(--border)] hover:border-[var(--accent)]/50 bg-[var(--background)]/40 cursor-pointer"
                  }`}
                >
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-[var(--foreground)]/[0.04]">
                    <Image src={img} alt={item.itemName} fill sizes="36px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--foreground)] truncate">{item.itemName}</p>
                    <p className="text-[11px] font-black text-[var(--accent)]">₹{item.sellingPrice}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-[var(--foreground)]/[0.06] text-[var(--foreground)] flex items-center gap-1">
                    {added ? (
                      <>
                        <Check size={12} className="text-emerald-500" /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={12} /> Add
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
