"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiYoutube,
  FiSmartphone,
  FiMessageCircle,
  FiGlobe,
  FiStar,
  FiList,
  FiRefreshCw,
  FiPlus,
  FiX,
  FiClock,
  FiToggleRight,
  FiToggleLeft,
  FiEdit3,
  FiTrash2,
  FiAlertCircle,
  FiCheck,
  FiEye,
} from "react-icons/fi";
import { Coins, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StatusBadge, SearchInput, EmptyState, Pagination, LoadingSpinner, SectionTitle } from "@/components/common";
import { Icons } from "@/components/icons";
import { formatCurrency, formatCoins, formatNumber, formatDate, formatDateTime } from "@/utils";

const TASK_TYPES = ["url_visit", "yt_watch", "app_install", "wp_join", "custom"];
const typeLabels = {
  url_visit: "Website Visit",
  yt_watch: "YouTube Watch",
  app_install: "App Install",
  wp_join: "WhatsApp Join",
  custom: "Custom",
};

function TypeIcon({ type }) {
  switch (type) {
    case "yt_watch": return <FiYoutube />;
    case "app_install": return <FiSmartphone />;
    case "wp_join": return <FiMessageCircle />;
    case "url_visit": return <FiGlobe />;
    default: return <FiStar />;
  }
}

function Toast({ msg, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`fixed top-4 right-4 z-[1600] px-4 py-3 rounded-xl shadow-2xl text-xs font-black uppercase tracking-widest ${
        type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
      }`}
    >
      {msg}
    </motion.div>
  );
}


