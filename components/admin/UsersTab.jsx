"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Filter,
  X,
  ChevronRight,
  ChevronDown,
  Loader2,
  Users,
  Crown,
  Activity,
  Globe,
  Plus,
  Tag,
  IdCard,
  ExternalLink,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { SearchInput, StatusBadge, CopyButton, EmptyState, Pagination, SectionTitle } from "@/components/common";
import { formatDate, formatDateTime, formatCurrency, formatNumber } from "@/utils";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeStats, setActiveStats] = useState({
    day: 0,
    week: 0,
    month: 0,
  });
  const [newStats, setNewStats] = useState({
    day: 0,
    week: 0,
    month: 0,
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    userType: "",
    from: "",
    to: "",
  });

  const [sortBy, setSortBy] = useState("lastLogin");
  const [order, setOrder] = useState("desc");

  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const ALLOWED_TAGS = ["premium", "rare", "new", "loyal", "vip", "special"];

  const getTagColor = (tag) => {
    const tagLower = tag.toLowerCase();
    if (tagLower === 'premium' || tagLower === 'vip') return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
    if (tagLower === 'rare' || tagLower === 'special') return 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30';
    if (tagLower === 'new' || tagLower === 'latest') return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    if (tagLower === 'loyal' || tagLower === 'topup') return 'bg-rose-500/15 text-rose-600 border-rose-500/30';
    if (tagLower === 'external') return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
    return 'bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]';
  };

  const formatShortDate = (date) => {
    if (!date) return "--";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "--";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  };

  const formatShortTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    fetchUsersStats();
  }, []);

  useEffect(() => {
    fetchUsersList(users.length > 0);
  }, [page, limit, search, filters, sortBy, order]);

  const fetchUsersStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setActiveStats(data.activeStats || { day: 0, week: 0, month: 0 });
        setNewStats(data.newStats || { day: 0, week: 0, month: 0 });
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } catch (err) {
      console.error("Fetch users stats failed", err);
    }
  };

  const fetchUsersList = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page,
        limit,
        search,
        sortBy,
        order,
        ...(filters.userType && { userType: filters.userType }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
      });

      const res = await fetch(`/api/admin/users/data?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUsers(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch users list failed", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("desc");
    }
    setPage(1);
  };


  const handleForceLogout = async (userId) => {
    if (!confirm("Are you sure you want to log out this user forcefully? They will be logged out on their next action.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${userId}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("User scheduled for forceful logout!");
      } else {
        alert(data.message || "Failed to force logout");
      }
    } catch (err) {
      alert("Error occurred");
    }
  };

  const handleUpdateTags = async (userId, tags) => {
    try {
      setUpdatingUserId(userId);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, tags }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, tags: data.tags } : u));
        if (selectedUser?._id === userId) {
          setSelectedUser(prev => ({ ...prev, tags: data.tags }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const addTagToUser = (user, tag) => {
    if (!tag || user.tags?.includes(tag)) return;
    
    // 1-Tag Limit: Simply replace the existing tags with the new one
    handleUpdateTags(user._id, [tag]);
  };

  const removeTagFromUser = (user, tag) => {
    const updatedTags = (user.tags || []).filter(t => t !== tag);
    handleUpdateTags(user._id, updatedTags);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner": return <ShieldAlert size={14} className="text-rose-500" />;
      case "admin": return <ShieldCheck size={14} className="text-[var(--accent)]" />;
      case "member": return <Crown size={14} className="text-amber-500" />;
      default: return <User size={14} className="text-[var(--muted)]/60" />;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "owner": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "admin": return "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20";
      case "member": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-1 sm:justify-end">
          <div className="px-1.5 py-0.5 flex items-center gap-1 text-[11px] font-bold text-[var(--foreground)] tabular-nums">
            <Users size={12} className="text-[var(--accent)]" />
            <span>{pagination.total}</span>
            <span className="text-[10px] text-[var(--muted)] font-medium">Users</span>
          </div>
          <button
            type="button"
            aria-label="Refresh users list"
            onClick={() => { fetchUsersStats(); fetchUsersList(users.length > 0); }}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] active:scale-95 transition-all flex items-center justify-center outline-none cursor-pointer"
          >
            <RefreshCcw size={13} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>
        </div>
      </div>



      {/* ================= SEARCH & FILTERS ================= */}
      <div className="flex gap-2 items-center">
        <SearchInput
          value={search}
          onChange={(val) => {
            setPage(1);
            setSearch(val);
          }}
          placeholder="SEARCH USERS..."
          loading={loading}
          className="flex-1 min-w-0"
          rightElement={
            <button
              type="button"
              aria-label="Filter users"
              onClick={() => setShowFilters(true)}
              className="h-7 w-7 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.08] transition-colors flex items-center justify-center outline-none shrink-0 cursor-pointer"
              title="Filter Users"
            >
              <Filter size={13} />
            </button>
          }
        />
        <div className="flex gap-2 shrink-0">
          <div className="hidden sm:flex px-5 h-11 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] items-center gap-2.5">
            <Users size={14} className="text-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
              {pagination.total} Records
            </span>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <AnimatePresence>
        {loading && users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
            <p className="text-sm text-[var(--muted)] font-medium">Fetching users...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block rounded-[1.5rem] overflow-hidden border border-[var(--border)] bg-[var(--card)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)] text-[var(--muted)]">
                  <tr className="text-xs font-semibold">
                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort("name")}>
                      User {sortBy === "name" && (order === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort("totalOrders")}>
                      Orders {sortBy === "totalOrders" && (order === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort("joinDate")}>
                      Joined Date {sortBy === "joinDate" && (order === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort("lastLogin")}>
                      Last Active {sortBy === "lastLogin" && (order === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((u, idx) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setSelectedUser(u)}
                      className="group hover:bg-[var(--foreground)]/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={u} />
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-semibold text-sm">{u.name}</span>
                            <span className="text-[11px] text-[var(--muted)]/60 font-mono truncate max-w-[120px] leading-none">{u.userId}</span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                               {u.tags?.map(tag => (
                                 <span key={tag} className={`px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[8px] font-black lowercase tracking-tight ${getTagColor(tag).split(' ')[1]}`}>
                                   #{tag}
                                 </span>
                               ))}
                            </div>
                          </div>
                        </div>
                      </td>
                                   <td className="px-6 py-4">
                        <div className="flex flex-col text-[var(--muted)]">
                          <span className="text-[var(--foreground)] font-medium text-xs truncate max-w-[180px]">{u.email}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px]">{u.phone || "No phone linked"}</span>
                            {u.phone && (
                              <a
                                href={getWhatsAppUrl(u.phone, u)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-emerald-400 hover:text-emerald-300 transition-colors p-0.5"
                                title="Chat with User on WhatsApp"
                              >
                                <FaWhatsapp size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Activity size={12} className="text-[var(--accent)]" />
                          <span className="font-bold text-[var(--foreground)]">{u.totalOrders || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[11px] font-semibold tracking-wide capitalize ${getRoleClass(u.userType)}`}>
                          {getRoleIcon(u.userType)}
                          {u.userType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-[var(--foreground)]">
                            {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-[var(--muted)]/60">
                            {new Date(u.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-[var(--foreground)]">
                            {u.lastLogin
                              ? new Date(u.lastLogin).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                              : "Never"}
                          </span>
                          {u.lastLoginIp && (
                            <span className="text-[9px] text-[var(--accent)]/50 font-mono mt-0.5">{u.lastLoginIp.split(',')[0]}</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="lg:hidden space-y-1.5">
              {users.map((u, idx) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => setSelectedUser(u)}
                  className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] active:bg-[var(--foreground)]/[0.05] hover:border-[var(--accent)]/30 transition-all cursor-pointer"
                >
                  {/* Top Row: User Identity on Left, Role & Orders on Right */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Avatar user={u} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-[var(--foreground)] text-[11px] leading-tight truncate">
                            {u.name}
                          </p>
                          {u.tags?.map((tag) => (
                            <span
                              key={tag}
                              className={`px-1 py-0.2 rounded text-[7.5px] font-bold lowercase tracking-tight border ${getTagColor(tag)}`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-[8.5px] font-mono text-[var(--muted)]/70 uppercase tracking-tight truncate">
                            {u.userId}
                          </p>
                          {u.userId && (
                            <CopyButton
                              text={u.userId}
                              size="xs"
                              variant="ghost"
                              className="!p-0.5"
                              title="Copy User ID"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider ${getRoleClass(u.userType)}`}
                        >
                          {getRoleIcon(u.userType)}
                          {u.userType}
                        </span>
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-wider tabular-nums"
                          title={`${u.totalOrders || 0} orders`}
                        >
                          <span>{u.totalOrders || 0}</span>
                          <span className="opacity-70 text-[6.5px]">ORD</span>
                        </span>
                      </div>
                      <span className="text-[7.5px] font-medium text-[var(--muted)]/60 tabular-nums">
                        {u.lastLogin ? `Active ${formatShortDate(u.lastLogin)}` : "Never Active"}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Contact & Dates on Left, WhatsApp or Details on Right */}
                  <div className="flex items-center justify-between gap-2 pt-1.5 mt-1.5 border-t border-[var(--border)]/30">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1 text-[var(--foreground)]/80">
                        <Mail size={9} className="text-[var(--accent)] shrink-0" />
                        <span className="text-[9.5px] font-medium truncate lowercase leading-tight">
                          {u.email}
                        </span>
                        {u.email && (
                          <CopyButton
                            text={u.email}
                            size="xs"
                            variant="ghost"
                            className="!p-0.5"
                            title="Copy Email"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[7.5px] text-[var(--muted)]/50 tabular-nums">
                        <span>Joined {formatShortDate(u.createdAt)}</span>
                        {u.lastLogin && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-500/70">
                              Active {formatShortTime(u.lastLogin)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      {u.phone ? (
                        <a
                          href={getWhatsAppUrl(u.phone, u)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[8.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md transition-all active:scale-95 shrink-0 cursor-pointer"
                          title="Chat on WhatsApp"
                        >
                          <FaWhatsapp size={10} className="text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="flex items-center gap-0.5 text-[8.5px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] px-1.5 py-0.5 rounded-md hover:bg-[var(--foreground)]/[0.04] transition-all cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight size={10} className="text-[var(--muted)]/60" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {!users.length && (
              <EmptyState
                icon={Users}
                title="No Users Found"
                description="No users matched your search criteria."
              />
            )}

            {/* ================= PAGINATION ================= */}
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemLabel="Users"
              onPageChange={setPage}
              variant="numbered"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DRAWER (User Info) ================= */}
      < AnimatePresence >
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-[360px] bg-[var(--background)] border-l border-[var(--border)] z-[1110] flex flex-col"
            >
              {/* Simple Premium Header - Compact */}
              <div className="p-3 sm:p-4 border-b border-[var(--border)] bg-[var(--card)]/30">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-[var(--accent)]" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">User Profile</h3>
                  </div>
                  <button aria-label="Close user profile"
                    onClick={() => setSelectedUser(null)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] transition-all outline-none cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar user={selectedUser} size="md" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--background)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate leading-tight mb-1">{selectedUser.name}</h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 ${getRoleClass(selectedUser.userType)}`}>
                        {getRoleIcon(selectedUser.userType)}
                        {selectedUser.userType}
                      </span>
                      <span className="text-[9px] text-[var(--muted)] font-mono">
                        {selectedUser.userId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content - Compact */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar bg-[var(--foreground)]/[0.01]">
                <DrawerSection icon={<Shield size={12} />} title="Account">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--muted)]/70 px-0.5">Role Assignment</p>
                      <div className="px-2 py-1 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-lg">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${getRoleClass(selectedUser.userType)}`}>
                          {selectedUser.userType}
                        </span>
                      </div>
                      {selectedUser.userType === "owner" && (
                        <p className="text-[8.5px] text-rose-500/80 font-medium px-2 flex items-center gap-1 mt-1 bg-rose-500/10 py-0.5 rounded border border-rose-500/20">
                          <ShieldAlert size={9} /> Owner role
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 pt-2 border-t border-[var(--border)]/40">
                      <p className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--muted)]/70 px-0.5">Session Action</p>
                      <button aria-label="Force log out user"
                        onClick={() => handleForceLogout(selectedUser._id)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold shadow-xs active:scale-[0.98] cursor-pointer"
                      >
                        Force Log Out
                      </button>
                    </div>
                  </div>
                </DrawerSection>

                <DrawerSection icon={<Tag size={12} />} title="Tags">
                  <div className="space-y-1.5">
                    <p className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--muted)]/70 flex items-center gap-1 px-0.5">
                      <Plus size={9} /> Category Tag (1 Max)
                    </p>
                    
                    <div className="flex flex-wrap gap-1 p-1.5 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)]/30">
                      {ALLOWED_TAGS.map(tag => {
                        const isActive = selectedUser.tags?.includes(tag);
                        return (
                          <button aria-label={`Toggle tag ${tag}`}
                            key={tag}
                            onClick={() => isActive ? removeTagFromUser(selectedUser, tag) : addTagToUser(selectedUser, tag)}
                            className={`px-2 py-0.5 rounded-md border text-[8.5px] font-bold lowercase transition-all active:scale-95 cursor-pointer ${
                              isActive 
                                ? getTagColor(tag).replace('15', '100').replace('600', 'white') + " border-transparent shadow-xs"
                                : getTagColor(tag) + " bg-transparent opacity-60 hover:opacity-100 hover:bg-[var(--foreground)]/[0.03]"
                            }`}
                          >
                            {isActive ? `✓ ${tag}` : tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </DrawerSection>

                <DrawerSection icon={<IdCard size={12} />} title="Identity">
                  <div className="grid grid-cols-1 gap-1.5">
                    <DrawerDetail
                      label="Full Name"
                      value={selectedUser.name}
                      copyText={selectedUser.name}
                    />
                    <DrawerDetail
                      label="User ID"
                      value={selectedUser.userId}
                      copyText={selectedUser.userId}
                      code
                    />
                    <DrawerDetail label="Orders Count" value={selectedUser.totalOrders || 0} />
                  </div>
                </DrawerSection>

                <DrawerSection icon={<Mail size={12} />} title="Contact">
                  <div className="grid grid-cols-1 gap-1.5">
                    <DrawerDetail
                      label="Email Address"
                      value={selectedUser.email}
                      copyText={selectedUser.email}
                    />
                    <DrawerDetail
                      label="Phone Number"
                      value={selectedUser.phone || "Not provided"}
                      copyText={selectedUser.phone}
                      whatsappUrl={selectedUser.phone ? getWhatsAppUrl(selectedUser.phone, selectedUser) : null}
                    />

                    {selectedUser.phone && (
                      <a
                        href={getWhatsAppUrl(selectedUser.phone, selectedUser)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-bold text-xs transition-all active:scale-[0.98] group cursor-pointer"
                      >
                        <FaWhatsapp size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span>Chat with User on WhatsApp</span>
                        <ExternalLink size={10} className="opacity-60" />
                      </a>
                    )}
                  </div>
                </DrawerSection>

                <DrawerSection icon={<Activity size={14} />} title="Activity">
                  <div className="grid grid-cols-1 gap-2">
                    <DrawerDetail
                      label="Last Logged In"
                      value={selectedUser.lastLogin
                        ? `${new Date(selectedUser.lastLogin).toLocaleDateString(undefined, { dateStyle: 'medium' })} at ${new Date(selectedUser.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : "No record found"
                      }
                    />
                    <DrawerDetail label="Last Login IP" value={selectedUser.lastLoginIp || "Not recorded"} code />
                  </div>
                </DrawerSection>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence >

      {/* ================= FILTER MODAL ================= */}
      < AnimatePresence >
        {showFilters && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-[var(--background)] border-l border-[var(--border)] p-8 space-y-8 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[var(--foreground)]">Filters</h3>
                <button aria-label="button"
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 pt-2">
                {/* SORTING */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">Sort Preference</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="flex-1 h-12 px-4 rounded-2xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--foreground)] text-sm font-bold focus:border-[var(--accent)]/50 outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="lastLogin">Last Active</option>
                      <option value="totalOrders">Order Count</option>
                      <option value="joinDate">Join Date</option>
                      <option value="name">Name</option>
                    </select>
                    <button aria-label="button"
                      onClick={() => {
                        setOrder(order === "asc" ? "desc" : "asc");
                        setPage(1);
                      }}
                      className="w-12 h-12 rounded-2xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--accent)] flex items-center justify-center hover:bg-[var(--foreground)]/[0.1] transition-all"
                    >
                      <Activity size={18} className={`transition-transform duration-500 ${order === "asc" ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="h-px bg-[var(--border)]/50 my-2" />

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">Role Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["user", "member", "admin", "owner"].map((type) => (
                      <button aria-label="button"
                        key={type}
                        onClick={() => setFilters({ ...filters, userType: filters.userType === type ? "" : type })}
                        className={`
                           px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all outline-none
                           ${filters.userType === type
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                            : "border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--muted)] hover:text-[var(--foreground)]"}
                         `}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)] ml-1">Joined From</label>
                    <input
                      type="date"
                      value={filters.from}
                      onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] text-[10px] font-bold focus:border-[var(--accent)]/50 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)] ml-1">Joined To</label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] text-[10px] font-bold focus:border-[var(--accent)]/50 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button aria-label="button"
                  onClick={() => {
                    setFilters({ userType: "", from: "", to: "" });
                    setPage(1);
                  }}
                  className="flex-1 h-11 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)] transition-all outline-none"
                >
                  Clear All
                </button>

                <button aria-label="button"
                  onClick={() => setShowFilters(false)}
                  className="flex-1 h-11 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 active:scale-95 transition-all outline-none"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence >
    </div >
  );
}


/* ================= AVATAR ================= */
function Avatar({ user, size = "md" }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    xs: "h-5 w-5 text-[8px]",
    sm: "h-7 w-7 text-[9.5px]",
    md: "h-9 w-9 text-xs",
    lg: "h-11 w-11 text-sm",
  };

  const initials = user?.userId
    ?.replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase() || user?.name?.slice(0, 2).toUpperCase() || "U";

  if (user?.avatar && !imgError) {
    return (
      <img
        src={user.avatar}
        alt={user.name || "User"}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-lg object-cover border border-[var(--border)] shadow-xs shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size] || sizeClasses.md} rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br from-[var(--accent)] via-indigo-500 to-purple-600 shadow-xs shrink-0 select-none`}>
      {size === 'lg' ? <User size={18} /> : initials}
    </div>
  );
}

/* ================= HELPERS ================= */

function getWhatsAppUrl(phone, user) {
  if (!phone) return null;
  let clean = phone.toString().replace(/[^0-9]/g, "");
  if (clean.length === 10) {
    clean = "91" + clean;
  }
  const userName = user?.name || "Player";
  const text = `Hello ${userName}! Contacting you from BlueBuff...`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

function DrawerSection({ icon, title, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[var(--foreground)]">
        <div className="p-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">{icon}</div>
        <h4 className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]/80">{title}</h4>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)]/70 to-transparent ml-2" />
      </div>
      <div className="flex flex-col gap-1 px-0.5 mt-0.5">{children}</div>
    </div>
  );
}

function DrawerDetail({ label, value, emphasize, copyText, whatsappUrl, code }) {
  return (
    <div className="flex items-end justify-between gap-1 group w-full py-0.5">
      <span className="text-[9px] font-bold text-[var(--muted)]/70 uppercase tracking-wider whitespace-nowrap mb-0.5">{label}</span>
      <div className="flex-1 border-b border-dotted border-[var(--border)]/40 mx-2 mb-1 opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-1.5 justify-end max-w-[65%]">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-right truncate text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 transition-colors"
            title="Open WhatsApp chat with user"
          >
            <span className="truncate">{value || "N/A"}</span>
            <FaWhatsapp size={11} className="text-emerald-400 shrink-0 inline-block ml-0.5" />
          </a>
        ) : (
          <span className={`text-xs font-bold text-right truncate ${code ? "font-mono" : ""} ${emphasize ? "text-[var(--accent)] drop-shadow-[0_0_5px_rgba(var(--accent-rgb),0.3)] italic uppercase" : "text-[var(--foreground)]"}`}>
            {value || "N/A"}
          </span>
        )}
        {copyText && (
          <CopyButton
            text={copyText}
            size="xs"
            variant="ghost"
            className="!p-0.5"
            title={`Copy ${label}`}
          />
        )}
      </div>
    </div>
  );
}

