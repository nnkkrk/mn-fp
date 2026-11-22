"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, Crown, ShieldCheck, Calendar, Clock, UserX, Plus, RefreshCw } from "lucide-react";
import { SectionTitle, LoadingSpinner, SearchInput } from "@/components/common";

export default function MembershipsTab() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGrantForm, setShowGrantForm] = useState(false);

  // Form State
  const [newUserId, setNewUserId] = useState("");
  const [newUserType, setNewUserType] = useState("member");
  const [expiryType, setExpiryType] = useState("days"); // 'days' or 'date'
  const [expiryDays, setExpiryDays] = useState("30");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    setDebouncedSearch(search);
  }, [search]);

  useEffect(() => {
    fetchMemberships();
  }, [debouncedSearch]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/memberships?search=${debouncedSearch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMemberships(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateExpiryDate = () => {
    if (expiryType === "days") {
      const days = parseInt(expiryDays) || 0;
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toISOString();
    }
    return new Date(expiryDate).toISOString();
  };

  const handleGrantMembership = async (e) => {
    e.preventDefault();
    if (!newUserId) return alert("User ID/Email is required");
    if (expiryType === "date" && !expiryDate) return alert("Please select an expiry date");
    if (expiryType === "days" && (!expiryDays || parseInt(expiryDays) <= 0)) return alert("Please enter valid days");

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const calculatedDate = calculateExpiryDate();

      const res = await fetch("/api/admin/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: newUserId,
          userType: newUserType,
          expiryDate: calculatedDate
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Membership granted successfully!");
        setNewUserId("");
        fetchMemberships();
      } else {
        alert(data.message || "Failed to grant membership");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (userId) => {
    if (!confirm("Are you sure you want to revoke this membership? They will become a normal user immediately.")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/memberships?userId=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        alert("Membership revoked successfully");
        fetchMemberships();
      } else {
        alert(data.message || "Failed to revoke membership");
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "member": return <Crown size={16} className="text-purple-500" />;
      case "admin": return <ShieldCheck size={16} className="text-emerald-500" />;
      default: return <Users size={16} />;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "member": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "admin": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getTimeRemaining = (expiryStr) => {
    if (!expiryStr) return "Lifetime";
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diff = expiry - now;
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days left`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} hours left`;
    
    return "Less than an hour";
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[var(--border)]/70">
        <div className="flex items-center gap-2">
          {memberships.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
              {memberships.length} Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fetchMemberships()}
            disabled={loading}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0"
            title="Refresh memberships"
          >
            <RefreshCw size={12} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>
          <button
            onClick={() => setShowGrantForm(!showGrantForm)}
            className="h-7 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-2xs shrink-0 cursor-pointer"
          >
            <Plus size={12} />
            <span>{showGrantForm ? "Close" : "Add"}</span>
          </button>
        </div>
      </div>

      {/* Grant Membership Form */}
      {showGrantForm && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/50">
            <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400 shrink-0">
              <Crown size={14} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Grant Access</h3>
              <p className="text-[10px] text-[var(--muted)]">Elevate user privileges temporarily</p>
            </div>
          </div>
          
          <form onSubmit={handleGrantMembership} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
            <div className="space-y-1 lg:col-span-5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">User ID / Email</label>
              <input
                type="text"
                value={newUserId}
                onChange={e => setNewUserId(e.target.value)}
                placeholder="Enter user identifier..."
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] font-bold focus:outline-none focus:border-purple-500 transition-all placeholder:text-[var(--muted)]/50 shadow-2xs"
                required
              />
            </div>

            <div className="space-y-1 lg:col-span-3">
              <label className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">Role Type</label>
              <select
                value={newUserType}
                onChange={e => setNewUserType(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] font-bold focus:outline-none focus:border-purple-500 transition-all cursor-pointer shadow-2xs"
              >
                <option value="member">🌟 Premium Member</option>
                <option value="admin">🛡️ Administrator</option>
              </select>
            </div>

            <div className="space-y-1 lg:col-span-4">
              <label className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">Duration</label>
              <div className="flex gap-1.5">
                <select
                  value={expiryType}
                  onChange={e => setExpiryType(e.target.value)}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--foreground)] font-bold focus:outline-none focus:border-purple-500 transition-all cursor-pointer shadow-2xs w-20"
                >
                  <option value="days">Days</option>
                  <option value="date">Date</option>
                </select>
                
                {expiryType === "days" ? (
                  <input
                    type="number"
                    min="1"
                    value={expiryDays}
                    onChange={e => setExpiryDays(e.target.value)}
                    placeholder="30"
                    className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] font-bold focus:outline-none focus:border-purple-500 transition-all shadow-2xs"
                  />
                ) : (
                  <input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--foreground)] font-bold focus:outline-none focus:border-purple-500 transition-all shadow-2xs [color-scheme:dark]"
                  />
                )}
              </div>
            </div>

            <div className="lg:col-span-12 flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-7 px-4 rounded-lg bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <>
                    <Crown size={12} />
                    Authorize Access
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Memberships List */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden flex flex-col shadow-2xs">
        {/* Search Bar in Card Header */}
        <div className="p-2.5 sm:px-3 sm:py-2.5 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between border-b border-[var(--border)]/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users size={12} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                Active Access
              </h3>
            </div>
          </div>
          
          <div className="relative w-full sm:w-60">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, email or ID..."
              size="sm"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-col divide-y divide-[var(--border)]/60">
            {loading ? (
              <div className="py-10 text-center text-[var(--muted)] flex flex-col items-center gap-2">
                <LoadingSpinner size="md" color="accent" />
                <p className="font-bold text-xs">Loading Directory...</p>
              </div>
            ) : memberships.length === 0 ? (
              <div className="py-10 text-center text-xs text-[var(--muted)]">
                No privileged users found.
              </div>
            ) : (
              memberships.map((u) => (
                <div
                  key={u._id}
                  className="group flex items-center justify-between gap-3 p-2.5 sm:px-3.5 sm:py-2 hover:bg-[var(--foreground)]/[0.015] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.05] border border-[var(--border)]/50 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name?.charAt(0) || <Users size={12} />}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-[var(--foreground)] truncate">{u.name || "Unknown"}</p>
                        <span className={`shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase tracking-wider ${getRoleClass(u.userType)}`}>
                          {u.userType}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--muted)] truncate">{u.email}</p>
                      <div className="flex items-center gap-1 text-[9px] text-[var(--muted)] font-medium mt-0.5">
                        <Clock size={9} className="text-purple-400 shrink-0" />
                        <span>{getTimeRemaining(u.membershipExpiry)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevoke(u.userId)}
                    className="shrink-0 w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-rose-500 hover:border-rose-500/30 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                    title="Revoke Access"
                  >
                    <UserX size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
