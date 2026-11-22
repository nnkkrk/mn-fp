"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiGift, FiPlus, FiClock, FiUser, FiTrash2, FiZap, FiHash, FiType, FiRefreshCw } from "react-icons/fi";
import { Ticket, Gift, CheckCircle2, Percent } from "lucide-react";
import { StatusBadge, CopyButton, SectionTitle, Pagination, EmptyState } from "@/components/common";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/utils";

export default function RedeemCodesTab() {
    const [amount, setAmount] = useState("");
    const [quantity, setQuantity] = useState("");
    const [isSeries, setIsSeries] = useState(false);
    const [customCode, setCustomCode] = useState("");
    const [maxUses, setMaxUses] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [recentCodes, setRecentCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

    const [summary, setSummary] = useState({ totalUsed: 0, total: 0 });

    const fetchCodes = async (targetPage = page) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/redeem-codes?page=${targetPage}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRecentCodes(data.codes);
                setSummary(data.summary);
                setPagination(data.pagination);
            }
        } catch (err) {
            console.error("Failed to fetch codes", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes(page);
    }, [page]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/admin/redeem-codes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    quantity: isSeries ? 1 : Number(quantity),
                    isSeries,
                    customCode: isSeries ? customCode : "",
                    maxUses: isSeries ? Number(maxUses) : 1
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message + (isSeries ? "" : "\n\nGenerated Codes:\n" + data.codes.join("\n")));
                setAmount("");
                setQuantity("");
                setCustomCode("");
                setMaxUses("");
                fetchCodes();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Could not generate codes.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExpire = async (codeId) => {
        if (!confirm("Do you want to expire/delete this code?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/redeem-codes?id=${codeId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchCodes();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Could not expire code.");
        }
    };

    const availableCount = Math.max((summary.total || 0) - (summary.totalUsed || 0), 0);
    const claimRate = summary.total > 0 ? Math.round(((summary.totalUsed || 0) / summary.total) * 100) : 0;

    return (
        <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300">
            {/* ── HEADER ── */}
            <div className="flex items-center justify-end flex-wrap gap-2 pb-2.5 border-b border-[var(--border)]/70">
                <button
                    onClick={() => fetchCodes(page)}
                    disabled={loading}
                    className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0"
                    title="Refresh codes"
                >
                    <FiRefreshCw size={12} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
                </button>
            </div>

            {/* ── UNIFIED 1-ROW STATS BAR ── */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 sm:p-2.5 shadow-2xs">
                <div className="grid grid-cols-4 divide-x divide-[var(--border)]/70">
                    {/* Total Codes */}
                    <div className="px-1.5 sm:px-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="min-w-0">
                            <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] truncate block">Total</span>
                            <div className="text-xs sm:text-sm font-black text-indigo-400 tabular-nums leading-tight">
                                {formatNumber(summary.total || 0)}
                            </div>
                        </div>
                        <Ticket size={14} className="text-indigo-400/80 hidden sm:block shrink-0" />
                    </div>

                    {/* Available Codes */}
                    <div className="px-1.5 sm:px-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="min-w-0">
                            <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] truncate block">Available</span>
                            <div className="text-xs sm:text-sm font-black text-amber-400 tabular-nums leading-tight">
                                {formatNumber(availableCount)}
                            </div>
                        </div>
                        <Gift size={14} className="text-amber-400/80 hidden sm:block shrink-0" />
                    </div>

                    {/* Claimed Codes */}
                    <div className="px-1.5 sm:px-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="min-w-0">
                            <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] truncate block">Claimed</span>
                            <div className="text-xs sm:text-sm font-black text-emerald-400 tabular-nums leading-tight">
                                {formatNumber(summary.totalUsed || 0)}
                            </div>
                        </div>
                        <CheckCircle2 size={14} className="text-emerald-400/80 hidden sm:block shrink-0" />
                    </div>

                    {/* Claim Rate */}
                    <div className="px-1.5 sm:px-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="min-w-0">
                            <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] truncate block">Rate</span>
                            <div className="text-xs sm:text-sm font-black text-[var(--foreground)] tabular-nums leading-tight">
                                {claimRate}%
                            </div>
                        </div>
                        <Percent size={14} className="text-[var(--muted)]/60 hidden sm:block shrink-0" />
                    </div>
                </div>
            </div>

            {/* COMPACT GENERATOR TOOLBAR */}
            <div className="py-1 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <FiZap size={14} className="text-[var(--accent)] shrink-0" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] leading-none">
                            Voucher Generator
                        </h3>
                    </div>

                    <div className="flex bg-[var(--foreground)]/[0.04] p-0.5 rounded-lg border border-[var(--border)]">
                        <button aria-label="button"
                            type="button"
                            onClick={() => setIsSeries(false)}
                            className={`px-2.5 py-1 rounded-md text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${!isSeries ? 'bg-[var(--accent)] text-white shadow-2xs' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                        >
                            Unique
                        </button>
                        <button aria-label="button"
                            type="button"
                            onClick={() => setIsSeries(true)}
                            className={`px-2.5 py-1 rounded-md text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${isSeries ? 'bg-[var(--accent)] text-white shadow-2xs' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                        >
                            Series
                        </button>
                    </div>
                </div>

                <form className="grid grid-cols-1 sm:grid-cols-4 gap-2" onSubmit={handleGenerate}>
                    <div>
                        <label className="text-[7.5px] font-black uppercase text-[var(--muted)] block mb-1">Value (₹)</label>
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] font-black text-[11px]">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="500"
                                className="w-full h-8.5 bg-[var(--card)] border border-[var(--border)] rounded-xl pl-6 pr-2.5 text-[11px] focus:border-[var(--accent)] outline-none font-bold text-[var(--foreground)] placeholder:text-[var(--muted)]/40 shadow-2xs"
                                required
                            />
                        </div>
                    </div>

                    {isSeries ? (
                        <>
                            <div>
                                <label className="text-[7.5px] font-black uppercase text-[var(--muted)] block mb-1">Code String</label>
                                <div className="relative">
                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                                        <FiType size={11} />
                                    </div>
                                    <input
                                        type="text"
                                        value={customCode}
                                        onChange={(e) => setCustomCode(e.target.value)}
                                        placeholder="BONUS"
                                        className="w-full h-8.5 bg-[var(--card)] border border-[var(--border)] rounded-xl pl-7 pr-2.5 text-[11px] focus:border-[var(--accent)] outline-none font-bold uppercase text-[var(--foreground)] placeholder:text-[var(--muted)]/40 shadow-2xs"
                                        required={isSeries}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[7.5px] font-black uppercase text-[var(--muted)] block mb-1">Max Uses</label>
                                <div className="relative">
                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                                        <FiHash size={11} />
                                    </div>
                                    <input
                                        type="number"
                                        value={maxUses}
                                        onChange={(e) => setMaxUses(e.target.value)}
                                        placeholder="100"
                                        className="w-full h-8.5 bg-[var(--card)] border border-[var(--border)] rounded-xl pl-7 pr-2.5 text-[11px] focus:border-[var(--accent)] outline-none font-bold text-[var(--foreground)] placeholder:text-[var(--muted)]/40 shadow-2xs"
                                        required={isSeries}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="col-span-1 sm:col-span-2">
                            <label className="text-[7.5px] font-black uppercase text-[var(--muted)] block mb-1">Code Count</label>
                            <div className="relative">
                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                                    <FiHash size={11} />
                                </div>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="10"
                                    className="w-full h-8.5 bg-[var(--card)] border border-[var(--border)] rounded-xl pl-7 pr-2.5 text-[11px] focus:border-[var(--accent)] outline-none font-bold text-[var(--foreground)] placeholder:text-[var(--muted)]/40 shadow-2xs"
                                    required={!isSeries}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-end">
                        <button aria-label="button"
                            type="submit"
                            disabled={isGenerating}
                            className="w-full h-8.5 bg-[var(--accent)] text-white font-black uppercase text-[9.5px] tracking-wider rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
                        >
                            {isGenerating ? "Processing..." : <><FiZap size={11} /> {isSeries ? "Create Series" : "Generate Unique"}</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* RECENT CODES */}
            <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-[9.5px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                        <FiClock size={11} /> Recently Generated
                    </h3>
                    <span className="text-[8.5px] font-bold text-[var(--muted)]/60 uppercase tabular-nums">{recentCodes.length} Records</span>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden lg:block rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                    <table className="w-full text-left text-[10.5px]">
                        <thead className="bg-[var(--foreground)]/[0.02] border-b border-[var(--border)] text-[var(--muted)] font-black uppercase tracking-wider text-[8.5px]">
                            <tr>
                                {["Redeem Code", "Type", "Value", "Activity", "Owner"].map((h) => (
                                    <th key={h} className="px-4 py-2.5">{h}</th>
                                ))}
                                <th className="px-4 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)] font-bold uppercase tracking-widest opacity-40 text-xs">Loading Codes...</td></tr>
                            ) : recentCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center">
                                        <EmptyState
                                            title="No Redeem Codes Found"
                                            description="Generate single-use or series voucher codes to distribute."
                                            size="sm"
                                            variant="plain"
                                        />
                                    </td>
                                </tr>
                            ) : recentCodes.map((code) => (
                                <tr key={code._id} className="hover:bg-[var(--foreground)]/[0.02] transition-colors group">
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-black text-[var(--accent)] tracking-tight uppercase text-xs">{code.code}</span>
                                            <CopyButton text={code.code} size="xs" variant="ghost" className="opacity-40 group-hover:opacity-100" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase border tracking-wider ${code.isSeries
                                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            }`}>
                                            {code.isSeries ? "Series" : "Unique"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className="font-black text-[var(--foreground)] tabular-nums text-xs">{formatCurrency(code.value)}</span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {code.isSeries ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 min-w-[50px] max-w-[80px] h-1.5 bg-[var(--foreground)]/[0.05] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, ((code.claimedBy?.length || 0) / code.maxUses) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[8.5px] font-black tabular-nums text-[var(--muted)]">
                                                    {code.claimedBy?.length || 0} / {code.maxUses}
                                                </span>
                                            </div>
                                        ) : (
                                            <StatusBadge status={code.status} size="xs" />
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {code.isSeries ? (
                                            <span className="text-[8.5px] font-bold text-[var(--muted)]/50 uppercase tracking-tight italic">Multi-User</span>
                                        ) : code.status === "used" && code.usedBy ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]">
                                                    <FiUser size={10} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[9.5px] font-bold text-[var(--foreground)] truncate uppercase leading-none mb-0.5">{code.usedBy.name}</span>
                                                    <span className="text-[7.5px] text-[var(--muted)]/60 truncate tracking-tight">{new Date(code.usedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[8.5px] font-bold text-[var(--muted)]/30 uppercase">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {(code.status === "active" || code.isSeries) && (
                                                <button aria-label="button"
                                                    onClick={() => handleExpire(code._id)}
                                                    className="w-6.5 h-6.5 rounded-md bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 transition-all flex items-center justify-center cursor-pointer"
                                                    title="Expire Voucher"
                                                >
                                                    <FiTrash2 size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE LIST */}
                <div className="lg:hidden space-y-2">
                    {!loading && recentCodes.length === 0 && (
                        <EmptyState
                            title="No Redeem Codes Found"
                            description="Generate single-use or series voucher codes to distribute."
                            size="sm"
                            variant="plain"
                        />
                    )}
                    {recentCodes.map((code) => (
                        <div key={code._id} className="p-2.5 sm:p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-2">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[7.5px] font-black uppercase tracking-wider text-[var(--muted)]">Redeem Code</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-black text-[var(--accent)] uppercase tracking-tight">{code.code}</span>
                                        <CopyButton text={code.code} size="xs" variant="ghost" />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[7.5px] font-black uppercase tracking-wider text-[var(--muted)]">Value</span>
                                    <p className="text-xs font-black text-[var(--foreground)] tabular-nums">{formatCurrency(code.value)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-1.5 border-y border-[var(--border)]/50 border-dashed">
                                <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase border tracking-wider ${code.isSeries ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                    {code.isSeries ? 'Series' : 'Unique'}
                                </span>
                                
                                <div className="flex items-center gap-2">
                                    {code.isSeries ? (
                                        <span className="text-[8.5px] font-black text-[var(--muted)] uppercase tracking-tight">
                                            {code.claimedBy?.length || 0} / {code.maxUses} Uses
                                        </span>
                                    ) : (
                                        <StatusBadge status={code.status} size="xs" />
                                    )}
                                    {(code.status === 'active' || code.isSeries) && (
                                        <button aria-label="button" onClick={() => handleExpire(code._id)} className="text-rose-500/60 hover:text-rose-500 transition-colors p-1 cursor-pointer">
                                            <FiTrash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!code.isSeries && code.status === "used" && code.usedBy && (
                                <div className="flex items-center gap-1.5 pt-0.5">
                                    <div className="w-5 h-5 rounded bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]">
                                        <FiUser size={10} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[9.5px] font-bold text-[var(--foreground)] uppercase truncate leading-none">{code.usedBy.name}</span>
                                        <span className="text-[7.5px] text-[var(--muted)]/60 tracking-tight">{new Date(code.usedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGINATION */}
            <Pagination page={page} totalPages={pagination.pages} onPageChange={setPage} disabled={loading} size="sm" hideOnSinglePage />
        </div>
    );
}

function InsightCard({ label, value, color, pulse }) {
    const colors = {
        blue: "text-blue-500 bg-blue-500/5 border-blue-500/10",
        amber: "text-amber-500 bg-amber-500/5 border-amber-500/10",
        purple: "text-purple-500 bg-purple-500/5 border-purple-500/10",
        emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border ${colors[color]} flex flex-col items-center justify-center text-center relative overflow-hidden`}
        >
            {pulse && (
                <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-current animate-ping" />
            )}
            <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tight opacity-60 mb-0.5">{label}</span>
            <span className="text-xs sm:text-sm font-black tabular-nums whitespace-nowrap">{value}</span>
        </motion.div>
    );
}