export default function CoinsAdminTab() {
  const [view, setView] = useState("claims");
  const [tasks, setTasks] = useState([]);
  const [claims, setClaims] = useState([]);
  const [history, setHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState({ source: "", type: "" });
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [claimStatus, setClaimStatus] = useState("pending");
  const [pendingCount, setPendingCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [rejModal, setRejModal] = useState(null);
  const [rejReason, setRejReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const [adjModal, setAdjModal] = useState(null);
  const [adjAmount, setAdjAmount] = useState("");
  const [adjAction, setAdjAction] = useState("add");

  const [coinStats, setCoinStats] = useState({
    totalAvailable: 0,
    totalEarned: 0,
    totalSpent: 0,
    todayEarned: 0,
    todaySpent: 0
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coins/tasks?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
        setPages(data.pages || 1);
      }
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  const fetchClaims = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coins/claims?status=${claimStatus}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setClaims(data.claims);
        setPages(data.pages || 1);
        setPendingCount(data.pendingCount || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [token, claimStatus, page]);

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        search: historySearch,
        source: historyFilter.source,
        type: historyFilter.type
      });
      const res = await fetch(`/api/admin/coins/history?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.transactions || []);
        setPages(data.pages || 1);
        if (data.stats) {
          setCoinStats(data.stats);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, historySearch, historyFilter]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search: userSearch,
        sortBy: "coins",
        order: "desc"
      });
      const res = await fetch(`/api/admin/users/data?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        setPages(data.pagination?.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, userSearch]);

  useEffect(() => { setPage(1); }, [userSearch, historySearch]);
  useEffect(() => { if (view === "tasks") fetchTasks(); }, [view, fetchTasks]);
  useEffect(() => { if (view === "claims") fetchClaims(); }, [view, fetchClaims]);
  useEffect(() => { if (view === "users") fetchUsers(); }, [view, fetchUsers]);
  useEffect(() => { if (view === "history") fetchHistory(); }, [view, fetchHistory]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]); // Initial stats fetch

  const toggleTask = async (task) => {
    const res = await fetch("/api/admin/coins/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ taskId: task.taskId, active: !task.active }),
    });
    const data = await res.json();
    if (data.success) { showToast(`Task ${!task.active ? "activated" : "deactivated"}`, "success"); fetchTasks(); }
    else showToast(data.message, "error");
  };

  const deleteTask = async (taskId) => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    const res = await fetch("/api/admin/coins/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ taskId }),
    });
    const data = await res.json();
    if (data.success) { showToast("Task deleted", "success"); fetchTasks(); }
    else showToast(data.message, "error");
  };

  const approveClaim = async (claimId) => {
    setActionLoading(claimId);
    const res = await fetch("/api/admin/coins/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ claimId, action: "approve" }),
    });
    const data = await res.json();
    if (data.success) { showToast(data.message, "success"); fetchClaims(); }
    else showToast(data.message, "error");
    setActionLoading(null);
  };

  const rejectClaim = async () => {
    if (!rejModal) return;
    setActionLoading(rejModal.claimId);
    const res = await fetch("/api/admin/coins/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ claimId: rejModal.claimId, action: "reject", rejectionReason: rejReason }),
    });
    const data = await res.json();
    if (data.success) { showToast("Claim rejected", "success"); fetchClaims(); }
    else showToast(data.message, "error");
    setActionLoading(null);
    setRejModal(null);
    setRejReason("");
  };

  const adjustCoins = async () => {
    if (!adjModal || !adjAmount || Number(adjAmount) <= 0) return;
    setActionLoading(adjModal.userId);
    try {
      const res = await fetch("/api/admin/coins/adjust-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: adjModal.userId, amount: Number(adjAmount), action: adjAction }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchUsers();
        setAdjModal(null);
        setAdjAmount("");
      } else {
        showToast(data.message, "error");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (s) =>
    s === "approved" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : s === "rejected" ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
    : "text-amber-400 bg-amber-500/10 border-amber-500/20";

  return (
    <div className="space-y-5">
      <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>
      


      {/* Header */}
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[var(--border)]/70">
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
              {pendingCount} Pending
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
          <button aria-label="button"
            onClick={() => { setView("users"); setPage(1); }}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              view === "users" ? "bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)]"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30"
            }`}
          >
            Users
          </button>
          <button aria-label="button"
            onClick={() => { setView("claims"); setPage(1); }}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              view === "claims" ? "bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)]"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30"
            }`}
          >
            Claims {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button aria-label="button"
            onClick={() => { setView("history"); setPage(1); }}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              view === "history" ? "bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)]"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30"
            }`}
          >
            History
          </button>
          <button aria-label="button"
            onClick={() => { setView("tasks"); setPage(1); }}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              view === "tasks" ? "bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)]"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30"
            }`}
          >
            Tasks
          </button>
        </div>
      </div>

      {/* ── COIN STATS OVERVIEW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total in Circulation */}
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xs hover:border-amber-500/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
            <span>In Circulation</span>
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <Coins size={11} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-amber-400 tabular-nums tracking-tight my-0.5">
              {formatNumber(coinStats.totalAvailable)} <span className="text-[10px] font-bold text-[var(--muted)]">BBC</span>
            </div>
            <div className="text-[10px] font-medium text-[var(--muted)] truncate">Active User Balances</div>
          </div>
        </div>

        {/* Total Distributed */}
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xs hover:border-emerald-500/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
            <span>Distributed</span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight size={11} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums tracking-tight my-0.5">
              {formatNumber(coinStats.totalEarned)} <span className="text-[10px] font-bold text-[var(--muted)]">BBC</span>
            </div>
            <div className="text-[10px] font-medium text-[var(--muted)] truncate">All-time Claims & Tasks</div>
          </div>
        </div>

        {/* Total Redeemed */}
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xs hover:border-purple-500/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
            <span>Total Spent</span>
            <div className="p-1 rounded-md bg-purple-500/10 text-purple-400">
              <ArrowDownRight size={11} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-purple-400 tabular-nums tracking-tight my-0.5">
              {formatNumber(coinStats.totalSpent)} <span className="text-[10px] font-bold text-[var(--muted)]">BBC</span>
            </div>
            <div className="text-[10px] font-medium text-[var(--muted)] truncate">Used for Discounts</div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
            <span>Today&apos;s Flow</span>
            <span className="text-[8.5px] font-bold uppercase bg-[var(--foreground)]/[0.05] px-1.5 py-0.2 rounded text-[var(--muted)]">Today</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-sm sm:text-base font-black text-emerald-400 tabular-nums">+{formatNumber(coinStats.todayEarned)}</span>
              <span className="text-[9px] text-[var(--muted)] block font-medium">Earned</span>
            </div>
            <div className="text-right">
              <span className="text-sm sm:text-base font-black text-rose-400 tabular-nums">-{formatNumber(coinStats.todaySpent)}</span>
              <span className="text-[9px] text-[var(--muted)] block font-medium">Spent</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── USERS VIEW ─────────────────────────────────────────────────── */}
      {view === "users" && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <SearchInput
                value={userSearch}
                onChange={setUserSearch}
                placeholder="Search by name, email or ID..."
                size="sm"
              />
            </div>
            <button aria-label="button" onClick={fetchUsers} className="text-[var(--muted)]/40 hover:text-[var(--muted)] transition-colors">
              <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)]/40">
            <table className="w-full text-left border-collapse block sm:table">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-[var(--border)] bg-[var(--foreground)]/[0.02]">
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">User</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">Status/Role</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-[var(--muted)] text-right">Coins Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/40 block sm:table-row-group">
                {loading ? (
                  <tr className="block sm:table-row">
                    <td colSpan={3} className="py-10 text-center block sm:table-cell">
                      <LoadingSpinner size="md" color="muted" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr className="block sm:table-row">
                    <td colSpan={3} className="py-10 text-center block sm:table-cell">
                      <EmptyState
                        title="No Users Found"
                        description="No user records matched your search query."
                        size="sm"
                        variant="plain"
                      />
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[var(--foreground)]/[0.02] transition-colors flex flex-col sm:table-row p-4 sm:p-0 gap-3 sm:gap-0 relative"
                    >
                      <td className="px-0 sm:px-4 py-0 sm:py-3 block sm:table-cell">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black leading-tight">{u.name}</span>
                          <span className="text-[9px] text-[var(--muted)] font-mono">{u.userId}</span>
                          <span className="text-[8px] text-[var(--muted)]/60 truncate">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-0 sm:px-4 py-0 sm:py-3 block sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 rounded-md bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-[8px] font-black uppercase">
                            {u.userType}
                          </span>
                          {u.tags?.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-black uppercase">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-0 sm:px-4 py-0 sm:py-3 block sm:table-cell sm:text-right absolute sm:relative top-4 right-4 sm:top-auto sm:right-auto">
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-amber-400">{u.coins || 0} BBC</span>
                            <span className="text-[7px] text-[var(--muted)] font-bold uppercase tracking-tighter">Points</span>
                          </div>
                          <button aria-label="button"
                            onClick={() => setAdjModal(u)}
                            className="p-1.5 rounded-lg bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] transition-all shadow-sm"
                            title="Adjust Balance"
                          >
                            <FiPlus className="text-[10px]" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={pages} onPageChange={setPage} size="sm" hideOnSinglePage />
        </div>
      )}
      {/* ── HISTORY VIEW ───────────────────────────────────────────────── */}
      {view === "history" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                value={historySearch}
                onChange={setHistorySearch}
                placeholder="Search by User ID, Description, ID..."
                size="sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={historyFilter.source}
                onChange={(e) => { setHistoryFilter(f => ({ ...f, source: e.target.value })); setPage(1); }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-[var(--accent)]/40"
              >
                <option value="">All Sources</option>
                <option value="checkin">Daily Check-in</option>
                <option value="task">Tasks</option>
                <option value="ad_reward">Ads</option>
                <option value="purchase">Purchase</option>
                <option value="convert_to_wallet">Spend</option>
                <option value="admin">Admin</option>
              </select>
              <button aria-label="button" onClick={fetchHistory} className="text-[var(--muted)]/40 hover:text-[var(--muted)] transition-colors">
                <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)]/40">
            <table className="w-full text-left border-collapse block sm:table">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-[var(--border)] bg-[var(--foreground)]/[0.02]">
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">Time / ID</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">User</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">Type / Source</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-[var(--muted)] text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/40 block sm:table-row-group">
                {loading ? (
                  <tr className="block sm:table-row">
                    <td colSpan={4} className="py-10 text-center block sm:table-cell">
                      <LoadingSpinner size="md" color="muted" />
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr className="block sm:table-row">
                    <td colSpan={4} className="py-10 text-center block sm:table-cell">
                      <EmptyState
                        title="No Transactions Matched"
                        description="No transactions matched your search or filters."
                        size="sm"
                        variant="plain"
                      />
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <motion.tr
                      key={h.transactionId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[var(--foreground)]/[0.02] transition-colors text-[10px] flex flex-col sm:table-row p-4 sm:p-0 gap-3 sm:gap-0 relative"
                    >
                      <td className="px-0 sm:px-4 py-0 sm:py-3 block sm:table-cell">
                        <div className="flex flex-col">
                          <span className="font-mono text-[var(--muted)]/50">{h.transactionId}</span>
                          <span className="text-[9px] text-[var(--muted)] font-bold">
                            {new Date(h.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </td>
                      <td className="px-0 sm:px-4 py-0 sm:py-3 block sm:table-cell">
                        <div className="flex flex-col">
                          <span className="font-black truncate max-w-[150px]">{h.userId}</span>
                          <span className="text-[8px] text-[var(--muted)]/40 truncate max-w-[150px]">{h.description}</span>
                        </div>
                      </td>
                      <td className="px-0 sm:px-4 py-0 sm:py-3 block sm:table-cell">
                        <div className="flex gap-1.5 items-center">
                          <span className={`px-1.5 py-0.5 rounded uppercase font-black text-[8px] ${h.type === "earn" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                            {h.type}
                          </span>
                          <span className="text-[9px] text-[var(--muted)] font-bold uppercase">{h.source}</span>
                        </div>
                      </td>
                      <td className="px-0 sm:px-4 py-0 sm:py-3 block sm:table-cell sm:text-right absolute sm:relative top-4 right-4 sm:top-auto sm:right-auto">
                        <span className={`font-black text-xs ${h.type === "earn" ? "text-amber-400" : "text-rose-400"}`}>
                          {h.type === "earn" ? "+" : "-"}{h.coins}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={pages} onPageChange={setPage} size="sm" hideOnSinglePage />
        </div>
      )}

      {/* ── CLAIMS VIEW ─────────────────────────────────────────────────── */}
      {view === "claims" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {["pending", "approved", "rejected", "all"].map((s) => (
              <button aria-label="button"
                key={s}
                onClick={() => { setClaimStatus(s); setPage(1); }}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide border transition-all ${
                  claimStatus === s
                    ? "bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)]"
                    : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {s}
              </button>
            ))}
            <button aria-label="button" onClick={fetchClaims} className="ml-auto text-[var(--muted)]/40 hover:text-[var(--muted)] transition-colors">
              <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 flex justify-center"><LoadingSpinner size="lg" color="accent" /></div>
          ) : claims.length === 0 ? (
            <EmptyState
              icon={FiList}
              title={`No ${claimStatus} claims`}
              description="User submitted task claims will appear here."
            />
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => (
                <motion.div
                  key={claim.claimId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--card)]/40 border border-[var(--border)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[11px] font-black truncate">{claim.userName}</p>
                      <span className="text-[8px] font-mono text-[var(--muted)]/40">{claim.userId}</span>
                      <StatusBadge status={claim.status} size="xs" />
                    </div>
                    <p className="text-[9px] text-[var(--muted)]/60">
                      Task: <span className="font-bold text-[var(--foreground)]">{claim.taskTitle}</span>
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-amber-400 font-black text-xs">+{formatCoins(claim.coins, true)}</span>
                      <span className="text-[8px] font-mono text-[var(--muted)]/40">
                        {formatDateTime(claim.createdAt)}
                      </span>
                      {claim.proofUrl && (
                        <a href={claim.proofUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[8px] text-blue-400 underline flex items-center gap-0.5">
                          <FiEye size={10} /> Proof
                        </a>
                      )}
                      {claim.rejectionReason && (
                        <span className="text-[8px] text-rose-400">Reason: {claim.rejectionReason}</span>
                      )}
                    </div>
                  </div>

                  {claim.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => approveClaim(claim.claimId)}
                        disabled={actionLoading === claim.claimId}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase disabled:opacity-50"
                      >
                        {actionLoading === claim.claimId ? <LoadingSpinner size="xs" color="white" /> : <FiCheck size={12} />}
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setRejModal({ claimId: claim.claimId })}
                        disabled={actionLoading === claim.claimId}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase disabled:opacity-50"
                      >
                        <FiX /> Reject
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={pages} onPageChange={setPage} size="sm" hideOnSinglePage />
        </div>
      )}

      {/* ── TASKS VIEW ──────────────────────────────────────────────────── */}
      {view === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wide text-[var(--muted)]">
              Tasks Management
            </p>
            <div className="flex gap-2">
              <button aria-label="button" onClick={fetchTasks} className="text-[var(--muted)]/40 hover:text-[var(--muted)] transition-colors">
                <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setEditTask(null); setShowForm(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-wide"
              >
                <FiPlus /> New Task
              </motion.button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 flex justify-center"><LoadingSpinner size="md" color="muted" /></div>
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No Tasks Yet"
              description="Create your first coin task for users."
              size="sm"
              variant="plain"
            />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <motion.div
                  key={task.taskId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[var(--card)]/40 border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-all ${
                    task.active ? "border-[var(--border)]" : "border-[var(--border)]/40 opacity-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                    <TypeIcon type={task.type} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[11px] font-black truncate">{task.title}</p>
                      <span className="text-[8px] text-[var(--muted)]/40 font-bold uppercase">{typeLabels[task.type]}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-amber-400 font-black text-[10px]">+{task.reward} BBC</span>
                      <span className="text-[8px] text-[var(--muted)]/40 font-mono flex items-center gap-1">
                        <FiClock size={8} />{task.waitSeconds}s wait
                      </span>
                      <span className="text-[8px] text-emerald-400 font-bold">{task.completionCount} completed</span>
                      {task.maxCompletions && (
                        <span className="text-[8px] text-[var(--muted)]/40">/ {task.maxCompletions} max</span>
                      )}
                      {task.verificationCode && (
                        <span className="text-[8px] text-purple-400 font-bold flex items-center gap-1">🔒 Code: <span className="font-mono">{task.verificationCode}</span></span>
                      )}
                      {task.sponsorName && (
                        <span className="text-[8px] text-blue-400 font-bold">📢 {task.sponsorName}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button aria-label="button" onClick={() => toggleTask(task)} title={task.active ? "Deactivate" : "Activate"}
                      className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                      {task.active ? <FiToggleRight className="text-xl text-emerald-400" /> : <FiToggleLeft className="text-xl" />}
                    </button>
                    <button aria-label="button" onClick={() => { setEditTask(task); setShowForm(true); }}
                      className="text-[var(--muted)]/40 hover:text-[var(--accent)] transition-colors">
                      <FiEdit3 className="text-sm" />
                    </button>
                    <button aria-label="button" onClick={() => deleteTask(task.taskId)}
                      className="text-[var(--muted)]/40 hover:text-rose-400 transition-colors">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={pages} onPageChange={setPage} size="sm" hideOnSinglePage />
        </div>
      )}

      {/* ── TASK FORM MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <TaskFormModal
            task={editTask}
            token={token || ""}
            onClose={() => { setShowForm(false); setEditTask(null); }}
            onSaved={() => { setShowForm(false); setEditTask(null); fetchTasks(); showToast(editTask ? "Task updated!" : "Task created!", "success"); }}
            onError={(msg) => showToast(msg, "error")}
          />
        )}
      </AnimatePresence>

      {/* ── REJECT MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {rejModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1500] flex items-center justify-center p-3 sm:p-4"
            onClick={() => setRejModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 w-full max-w-sm space-y-4 mx-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-rose-400 text-lg" />
                <h3 className="text-sm font-black uppercase tracking-wide">Reject Claim</h3>
              </div>
              <textarea
                value={rejReason}
                onChange={(e) => setRejReason(e.target.value)}
                placeholder="Reason for rejection (optional)..."
                rows={3}
                className="w-full bg-[var(--background)]/60 border border-[var(--border)] rounded-xl p-3 text-xs font-bold outline-none focus:border-rose-500/40 resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button aria-label="button" onClick={() => setRejModal(null)}
                  className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--muted)] text-[10px] font-black uppercase">
                  Cancel
                </button>
                <button aria-label="button" onClick={rejectClaim} disabled={!!actionLoading}
                  className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase disabled:opacity-50">
                  {actionLoading ? <FiRefreshCw className="animate-spin mx-auto" /> : "Reject Claim"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADJUST BALANCE MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {adjModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1500] flex items-center justify-center p-4"
            onClick={() => setAdjModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 w-full max-w-sm space-y-5 mx-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <FiStar className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wide">Adjust Balance</h3>
                    <p className="text-[8px] text-[var(--muted)]/50 font-bold uppercase">{adjModal.userId}</p>
                  </div>
                </div>
                <button aria-label="button" onClick={() => setAdjModal(null)} className="text-[var(--muted)]/40 hover:text-[var(--muted)]">
                  <FiX />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex bg-[var(--background)]/60 rounded-xl p-1 border border-[var(--border)]">
                  <button aria-label="button"
                    onClick={() => setAdjAction("add")}
                    className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${adjAction === "add" ? "bg-emerald-500 text-white" : "text-[var(--muted)]"}`}
                  >
                    Add
                  </button>
                  <button aria-label="button"
                    onClick={() => setAdjAction("remove")}
                    className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${adjAction === "remove" ? "bg-rose-500 text-white" : "text-[var(--muted)]"}`}
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/40 ml-1">Coins Amount</label>
                  <input
                    type="number"
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                    placeholder="Enter BBC Coins amount..."
                    className="w-full bg-[var(--background)]/60 border border-[var(--border)] rounded-xl px-4 py-3 text-xs font-black outline-none focus:border-[var(--accent)]/40"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] space-y-1">
                  <div className="flex justify-between text-[8px] font-bold uppercase text-[var(--muted)]">
                    <span>Current Balance</span>
                    <span>{adjModal.coins || 0} BBC</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-bold uppercase">
                    <span>New Balance</span>
                    <span className={adjAction === "add" ? "text-emerald-400" : "text-rose-400"}>
                      {adjAction === "add" ? (adjModal.coins || 0) + (Number(adjAmount) || 0) : (adjModal.coins || 0) - (Number(adjAmount) || 0)} BBC
                    </span>
                  </div>
                </div>

                <button aria-label="button"
                  onClick={adjustCoins}
                  disabled={!!actionLoading || !adjAmount || Number(adjAmount) <= 0}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${adjAction === "add" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-rose-500 text-white shadow-lg shadow-rose-500/20"}`}
                >
                  {actionLoading === adjModal.userId ? <FiRefreshCw className="animate-spin mx-auto text-lg" /> : `Confirm ${adjAction}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, color, pulse }) {
  const colors = {
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };
  return (
    <div className={`p-2 rounded-xl border ${colors[color]} relative overflow-hidden`}>
      {pulse && <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-current animate-pulse" />}
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[10px] shrink-0">{icon}</span>
        <span className="text-[7px] font-black uppercase tracking-wider opacity-60 whitespace-nowrap truncate">{label}</span>
      </div>
      <div className="text-sm font-black tracking-tighter tabular-nums">
        {value.toLocaleString()} <span className="text-[7px] opacity-40 ml-0.5 font-bold">BBC</span>
      </div>
    </div>
  );
}

// ── TASK FORM MODAL ──────────────────────────────────────────────────────────
function TaskFormModal({ task, token, onClose, onSaved, onError }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    type: task?.type || "url_visit",
    url: task?.url || "",
    reward: String(task?.reward || 10),
    waitSeconds: String(task?.waitSeconds || 10),
    sponsorName: task?.sponsorName || "",
    priority: String(task?.priority || 0),
    maxCompletions: task?.maxCompletions ? String(task.maxCompletions) : "",
    expiresAt: task?.expiresAt ? task.expiresAt.slice(0, 16) : "",
    verificationCode: task?.verificationCode || "",
  });
  // Toggle: if false, no code required; if true, code input is shown & mandatory
  const [requireCode, setRequireCode] = useState(!!task?.verificationCode);
  const [saving, setSaving] = useState(false);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleToggleCode = (val) => {
    setRequireCode(val);
    // Clear code if toggled off
    if (!val) setForm((f) => ({ ...f, verificationCode: "" }));
  };

  const save = async () => {
    if (!form.title || !form.url || !form.reward) return onError("Title, URL, reward are required");
    if (requireCode && !form.verificationCode.trim()) return onError("Please enter a verification code, or disable the toggle");

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        url: form.url,
        reward: Number(form.reward),
        waitSeconds: Number(form.waitSeconds) || 10,
        sponsorName: form.sponsorName || null,
        priority: Number(form.priority) || 0,
        maxCompletions: form.maxCompletions ? Number(form.maxCompletions) : null,
        expiresAt: form.expiresAt || null,
        verificationCode: requireCode ? (form.verificationCode.trim() || null) : null,
      };

      let res;
      if (task) {
        payload.taskId = task.taskId;
        res = await fetch("/api/admin/coins/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/coins/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (data.success) onSaved();
      else onError(data.message || "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const fieldCls = "w-full bg-[var(--background)]/60 border border-[var(--border)] rounded-xl px-3 py-3 text-xs font-bold outline-none focus:border-[var(--accent)]/40 transition-colors";
  const labelCls = "text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/40 mb-1.5 block";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1500] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg space-y-4 my-2 sm:my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wide">
            {task ? "Edit Task" : "Create New Task"}
          </h3>
          <button aria-label="button" onClick={onClose} className="text-[var(--muted)]/40 hover:text-[var(--muted)]">
            <FiX />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="col-span-1 sm:col-span-2">
            <p className={labelCls}>Title *</p>
            <input value={form.title} onChange={e => setField("title", e.target.value)} placeholder="e.g. Watch Our Latest Video"
              className={fieldCls} />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <p className={labelCls}>Description</p>
            <input value={form.description} onChange={e => setField("description", e.target.value)} placeholder="Short description"
              className={fieldCls} />
          </div>
          <div>
            <p className={labelCls}>Type *</p>
            <select value={form.type} onChange={e => setField("type", e.target.value)} className={fieldCls}>
              {TASK_TYPES.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
            </select>
          </div>
          <div>
            <p className={labelCls}>Coin Reward *</p>
            <input type="number" value={form.reward} onChange={e => setField("reward", e.target.value)} min={1}
              placeholder="e.g. 15" className={fieldCls} />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <p className={labelCls}>URL / Link *</p>
            <input value={form.url} onChange={e => setField("url", e.target.value)} placeholder="https://..."
              className={fieldCls} />
          </div>
          <div>
            <p className={labelCls}>Wait (sec) before claim</p>
            <input type="number" value={form.waitSeconds} onChange={e => setField("waitSeconds", e.target.value)} min={0}
              placeholder="10" className={fieldCls} />
          </div>
          <div>
            <p className={labelCls}>Priority (higher = first)</p>
            <input type="number" value={form.priority} onChange={e => setField("priority", e.target.value)}
              placeholder="0" className={fieldCls} />
          </div>
          <div>
            <p className={labelCls}>Sponsor Name</p>
            <input value={form.sponsorName} onChange={e => setField("sponsorName", e.target.value)} placeholder="e.g. Garena"
              className={fieldCls} />
          </div>
          <div>
            <p className={labelCls}>Max Completions</p>
            <input type="number" value={form.maxCompletions} onChange={e => setField("maxCompletions", e.target.value)}
              placeholder="∞ unlimited" className={fieldCls} />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <p className={labelCls}>Expires At</p>
            <input type="datetime-local" value={form.expiresAt} onChange={e => setField("expiresAt", e.target.value)}
              className={fieldCls} />
          </div>

          {/* ── VERIFICATION CODE TOGGLE ─────────────────────────────── */}
          <div className="col-span-1 sm:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-3 space-y-3">
            {/* Toggle row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide">🔒 Require Verification Code</p>
                <p className="text-[8px] text-[var(--muted)]/40 font-bold mt-0.5">
                  {requireCode ? "Users must enter the secret code to claim" : "No code needed — timer only"}
                </p>
              </div>
              {/* Toggle switch */}
              <button aria-label="button"
                type="button"
                onClick={() => handleToggleCode(!requireCode)}
                className={`relative w-11 h-6 rounded-full border-2 transition-all duration-300 shrink-0 ${
                  requireCode
                    ? "bg-purple-600 border-purple-500"
                    : "bg-[var(--card)] border-[var(--border)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                    requireCode ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Code input — only visible when toggle is ON */}
            {requireCode && (
              <div className="space-y-1.5 pt-1 border-t border-[var(--border)]/40">
                <input
                  value={form.verificationCode}
                  onChange={e => setField("verificationCode", e.target.value.toUpperCase())}
                  placeholder="e.g. BLUEBUFF2025"
                  className={`${fieldCls} border-purple-500/30 focus:border-purple-500/60 font-black tracking-widest text-purple-300`}
                  autoComplete="off"
                />
                <p className="text-[8px] text-purple-400/60 font-bold">
                  💡 Hide this code in your YouTube description, WhatsApp post, or web page. Users must read carefully and type it to claim their coins.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button aria-label="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--muted)] text-[10px] font-black uppercase">
            Cancel
          </button>
          <button aria-label="button" onClick={save} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-white text-[10px] font-black uppercase disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
            {task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
