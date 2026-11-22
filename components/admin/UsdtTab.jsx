"use client";

import { useEffect, useState } from "react";
import { StatusBadge, CopyButton, Pagination, LoadingSpinner, EmptyState, SectionTitle } from "@/components/common";
import { Icons } from "@/components/icons";
import { formatDateTime, formatCoins } from "@/utils";

export default function UsdtTab() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("submitted");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null); // ID of deposit being processed

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/wallet/usdt?status=${status}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDeposits(data.deposits || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch USDT deposits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [status, page]);

  const handleAction = async (depositId, action) => {
    if (!confirm(`Do you want to ${action} this deposit?`)) return;

    try {
      setActionLoading(depositId);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/wallet/usdt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ depositId, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchDeposits(); // Refresh
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(`USDT ${action} error:`, err);
      alert("Server error.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-3 pb-2.5 border-b border-[var(--border)]/70 mb-4">
        <div className="w-full md:w-auto">
          {/* MOBILE DROPDOWN */}
          <div className="md:hidden relative group">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full h-11 pl-4 pr-10 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs font-black uppercase tracking-[0.15em] text-[var(--foreground)] outline-none focus:border-green-500 appearance-none cursor-pointer shadow-sm transition-all hover:bg-[var(--foreground)]/[0.02]"
            >
              <option value="waiting">Waiting</option>
              <option value="submitted">Submitted</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 block animate-pulse"></span>
            </div>
          </div>

          {/* DESKTOP TABS */}
          <div className="hidden md:flex bg-[var(--card)] p-1.5 rounded-full border border-[var(--border)] shadow-sm">
            <div className="flex gap-1">
              {[
                { id: "waiting", label: "Waiting" },
                { id: "submitted", label: "Submitted" },
                { id: "confirmed", label: "Confirmed" },
                { id: "failed", label: "Failed" },
                { id: "expired", label: "Expired" }
              ].map(s => (
                <button aria-label="button"
                  key={s.id}
                  onClick={() => { setStatus(s.id); setPage(1); }}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap active:scale-95 ${
                    status === s.id 
                      ? "bg-green-500 text-black shadow-md shadow-green-500/20" 
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" color="accent" />
        </div>
      ) : deposits.length === 0 ? (
        <EmptyState
          icon={Icons.dollarSign}
          title="No Deposits Found"
          description={`No ${status} deposits match your filter.`}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-black">
                {["User / ID", "Amount", "TX Hash", "Network", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/10">
              {deposits.map(d => (
                <tr key={d._id} className="group hover:bg-[var(--foreground)]/[0.02] transition-colors">
                  <td className="px-4 py-4">
                    <p className="text-[11px] font-black text-[var(--foreground)] break-all">{d.userId}</p>
                    <p className="text-[9px] text-[var(--muted)] font-mono">{d.depositId}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-green-400">{d.usdtAmount} USDT</p>
                    <p className="text-[9px] text-[var(--muted)] uppercase font-bold">≈ {formatCoins(d.coinsToCredit)}</p>
                  </td>
                  <td className="px-4 py-4 max-w-[180px]">
                    {d.txHash ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[var(--muted)] truncate">{d.txHash}</span>
                        <CopyButton text={d.txHash} size="xs" variant="ghost" className="p-0.5" />
                        <a href={`https://bscscan.com/tx/${d.txHash}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400">
                          <Icons.externalLink size={10} />
                        </a>
                      </div>
                    ) : (
                      <span className="text-[9px] text-amber-500 font-bold uppercase italic">Missing Hash</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[9px] font-black">{d.network}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-[10px] text-[var(--muted)] font-medium">
                      {formatDateTime(d.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {d.status === "submitted" ? (
                      <div className="flex justify-end gap-2">
                        <button aria-label="button" 
                          onClick={() => handleAction(d.depositId, "confirm")}
                          disabled={actionLoading === d.depositId}
                          className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-black transition-all"
                          title="Confirm & Credit"
                        >
                          {actionLoading === d.depositId ? <LoadingSpinner size="xs" color="current" /> : <Icons.checkCircle size={14} />}
                        </button>
                        <button aria-label="button" 
                          onClick={() => handleAction(d.depositId, "reject")}
                          disabled={actionLoading === d.depositId}
                          className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-black transition-all"
                          title="Reject"
                        >
                          {actionLoading === d.depositId ? <LoadingSpinner size="xs" color="current" /> : <Icons.close size={14} />}
                        </button>
                      </div>
                    ) : (
                      <StatusBadge status={d.status} size="sm" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="pt-4 border-t border-[var(--border)]/10 flex justify-end">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          size="sm"
          hideOnSinglePage
        />
      </div>
    </div>
  );
}
