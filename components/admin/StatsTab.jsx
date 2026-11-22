"use client";

import { useEffect, useState } from "react";
import {
    FiUser,
    FiCreditCard,
    FiRefreshCw,
    FiPlus,
    FiMinus,
    FiMail,
    FiDollarSign,
    FiClock,
    FiSearch,
    FiChevronLeft,
    FiChevronRight,
    FiArrowUp,
    FiArrowDown,
    FiFilter,
    FiCheckCircle,
    FiXCircle,
    FiTrendingUp,
    FiActivity,
    FiMoreVertical
} from "react-icons/fi";
import { Loader2, Zap, ArrowUpRight, ArrowDownRight, User, Wallet, ChevronDown, ChevronUp, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination, SearchInput, StatusBadge, SectionTitle } from "@/components/common";
import { formatCurrency, formatDate, formatDateTime } from "@/utils";

export default function StatsTab() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        wallets: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }
    });

    // Wallet List State
    const [walletPage, setWalletPage] = useState(1);
    const [walletSearch, setWalletSearch] = useState("");
    const [walletLoading, setWalletLoading] = useState(false);

    // Manage Wallet State
    const [manageEmail, setManageEmail] = useState("");
    const [manageAmount, setManageAmount] = useState("");
    const [manageDescription, setManageDescription] = useState("");
    const [updating, setUpdating] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);

    // History State
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [historySearch, setHistorySearch] = useState("");
    const [historyType, setHistoryType] = useState(""); // credit | debit
    const [historyStatus, setHistoryStatus] = useState(""); // success | failed | pending
    const [historyTotalPages, setHistoryTotalPages] = useState(1);

    // Tab State
    const [activeTab, setActiveTab] = useState("history"); // history | wallets

    // Modal State
    const [selectedUserForWallet, setSelectedUserForWallet] = useState(null);
    const [quickAmount, setQuickAmount] = useState("");



    /* ================= FETCH WALLET LIST ================= */
    const fetchWallets = async () => {
        try {
            setWalletLoading(true);
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: walletPage,
                limit: 10,
                search: walletSearch
            });

            const res = await fetch(`/api/admin/stats/data?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                setData(prev => ({
                    ...prev,
                    wallets: json.data || [],
                    pagination: json.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
                }));
            }
        } catch (err) {
            console.error("Failed to fetch wallet list", err);
        } finally {
            setWalletLoading(false);
            setLoading(false);
        }
    };

    /* ================= FETCH HISTORY ================= */
    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: historyPage,
                limit: 10,
                search: historySearch,
                type: historyType,
                status: historyStatus
            });

            const res = await fetch(`/api/admin/wallet/history?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                setHistory(json.data || []);
                setHistoryTotalPages(json.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setHistoryLoading(false);
            setLoading(false);
        }
    };

    /* ================= MANAGE WALLET ================= */
    const handleManageWallet = async (action, overrideEmail = null, overrideAmount = null) => {
        const finalEmail = overrideEmail || manageEmail;
        const finalAmount = overrideAmount || manageAmount;

        if (!finalEmail || !finalAmount || Number(finalAmount) <= 0) {
            alert("Please enter a valid email and amount.");
            return;
        }

        try {
            setUpdating(true);
            const token = localStorage.getItem("token");

            const res = await fetch("/api/admin/wallet/manage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: finalEmail,
                    amount: Number(finalAmount),
                    action,
                    description: manageDescription,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                alert(json.message || "Failed to update wallet");
            } else {
                // If it's a quick action, we might not want alerts, but for now keep it simple
                // alert(json.message); 
                setManageEmail("");
                setManageAmount("");
                setManageDescription("");
                setQuickAmount("");
                setSelectedUserForWallet(null);
                fetchWallets();
                fetchHistory();
            }
        } catch (err) {
            console.error("Wallet update error", err);
            alert("Something went wrong.");
        } finally {
            setUpdating(false);
        }
    };

    /* ================= UPDATE STATUS ================= */
    const handleStatusUpdate = async (id, newStatus) => {
        if (!confirm(`Do you want to mark this transaction as ${newStatus}?`)) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/admin/wallet/update-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id, status: newStatus }),
            });
            const json = await res.json();

            if (json.success) {
                alert(json.message);
                fetchHistory();
                fetchWallets(); // Update wallet list
            } else {
                alert(json.message || "Failed to update status");
            }
        } catch (err) {
            console.error("Status update error", err);
            alert("Could not update status.");
        }
    };




    // Fetch on history change
    useEffect(() => {
        if (activeTab === "history") {
            fetchHistory();
        }
    }, [historyPage, historySearch, historyType, historyStatus, activeTab]);

    // Fetch on wallet list change
    useEffect(() => {
        if (activeTab === "wallets") {
            fetchWallets();
        }
    }, [walletPage, walletSearch, activeTab]);

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">

            {/* HEADER */}
            <div className="flex items-center justify-end flex-wrap gap-2 pb-2.5 border-b border-[var(--border)]/70 mb-2">
                <div className="flex items-center justify-end gap-1.5 md:gap-2 shrink-0">
                    {/* TABS */}
                    <div className="flex bg-[var(--foreground)]/[0.03] p-0.5 rounded-full border border-[var(--border)]">
                        <button aria-label="button"
                            onClick={() => setActiveTab("history")}
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                        >
                            History
                        </button>
                        <button aria-label="button"
                            onClick={() => setActiveTab("wallets")}
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'wallets' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                        >
                            Wallets
                        </button>
                    </div>

                    <button aria-label="button"
                        onClick={() => {
                            if (activeTab === "history") fetchHistory();
                            else fetchWallets();
                        }}
                        disabled={loading || (activeTab === "history" ? historyLoading : walletLoading)}
                        className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0"
                        title="Refresh wallet data"
                    >
                        {loading || (activeTab === "history" ? historyLoading : walletLoading) ? (
                            <Loader2 className="animate-spin text-[var(--accent)]" size={12} />
                        ) : (
                            <RefreshCcw size={12} className="text-[var(--accent)]" />
                        )}
                    </button>
                </div>
            </div>

            {loading && !data.totalBalance && (!data.wallets || !data.wallets.length) ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
                    <p className="text-sm text-[var(--muted)] font-medium">Fetching wallet data...</p>
                </div>
            ) : (
                <>




                    {/* MANUAL WALLET ADJUSTMENT */}
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[1.25rem] p-4 sm:p-5 relative overflow-hidden mb-2">
                        <div 
                            className="flex items-center justify-between cursor-pointer group"
                            onClick={() => setShowManualForm(!showManualForm)}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">Add/Remove Money</h3>
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--foreground)]/[0.03] text-[var(--muted)] group-hover:text-[var(--foreground)] group-hover:bg-[var(--foreground)]/[0.05] transition-all">
                                {showManualForm ? <FiMinus size={16} /> : <FiPlus size={16} />}
                            </div>
                        </div>

                        {showManualForm && (
                            <div className="flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-6 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 sm:gap-4">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] ml-1 uppercase tracking-wider">User Email</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                                        <input
                                            type="email"
                                            value={manageEmail}
                                            onChange={(e) => setManageEmail(e.target.value)}
                                            placeholder="user@example.com"
                                            className="w-full h-10 sm:h-11 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] text-sm focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
                                        />
                                    </div>
                                </div>

                                <div className="w-full md:w-48 space-y-1.5">
                                    <label className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] ml-1 uppercase tracking-wider">Amount</label>
                                    <div className="relative">
                                        <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                                        <input
                                            type="number"
                                            value={manageAmount}
                                            onChange={(e) => setManageAmount(e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            className="w-full h-10 sm:h-11 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] text-sm focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 sm:gap-4">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] ml-1 uppercase tracking-wider">Description (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={manageDescription}
                                            onChange={(e) => setManageDescription(e.target.value)}
                                            placeholder="Reason for adjustment"
                                            className="w-full h-10 sm:h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] text-sm focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 w-full md:w-auto pt-1 sm:pt-0">
                                    <button aria-label="button"
                                        onClick={() => handleManageWallet("add")}
                                        disabled={updating}
                                        className="flex-1 md:flex-none h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-emerald-500/20 active:scale-95 transition-all outline-none disabled:opacity-50"
                                    >
                                        {updating ? <Loader2 className="animate-spin" size={14} /> : <FiPlus size={14} />}
                                        <span className="hidden xs:inline">Add Money</span>
                                        <span className="xs:hidden">Add</span>
                                    </button>
                                    <button aria-label="button"
                                        onClick={() => handleManageWallet("remove")}
                                        disabled={updating}
                                        className="flex-1 md:flex-none h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-red-500/20 active:scale-95 transition-all outline-none disabled:opacity-50"
                                    >
                                        {updating ? <Loader2 className="animate-spin" size={14} /> : <FiMinus size={14} />}
                                        <span className="hidden xs:inline">Remove Money</span>
                                        <span className="xs:hidden">Deduct</span>
                                    </button>
                                </div>
                            </div>
                            </div>
                        )}
                    </div>

                    {/* TRANSACTION HISTORY */}
                    {activeTab === "history" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                                        Wallet Action History
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
                                    {/* SEARCH */}
                                    <div className="sm:col-span-6">
                                        <SearchInput
                                            value={historySearch}
                                            onChange={(val) => { setHistorySearch(val); setHistoryPage(1); }}
                                            placeholder="Search transactions..."
                                            size="sm"
                                        />
                                    </div>
                                    <div className="sm:col-span-6 grid grid-cols-2 gap-2 sm:gap-3">
                                        <div className="relative group">
                                            <select
                                                value={historyType}
                                                onChange={(e) => { setHistoryType(e.target.value); setHistoryPage(1); }}
                                                className="w-full h-10 md:h-11 pl-3 sm:pl-4 pr-8 rounded-full bg-[var(--card)] border border-[var(--border)] text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--foreground)] outline-none focus:border-[var(--accent)] appearance-none cursor-pointer transition-all hover:bg-[var(--foreground)]/[0.02]"
                                            >
                                                <option value="">All Actions</option>
                                                <option value="credit">Money Added</option>
                                                <option value="debit">Money Spent</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]/70 group-hover:text-[var(--foreground)] transition-colors">
                                                <FiFilter size={12} />
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <select
                                                value={historyStatus}
                                                onChange={(e) => { setHistoryStatus(e.target.value); setHistoryPage(1); }}
                                                className="w-full h-10 md:h-11 pl-3 sm:pl-4 pr-8 rounded-full bg-[var(--card)] border border-[var(--border)] text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--foreground)] outline-none focus:border-[var(--accent)] appearance-none cursor-pointer transition-all hover:bg-[var(--foreground)]/[0.02]"
                                            >
                                                <option value="">All Status</option>
                                                <option value="success">Success</option>
                                                <option value="failed">Failed</option>
                                                <option value="pending">Pending</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]/70 group-hover:text-[var(--foreground)] transition-colors">
                                                <ChevronDown size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MOBILE CARD VIEW FOR HISTORY */}
                            <div className="md:hidden space-y-3">
                                {historyLoading ? (
                                    <div className="py-12 text-center text-[var(--muted)]">
                                        <Loader2 className="animate-spin mx-auto mb-2" />
                                        Loading history...
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="py-12 text-center text-[var(--muted)]">No transactions found.</div>
                                ) : (
                                    history.map((txn) => (
                                        <div key={txn._id} className="p-3 md:p-4 rounded-[1.25rem] bg-[var(--card)] border border-[var(--border)] active:bg-[var(--foreground)]/[0.05] transition-all relative overflow-hidden">
                                            
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[7px] font-bold uppercase tracking-wider ${txn.type === 'credit'
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                            }`}>
                                                            {txn.type === 'credit' ? <FiArrowUp size={8} /> : <FiArrowDown size={8} />}
                                                            {txn.type}
                                                        </span>
                                                        <StatusBadge status={txn.status} size="xs" />
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="w-6 h-6 rounded-lg bg-[var(--foreground)]/[0.05] flex items-center justify-center shrink-0">
                                                            <FiUser size={12} className="text-[var(--accent)]" />
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="font-bold text-[var(--foreground)] uppercase text-[10px] leading-tight truncate">{txn.userId}</p>
                                                            <p className="text-[9px] text-[var(--muted)]/60 truncate leading-tight lowercase">{txn.userObjectId?.email || "no email"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-end shrink-0">
                                                    <div className={`text-base font-black tracking-tighter tabular-nums ${txn.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {txn.type === 'credit' ? '+' : '-'}{txn.amount.toLocaleString()}
                                                    </div>
                                                    <span className="text-[8px] font-medium text-[var(--muted)]/40 leading-none mt-1">{new Date(txn.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[7px] font-medium text-[var(--muted)]/30 leading-none mt-0.5">{new Date(txn.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-2 mt-2">
                                                <span className="text-[9px] font-mono text-[var(--muted)]/40 truncate uppercase">{txn.transactionId}</span>
                                                
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {txn.status === 'pending' && (
                                                        <button aria-label="button"
                                                            onClick={async () => {
                                                                if (!confirm("Verify with Gateway?")) return;
                                                                try {
                                                                    const token = localStorage.getItem("token");
                                                                    const res = await fetch("/api/admin/wallet/verify", {
                                                                        method: "POST",
                                                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                                        body: JSON.stringify({ transactionId: txn._id })
                                                                    });
                                                                    const json = await res.json();
                                                                    alert(json.message);
                                                                    if (json.success) fetchHistory();
                                                                } catch (e) {
                                                                        alert("Verification failed.");
                                                                }
                                                            }}
                                                            className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                                                            title="Check & Auto Approve"
                                                        >
                                                            <FiRefreshCw size={10} />
                                                        </button>
                                                    )}
                                                    {txn.status !== 'success' && (
                                                        <button aria-label="button"
                                                            onClick={() => handleStatusUpdate(txn._id, 'success')}
                                                            className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                                                            title="Manually Mark Success"
                                                        >
                                                            <FiCheckCircle size={10} />
                                                        </button>
                                                    )}
                                                    {txn.status !== 'failed' && (
                                                        <button aria-label="button"
                                                            onClick={() => handleStatusUpdate(txn._id, 'failed')}
                                                            className="h-6 w-6 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                                                            title="Mark Failed & Deduct"
                                                        >
                                                            <FiXCircle size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* DESKTOP TABLE VIEW FOR HISTORY */}
                            <div className="hidden md:block rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)] text-[var(--muted)]">
                                            <tr className="text-xs font-semibold uppercase tracking-wider">
                                                <th className="px-6 py-4">Transaction ID</th>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4 text-right">Amount</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                                <th className="px-6 py-4 text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {historyLoading ? (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-12 text-center text-[var(--muted)]">
                                                        <Loader2 className="animate-spin mx-auto mb-2" />
                                                        Loading history...
                                                    </td>
                                                </tr>
                                            ) : history.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-12 text-center text-[var(--muted)]">
                                                        No transactions found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                history.map((txn) => (
                                                    <tr key={txn._id} className="group hover:bg-[var(--foreground)]/[0.02] transition-colors">
                                                        <td className="px-6 py-4 text-[11px] font-mono text-[var(--muted)]">
                                                            {txn.transactionId}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className="text-xs font-medium text-[var(--foreground)]">{txn.userId}</span>
                                                                    {txn.userObjectId?.email && (
                                                                        <span className="text-[10px] text-[var(--muted)]/70 font-normal lowercase">({txn.userObjectId.email})</span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-[var(--muted)] mt-0.5">{txn.description}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${txn.type === 'credit'
                                                                ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                                                                : 'bg-red-500/5 text-red-500 border-red-500/20'
                                                                }`}>
                                                                {txn.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`font-mono font-bold ${txn.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {txn.type === 'credit' ? '+' : '-'}{txn.amount.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <StatusBadge status={txn.status} size="xs" />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {txn.status === 'pending' && (
                                                                    <button aria-label="button"
                                                                        onClick={async () => {
                                                                            if (!confirm("Verify this Pending Transaction with Gateway?")) return;
                                                                            try {
                                                                                const token = localStorage.getItem("token");
                                                                                const res = await fetch("/api/admin/wallet/verify", {
                                                                                    method: "POST",
                                                                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                                                    body: JSON.stringify({ transactionId: txn._id })
                                                                                });
                                                                                const json = await res.json();
                                                                                alert(json.message);
                                                                                if (json.success) fetchHistory();
                                                                            } catch (e) {
                                                                                console.error(e);
                                                                                alert("Verification API failed.");
                                                                            }
                                                                        }}
                                                                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                                                                        title="Check Gateway & Auto Approve"
                                                                    >
                                                                        <FiRefreshCw size={14} />
                                                                    </button>
                                                                )}
                                                                {txn.status !== 'success' && (
                                                                    <button aria-label="button"
                                                                        onClick={() => handleStatusUpdate(txn._id, 'success')}
                                                                        className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-colors"
                                                                        title="Manually Mark as Success"
                                                                    >
                                                                        <FiCheckCircle size={14} />
                                                                    </button>
                                                                )}
                                                                {txn.status !== 'failed' && (
                                                                    <button aria-label="button"
                                                                        onClick={() => handleStatusUpdate(txn._id, 'failed')}
                                                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                                                        title="Mark as Failed & Deduct Funds"
                                                                    >
                                                                        <FiXCircle size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-[11px] text-[var(--muted)] font-mono">
                                                            {new Date(txn.createdAt).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination History */}
                            <div className="pt-2 border-t border-[var(--border)] flex justify-end">
                                <Pagination
                                    page={historyPage}
                                    totalPages={historyTotalPages}
                                    onPageChange={setHistoryPage}
                                    size="sm"
                                    hideOnSinglePage
                                />
                            </div>
                        </div>
                    )}

                    {/* USER WALLETS TABLE */}
                    {activeTab === "wallets" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                                    Customer Wallet List
                                </h3>

                                <div className="relative w-full sm:w-64">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/70" size={14} />
                                    <input
                                        value={walletSearch}
                                        onChange={(e) => { setWalletSearch(e.target.value); setWalletPage(1); }}
                                        placeholder="Search users..."
                                        className="w-full h-10 md:h-11 pl-10 pr-4 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]/40 hover:bg-[var(--foreground)]/[0.01]"
                                    />
                                </div>
                            </div>

                            <div className="lg:hidden space-y-4">
                                {walletLoading ? (
                                    <div className="py-20 text-center text-[var(--muted)]">
                                        <Loader2 className="animate-spin mx-auto mb-3 text-[var(--accent)]" size={32} />
                                        <p className="font-medium">Curating your user list...</p>
                                    </div>
                                ) : (!data.wallets || !data.wallets.length) ? (
                                    <div className="py-20 text-center text-[var(--muted)]/40 flex flex-col items-center">
                                        <FiUser size={48} className="mb-4 opacity-10" />
                                        <p className="text-sm font-medium">No users found.</p>
                                    </div>
                                ) : (
                                    data.wallets.map((user, idx) => (
                                        <motion.div
                                            key={user._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group relative bg-[var(--card)] border border-[var(--border)] rounded-[1.25rem] p-3 md:p-4 overflow-hidden transition-all hover:border-[var(--accent)]/30 active:bg-[var(--foreground)]/[0.05]"
                                        >
                                            <div className="relative z-10 flex items-center justify-between gap-2 w-full">
                                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center shrink-0">
                                                        <span className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase">{user.name ? user.name.charAt(0) : '?'}</span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <h4 className="font-bold text-[var(--foreground)] text-xs md:text-sm truncate leading-none">{user.name || "Unknown"}</h4>
                                                            {user.userType === 'owner' && (
                                                                <span className="px-1.5 py-0.5 rounded-md text-[7px] bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest shrink-0">
                                                                    OWNER
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-[var(--muted)]/80 font-medium truncate lowercase leading-tight mt-1">{user.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end shrink-0 gap-2 border-l border-[var(--border)] pl-3">
                                                    <div className="text-right">
                                                        <p className="text-base md:text-lg font-black text-[var(--foreground)] tabular-nums tracking-tighter leading-none">
                                                            ₹{user.wallet.toLocaleString()}
                                                        </p>
                                                        <p className="text-[8px] font-bold text-[var(--muted)]/50 uppercase tracking-widest mt-1 leading-none">Wallet</p>
                                                    </div>
                                                    <button aria-label="button"
                                                        onClick={() => {
                                                            setSelectedUserForWallet(user);
                                                            setQuickAmount("");
                                                        }}
                                                        className="w-7 h-7 rounded-full bg-[var(--accent)]/10 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white transition-all flex items-center justify-center active:scale-95 border border-[var(--accent)]/10"
                                                    >
                                                        <FiDollarSign size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* DESKTOP TABLE VIEW FOR WALLETS */}
                            <div className="hidden md:block rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)] text-[var(--muted)]">
                                            <tr className="text-xs font-semibold uppercase tracking-wider">
                                                <th className="px-6 py-4 w-16 text-center">#</th>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Email / ID</th>
                                                <th className="px-6 py-4 text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {walletLoading ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-[var(--muted)]">
                                                        <Loader2 className="animate-spin mx-auto mb-2" />
                                                        Loading wallets...
                                                    </td>
                                                </tr>
                                            ) : (!data.wallets || !data.wallets.length) ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-[var(--muted)] text-sm">
                                                        No wallet data available.
                                                    </td>
                                                </tr>
                                            ) : (
                                                data.wallets.map((user, idx) => (
                                                    <tr
                                                        key={user._id}
                                                        className="group hover:bg-[var(--foreground)]/[0.02] transition-colors"
                                                    >
                                                        <td className="px-6 py-4 text-center font-mono text-[var(--muted)]/60">
                                                            {(data.pagination.page - 1) * data.pagination.limit + idx + 1}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-medium text-[var(--foreground)]">
                                                                    {user.name || "Unknown"}
                                                                </span>
                                                                {user.userType === 'owner' && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 font-semibold">
                                                                        OWNER
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[var(--foreground)]/80 text-xs font-mono">{user.email || 'No Email'}</span>
                                                                <span className="text-[10px] text-[var(--muted)]/60 font-mono mt-0.5">{user.userId}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-xs font-black text-[var(--foreground)] tabular-nums">
                                                                        ₹{user.wallet.toLocaleString()}
                                                                    </span>
                                                                    <span className="text-[9px] text-[var(--muted)] uppercase font-bold tracking-tighter opacity-50">Current Balance</span>
                                                                </div>
                                                                <button aria-label="button"
                                                                    onClick={() => {
                                                                        setSelectedUserForWallet(user);
                                                                        setQuickAmount("");
                                                                    }}
                                                                    className="w-8 h-8 rounded-lg bg-[var(--accent)]/5 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white transition-all flex items-center justify-center shadow-lg shadow-transparent hover:shadow-[var(--accent)]/20 active:scale-95"
                                                                >
                                                                    <FiDollarSign size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination Wallets */}
                            <div className="pt-6 border-t border-[var(--border)] flex justify-end">
                                <Pagination
                                    page={data.pagination?.page || 1}
                                    totalPages={data.pagination?.totalPages || 1}
                                    totalItems={data.pagination?.total || data.wallets.length}
                                    itemLabel="Wallets"
                                    onPageChange={setWalletPage}
                                    size="sm"
                                    hideOnSinglePage
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* QUICK MANAGE MODAL */}
            <AnimatePresence>
                {selectedUserForWallet && (
                    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUserForWallet(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-5 pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                                            <Wallet size={14} />
                                        </div>
                                        <div>
                                            <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--foreground)] leading-none mb-1">Quick Adjust</h3>
                                            <p className="text-[9px] text-[var(--muted)] font-medium">Manage user balance</p>
                                        </div>
                                    </div>
                                    <button aria-label="button"
                                        onClick={() => setSelectedUserForWallet(null)}
                                        className="w-7 h-7 rounded-full bg-[var(--foreground)]/[0.05] text-[var(--muted)] flex items-center justify-center hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.1] transition-all"
                                    >
                                        <FiXCircle size={14} />
                                    </button>
                                </div>

                                <div className="bg-[var(--card)] border border-[var(--border)] rounded-[1rem] p-3 mb-4 relative overflow-hidden">
                                    <div className="flex items-center gap-2.5 relative z-10">
                                        <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center shrink-0">
                                            <span className="font-black text-[var(--foreground)] text-xs uppercase">{selectedUserForWallet.name ? selectedUserForWallet.name.charAt(0) : '?'}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-[var(--foreground)] text-[12px] truncate">{selectedUserForWallet.name}</p>
                                            <p className="text-[9px] text-[var(--muted)]/80 font-medium truncate lowercase">{selectedUserForWallet.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex justify-between items-center relative z-10">
                                        <span className="text-[8px] font-bold text-[var(--muted)]/70 uppercase tracking-widest">Current Wallet</span>
                                        <span className="font-black text-[var(--foreground)] text-sm tabular-nums tracking-tighter">₹{selectedUserForWallet.wallet.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Adjustment Amount</label>
                                        <div className="relative group">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)] font-black text-xs">₹</span>
                                            <input
                                                autoFocus
                                                type="number"
                                                value={quickAmount}
                                                onChange={(e) => setQuickAmount(e.target.value)}
                                                placeholder="0"
                                                className="w-full h-10 pl-7 pr-3 rounded-full bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-[var(--foreground)] font-black text-sm outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/[0.05] transition-all placeholder:text-[var(--muted)]/30"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <button aria-label="button"
                                            onClick={() => handleManageWallet("remove", selectedUserForWallet.email, quickAmount)}
                                            disabled={updating || !quickAmount}
                                            className="h-9 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-30"
                                        >
                                            {updating ? <Loader2 className="animate-spin" size={12} /> : <FiMinus size={12} />}
                                            Deduct
                                        </button>
                                        <button aria-label="button"
                                            onClick={() => handleManageWallet("add", selectedUserForWallet.email, quickAmount)}
                                            disabled={updating || !quickAmount}
                                            className="h-9 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-30"
                                        >
                                            {updating ? <Loader2 className="animate-spin" size={12} /> : <FiPlus size={12} />}
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 pt-0 mt-4">
                                <p className="text-[9px] text-center text-[var(--muted)] leading-relaxed px-4 opacity-50">
                                    Changes will be recorded in transaction history and adjusted immediately.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Avatar({ name, type, size = "md" }) {
    const initials = name?.[0]?.toUpperCase() || "U";
    const isOwner = type === "owner";
    
    return (
        <div className={`
            ${size === "lg" ? "w-14 h-14 text-xl" : "w-11 h-11 text-base"} 
            rounded-2xl flex items-center justify-center font-black relative
            ${isOwner 
                ? "bg-gradient-to-br from-rose-500 via-pink-600 to-amber-500 text-white shadow-[0_8px_20px_-4px_rgba(244,63,94,0.4)]" 
                : "bg-gradient-to-br from-[var(--foreground)]/[0.05] to-[var(--foreground)]/[0.1] text-[var(--foreground)] border border-[var(--border)] shadow-inner"}
        `}>
            <span className="relative z-10">{initials}</span>
            {isOwner && (
                <div className="absolute inset-0 rounded-2xl bg-white/20 blur-[1px]" />
            )}
        </div>
    );
}

function PremiumInsightCard({ label, value, color, icon, description }) {
    const colors = {
        blue: "from-blue-500/20 to-indigo-500/5 text-blue-500 border-blue-500/20",
        amber: "from-amber-500/20 to-orange-500/5 text-amber-500 border-amber-500/20",
        purple: "from-purple-500/20 to-pink-500/5 text-purple-500 border-purple-500/20",
        emerald: "from-emerald-500/20 to-teal-500/5 text-emerald-500 border-emerald-500/20",
    };

    return (
        <motion.div 
            whileHover={{ y: -2 }}
            className={`relative p-1.5 sm:p-3 rounded-xl border bg-gradient-to-b ${colors[color]} bg-[var(--card)]/40 backdrop-blur-xl overflow-hidden group transition-all`}
        >
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2.5 text-center sm:text-left">
                    <div className={`p-1 sm:p-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-sm scale-75 sm:scale-100`}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest opacity-60 sm:opacity-40 mb-0.5">{label}</p>
                        <p className="text-xs sm:text-lg font-black tabular-nums tracking-tighter text-[var(--foreground)] leading-none">{value}</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/5 text-[7px] font-black uppercase tracking-[0.1em] opacity-50 shrink-0">
                    <FiTrendingUp className="text-emerald-500" /> Live
                </div>
            </div>
            
            {description && (
                <div className="hidden sm:block relative z-10 mt-2 pt-1.5 text-[9px] font-medium opacity-30 border-t border-white/5 truncate">
                    {description}
                </div>
            )}
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}

function InsightCard({ label, value, color, pulse, compact }) {
    const colors = {
        blue: "text-blue-500 bg-blue-500/5 border-blue-500/10",
        amber: "text-amber-500 bg-amber-500/5 border-amber-500/10",
        purple: "text-purple-500 bg-purple-500/5 border-purple-500/10",
        emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
    };

    return (
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border ${colors[color]} flex flex-col items-center justify-center text-center relative overflow-hidden bg-[var(--card)]`}
        >
            {pulse && (
                <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-current animate-ping" />
            )}
            <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tight opacity-60 mb-0.5">{label}</span>
            <span className="text-xs sm:text-sm font-black tabular-nums whitespace-nowrap">{value}</span>
        </motion.div>
    );
}
