"use client";

// Fresh HMR invalidation
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiCheck,
  FiLoader,
  FiUsers,
  FiAward,
  FiCopy,
  FiBookmark,
  FiZap,
  FiClock,
  FiCalendar,
  FiLock,
  FiStar,
  FiChevronRight,
  FiLayers,
  FiMail,
  FiPhone,
  FiShield,
  FiKey,
  FiUser,
  FiMinus,
  FiRefreshCw,
  FiExternalLink,
  FiChevronUp,
  FiChevronDown,
  FiFilter,
} from "react-icons/fi";
import { GiTrophy, GiSwords } from "react-icons/gi";
import { LoadingSpinner, InfoTooltip, SectionTitle, SearchInput, EmptyState } from "@/components/common";

const GAMES = ["mlbb", "freefire", "codm", "honorkings", "other"];
const STATUSES = ["upcoming", "open", "ongoing", "closed", "ended"];

const PRESET_TEMPLATES = [
  {
    id: "mlbb-5v5-bo3",
    label: "MLBB 5v5 Squad (Bo3)",
    tag: "Popular",
    icon: "🏆",
    data: {
      game: "mlbb",
      title: "5v5 Squad Scrims",
      subtitle: "Daily competitive squad showdown",
      format: "5v5 · Best of 3",
      prize: "5x Weekly Pass",
      slots: 16,
      entryCoins: 0,
      status: "open",
    },
  },
  {
    id: "mlbb-1v1-solo",
    label: "MLBB 1v1 Solo",
    tag: "Solo",
    icon: "⚔️",
    data: {
      game: "mlbb",
      title: "1v1 Solo Scrims",
      subtitle: "Mid lane 1v1 fast knockout matches",
      format: "1v1 · Knockout",
      prize: "Weekly Pass",
      slots: 16,
      entryCoins: 0,
      status: "open",
    },
  },
  {
    id: "freefire-4v4",
    label: "FF 4v4 Clash",
    tag: "Squad",
    icon: "🔥",
    data: {
      game: "freefire",
      title: "4v4 Clash Squad Cup",
      subtitle: "Bermuda squad elimination showdown",
      format: "4v4 · Clash Squad",
      prize: "1,000 Diamonds",
      slots: 12,
      entryCoins: 0,
      status: "open",
    },
  },
  {
    id: "codm-5v5-snd",
    label: "CODM 5v5 S&D",
    tag: "Tactical",
    icon: "🎯",
    data: {
      game: "codm",
      title: "5v5 Search & Destroy",
      subtitle: "Tactical competitive scrim cup",
      format: "5v5 · S&D",
      prize: "800 CP",
      slots: 8,
      entryCoins: 0,
      status: "open",
    },
  },
  {
    id: "mlbb-diamond-cup",
    label: "MLBB Diamond Championship",
    tag: "High Prize",
    icon: "💎",
    data: {
      game: "mlbb",
      title: "MLBB Diamond Championship",
      subtitle: "High-tier weekend tournament",
      format: "5v5 · Best of 3",
      prize: "2,000 Diamonds + Pass",
      slots: 16,
      entryCoins: 50,
      status: "open",
    },
  },
];

const emptyForm = {
  game: "mlbb",
  title: "",
  subtitle: "",
  format: "5v5 · Best of 3",
  prize: "Weekly Pass",
  slots: 16,
  entryCoins: 0,
  status: "open",
  startsAt: "",
  endsAt: "",
  roomId: "",
  roomPassword: "",
};

const STATUS_COLOR = {
  open: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  ongoing: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  upcoming: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  closed: "text-rose-400 bg-rose-500/10 border-rose-500/25",
  ended: "text-[var(--muted)] bg-[var(--foreground)]/5 border-[var(--border)]",
};

