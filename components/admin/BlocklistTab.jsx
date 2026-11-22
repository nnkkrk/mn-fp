"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LoadingSpinner, EmptyState, SectionTitle } from "@/components/common";
import { Icons } from "@/components/icons";
import { formatDateTime } from "@/utils";

export default function BlocklistTab() {
  const { token, user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formType, setFormType] = useState("ip");
  const [formValue, setFormValue] = useState("");
  const [formReason, setFormReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [message, setMessage] = useState({ text: "", type: "" });

  const [isAddOpen, setIsAddOpen] = useState(false);

  const showMessage = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  useEffect(() => {
    if (token) fetchBlocklist();
  }, [token]);

  const fetchBlocklist = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blocklist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      } else {
        showMessage(data.message || "Failed to fetch blocklist");
      }
    } catch (err) {
      showMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formValue.trim()) return showMessage("Value is required");
    
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/blocklist", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          type: formType,
          value: formValue,
          reason: formReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Added to blocklist", "success");
        setFormValue("");
        setFormReason("");
        setIsAddOpen(false);
        fetchBlocklist();
      } else {
        showMessage(data.message || "Failed to add");
      }
    } catch (err) {
      showMessage("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this from the blocklist?")) return;
    
    try {
      const res = await fetch(`/api/admin/blocklist?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Removed successfully", "success");
        setItems(items.filter((item) => item._id !== id));
      } else {
        showMessage(data.message || "Failed to remove");
      }
    } catch (err) {
      showMessage("An error occurred");
    }
  };

  const filteredItems = items.filter((item) => filterType === "all" || item.type === filterType);

  if (user?.userType !== "admin" && user?.userType !== "owner") {
    return <div className="p-6 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border)]/70">
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
              {items.length} Blocked
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={fetchBlocklist}
            disabled={loading}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0"
            title="Refresh list"
          >
            <Icons.refresh size={12} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>
          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="h-7 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-2xs shrink-0 cursor-pointer"
          >
            <Icons.plus size={11} />
            <span>{isAddOpen ? "Close" : "Add Entry"}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Add Form */}
      {isAddOpen && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/50">
            <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-400 shrink-0">
              <Icons.shield size={14} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Add to Blocklist</h3>
              <p className="text-[10px] text-[var(--muted)]">Block suspicious IP address, email, or game ID</p>
            </div>
          </div>

          {message.text && (
            <div className={`p-2 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] font-bold focus:outline-none focus:border-rose-500 transition-all cursor-pointer shadow-2xs"
              >
                <option value="ip">IP Address</option>
                <option value="email">Email Address</option>
                <option value="gameId">Game ID</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">Value to Block</label>
              <input
                type="text"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder={formType === "ip" ? "e.g. 192.168.1.1" : formType === "email" ? "user@gmail.com" : "12345678"}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] font-bold focus:outline-none focus:border-rose-500 transition-all placeholder:text-[var(--muted)]/50 shadow-2xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">Reason (Optional)</label>
              <input
                type="text"
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder="e.g. Fraud, Abuse"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] font-bold focus:outline-none focus:border-rose-500 transition-all placeholder:text-[var(--muted)]/50 shadow-2xs"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="h-7 px-4 rounded-lg bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {submitting ? <LoadingSpinner size="xs" color="white" /> : <Icons.plus size={11} />}
                <span>{submitting ? "Adding..." : "Confirm Block"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blocked Entries Container */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs">
        <div className="p-2.5 sm:px-3 sm:py-2.5 border-b border-[var(--border)]/70 flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Blocked Entries</h3>
          
          <div className="flex p-0.5 bg-[var(--foreground)]/[0.04] border border-[var(--border)] rounded-lg gap-0.5">
            {["all", "ip", "email", "gameId"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  filterType === type 
                    ? "bg-rose-600 text-white shadow-2xs" 
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {type === "all" ? "All" : type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" color="accent" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-10 text-center text-xs text-[var(--muted)]">
            No blocked entries found.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]/50">
            {filteredItems.map((item) => (
              <div 
                key={item._id} 
                className="p-2.5 sm:px-3.5 flex items-center justify-between gap-3 hover:bg-[var(--foreground)]/[0.015] transition-colors"
              >
                {/* Left: Badge + Value & Reason */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider shrink-0 ${
                    item.type === "ip" ? "bg-blue-500/10 text-blue-400" :
                    item.type === "email" ? "bg-purple-500/10 text-purple-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>
                    {item.type}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="font-mono font-bold text-xs text-[var(--foreground)] leading-tight truncate">
                      {item.value}
                    </div>
                    {item.reason && (
                      <div className="text-[10px] text-[var(--muted)] font-medium mt-0.5 truncate">
                        {item.reason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Date & Delete Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9.5px] text-[var(--muted)] font-mono hidden sm:inline">
                    {formatDateTime(item.createdAt)}
                  </span>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="w-7 h-7 flex items-center justify-center text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                    title="Remove from blocklist"
                  >
                    <Icons.trash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
