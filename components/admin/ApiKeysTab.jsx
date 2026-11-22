"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  RefreshCcw,
  Loader2,
  User,
  Mail,
  Shield,
  Clock,
} from "lucide-react";
import { Icons } from "@/components/icons";
import { StatusBadge, EmptyState, LoadingSpinner, InfoTooltip, SectionTitle } from "@/components/common";
import { formatCurrency, formatDate } from "@/utils";

export default function ApiKeysTab() {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchKeys = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("/api/admin/api-keys", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setKeys(data.data || []);
            }
        } catch (err) {
            console.error("Fetch API keys failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    return (
        <div className="w-full space-y-4">
            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-end gap-3 pb-3 border-b border-[var(--border)]/70">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-[var(--muted)] text-xs font-bold tabular-nums">
                        <Key size={13} className="text-[var(--accent)]" />
                        <span>{keys.length}</span>
                    </div>
                    <button aria-label="Refresh API Keys"
                        onClick={fetchKeys}
                        className="text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all p-1 flex items-center justify-center cursor-pointer"
                    >
                        <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* ================= CONTENT ================= */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 flex flex-col items-center justify-center space-y-3"
                    >
                        <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                        <p className="text-xs text-[var(--muted)] font-medium">Loading developer data...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        {/* DESKTOP TABLE */}
                        <div className="hidden lg:block rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)]">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[var(--foreground)]/[0.02] border-b border-[var(--border)] text-[var(--muted)]">
                                    <tr className="text-[11px] font-bold uppercase tracking-wider">
                                        <th className="px-4 py-2.5">Developer / User</th>
                                        <th className="px-4 py-2.5">API Key Info</th>
                                        <th className="px-4 py-2.5">Daily Usage (Today)</th>
                                        <th className="px-4 py-2.5">Activity (24h)</th>
                                        <th className="px-4 py-2.5">Last Used</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]/60">
                                    {keys.map((k, idx) => (
                                        <motion.tr
                                            key={k._id}
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="group hover:bg-[var(--foreground)]/[0.015] transition-colors"
                                        >
                                            {/* Developer Info */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                                                        <User size={13} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[var(--foreground)] font-bold text-xs truncate">{k.userDetails?.name || "Unknown User"}</span>
                                                        <span className="text-[10px] text-[var(--muted)] flex items-center gap-1 truncate">
                                                            <Mail size={9} />
                                                            {k.userDetails?.email || "No email"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* API Key Info */}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold text-[var(--foreground)]">{k.name}</span>
                                                        <StatusBadge status={k.status} size="xs" variant="rounded" />
                                                    </div>
                                                    <div className="flex items-center gap-1 font-mono text-[10px] text-[var(--muted)] bg-[var(--foreground)]/[0.03] w-fit px-1.5 py-0.5 rounded border border-[var(--border)]">
                                                        <Shield size={9} />
                                                        <span>•••• •••• {k.lastFour}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Usage */}
                                            <td className="px-4 py-3 min-w-[180px]">
                                                <div className="flex flex-col gap-1">
                                                    <div className="w-full h-1.5 bg-[var(--foreground)]/[0.06] rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(((k.usedToday || 0) / (k.dailyLimit || 10000)) * 100, 100)}%` }}
                                                            className={`h-full rounded-full ${(k.usedToday || 0) > (k.dailyLimit || 10000) * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className="font-bold text-[var(--foreground)] tabular-nums">₹{(k.usedToday || 0).toLocaleString()} used</span>
                                                        <span className="text-[var(--muted)] tabular-nums">Limit: ₹{(k.dailyLimit || 10000).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 24h Activity Status */}
                                            <td className="px-4 py-3">
                                                {k.hasRecentOrder ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--foreground)]/5 text-[var(--muted)] border border-[var(--border)]">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            {/* Last Used */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={12} className="text-[var(--muted)]/50 shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-[var(--foreground)]">
                                                            {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : "Never"}
                                                        </span>
                                                        <span className="text-[9px] text-[var(--muted)]">
                                                            {k.lastUsed ? new Date(k.lastUsed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
 
                        {/* MOBILE LIST */}
                        <div className="lg:hidden space-y-2">
                            {keys.map((k, idx) => (
                                <motion.div
                                    key={k._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-2 shadow-2xs"
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <User size={13} className="text-[var(--muted)] shrink-0" />
                                            <div className="min-w-0 flex items-center gap-2">
                                                <span className="text-xs font-bold text-[var(--foreground)] truncate">{k.userDetails?.name || "Unknown User"}</span>
                                                <span className="text-[10.5px] text-[var(--muted)] truncate max-w-[140px] sm:max-w-none">{k.userDetails?.email || ""}</span>
                                            </div>
                                        </div>
                                        {k.hasRecentOrder ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8.5px] font-medium bg-[var(--foreground)]/5 text-[var(--muted)] border border-[var(--border)] shrink-0">
                                                Offline
                                            </span>
                                        )}
                                    </div>

                                    {/* Middle info strip: Key & Last Used on single line */}
                                    <div className="flex items-center justify-between gap-2 text-[10px] pt-0.5">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-[8.5px] font-bold uppercase text-[var(--muted)]">KEY</span>
                                            <span className="font-bold text-[var(--foreground)] truncate">{k.name}</span>
                                            <span className="font-mono text-[var(--muted)] shrink-0">•••• {k.lastFour}</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 text-right">
                                            <span className="text-[8.5px] font-bold uppercase text-[var(--muted)]">LAST USED</span>
                                            <span className="font-bold text-[var(--foreground)]">
                                                {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString([], { month: "short", day: "numeric" }) : "Never"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Usage progress */}
                                    <div className="space-y-0.5 pt-0.5">
                                        <div className="flex justify-between items-center text-[9px]">
                                            <span className="font-semibold text-[var(--muted)]">Usage</span>
                                            <span className="font-bold text-[var(--foreground)] tabular-nums">
                                                ₹{(k.usedToday || 0).toLocaleString()} <span className="text-[var(--muted)] font-normal">/ ₹{(k.dailyLimit || 10000).toLocaleString()}</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-1 bg-[var(--foreground)]/[0.06] rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(((k.usedToday || 0) / (k.dailyLimit || 10000)) * 100, 100)}%` }}
                                                className={`h-full rounded-full ${(k.usedToday || 0) > (k.dailyLimit || 10000) * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {!keys.length && (
                            <EmptyState
                                icon={Icons.key}
                                title="No Active API Keys Found"
                                description="Generated developer and merchant keys will appear here."
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