export default function TournamentsAdminTab() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");
  const [customTemplates, setCustomTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (gameFilter !== "all" ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || (search && search.trim() !== "");

  // Confirmation state — { id, type: "end" | "delete" }
  const [confirmAction, setConfirmAction] = useState(null);

  // Entries modal state
  const [viewEntries, setViewEntries] = useState(null);
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entrySearch, setEntrySearch] = useState("");
  const [entryFilter, setEntryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [entrySaveMsg, setEntrySaveMsg] = useState({});
  const [confirmEntry, setConfirmEntry] = useState(null);

  const token = () => (typeof window !== "undefined" ? localStorage.getItem("token") : "");

  // Load custom templates
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bb_custom_tourn_templates");
      if (saved) setCustomTemplates(JSON.parse(saved));
    } catch {}
  }, []);

  /* ── Fetch Tournaments ── */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      setTournaments(data.data || []);
    } catch {
      flash("Failed to fetch tournaments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3500);
  };

  const stats = useMemo(() => {
    return {
      total: tournaments.length,
      open: tournaments.filter((t) => t.status === "open").length,
      ongoing: tournaments.filter((t) => t.status === "ongoing").length,
      upcoming: tournaments.filter((t) => t.status === "upcoming").length,
      ended: tournaments.filter((t) => t.status === "ended" || t.status === "closed").length,
    };
  }, [tournaments]);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const matchesSearch =
        !search ||
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.game?.toLowerCase().includes(search.toLowerCase()) ||
        t.format?.toLowerCase().includes(search.toLowerCase()) ||
        t.prize?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "ended"
          ? t.status === "ended" || t.status === "closed"
          : t.status === statusFilter;

      const matchesGame = gameFilter === "all" ? true : t.game?.toLowerCase() === gameFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesGame;
    });
  }, [tournaments, search, statusFilter, gameFilter]);

  // Apply template
  const applyTemplate = (templateData) => {
    setForm((prev) => ({
      ...prev,
      ...templateData,
      roomId: prev.roomId || "",
      roomPassword: prev.roomPassword || "",
      startsAt: prev.startsAt || "",
      endsAt: prev.endsAt || "",
    }));
    setShowForm(true);
    flash(`Loaded template: "${templateData.title}"`);
  };

  // Save custom template
  const saveCustomTemplate = () => {
    if (!templateName.trim()) {
      flash("Please enter a template name");
      return;
    }
    const newTpl = {
      id: "custom-" + Date.now(),
      label: templateName.trim(),
      tag: "Custom",
      icon: "⭐",
      data: {
        game: form.game,
        title: form.title,
        subtitle: form.subtitle,
        format: form.format,
        prize: form.prize,
        slots: Number(form.slots) || 16,
        entryCoins: Number(form.entryCoins) || 0,
        status: form.status,
      },
    };
    const updated = [newTpl, ...customTemplates];
    setCustomTemplates(updated);
    try {
      localStorage.setItem("bb_custom_tourn_templates", JSON.stringify(updated));
    } catch {}
    setTemplateName("");
    setShowSaveTemplate(false);
    flash("Template saved successfully!");
  };

  // Delete custom template
  const deleteCustomTemplate = (id, e) => {
    e?.stopPropagation();
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    try {
      localStorage.setItem("bb_custom_tourn_templates", JSON.stringify(updated));
    } catch {}
    flash("Template deleted");
  };

  // Quick schedule helper
  const setQuickTime = (type) => {
    const d = new Date();
    if (type === "today8") {
      d.setHours(20, 0, 0, 0);
    } else if (type === "tomorrow8") {
      d.setDate(d.getDate() + 1);
      d.setHours(20, 0, 0, 0);
    } else if (type === "tomorrow9") {
      d.setDate(d.getDate() + 1);
      d.setHours(21, 0, 0, 0);
    }
    const pad = (n) => String(n).padStart(2, "0");
    const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setForm((f) => ({ ...f, startsAt: localIso }));
  };

  // Duplicate existing tournament
  const duplicateTournament = (t) => {
    setForm({
      game: t.game,
      title: `${t.title} (Copy)`,
      subtitle: t.subtitle || "",
      format: t.format,
      prize: t.prize || "Weekly Pass",
      slots: t.slots,
      entryCoins: t.entryCoins || 0,
      status: "open",
      startsAt: "",
      endsAt: "",
      roomId: "",
      roomPassword: "",
    });
    setEditId(null);
    setShowForm(true);
    flash(`Duplicated from "${t.title}"`);
  };

  /* ── Create / Update ── */
  const handleSubmit = async () => {
    if (!form.title || !form.format || !form.slots) {
      flash("Title, format and slots are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slots: Number(form.slots),
        entryCoins: Number(form.entryCoins),
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        roomId: form.roomId,
        roomPassword: form.roomPassword,
      };

      const res = await fetch(
        editId ? `/api/tournaments/${editId}` : "/api/tournaments",
        {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        flash(editId ? "Tournament updated successfully!" : "Tournament created successfully!");
        setShowForm(false);
        setEditId(null);
        setForm(emptyForm);
        fetchAll();
      } else {
        flash(data.message || "Error saving tournament");
      }
    } catch {
      flash("Network error saving tournament");
    } finally {
      setSaving(false);
    }
  };

  /* ── Status cycling / fast actions ── */
  const cycleStatus = async (t, e) => {
    e?.stopPropagation();
    const nextStatus =
      t.status === "open"
        ? "ongoing"
        : t.status === "ongoing"
        ? "ended"
        : t.status === "ended"
        ? "upcoming"
        : "open";

    try {
      const res = await fetch(`/api/tournaments/${t._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTournaments((prev) =>
          prev.map((item) => (item._id === t._id ? { ...item, status: nextStatus } : item))
        );
        flash(`Status updated to "${nextStatus.toUpperCase()}"`);
      }
    } catch {
      flash("Error updating status");
    }
  };

  /* ── Delete ── */
  const deleteTournament = (id) => setConfirmAction({ id, type: "delete" });

  /* ── Execute confirmed action ── */
  const executeConfirm = async () => {
    if (!confirmAction) return;
    const { id, type } = confirmAction;
    setConfirmAction(null);
    if (type === "end") {
      await fetch(`/api/tournaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status: "ended" }),
      });
    } else {
      await fetch(`/api/tournaments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
    }
    fetchAll();
  };

  /* ── Open Edit ── */
  const openEdit = (t) => {
    setForm({
      game: t.game,
      title: t.title,
      subtitle: t.subtitle || "",
      format: t.format,
      prize: t.prize || "Weekly Pass",
      slots: t.slots,
      entryCoins: t.entryCoins || 0,
      status: t.status,
      startsAt: t.startsAt ? t.startsAt.slice(0, 16) : "",
      endsAt: t.endsAt ? t.endsAt.slice(0, 16) : "",
      roomId: t.roomId || "",
      roomPassword: t.roomPassword || "",
    });
    setEditId(t._id);
    setShowForm(true);
  };

  /* ── Entries management ── */
  const fetchEntries = async (tournamentId) => {
    setEntriesLoading(true);
    try {
      const res = await fetch(`/api/admin/tournaments/entries?tournamentId=${tournamentId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        setEntries(data.data || []);
      } else {
        flash(data.message || "Failed to load entries");
      }
    } catch {
      flash("Error fetching entries");
    } finally {
      setEntriesLoading(false);
    }
  };

  const openEntries = (t) => {
    setViewEntries(t);
    setEntrySearch("");
    setEntryFilter("all");
    fetchEntries(t._id);
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateEntryProgress = async (entryId, action, extra = {}) => {
    try {
      const res = await fetch("/api/admin/tournaments/entries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ entryId, action, ...extra }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) =>
          prev.map((e) => (e._id === entryId ? { ...e, ...data.data } : e))
        );
        if (action === "updateRoom") {
          setEntrySaveMsg((prev) => ({ ...prev, [entryId]: true }));
          setTimeout(() => {
            setEntrySaveMsg((prev) => ({ ...prev, [entryId]: false }));
          }, 2000);
        }
        setConfirmEntry(null);
      } else {
        flash(data.message || "Failed to update entry");
      }
    } catch {
      flash("Network error updating entry");
    }
  };

  const entryStats = useMemo(() => {
    const total = entries.length;
    const active = entries.filter((e) => !e.isEliminated && !e.isWinner).length;
    const round2Plus = entries.filter((e) => e.currentRound > 1 && !e.isEliminated).length;
    const eliminated = entries.filter((e) => e.isEliminated).length;
    const winners = entries.filter((e) => e.isWinner).length;
    return { total, active, round2Plus, eliminated, winners };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const q = entrySearch.toLowerCase();
      const matchesSearch =
        !q ||
        e.teamName?.toLowerCase().includes(q) ||
        e.userId?.name?.toLowerCase().includes(q) ||
        e.userId?.userId?.toLowerCase().includes(q) ||
        e.contactPhone?.toLowerCase().includes(q) ||
        e.contactEmail?.toLowerCase().includes(q) ||
        (e.gameIds || []).some((gid) => gid.toLowerCase().includes(q));

      const matchesFilter =
        entryFilter === "all"
          ? true
          : entryFilter === "active"
          ? !e.isEliminated && !e.isWinner
          : entryFilter === "round2"
          ? e.currentRound > 1 && !e.isEliminated
          : entryFilter === "eliminated"
          ? e.isEliminated
          : entryFilter === "winner"
          ? e.isWinner
          : true;

      return matchesSearch && matchesFilter;
    });
  }, [entries, entrySearch, entryFilter]);

  /* ── FILTER BOTTOM SHEET CONTENT ── */
  const filterSheetContent = (
    <AnimatePresence>
      {showFilters && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowFilters(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-[9999]"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-md bg-[var(--card)] border-t sm:border border-[var(--border)] rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 pb-8 sm:pb-5 z-[10000] max-h-[85vh] overflow-y-auto"
          >
            {/* Drag Handle */}
            <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]/60">
              <div className="flex items-center gap-2">
                <FiFilter size={16} className="text-amber-400" />
                <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">Filter Tournaments</span>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setGameFilter("all");
                    }}
                    className="text-[11px] font-semibold text-[var(--muted)] hover:text-rose-400 transition-colors cursor-pointer mr-1"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setShowFilters(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Filter Section 1: Tournament Status */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1.5">
                <span>Status</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "all", label: "All Statuses", count: stats.total },
                  { id: "open", label: "Open", count: stats.open },
                  { id: "ongoing", label: "Live", count: stats.ongoing },
                  { id: "upcoming", label: "Upcoming", count: stats.upcoming },
                  { id: "ended", label: "Ended", count: stats.ended },
                ].map((tab) => {
                  const active = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left flex items-center justify-between ${
                        active
                          ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-2xs font-bold"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
                      }`}
                    >
                      <span className="truncate">{tab.label}</span>
                      <span className={`text-[9px] px-1 rounded font-bold ${active ? "bg-[var(--background)]/20 text-[var(--background)]" : "bg-[var(--foreground)]/5 text-[var(--muted)]"}`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Section 2: Game Filter */}
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1.5">
                <span>Game</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["all", ...GAMES].map((g) => {
                  const active = gameFilter === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGameFilter(g)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center uppercase tracking-wider ${
                        active
                          ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-2xs font-bold"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
                      }`}
                    >
                      {g === "all" ? "All Games" : g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-[var(--border)]/60">
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                style={{ color: "#ffffff" }}
                className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer text-center shadow-xs"
              >
                Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ── Top Flash Message ── */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-2.5 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-black uppercase tracking-wider flex items-center justify-between"
          >
            <span>{msg}</span>
            <button onClick={() => setMsg("")} className="hover:opacity-75">
              <FiX size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Header Toolbar (Row 1) ── */}
      <div className="flex items-center justify-end gap-3 pb-2.5 border-b border-[var(--border)]/70">
        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Presets Button */}
          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className={`h-7 px-2.5 rounded-lg text-[10.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              showTemplates
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06]"
            }`}
            title="Tournament Presets"
          >
            <FiZap size={11} className={showTemplates ? "text-[var(--background)]" : "text-amber-400"} />
            <span className="hidden sm:inline">Presets</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchAll}
            disabled={loading}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer shrink-0"
            title="Refresh list"
          >
            <FiRefreshCw size={11} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>

          {/* New Tournament Button - Icon Only */}
          <button
            type="button"
            aria-label={showForm ? "Close Form" : "New Tournament"}
            title={showForm ? "Close Form" : "New Tournament"}
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditId(null);
                setForm(emptyForm);
              } else {
                setEditId(null);
                setForm(emptyForm);
                setShowForm(true);
              }
            }}
            style={{ color: showForm ? undefined : "#ffffff" }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs ${
              showForm
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                : "bg-[var(--accent)] text-white hover:brightness-110"
            }`}
          >
            {showForm ? (
              <FiX size={13} />
            ) : (
              <FiPlus size={14} color="#ffffff" style={{ color: "#ffffff" }} className="stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* ── Search & Filter Row (Row 2 - Filter side to search) ── */}
      <div className="flex items-center gap-2 w-full">
        <SearchInput
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder="Search tournament, prize, game..."
          variant="pill"
          className="flex-1"
        />

        {/* Filter Trigger Button beside search - Icon Only */}
        <button
          type="button"
          aria-label="Filter tournaments"
          title="Filters"
          onClick={() => setShowFilters(true)}
          className={`w-8.5 h-8.5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 relative ${
            activeFilterCount > 0
              ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-2xs"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
          }`}
        >
          <FiFilter size={13} style={{ color: activeFilterCount > 0 ? "#ffffff" : undefined }} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[8.5px] font-black flex items-center justify-center shadow-xs border border-[var(--background)]">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setGameFilter("all");
              setSearch("");
            }}
            className="px-2 h-8.5 rounded-full text-rose-500 hover:bg-rose-500/10 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Presets Template Strip (Collapsible) ── */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-[var(--card)] border border-amber-500/20 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <FiZap size={11} /> Quick Launch Presets
                </span>
                <span className="text-[8px] text-[var(--muted)] uppercase font-bold">
                  Click to pre-fill tournament form
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl.data)}
                    className="p-2 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-base">{tpl.icon}</span>
                      <span className="text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {tpl.tag}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-[var(--foreground)] group-hover:text-amber-400 line-clamp-1">
                        {tpl.label}
                      </p>
                      <p className="text-[7.5px] text-[var(--muted)] truncate font-mono">
                        {tpl.data.prize}
                      </p>
                    </div>
                  </button>
                ))}

                {customTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl.data)}
                    className="p-2 rounded-xl bg-[var(--background)] border border-[var(--accent)]/30 hover:border-[var(--accent)] text-left transition-all group flex flex-col justify-between relative cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-base">{tpl.icon || "⭐"}</span>
                      <button
                        type="button"
                        onClick={(e) => deleteCustomTemplate(tpl.id, e)}
                        className="text-[var(--muted)] hover:text-rose-400 p-0.5 rounded"
                        title="Delete custom preset"
                      >
                        <FiTrash2 size={10} />
                      </button>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-[var(--foreground)] group-hover:text-[var(--accent)] line-clamp-1">
                        {tpl.label}
                      </p>
                      <p className="text-[7.5px] text-[var(--muted)] truncate font-mono">
                        {tpl.data.prize}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create / Edit Form Drawer ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[var(--card)] border border-[var(--accent)]/30 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-tight text-[var(--foreground)]">
                    {editId ? "Edit Tournament" : "Create New Tournament"}
                  </span>
                  {editId && (
                    <span className="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--foreground)]/5 text-[var(--muted)]">
                      ID: {editId.slice(-6)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveTemplate((v) => !v)}
                    className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent)] hover:underline flex items-center gap-1"
                  >
                    <FiBookmark size={11} /> Save as Template
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditId(null);
                      setForm(emptyForm);
                    }}
                    className="w-6 h-6 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 flex items-center justify-center text-[var(--muted)]"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              </div>

              {/* Save template inline bar */}
              {showSaveTemplate && (
                <div className="p-2.5 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter template name (e.g. Weekly FF Solo)"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1 h-7 px-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[10px] text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={saveCustomTemplate}
                    className="h-7 px-3 rounded-lg bg-[var(--accent)] text-white text-[9px] font-black uppercase tracking-wider shrink-0"
                  >
                    Save
                  </button>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* Game */}
                <div>
                  <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">
                    Game *
                  </label>
                  <select
                    value={form.game}
                    onChange={(e) => setForm((f) => ({ ...f, game: e.target.value }))}
                    className="w-full h-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase px-2.5 outline-none focus:border-[var(--accent)]"
                  >
                    {GAMES.map((g) => (
                      <option key={g} value={g}>
                        {g.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">
                    Status *
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full h-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase px-2.5 outline-none focus:border-[var(--accent)]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slots with Quick Buttons */}
                <div>
                  <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">
                    Slots *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={2}
                      value={form.slots}
                      onChange={(e) => setForm((f) => ({ ...f, slots: e.target.value }))}
                      className="flex-1 h-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black px-2.5 outline-none focus:border-[var(--accent)]"
                    />
                    {[8, 16, 32, 64].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, slots: s }))}
                        className={`h-8 px-2 rounded-xl border text-[8.5px] font-bold ${
                          Number(form.slots) === s
                            ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                            : "bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">
                    Tournament Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. 5v5 Squad Scrims Daily Cup"
                    className="w-full h-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase px-2.5 outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">
                    Subtitle / Tagline
                  </label>
                  <input
                    value={form.subtitle}
                    onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                    placeholder="e.g. Win Weekly Pass & Diamonds"
                    className="w-full h-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-medium px-2.5 outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Format with quick chips */}
                <div>
                  <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">
                    Match Format *
                  </label>
                  <input
                    value={form.format}
                    onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
                    placeholder="e.g. 5v5 · Best of 3"
                    className="w-full h-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase px-2.5 outline-none focus:border-[var(--accent)] mb-1"
                  />
                  <div className="flex flex-wrap gap-1">
                    {["1v1 · Solo", "4v4 · Squad", "5v5 · Bo1", "5v5 · Bo3"].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, format: fmt }))}
                        className="text-[7.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prize with quick chips */}
                <div>
                  <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">
                    Prize Pool *
                  </label>
                  <input
                    value={form.prize}
                    onChange={(e) => setForm((f) => ({ ...f, prize: e.target.value }))}
                    placeholder="e.g. Weekly Pass"
                    className="w-full h-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase px-2.5 outline-none focus:border-[var(--accent)] mb-1 text-amber-400"
                  />
                  <div className="flex flex-wrap gap-1">
                    {["Weekly Pass", "5x Weekly Pass", "1,000 💎", "2,000 💎"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, prize: p }))}
                        className="text-[7.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-amber-400/80 hover:text-amber-400"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entry Coins */}
                <div>
                  <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">
                    Entry Coins (0 = Free)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      value={form.entryCoins}
                      onChange={(e) => setForm((f) => ({ ...f, entryCoins: e.target.value }))}
                      className="flex-1 h-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black px-2.5 outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, entryCoins: 0 }))}
                      className={`h-8 px-2.5 rounded-xl border text-[8px] font-black uppercase tracking-wider ${
                        Number(form.entryCoins) === 0
                          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                          : "bg-[var(--background)] border-[var(--border)] text-[var(--muted)]"
                      }`}
                    >
                      Free (0)
                    </button>
                  </div>
                </div>

                {/* Starts At with Helpers */}
                <div>
                  <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">
                    Starts At
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                    className="w-full h-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] px-2.5 outline-none focus:border-[var(--accent)] mb-1"
                  />
                  <div className="flex gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setQuickTime("today8")}
                      className="text-[7.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      Today 8 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickTime("tomorrow8")}
                      className="text-[7.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      Tomorrow 8 PM
                    </button>
                  </div>
                </div>

                {/* Ends At */}
                <div>
                  <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">
                    Ends At / Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                    className="w-full h-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] px-2.5 outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Room Credentials Box */}
                <div className="sm:col-span-2 lg:col-span-3 p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-1.5">
                    <FiLock size={11} className="text-[var(--accent)]" />
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-[var(--foreground)]">
                      Lobby Credentials (Optional, can update anytime before match)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        value={form.roomId}
                        onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
                        placeholder="Room ID (e.g. 892341)"
                        className="w-full h-7.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[10px] font-mono font-bold px-2.5 outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <input
                        value={form.roomPassword}
                        onChange={(e) => setForm((f) => ({ ...f, roomPassword: e.target.value }))}
                        placeholder="Room Password (e.g. 5566)"
                        className="w-full h-7.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[10px] font-mono font-bold px-2.5 outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="h-8 px-4 rounded-xl bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {saving ? <FiLoader size={12} className="animate-spin" /> : <FiCheck size={12} />}
                  {editId ? "Save Changes" : "Publish Tournament"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setForm(emptyForm);
                  }}
                  className="h-8 px-3 rounded-xl border border-[var(--border)] text-[10px] font-black uppercase tracking-wider text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tournaments List / Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <LoadingSpinner size="lg" />
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
            Loading tournaments...
          </p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <EmptyState
          icon={GiTrophy}
          title="No Tournaments Found"
          description={
            search || statusFilter !== "all" || gameFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Click 'New Tournament' or select a preset to launch your first event!"
          }
          size="sm"
          variant="card"
        />
      ) : (
        /* ── HIGH-DENSITY LIST / TABLE VIEW ── */
        <div className="space-y-3">
          {/* DESKTOP TABLE */}
          <div className="hidden md:block rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--foreground)]/[0.02] border-b border-[var(--border)]">
                <tr className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">
                  <th className="py-2 px-3">Tournament</th>
                  <th className="py-2 px-2.5">Status</th>
                  <th className="py-2 px-2.5">Prize Pool</th>
                  <th className="py-2 px-2.5">Slots</th>
                  <th className="py-2 px-2.5">Schedule / Room</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50 text-xs">
                {filteredTournaments.map((t) => {
                  const isPending = confirmAction?.id === t._id;
                  const slotsPct = Math.min(100, Math.round(((t.slotsFilled || 0) / (t.slots || 1)) * 100));

                  return (
                    <tr
                      key={t._id}
                      className="group hover:bg-[var(--foreground)]/[0.02] transition-colors relative"
                    >
                      {/* 1. Tournament Info */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--foreground)] shrink-0">
                            {t.game}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-black uppercase tracking-tight text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                              {t.title}
                            </p>
                            <p className="text-[8.5px] text-[var(--muted)] truncate">
                              {t.format} {t.subtitle ? `• ${t.subtitle}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Status Pill */}
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => cycleStatus(t, e)}
                          title="Click to cycle status"
                          className={`text-[7.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                            STATUS_COLOR[t.status] || ""
                          }`}
                        >
                          {t.status}
                        </button>
                      </td>

                      {/* 3. Prize & Entry */}
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 font-black text-amber-400 text-[10.5px] truncate">
                            <GiTrophy size={11} className="shrink-0" />
                            {t.prize}
                          </span>
                          <span className="text-[8px] text-[var(--muted)] font-mono">
                            {Number(t.entryCoins) > 0 ? `${t.entryCoins} Coins` : "Free Entry"}
                          </span>
                        </div>
                      </td>

                      {/* 4. Slots Progress */}
                      <td className="py-2 px-2.5 min-w-[110px]">
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[8px] font-mono text-[var(--muted)]">
                            <span>
                              <strong className="text-[var(--foreground)]">{t.slotsFilled || 0}</strong>/{t.slots}
                            </span>
                            <span>{slotsPct}%</span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-[var(--foreground)]/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                slotsPct >= 100 ? "bg-rose-500" : slotsPct >= 75 ? "bg-amber-400" : "bg-emerald-400"
                              }`}
                              style={{ width: `${slotsPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 5. Schedule & Room */}
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 text-[8px] font-mono">
                          {t.roomId ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <FiLock size={8} /> {t.roomId}
                            </span>
                          ) : (
                            <span className="text-[var(--muted)]/50">No Room ID</span>
                          )}
                          {t.startsAt ? (
                            <span className="flex items-center gap-1 text-[var(--muted)]">
                              <FiClock size={8} />
                              {new Date(t.startsAt).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                              {new Date(t.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          ) : (
                            <span className="text-[var(--muted)]/50">TBD</span>
                          )}
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEntries(t)}
                            className="h-6 px-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-[8px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                          >
                            <FiUsers size={9} />
                            <span>({t.slotsFilled || 0})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => duplicateTournament(t)}
                            className="w-6 h-6 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 flex items-center justify-center transition-colors cursor-pointer"
                            title="Duplicate"
                          >
                            <FiCopy size={11} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(t)}
                            className="w-6 h-6 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <FiEdit2 size={11} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteTournament(t._id)}
                            className="w-6 h-6 rounded-lg text-[var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <FiTrash2 size={11} />
                          </button>
                        </div>

                        {/* Inline Delete Confirmation Overlay for Table Row */}
                        {isPending && (
                          <div className="absolute inset-0 bg-[var(--card)]/95 backdrop-blur-xs px-3 flex items-center justify-between z-10 border border-rose-500/30">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-rose-400 uppercase">
                                Delete "{t.title}"?
                              </span>
                              <span className="text-[8px] text-[var(--muted)]">
                                All entries will be permanently removed.
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={executeConfirm}
                                className="h-5.5 px-2.5 rounded-lg bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmAction(null)}
                                className="h-5.5 px-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-[8px] font-black uppercase tracking-wider"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST */}
          <div className="md:hidden space-y-1.5">
            {filteredTournaments.map((t) => {
              const isPending = confirmAction?.id === t._id;
              const slotsPct = Math.min(100, Math.round(((t.slotsFilled || 0) / (t.slots || 1)) * 100));

              return (
                <div
                  key={t._id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 hover:border-[var(--accent)]/30 transition-all space-y-1.5 relative overflow-hidden"
                >
                  {/* Row 1: Game, Status, Title on Left; Prize on Right */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-[7px] font-black uppercase tracking-wider px-1 py-0.2 rounded bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--foreground)] shrink-0">
                        {t.game}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => cycleStatus(t, e)}
                        className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full border shrink-0 ${
                          STATUS_COLOR[t.status] || ""
                        }`}
                      >
                        {t.status}
                      </button>
                      <h3 className="text-[11px] font-black uppercase tracking-tight text-[var(--foreground)] truncate">
                        {t.title}
                      </h3>
                    </div>
                    <span className="flex items-center gap-0.5 font-black text-amber-400 text-[10px] shrink-0">
                      <GiTrophy size={10} className="shrink-0" />
                      <span className="truncate">{t.prize}</span>
                    </span>
                  </div>

                  {/* Row 2: Subtitle/Format, Room, Time, and Slots */}
                  <div className="flex items-center justify-between gap-2 text-[8px] text-[var(--muted)] pt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                      <span className="truncate">{t.format}</span>
                      {t.roomId && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono flex items-center gap-0.5 shrink-0">
                            <FiLock size={7.5} /> {t.roomId}
                          </span>
                        </>
                      )}
                      {t.startsAt && (
                        <>
                          <span>•</span>
                          <span className="font-mono truncate">
                            {new Date(t.startsAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[8px]">
                        <strong className="text-[var(--foreground)]">{t.slotsFilled || 0}</strong>/{t.slots} ({slotsPct}%)
                      </span>
                      <div className="w-10 h-1 rounded-full bg-[var(--foreground)]/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            slotsPct >= 100 ? "bg-rose-500" : slotsPct >= 75 ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${slotsPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Action Buttons */}
                  <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-[var(--border)]/40">
                    <span className="text-[7.5px] text-[var(--muted)] font-mono">
                      {Number(t.entryCoins) > 0 ? `${t.entryCoins} Coins` : "Free Entry"}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEntries(t)}
                        className="h-5.5 px-2 rounded-md bg-[var(--foreground)] text-[var(--background)] text-[7.5px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <FiUsers size={8} /> Entries ({t.slotsFilled || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateTournament(t)}
                        className="w-5.5 h-5.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 flex items-center justify-center transition-colors cursor-pointer"
                        title="Duplicate"
                      >
                        <FiCopy size={9} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="w-5.5 h-5.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <FiEdit2 size={9} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTournament(t._id)}
                        className="w-5.5 h-5.5 rounded-md text-[var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <FiTrash2 size={9} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Inline Delete Confirmation */}
                  {isPending && (
                    <div className="absolute inset-0 bg-[var(--card)]/95 backdrop-blur-xs p-2 flex items-center justify-between z-10 border border-rose-500/30">
                      <div className="min-w-0 flex-1">
                        <p className="text-[8px] font-black text-rose-400 uppercase truncate">
                          Delete "{t.title}"?
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={executeConfirm}
                          className="h-5 px-2 rounded bg-rose-500 text-white text-[7.5px] font-black uppercase"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmAction(null)}
                          className="h-5 px-1.5 rounded border border-[var(--border)] text-[var(--muted)] text-[7.5px] font-black uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sleek High-Density Entries Modal ── */}
      {viewEntries && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-[var(--background)] border border-[var(--border)] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]/80 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-[var(--foreground)] truncate">
                  {viewEntries.title}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-[9px] font-black uppercase tracking-wider border border-[var(--accent)]/20 shrink-0">
                  {viewEntries.format}
                </span>
                <span className="text-xs text-[var(--muted)] shrink-0">
                  <strong className="text-[var(--foreground)]">{entries.length}</strong>/{viewEntries.slots}
                </span>
                <span className="hidden xs:inline text-xs text-[var(--muted)]">•</span>
                <span className="hidden xs:inline text-[10px] text-emerald-400 font-bold">
                  {entryStats.active} Active
                </span>
                {entryStats.eliminated > 0 && (
                  <span className="hidden xs:inline text-[10px] text-rose-400 font-bold">
                    • {entryStats.eliminated} Elim
                  </span>
                )}
                {entryStats.winners > 0 && (
                  <span className="hidden xs:inline text-[10px] text-amber-400 font-bold">
                    • {entryStats.winners} Winner
                  </span>
                )}
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => fetchEntries(viewEntries._id)}
                  disabled={entriesLoading}
                  title="Refresh"
                  className="w-7 h-7 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <FiRefreshCw size={12} className={entriesLoading ? "animate-spin text-[var(--accent)]" : ""} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewEntries(null)}
                  className="w-7 h-7 rounded-lg bg-[var(--foreground)]/5 hover:bg-rose-500/10 hover:text-rose-400 border border-[var(--border)] flex items-center justify-center text-[var(--muted)] transition-colors cursor-pointer"
                  title="Close"
                >
                  <FiX size={13} />
                </button>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="px-3 sm:px-4 py-2 border-b border-[var(--border)] bg-[var(--background)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="relative flex-1 max-w-sm">
                <SearchInput
                  value={entrySearch}
                  onChange={setEntrySearch}
                  placeholder="Search player, user ID, contact..."
                  size="xs"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                {[
                  { id: "all", label: `All (${entryStats.total})` },
                  { id: "active", label: `Active (${entryStats.active})` },
                  { id: "round2", label: `R2+ (${entryStats.round2Plus})` },
                  { id: "eliminated", label: `Elim (${entryStats.eliminated})` },
                  { id: "winner", label: `Win (${entryStats.winners})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setEntryFilter(tab.id)}
                    className={`h-6.5 px-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      entryFilter === tab.id
                        ? "bg-[var(--accent)] text-white shadow-xs"
                        : "bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Entries Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {entriesLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <FiLoader size={20} className="animate-spin text-[var(--accent)]" />
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                    Loading entries...
                  </p>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="py-14 text-center flex flex-col items-center justify-center gap-1.5">
                  <p className="text-xs font-bold text-[var(--foreground)]">No participants found</p>
                  <p className="text-[10px] text-[var(--muted)]">
                    {entrySearch || entryFilter !== "all"
                      ? "Try changing your search or filter."
                      : "No players have registered for this tournament yet."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Compact Cards (< md) */}
                  <div className="space-y-2 block md:hidden">
                    {filteredEntries.map((e) => {
                      const isElim = e.isEliminated;
                      const isWin = e.isWinner;
                      const isConf = confirmEntry?.entryId === e._id;

                      return (
                        <div
                          key={e._id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            isWin
                              ? "bg-amber-500/[0.03] border-amber-500/30"
                              : isElim
                              ? "bg-rose-500/[0.02] border-rose-500/20 opacity-70"
                              : "bg-[var(--card)]/50 border-[var(--border)]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[var(--foreground)] truncate">
                                {e.teamName ? e.teamName : e.userId?.name || "Player"}
                              </div>
                              <div className="flex items-center gap-1 text-[9px] font-mono text-[var(--muted)]">
                                <span>ID: {e.userId?.userId || "N/A"}</span>
                                {e.userId?.userId && (
                                  <button
                                    onClick={() => copyToClipboard(e.userId.userId, `uid-${e._id}`)}
                                    className="text-[var(--muted)] hover:text-[var(--foreground)]"
                                  >
                                    {copiedId === `uid-${e._id}` ? (
                                      <FiCheck size={9} className="text-emerald-400" />
                                    ) : (
                                      <FiCopy size={9} />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div>
                              {isWin ? (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[8px] font-black uppercase flex items-center gap-1">
                                  <FiAward size={9} /> Winner
                                </span>
                              ) : isElim ? (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black uppercase">
                                  Eliminated
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 text-[8px] font-black uppercase">
                                  Round {e.currentRound}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* IGN & Contact */}
                          <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-[var(--border)]/40 text-[10px] flex-wrap">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[8px] font-bold uppercase text-[var(--muted)]">IGN:</span>
                              {(e.gameIds || []).map((gid, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => copyToClipboard(gid, `gid-${e._id}-${idx}`)}
                                  className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/5 border border-[var(--border)] font-mono text-[9px] text-[var(--foreground)] flex items-center gap-1"
                                >
                                  <span>{gid}</span>
                                  {copiedId === `gid-${e._id}-${idx}` ? (
                                    <FiCheck size={8} className="text-emerald-400" />
                                  ) : (
                                    <FiCopy size={8} className="text-[var(--muted)]" />
                                  )}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 text-[9px] text-[var(--muted)]">
                              {e.contactPhone && (
                                <a href={`tel:${e.contactPhone}`} className="flex items-center gap-1 text-[var(--foreground)]/80">
                                  <FiPhone size={9} className="text-[var(--accent)]" /> {e.contactPhone}
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Next Room Credentials for Round 2+ */}
                          {e.currentRound > 1 && !isElim && (
                            <div className="flex items-center justify-between gap-1.5 mt-2 p-1.5 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-[9px]">
                              <span className="font-bold text-[var(--muted)] uppercase tracking-wider shrink-0 flex items-center gap-1">
                                <FiKey size={9} className="text-[var(--accent)]" /> Next Room:
                              </span>
                              <div className="flex items-center gap-1 flex-1">
                                <input
                                  placeholder="Room ID"
                                  defaultValue={e.assignedRoomId}
                                  onBlur={(evt) =>
                                    updateEntryProgress(e._id, "updateRoom", {
                                      roomId: evt.target.value,
                                      roomPassword: e.assignedRoomPassword,
                                    })
                                  }
                                  className="w-1/2 bg-[var(--card)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[9px] font-mono outline-none focus:border-[var(--accent)]"
                                />
                                <input
                                  placeholder="Password"
                                  defaultValue={e.assignedRoomPassword}
                                  onBlur={(evt) =>
                                    updateEntryProgress(e._id, "updateRoom", {
                                      roomId: e.assignedRoomId,
                                      roomPassword: evt.target.value,
                                    })
                                  }
                                  className="w-1/2 bg-[var(--card)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[9px] font-mono outline-none focus:border-[var(--accent)]"
                                />
                              </div>
                              {entrySaveMsg[e._id] && <span className="text-emerald-400 font-bold text-[8px]">✓</span>}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-2 pt-1.5 border-t border-[var(--border)]/40">
                            {isConf ? (
                              <div className="flex items-center justify-between p-1 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30">
                                <span className="text-[8.5px] font-black uppercase text-[var(--accent)]">
                                  Confirm {confirmEntry.action}?
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => updateEntryProgress(e._id, confirmEntry.action)}
                                    className="px-2 py-0.5 rounded bg-[var(--accent)] text-white text-[8.5px] font-black uppercase"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setConfirmEntry(null)}
                                    className="px-2 py-0.5 rounded bg-[var(--border)] text-[var(--foreground)] text-[8.5px] font-black uppercase"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                {!isElim ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmEntry({ entryId: e._id, action: "promote" })}
                                      className="flex-1 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8.5px] font-black uppercase flex items-center justify-center gap-0.5"
                                    >
                                      <FiPlus size={9} /> Promote
                                    </button>
                                    {e.currentRound > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmEntry({ entryId: e._id, action: "demote" })}
                                        className="flex-1 h-6 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8.5px] font-black uppercase flex items-center justify-center gap-0.5"
                                      >
                                        <FiMinus size={9} /> Demote
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setConfirmEntry({ entryId: e._id, action: "eliminate" })}
                                      className="flex-1 h-6 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8.5px] font-black uppercase flex items-center justify-center gap-0.5"
                                    >
                                      <FiX size={9} /> Kill
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmEntry({ entryId: e._id, action: "winner" })}
                                      className={`flex-1 h-6 rounded-lg text-[8.5px] font-black uppercase flex items-center justify-center gap-0.5 ${
                                        isWin
                                          ? "bg-amber-500 text-white"
                                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      }`}
                                    >
                                      <FiAward size={9} /> Win
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmEntry({ entryId: e._id, action: "reset" })}
                                    className="w-full h-6 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[8.5px] font-black uppercase flex items-center justify-center gap-1"
                                  >
                                    <FiRefreshCw size={9} /> Bring Back to Match
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Compact Table (>= md) */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]/30">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--muted)]">
                          <th className="px-3 py-2 font-black uppercase tracking-wider text-[8.5px]">Player / ID</th>
                          <th className="px-3 py-2 font-black uppercase tracking-wider text-[8.5px]">Contact</th>
                          <th className="px-3 py-2 font-black uppercase tracking-wider text-[8.5px]">Game ID</th>
                          <th className="px-3 py-2 font-black uppercase tracking-wider text-[8.5px]">Round & Room</th>
                          <th className="px-3 py-2 font-black uppercase tracking-wider text-[8.5px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]/50">
                        {filteredEntries.map((e) => {
                          const isElim = e.isEliminated;
                          const isWin = e.isWinner;
                          const isConf = confirmEntry?.entryId === e._id;

                          return (
                            <tr
                              key={e._id}
                              className={`transition-colors hover:bg-[var(--foreground)]/[0.02] ${
                                isWin
                                  ? "bg-amber-500/[0.03]"
                                  : isElim
                                  ? "bg-rose-500/[0.02] opacity-70"
                                  : ""
                              }`}
                            >
                              {/* Player */}
                              <td className="px-3 py-2">
                                <div className="font-bold text-[var(--foreground)] text-[11px]">
                                  {e.teamName ? e.teamName : e.userId?.name || "Player"}
                                </div>
                                <div className="flex items-center gap-1 text-[9px] font-mono text-[var(--muted)]">
                                  <span>ID: {e.userId?.userId || "N/A"}</span>
                                  {e.userId?.userId && (
                                    <button
                                      onClick={() => copyToClipboard(e.userId.userId, `uid-${e._id}`)}
                                      className="text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                                      title="Copy User ID"
                                    >
                                      {copiedId === `uid-${e._id}` ? (
                                        <FiCheck size={9} className="text-emerald-400" />
                                      ) : (
                                        <FiCopy size={8} />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Contact */}
                              <td className="px-3 py-2 text-[10px]">
                                {e.contactPhone && <div className="text-[var(--foreground)]/90">{e.contactPhone}</div>}
                                {e.contactEmail && (
                                  <div className="text-[9px] text-[var(--muted)] truncate max-w-[130px]">
                                    {e.contactEmail}
                                  </div>
                                )}
                              </td>

                              {/* Game IDs */}
                              <td className="px-3 py-2">
                                <div className="flex flex-wrap gap-1">
                                  {(e.gameIds || []).map((gid, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => copyToClipboard(gid, `gid-${e._id}-${idx}`)}
                                      className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--border)] font-mono text-[9px] text-[var(--foreground)] flex items-center gap-1 cursor-pointer"
                                      title="Click to copy"
                                    >
                                      <span>{gid}</span>
                                      {copiedId === `gid-${e._id}-${idx}` ? (
                                        <FiCheck size={8} className="text-emerald-400" />
                                      ) : (
                                        <FiCopy size={8} className="text-[var(--muted)]" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </td>

                              {/* Progress & Next Room */}
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {isWin ? (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                                      <FiAward size={9} /> Winner
                                    </span>
                                  ) : isElim ? (
                                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black uppercase tracking-wider">
                                      Eliminated
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 text-[8px] font-black uppercase tracking-wider">
                                      Round {e.currentRound}
                                    </span>
                                  )}

                                  {e.currentRound > 1 && !isElim && (
                                    <div className="flex items-center gap-1">
                                      <input
                                        placeholder="Room ID"
                                        defaultValue={e.assignedRoomId}
                                        onBlur={(evt) =>
                                          updateEntryProgress(e._id, "updateRoom", {
                                            roomId: evt.target.value,
                                            roomPassword: e.assignedRoomPassword,
                                          })
                                        }
                                        className="w-16 bg-[var(--card)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[9px] font-mono outline-none focus:border-[var(--accent)]"
                                      />
                                      <input
                                        placeholder="Pass"
                                        defaultValue={e.assignedRoomPassword}
                                        onBlur={(evt) =>
                                          updateEntryProgress(e._id, "updateRoom", {
                                            roomId: e.assignedRoomId,
                                            roomPassword: evt.target.value,
                                          })
                                        }
                                        className="w-12 bg-[var(--card)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[9px] font-mono outline-none focus:border-[var(--accent)]"
                                      />
                                    </div>
                                  )}
                                  {entrySaveMsg[e._id] && (
                                    <span className="text-emerald-400 font-bold text-[8px]">✓</span>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-3 py-2 text-right">
                                {isConf ? (
                                  <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30">
                                    <span className="text-[8px] font-black uppercase text-[var(--accent)] px-1">
                                      Sure?
                                    </span>
                                    <button
                                      onClick={() => updateEntryProgress(e._id, confirmEntry.action)}
                                      className="px-2 py-0.5 rounded bg-[var(--accent)] text-white text-[8px] font-black uppercase"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setConfirmEntry(null)}
                                      className="px-2 py-0.5 rounded bg-[var(--border)] text-[var(--foreground)] text-[8px] font-black uppercase"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-end gap-1">
                                    {!isElim ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmEntry({ entryId: e._id, action: "promote" })}
                                          className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase cursor-pointer"
                                          title="Promote Round"
                                        >
                                          + Promote
                                        </button>
                                        {e.currentRound > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => setConfirmEntry({ entryId: e._id, action: "demote" })}
                                            className="px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[8px] font-black uppercase cursor-pointer"
                                            title="Demote Round"
                                          >
                                            - Demote
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => setConfirmEntry({ entryId: e._id, action: "eliminate" })}
                                          className="px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[8px] font-black uppercase cursor-pointer"
                                          title="Eliminate"
                                        >
                                          ✕ Kill
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmEntry({ entryId: e._id, action: "winner" })}
                                          className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase cursor-pointer ${
                                            isWin
                                              ? "bg-amber-500 text-white shadow-xs"
                                              : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                                          }`}
                                          title="Toggle Winner"
                                        >
                                          🏆 Win
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmEntry({ entryId: e._id, action: "reset" })}
                                        className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[8px] font-black uppercase cursor-pointer"
                                      >
                                        ↺ Bring Back
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Filter Bottom Sheet (Portal) ── */}
      {mounted && typeof document !== "undefined"
        ? createPortal(filterSheetContent, document.body)
        : null}
    </div>
  );
}
