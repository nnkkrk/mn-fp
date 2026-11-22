"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Zap,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Save,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Tag,
  Eye,
  EyeOff,
  Percent,
  Calendar,
  Gamepad2,
  ImageIcon
} from "lucide-react";
import { SectionTitle, LoadingSpinner, InfoTooltip, EmptyState } from "@/components/common";

const ASSET_PRESETS = [
  { label: "Weekly Pass", src: "/game-assets/weeklypass.webp", game: "MLBB" },
  { label: "Weekly Bundle", src: "/game-assets/weekly-monthly-bundle.webp", game: "MLBB" },
  { label: "Starlight Card", src: "/game-assets/starkight.webp", game: "MLBB" },
  { label: "Genshin Welkin", src: "/game-assets/genshin.webp", game: "Genshin" },
  { label: "Honor of Kings", src: "/game-assets/hok.webp", game: "HOK" },
  { label: "BGMI India", src: "/game-assets/bgmi_india.webp", game: "BGMI" },
  { label: "Double Dias", src: "/game-assets/double-dias.webp", game: "MLBB" },
  { label: "MLBB India", src: "/game-assets/mlbbindia.webp", game: "MLBB" },
];

export default function FlashSaleTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Main Config State
  const [title, setTitle] = useState("Flash Sale");
  const [enabled, setEnabled] = useState(true);
  const [endTime, setEndTime] = useState("");
  const [items, setItems] = useState([]);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [itemForm, setItemForm] = useState({
    id: "",
    name: "",
    game: "MLBB",
    image: "/game-assets/weeklypass.webp",
    price: "₹149",
    originalPrice: "₹170",
    slug: "mobile-legends114?type=weekly-pass",
    badge: "Hot",
    enabled: true,
  });

  useEffect(() => {
    fetchFlashSaleConfig();
  }, []);

  const fetchFlashSaleConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/flash-sale", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setTitle(d.title || "Flash Sale");
        setEnabled(d.enabled !== false);
        setItems(d.items || []);

        if (d.endTime) {
          const date = new Date(d.endTime);
          // Format for datetime-local input (YYYY-MM-DDTHH:mm)
          const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setEndTime(localIso);
        } else {
          const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
          const localIso = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setEndTime(localIso);
        }
      }
    } catch (err) {
      console.error("Failed to load flash sale config:", err);
      setMessage({ type: "error", text: "Failed to load Flash Sale settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async (overrideItems) => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");

      const itemsToSave = overrideItems || items;

      const payload = {
        title: title.trim() || "Flash Sale",
        enabled,
        endTime: endTime ? new Date(endTime).toISOString() : null,
        items: itemsToSave,
      };

      const res = await fetch("/api/admin/flash-sale", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Flash Sale configuration updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      } else {
        setMessage({ type: "error", text: json.message || "Failed to update Flash Sale" });
      }
    } catch (err) {
      console.error("Error saving flash sale config:", err);
      setMessage({ type: "error", text: "Network error saving settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleExtendHours = (hours) => {
    const current = endTime ? new Date(endTime) : new Date();
    const extended = new Date(current.getTime() + hours * 60 * 60 * 1000);
    const localIso = new Date(extended.getTime() - extended.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEndTime(localIso);
    setMessage({ type: "success", text: `Extended countdown timer by +${hours} hours!` });
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setItemForm({
      id: `fs_${Date.now()}`,
      name: "",
      game: "MLBB",
      image: "/game-assets/weeklypass.webp",
      price: "₹",
      originalPrice: "₹",
      slug: "",
      badge: "Hot",
      enabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    setItemForm({ ...items[index] });
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!itemForm.name.trim() || !itemForm.price.trim()) {
      alert("Please provide at least the item name and deal price.");
      return;
    }

    const updated = [...items];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...itemForm };
    } else {
      updated.push({
        ...itemForm,
        id: itemForm.id.trim() || `fs_${Date.now()}`,
      });
    }

    setItems(updated);
    setIsModalOpen(false);
    handleSaveAll(updated);
  };

  const handleDeleteItem = (index) => {
    if (!confirm(`Are you sure you want to remove ${items[index].name} from Flash Sale?`)) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    handleSaveAll(updated);
  };

  const handleToggleItem = (index) => {
    const updated = [...items];
    updated[index].enabled = !updated[index].enabled;
    setItems(updated);
    handleSaveAll(updated);
  };

  const calculateDiscountPercent = (pStr, opStr) => {
    try {
      const p = parseFloat(String(pStr).replace(/[^\d.]/g, ""));
      const op = parseFloat(String(opStr).replace(/[^\d.]/g, ""));
      if (op > p && op > 0) {
        return Math.round(((op - p) / op) * 100);
      }
    } catch {}
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LoadingSpinner size="lg" color="accent" />
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Loading Flash Sale Settings...</p>
      </div>
    );
  }

  const activeItemsCount = items.filter((i) => i.enabled !== false).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchFlashSaleConfig}
            disabled={saving}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-all flex items-center justify-center cursor-pointer shrink-0"
            title="Refresh"
          >
            <RefreshCcw size={12} className={saving ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ALERT MESSAGE BANNER */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-3 rounded-xl border ${
            message.type === "success"
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-rose-400 bg-rose-500/10 border-rose-500/20"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* QUICK STATUS METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] space-y-1">
          <span className="text-[10px] uppercase font-black text-[var(--muted)] tracking-wider">Homepage Display</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${enabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            <span className="text-sm font-black text-[var(--foreground)]">{enabled ? "VISIBLE" : "HIDDEN"}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] space-y-1">
          <span className="text-[10px] uppercase font-black text-[var(--muted)] tracking-wider">Active Deals</span>
          <div className="text-sm font-black text-[var(--foreground)] tabular-nums">
            {activeItemsCount} <span className="text-[11px] text-[var(--muted)] font-normal">/ {items.length} Total</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] space-y-1">
          <span className="text-[10px] uppercase font-black text-[var(--muted)] tracking-wider">Campaign Title</span>
          <div className="text-sm font-black text-amber-400 truncate">
            {title || "Flash Sale"}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] space-y-1">
          <span className="text-[10px] uppercase font-black text-[var(--muted)] tracking-wider">Ends At</span>
          <div className="text-xs font-mono font-bold text-[var(--foreground)] truncate">
            {endTime ? new Date(endTime).toLocaleString() : "No end time"}
          </div>
        </div>
      </div>

      {/* SECTION 1: CAMPAIGN CONTROLS & COUNTDOWN TIMER */}
      <div className="p-5 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock size={16} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
                Campaign Settings & Expiration Timer
              </h2>
              <p className="text-[11px] text-[var(--muted)]">
                Configure the title heading, homepage visibility, and precise expiration countdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] hidden sm:inline">
              Flash Sale Row:
            </span>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                enabled ? "bg-amber-500" : "bg-neutral-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
              Section Title (e.g. "Flash Sale", "Weekend Dhamaka")
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Flash Sale"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
              Sale Expiration Date & Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--foreground)] outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Quick Extend Buttons */}
        <div className="pt-2 border-t border-[var(--border)]/50 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-black uppercase text-[var(--muted)]">Quick Timer Extensions:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleExtendHours(6)}
              className="px-2.5 py-1 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] text-[10px] font-bold border border-[var(--border)] transition-colors cursor-pointer"
            >
              +6 Hours
            </button>
            <button
              type="button"
              onClick={() => handleExtendHours(12)}
              className="px-2.5 py-1 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] text-[10px] font-bold border border-[var(--border)] transition-colors cursor-pointer"
            >
              +12 Hours
            </button>
            <button
              type="button"
              onClick={() => handleExtendHours(24)}
              className="px-2.5 py-1 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] text-[10px] font-bold border border-[var(--border)] transition-colors cursor-pointer"
            >
              +24 Hours
            </button>
            <button
              type="button"
              onClick={() => handleExtendHours(72)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/20 transition-colors cursor-pointer"
            >
              +3 Days
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: FLASH SALE ITEMS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
              Featured Deal Items ({items.length})
            </h2>
            <p className="text-[11px] text-[var(--muted)]">
              Products shown inside the horizontal slider on the homepage
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Deal Item</span>
          </button>
        </div>

        {/* ITEMS LIST */}
        <div className="space-y-2.5">
          {items.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No Flash Sale Items"
              description="No items featured in Flash Sale yet."
              variant="dashed"
              size="sm"
              action={{ label: "+ Add your first deal", onClick: handleOpenAdd }}
            />
          ) : (
            items.map((item, idx) => {
              const discount = calculateDiscountPercent(item.price, item.originalPrice);

              return (
                <motion.div
                  key={item.id || idx}
                  layout
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.enabled !== false
                      ? "bg-[var(--card)]/40 border-[var(--border)] hover:border-amber-500/40"
                      : "bg-[var(--card)]/15 border-[var(--border)]/40 opacity-60"
                  }`}
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-14 h-12 rounded-xl overflow-hidden bg-[var(--background)] border border-[var(--border)] shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-black">
                          {item.game}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black uppercase text-[var(--foreground)] truncate">
                          {item.name}
                        </h4>
                        {item.badge && (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            {item.badge}
                          </span>
                        )}
                        {discount && (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-black text-amber-400">{item.price}</span>
                        <span className="text-[10px] text-[var(--muted)] line-through">
                          {item.originalPrice}
                        </span>
                        <span className="text-[9px] font-mono text-[var(--muted)] truncate max-w-xs">
                          → /games/{item.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]/50">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(idx)}
                      className="p-2 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      title={item.enabled !== false ? "Disable Item" : "Enable Item"}
                    >
                      {item.enabled !== false ? (
                        <Eye size={15} className="text-emerald-400" />
                      ) : (
                        <EyeOff size={15} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(idx)}
                      className="p-2 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* ADD / EDIT ITEM MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  <h3 className="text-sm font-black uppercase text-[var(--foreground)]">
                    {editingIndex !== null ? "Edit Flash Sale Item" : "Add Flash Deal Item"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Game Tag & Item Name */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      Game Tag
                    </label>
                    <input
                      type="text"
                      value={itemForm.game}
                      onChange={(e) => setItemForm({ ...itemForm, game: e.target.value })}
                      placeholder="e.g. MLBB"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] font-black uppercase outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      placeholder="e.g. Weekly Diamond Pass"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] font-bold outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Deal Price & Original Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      Flash Deal Price (Display)
                    </label>
                    <input
                      type="text"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      placeholder="e.g. ₹149"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-amber-400 font-black outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      Original Strikethrough Price
                    </label>
                    <input
                      type="text"
                      value={itemForm.originalPrice}
                      onChange={(e) => setItemForm({ ...itemForm, originalPrice: e.target.value })}
                      placeholder="e.g. ₹170"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--muted)] font-bold outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Badge Tag & Target Slug */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      Promo Badge
                    </label>
                    <select
                      value={itemForm.badge}
                      onChange={(e) => setItemForm({ ...itemForm, badge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] font-bold outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Hot">HOT</option>
                      <option value="Sale">SALE</option>
                      <option value="Value">VALUE</option>
                      <option value="Best">BEST</option>
                      <option value="New">NEW</option>
                      <option value="50% OFF">50% OFF</option>
                      <option value="Limited">LIMITED</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      Target Game Slug / Route
                    </label>
                    <input
                      type="text"
                      value={itemForm.slug}
                      onChange={(e) => setItemForm({ ...itemForm, slug: e.target.value })}
                      placeholder="e.g. mobile-legends114?type=weekly-pass"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Image URL & 1-Click Presets */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    Item Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    value={itemForm.image}
                    onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                    placeholder="/game-assets/weeklypass.webp"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] font-mono outline-none focus:border-amber-500"
                  />

                  {/* 1-Click Image Presets */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[9px] font-black uppercase text-[var(--muted)]">Select from presets:</span>
                    <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {ASSET_PRESETS.map((preset) => (
                        <button
                          key={preset.src}
                          type="button"
                          onClick={() => {
                            setItemForm({
                              ...itemForm,
                              image: preset.src,
                              game: itemForm.game || preset.game,
                            });
                          }}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                            itemForm.image === preset.src
                              ? "bg-amber-500/15 border-amber-500 text-amber-400 font-bold"
                              : "bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          <div className="w-5 h-5 rounded relative overflow-hidden shrink-0">
                            <Image src={preset.src} alt={preset.label} fill className="object-cover" />
                          </div>
                          <span className="text-[9px] truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <div>
                    <span className="text-[11px] font-black uppercase text-[var(--foreground)]">Enable Item</span>
                    <p className="text-[10px] text-[var(--muted)]">Include this deal in the homepage Flash Sale carousel</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItemForm({ ...itemForm, enabled: !itemForm.enabled })}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      itemForm.enabled ? "bg-amber-500" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        itemForm.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModal}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  Save Deal Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
