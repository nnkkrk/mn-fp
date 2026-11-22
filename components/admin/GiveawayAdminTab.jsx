"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus, FiUsers, FiAward, FiTrash2, FiChevronDown, FiChevronUp,
  FiPlay, FiSquare, FiRefreshCw, FiDownload, FiGift, FiX, FiEdit2, FiFilter,
} from "react-icons/fi";
import { StatusBadge, EmptyState, LoadingSpinner, SectionTitle, SearchInput } from "@/components/common";
import { Gift, Sparkles, CheckCircle2, UserCheck, Trash2 } from "lucide-react";

const TASK_TYPES = [
  { value: "mlbb",      label: "MLBB Verify",  icon: "🎮" },
  { value: "youtube",   label: "YouTube",       icon: "▶️" },
  { value: "whatsapp",  label: "WhatsApp",      icon: "💬" },
  { value: "instagram", label: "Instagram",     icon: "📸" },
  { value: "link",      label: "Open Link",     icon: "🔗" },
  { value: "checkbox",  label: "Checkbox",      icon: "☑️" },
  { value: "text",      label: "Text Input",    icon: "✏️" },
];

function token() { return localStorage.getItem("token") || ""; }
function authHeaders() { return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }; }

export default function GiveawayAdminTab() {
  const [giveaways, setGiveaways]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget]  = useState(null);
  const [selected, setSelected]      = useState(null);
  const [entries, setEntries]       = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [winnerCount, setWinnerCount] = useState(1);
  const [pickResult, setPickResult] = useState(null);
  const [picking, setPicking]       = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => ({
    total: giveaways.length,
    live: giveaways.filter(g => g.status === "live").length,
    draft: giveaways.filter(g => g.status === "draft").length,
    ended: giveaways.filter(g => g.status === "ended").length,
  }), [giveaways]);

  const activeFilterCount = statusFilter !== "all" ? 1 : 0;
  const hasActiveFilters = activeFilterCount > 0 || (search && search.trim() !== "");

  const filteredGiveaways = useMemo(() => {
    return giveaways.filter(g => {
      const matchesSearch = !search ||
        g.title?.toLowerCase().includes(search.toLowerCase()) ||
        g.prize?.toLowerCase().includes(search.toLowerCase()) ||
        g.description?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || g.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [giveaways, search, statusFilter]);

  // Create form state
  const [form, setForm] = useState({
    title: "", description: "", prize: "", prizeCount: 1,
    status: "draft", startDate: "", endDate: "",
    tasks: [], maxEntries: 0,
  });

  const fetchGiveaways = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/giveaway", { headers: authHeaders() });
      const d = await res.json();
      setGiveaways(d.giveaways || []);
    } finally { setLoading(false); }
  };

  const fetchEntries = async (id) => {
    setEntriesLoading(true);
    try {
      const res = await fetch(`/api/admin/giveaway/${id}/entries`, { headers: authHeaders() });
      const d = await res.json();
      setEntries(d.entries || []);
    } finally { setEntriesLoading(false); }
  };

  useEffect(() => { fetchGiveaways(); }, []);

  useEffect(() => {
    if (selected) fetchEntries(selected._id);
  }, [selected]);

  const createGiveaway = async () => {
    if (editTarget) {
      const res = await fetch("/api/admin/giveaway", {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ id: editTarget._id, ...form }),
      });
      const d = await res.json();
      if (d.success) {
        setShowCreate(false);
        setEditTarget(null);
        setForm({ title: "", description: "", prize: "", prizeCount: 1, status: "draft", startDate: "", endDate: "", tasks: [], maxEntries: 0 });
        fetchGiveaways();
      }
    } else {
      const res = await fetch("/api/admin/giveaway", {
        method: "POST", headers: authHeaders(), body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) {
        setShowCreate(false);
        setForm({ title: "", description: "", prize: "", prizeCount: 1, status: "draft", startDate: "", endDate: "", tasks: [], maxEntries: 0 });
        fetchGiveaways();
      }
    }
  };

  const deleteGiveaway = async (id, title) => {
    if (!confirm(`Delete "${title}" and ALL its entries? This cannot be undone.`)) return;
    await fetch("/api/admin/giveaway", { method: "DELETE", headers: authHeaders(), body: JSON.stringify({ id }) });
    if (selected?._id === id) setSelected(null);
    fetchGiveaways();
  };

  const openEdit = (g) => {
    setEditTarget(g);
    setForm({
      title:       g.title       || "",
      description: g.description || "",
      prize:       g.prize       || "",
      prizeCount:  g.prizeCount  || 1,
      status:      g.status      || "draft",
      startDate:   g.startDate   ? g.startDate.slice(0, 10) : "",
      endDate:     g.endDate     ? g.endDate.slice(0, 10)   : "",
      tasks:       g.tasks       || [],
      maxEntries:  g.maxEntries  || 0,
    });
    setShowCreate(true);
  };

  const updateStatus = async (id, status) => {
    await fetch("/api/admin/giveaway", { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ id, status }) });
    fetchGiveaways();
    if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
  };

  const pickWinner = async () => {
    setPicking(true);
    setPickResult(null);
    try {
      const res = await fetch(`/api/admin/giveaway/${selected._id}/pick-winner`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ count: winnerCount }),
      });
      const d = await res.json();
      if (d.success) { setPickResult(d.winners); fetchGiveaways(); fetchEntries(selected._id); }
    } finally { setPicking(false); }
  };

  const manuallyPickWinner = async (userId) => {
    if (!confirm("Are you sure you want to manually mark this user as a winner?")) return;
    try {
      const res = await fetch(`/api/admin/giveaway/${selected._id}/pick-winner`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ count: 1, manualUserId: userId }),
      });
      const d = await res.json();
      if (d.success) { alert("User successfully marked as a winner!"); fetchGiveaways(); fetchEntries(selected._id); }
      else { alert(d.message || "Error"); }
    } catch (e) {
      alert("Error occurred");
    }
  };

  const revertWinner = async (userId) => {
    if (!confirm("Are you sure you want to revert this winner? They will no longer be marked as a winner.")) return;
    try {
      const res = await fetch(`/api/admin/giveaway/${selected._id}/pick-winner`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ revertUserId: userId }),
      });
      const d = await res.json();
      if (d.success) { alert("Winner successfully reverted!"); fetchGiveaways(); fetchEntries(selected._id); }
      else { alert(d.message || "Error"); }
    } catch (e) {
      alert("Error occurred");
    }
  };

  const toggleVerify = async (entryId, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/giveaway/${selected._id}/entries`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ entryId, isVerified: !currentStatus })
      });
      const d = await res.json();
      if (d.success) {
        setEntries(entries.map(e => e._id === entryId ? { ...e, isVerified: !currentStatus } : e));
      } else {
        alert(d.message || "Error");
      }
    } catch (e) {
      alert("Error occurred");
    }
  };

  const addTask = () => setForm(f => ({ ...f, tasks: [...f.tasks, { type: "checkbox", label: "", description: "", link: "", inputLabel: "", required: true }] }));
  const removeTask = (i) => setForm(f => ({ ...f, tasks: f.tasks.filter((_, idx) => idx !== i) }));
  const updateTask = (i, field, val) => setForm(f => {
    const tasks = [...f.tasks];
    tasks[i] = { ...tasks[i], [field]: val };
    return { ...f, tasks };
  });

  const exportCSV = () => {
    if (!entries.length || !selected) return;
    const inputTasks = (selected.tasks || []).map((t, i) => ({ label: t.inputLabel, index: i })).filter(t => t.label);
    const headers = ["Name", "Email", "Phone", "MLBB ID", "Server", "Entered At", "Winner", "Verified", ...inputTasks.map(t => t.label)];
    const rows = entries.map(e => [
      e.name, e.email, e.phone || "", e.mlbbId, e.mlbbServer, new Date(e.createdAt).toLocaleString(), e.isWinner ? "YES" : "", e.isVerified ? "YES" : "",
      ...inputTasks.map(t => (e.taskData?.[t.index] && typeof e.taskData[t.index] === 'string') ? e.taskData[t.index] : "")
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `entries-${selected.title}.csv`; a.click();
  };

  const renderEntriesPanel = (g) => (
    <div className="bg-[var(--background)]">
      {/* Winners picked result */}
      {pickResult && (
        <div className="m-2.5 p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-[10px] font-black text-yellow-400 uppercase tracking-wider mb-1">🏆 Winners Picked!</p>
          {pickResult.map((w, i) => (
            <p key={i} className="text-xs text-[var(--foreground)] font-bold">{w.name || w.userId} — MLBB: {w.mlbbId}</p>
          ))}
        </div>
      )}

      {/* Pick winner controls */}
      {g.status !== "draft" && (
        <div className="px-3 py-2 flex items-center gap-2.5 flex-wrap border-b border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-1.5">
            <label className="text-[8.5px] text-[var(--muted)] font-black uppercase">Pick Winners:</label>
            <input
              type="number" min={1} max={entries.length || 1} value={winnerCount}
              onChange={e => setWinnerCount(Number(e.target.value))}
              className="w-12 h-6 bg-[var(--background)] border border-[var(--border)] rounded px-1.5 text-[10px] font-bold text-[var(--foreground)] outline-none"
            />
          </div>
          <button aria-label="button"
            onClick={pickWinner}
            disabled={picking || !entries.length}
            className="h-6 px-2.5 rounded bg-yellow-500 text-black text-[8.5px] font-black uppercase flex items-center gap-1 hover:bg-yellow-400 disabled:opacity-40 transition-opacity cursor-pointer font-bold"
          >
            <FiAward size={10} /> {picking ? "Picking..." : "Roll Winner"}
          </button>
          <button aria-label="button" onClick={exportCSV} className="ml-auto h-6 px-2 rounded border border-[var(--border)] bg-[var(--foreground)]/5 text-[8.5px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1 cursor-pointer">
            <FiDownload size={10} /> Export CSV
          </button>
        </div>
      )}

      {/* Entries table */}
      {entriesLoading ? (
        <div className="py-6 flex justify-center">
          <LoadingSpinner size="md" color="accent" />
        </div>
      ) : !entries.length ? (
        <p className="text-center text-[10px] text-[var(--muted)] py-6">No entries recorded yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[10.5px]">
            <thead className="bg-[var(--foreground)]/[0.02] border-b border-[var(--border)] text-[var(--muted)] font-black uppercase tracking-wider text-[8px]">
              <tr>
                {["#", "Player", "Phone", "MLBB Info", "Tasks", "Date", "Action"].map(h => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {entries.map((e, i) => (
                <tr key={e._id} className={`hover:bg-[var(--foreground)]/[0.02] transition-colors ${e.isWinner ? "bg-yellow-500/5" : ""}`}>
                  <td className="px-3 py-2 text-[var(--muted)] text-[9px]">{i + 1}</td>
                  <td className="px-3 py-2 font-bold text-[var(--foreground)] whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[10.5px] font-bold flex items-center gap-1">
                        {e.isWinner && <span>🏆</span>}
                        {e.name || "—"}
                      </span>
                      <span className="text-[8px] text-[var(--muted)] font-normal">{e.email || "—"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)] font-mono text-[9.5px]">{e.phone || "—"}</td>
                  <td className="px-3 py-2 font-mono text-[var(--foreground)]">
                    <span className="font-bold text-[10px] text-[var(--accent)]">{e.mlbbId}</span>
                    <span className="text-[8.5px] text-[var(--muted)] ml-1">({e.mlbbServer})</span>
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)] align-middle">
                    <span className="px-1.5 py-0.2 rounded bg-[var(--foreground)]/5 border border-[var(--border)] text-[8px] font-bold text-[var(--foreground)]">
                      {Object.keys(e.taskData || {}).length} / {g.tasks?.length || 0}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)] whitespace-nowrap text-[8.5px]">
                    {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 justify-end">
                      <button aria-label="button" onClick={() => toggleVerify(e._id, e.isVerified)} className={`text-[7.5px] font-black px-1.5 py-0.5 rounded transition-all border cursor-pointer ${e.isVerified ? 'text-green-400 border-green-500/40 bg-green-500/10' : 'text-[var(--muted)] border-[var(--border)] bg-[var(--foreground)]/5 hover:text-[var(--foreground)]'}`}>
                        {e.isVerified ? "VERIFIED" : "VERIFY"}
                      </button>
                      {e.isWinner ? (
                        <button aria-label="button" onClick={() => revertWinner(e.userId)} className="text-[7.5px] font-black text-rose-400 hover:text-rose-500 border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 rounded transition-all cursor-pointer">
                          REVERT
                        </button>
                      ) : (
                        <button aria-label="button" onClick={() => manuallyPickWinner(e.userId)} className="text-[7.5px] font-black text-[var(--muted)] hover:text-yellow-400 border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 rounded transition-all cursor-pointer">
                          WINNER
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const filterSheetContent = (
    <AnimatePresence>
      {showFilters && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFilters(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[var(--card)] border-t border-[var(--border)] rounded-t-2xl p-4 shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                Filter Giveaways
              </h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setSearch("");
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-400 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="w-7 h-7 rounded-full bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2">
                Giveaway Status
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "all", label: "All Giveaways", count: stats.total },
                  { id: "live", label: "Live Drops", count: stats.live },
                  { id: "draft", label: "Drafts", count: stats.draft },
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
                      <span
                        className={`text-[9px] px-1 rounded font-bold ${
                          active
                            ? "bg-[var(--background)]/20 text-[var(--background)]"
                            : "bg-[var(--foreground)]/5 text-[var(--muted)]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

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
    <div className="space-y-4 pb-8 animate-in fade-in duration-300">
      {/* ── Header Toolbar (Row 1) ── */}
      <div className="flex items-center justify-end gap-3 pb-2.5 border-b border-[var(--border)]/70">
        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={fetchGiveaways}
            disabled={loading}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Refresh list"
          >
            <FiRefreshCw size={11} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>

          {/* New Giveaway Button - Icon Only */}
          <button
            type="button"
            aria-label={showCreate && !editTarget ? "Close" : "New Giveaway"}
            title={showCreate && !editTarget ? "Close" : "New Giveaway"}
            onClick={() => {
              if (showCreate && !editTarget) {
                setShowCreate(false);
              } else {
                setEditTarget(null);
                setForm({ title: "", description: "", prize: "", prizeCount: 1, status: "draft", startDate: "", endDate: "", tasks: [], maxEntries: 0 });
                setShowCreate(true);
              }
            }}
            style={{ color: showCreate && !editTarget ? undefined : "#ffffff" }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs ${
              showCreate && !editTarget
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                : "bg-[var(--accent)] text-white hover:brightness-110"
            }`}
          >
            {showCreate && !editTarget ? (
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
          placeholder="Search giveaways, prizes..."
          variant="pill"
          className="flex-1"
        />

        {/* Filter Trigger Button beside search - Icon Only */}
        <button
          type="button"
          aria-label="Filter giveaways"
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
              setSearch("");
            }}
            className="px-2 h-8.5 rounded-full text-rose-500 hover:bg-rose-500/10 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Giveaways Ledger / List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" color="accent" />
        </div>
      ) : !filteredGiveaways.length ? (
        <EmptyState
          icon={Gift}
          title={giveaways.length === 0 ? "No Giveaways Yet" : "No Matching Giveaways"}
          description={giveaways.length === 0 ? "Create your first giveaway to engage players!" : "Try adjusting your search or filters."}
        />
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)]">
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Giveaway</th>
                  <th className="py-2.5 px-3">Prize & Winners</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Entries</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredGiveaways.map((g, idx) => {
                  const isExpanded = selected?._id === g._id;
                  return (
                    <Fragment key={g._id}>
                      <tr className={`hover:bg-[var(--foreground)]/[0.02] transition-colors ${isExpanded ? "bg-[var(--accent)]/[0.03]" : ""}`}>
                        <td className="py-2.5 px-3 font-mono text-[9px] text-[var(--muted)]/60 font-semibold w-8">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--foreground)] text-xs truncate max-w-[260px] leading-tight">{g.title}</p>
                            {g.description ? (
                              <p className="text-[9px] text-[var(--muted)] truncate max-w-[260px] mt-0.5">{g.description}</p>
                            ) : (
                              <p className="text-[8px] text-[var(--muted)] font-mono mt-0.5">{g.tasks?.length || 0} task{g.tasks?.length === 1 ? "" : "s"}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[var(--foreground)] text-xs block leading-tight">{g.prize}</span>
                          <span className="text-[9px] text-[var(--muted)] font-mono">{g.prizeCount} winner{g.prizeCount > 1 ? "s" : ""}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={g.status} size="xs" />
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-xs font-bold text-[var(--foreground)]">{g.entryCount || 0}</span>
                          <span className="text-[9px] text-[var(--muted)] ml-1">entries</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 justify-end">
                            {g.status === "draft" && (
                              <button
                                aria-label="button"
                                onClick={() => updateStatus(g._id, "live")}
                                className="px-2 py-1 rounded-md text-[8.5px] font-black uppercase text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <FiPlay size={9} /> Live
                              </button>
                            )}
                            {g.status === "live" && (
                              <button
                                aria-label="button"
                                onClick={() => updateStatus(g._id, "ended")}
                                className="px-2 py-1 rounded-md text-[8.5px] font-black uppercase text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <FiSquare size={9} /> End
                              </button>
                            )}
                            <button
                              aria-label="button"
                              onClick={() => setSelected(isExpanded ? null : g)}
                              style={{ color: isExpanded ? "#ffffff" : undefined }}
                              className={`h-6.5 px-2 rounded-md text-[8.5px] font-black uppercase flex items-center gap-1 transition-colors cursor-pointer border ${
                                isExpanded
                                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                                  : "bg-[var(--foreground)]/5 text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--foreground)]/10"
                              }`}
                            >
                              <FiUsers size={10} />
                              <span>Entries</span>
                              {isExpanded ? <FiChevronUp size={9} /> : <FiChevronDown size={9} />}
                            </button>
                            <button
                              aria-label="button"
                              onClick={() => openEdit(g)}
                              className="w-6.5 h-6.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors flex items-center justify-center cursor-pointer"
                              title="Edit Giveaway"
                            >
                              <FiEdit2 size={11} />
                            </button>
                            <button
                              aria-label="button"
                              onClick={() => deleteGiveaway(g._id, g.title)}
                              className="w-6.5 h-6.5 rounded-md text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center cursor-pointer"
                              title="Delete Giveaway"
                            >
                              <FiTrash2 size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0 border-b border-[var(--border)]">
                            {renderEntriesPanel(g)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST */}
          <div className="md:hidden rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border)] shadow-2xs">
            {filteredGiveaways.map((g, idx) => {
              const isExpanded = selected?._id === g._id;
              return (
                <div key={g._id} className="p-2.5 space-y-1.5 transition-colors">
                  {/* Row 1: Index, Status, Title on Left; Prize on Right */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-[8px] font-mono font-bold text-[var(--muted)]/60 shrink-0">
                        #{idx + 1}
                      </span>
                      <StatusBadge status={g.status} size="xs" />
                      <h3 className="text-[11px] font-bold text-[var(--foreground)] truncate leading-tight">
                        {g.title}
                      </h3>
                    </div>
                    <span className="font-mono text-amber-400 font-bold text-[10px] shrink-0">
                      {g.prize}
                    </span>
                  </div>

                  {/* Row 2: Metadata (Entries, Winners, Tasks) on Left; Actions on Right */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 text-[8.5px] text-[var(--muted)] font-mono truncate">
                      <span>{g.entryCount || 0}{g.maxEntries > 0 ? `/${g.maxEntries}` : ""} entries</span>
                      <span>•</span>
                      <span>{g.prizeCount} winner{g.prizeCount > 1 ? "s" : ""}</span>
                      {g.tasks?.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{g.tasks.length} task{g.tasks.length > 1 ? "s" : ""}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {g.status === "draft" && (
                        <button
                          type="button"
                          aria-label="button"
                          onClick={() => updateStatus(g._id, "live")}
                          className="px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center gap-0.5 cursor-pointer"
                        >
                          <FiPlay size={8} /> Live
                        </button>
                      )}
                      {g.status === "live" && (
                        <button
                          type="button"
                          aria-label="button"
                          onClick={() => updateStatus(g._id, "ended")}
                          className="px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-0.5 cursor-pointer"
                        >
                          <FiSquare size={8} /> End
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="button"
                        onClick={() => setSelected(isExpanded ? null : g)}
                        style={{ color: isExpanded ? "#ffffff" : undefined }}
                        className={`h-6 px-1.5 rounded text-[8px] font-black uppercase flex items-center gap-1 transition-colors cursor-pointer border ${
                          isExpanded
                            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                            : "bg-[var(--foreground)]/5 text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--foreground)]/10"
                        }`}
                      >
                        <FiUsers size={9} />
                        <span>Entries</span>
                        {isExpanded ? <FiChevronUp size={8} /> : <FiChevronDown size={8} />}
                      </button>
                      <button
                        type="button"
                        aria-label="button"
                        onClick={() => openEdit(g)}
                        className="w-6 h-6 rounded bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center cursor-pointer"
                        title="Edit Giveaway"
                      >
                        <FiEdit2 size={10} />
                      </button>
                      <button
                        type="button"
                        aria-label="button"
                        onClick={() => deleteGiveaway(g._id, g.title)}
                        className="w-6 h-6 rounded text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center cursor-pointer"
                        title="Delete Giveaway"
                      >
                        <FiTrash2 size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Entries panel on mobile */}
                  {isExpanded && (
                    <div className="border-t border-[var(--border)] pt-2 mt-1">
                      {renderEntriesPanel(g)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}



      {/* Create / Edit Giveaway Modal (Shadowless & Flat) */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-10">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">{editTarget ? "Edit Giveaway" : "Create Giveaway"}</h3>
                <button aria-label="button" onClick={() => { setShowCreate(false); setEditTarget(null); }} className="w-6 h-6 rounded-md bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">
                  <FiX size={12} />
                </button>
              </div>

              <div className="p-4 space-y-2.5">
                <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Weekly Diamond Pass Giveaway" />
                <Field label="Prize" value={form.prize} onChange={v => setForm(f => ({ ...f, prize: v }))} placeholder="e.g. 5 Weekly Diamond Passes" />
                
                <div>
                  <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short description..."
                    className="w-full h-12 bg-[var(--card)] border border-[var(--border)] rounded-lg p-2 text-[11px] text-[var(--foreground)] outline-none focus:border-[var(--accent)] resize-none placeholder:text-[var(--muted)]/40 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Winners</label>
                    <input type="number" min={1} value={form.prizeCount} onChange={e => setForm(f => ({ ...f, prizeCount: Number(e.target.value) }))}
                      className="w-full h-8 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full h-8 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 text-[11px] font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]">
                      <option value="draft">Draft</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Max Entries (0 = Unlimited)</label>
                    <input type="number" min={0} value={form.maxEntries} onChange={e => setForm(f => ({ ...f, maxEntries: Number(e.target.value) }))}
                      className="w-full h-8 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
                  </div>
                </div>

                {/* Tasks builder */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[8px] font-black uppercase text-[var(--muted)]">Required Tasks</label>
                    <button aria-label="button" onClick={addTask} className="text-[8px] font-black text-[var(--accent)] uppercase flex items-center gap-0.5 hover:underline cursor-pointer">
                      <FiPlus size={10} /> Add Task
                    </button>
                  </div>

                  {form.tasks.length === 0 && (
                    <p className="text-[9px] text-[var(--muted)] py-2 text-center border border-dashed border-[var(--border)] rounded-lg">No custom tasks added</p>
                  )}

                  {form.tasks.map((task, i) => (
                    <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-2 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8.5px] font-black text-[var(--muted)]">#{i + 1}</span>
                        <select value={task.type} onChange={e => updateTask(i, "type", e.target.value)}
                          className="flex-1 h-6 bg-[var(--background)] border border-[var(--border)] rounded px-1.5 text-[9.5px] text-[var(--foreground)] outline-none">
                          {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                        </select>
                        <label className="flex items-center gap-1 text-[8.5px] font-bold text-[var(--muted)] cursor-pointer">
                          <input type="checkbox" checked={task.required} onChange={e => updateTask(i, "required", e.target.checked)} className="accent-[var(--accent)]" />
                          Req
                        </label>
                        <button aria-label="button" onClick={() => removeTask(i)} className="text-[var(--muted)] hover:text-red-400 p-0.5 cursor-pointer">
                          <FiTrash2 size={11} />
                        </button>
                      </div>
                      <input value={task.label} onChange={e => updateTask(i, "label", e.target.value)}
                        placeholder="Task label (e.g. Subscribe to channel)"
                        className="w-full h-6 bg-[var(--background)] border border-[var(--border)] rounded px-2 text-[10px] text-[var(--foreground)] placeholder-[var(--muted)]/40 outline-none" />
                      <input value={task.link} onChange={e => updateTask(i, "link", e.target.value)}
                        placeholder="Link URL (optional)"
                        className="w-full h-6 bg-[var(--background)] border border-[var(--border)] rounded px-2 text-[10px] text-[var(--foreground)] placeholder-[var(--muted)]/40 outline-none font-mono" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                  <button aria-label="button" onClick={() => { setShowCreate(false); setEditTarget(null); }} className="flex-1 h-8 rounded-lg border border-[var(--border)] text-[9px] font-black uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">Cancel</button>
                  <button aria-label="button" onClick={createGiveaway} disabled={!form.title || !form.prize}
                    style={{ color: "#ffffff" }}
                    className="flex-1 h-8 rounded-lg bg-[var(--accent)] text-white text-[9px] font-black uppercase disabled:opacity-40 hover:bg-[var(--accent-hover)] transition-colors cursor-pointer">
                    {editTarget ? "Save Changes" : "Create Giveaway"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Filter Bottom Sheet Portal */}
      {mounted && typeof document !== "undefined" && createPortal(filterSheetContent, document.body)}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-8 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] font-bold text-[var(--foreground)] placeholder-[var(--muted)]/40 outline-none focus:border-[var(--accent)] transition-colors" />
    </div>
  );
}
