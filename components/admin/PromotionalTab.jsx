"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Users,
  Search,
  CheckSquare,
  Square,
  Mail,
  Loader2,
  Trash2,
  AlertCircle,
  Globe,
  Tag,
  Plus,
  X,
  UserPlus,
  RefreshCcw,
  Info,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCheck,
  Eye,
  Edit3,
  Smartphone,
  Monitor
} from "lucide-react";
import { SearchInput, Pagination, LoadingSpinner, SectionTitle } from "@/components/common";

export default function PromotionalTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [composerMode, setComposerMode] = useState("edit"); // "edit" | "preview"
  const [previewDevice, setPreviewDevice] = useState("mobile"); // "mobile" | "desktop"
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isRecentCampaignsOpen, setIsRecentCampaignsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedPromoStatus, setSelectedPromoStatus] = useState("all");
  const [stats, setStats] = useState({ todayEmails: 0, totalEmails: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [manualEmail, setManualEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [manualEmails, setManualEmails] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [editingTagsUserId, setEditingTagsUserId] = useState(null);
  const [newTagInput, setNewTagInput] = useState("");
  const [tagUpdateLoading, setTagUpdateLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const ALLOWED_TAGS = ["premium", "rare", "new", "loyal", "vip", "special"];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "100",
        role: selectedRole === 'all' ? '' : selectedRole,
        tag: selectedTag || '',
        promoStatus: selectedPromoStatus === 'all' ? '' : selectedPromoStatus,
        search: debouncedSearch.trim(),
        sortBy: selectedPromoStatus === 'never' ? 'createdAt' : (selectedPromoStatus !== 'all' ? 'lastPromoSentAt' : 'name')
      });
      const res = await fetch(`/api/admin/users/data?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.filter(u => u.email));
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, selectedRole, selectedTag, selectedPromoStatus, debouncedSearch]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/promo-mail/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const useTemplate = (log) => {
    setSubject(log.subject || "");
    setContent(log.content || "");
    setImageUrl(log.imageUrl || "");
    setStatus({ type: "success", message: "Template loaded." });
    // Scroll to composer
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredUsers = [
    ...users.filter(u => !manualEmails.includes(u.email?.toLowerCase())),
    ...manualEmails
      .filter(email => {
        const matchesSearch = !search || email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = selectedRole === "all" || selectedRole === "external";
        const matchesPromo = selectedPromoStatus === "all" || selectedPromoStatus === "never";
        return matchesSearch && matchesRole && matchesPromo;
      })
      .map(email => ({
        _id: `manual-${email}`,
        email,
        name: "External Gmail",
        userType: "external",
        isManual: true,
        tags: ["External"],
        lastPromoSentAt: null,
        promoSentCount: 0
      }))
  ];

  const uniqueTags = Array.from(new Set([...users.flatMap(u => u.tags || []), ...ALLOWED_TAGS]));

  const handleUpdateTags = async (userId, tags) => {
    try {
      setTagUpdateLoading(true);

      const userToUpdate = filteredUsers.find(user => user._id === userId);

      if (userToUpdate?.isManual) {
        // Just update local state for manual/external contacts
        setUsers(prev => prev.map(user => user._id === userId ? { ...user, tags } : user));
        // Also update manualEmails if the user was originally from manualEmails
        setManualEmails(prev => prev.map(email => userToUpdate.email === email ? { ...userToUpdate, tags }.email : email));
        setEditingTagsUserId(null);
        setStatus({ type: "success", message: "Tags updated for external contact." });
        return;
      }

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
        setEditingTagsUserId(null);
        setStatus({ type: "success", message: "Tags updated." });
      } else {
        setStatus({ type: "error", message: data.message || "Failed to update tags." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to update tags." });
    } finally {
      setTagUpdateLoading(false);
    }
  };

  const addTagToUser = (user, tag) => {
    if (!tag || user.tags?.includes(tag)) return;

    // 1-Tag Limit: Simply replace the existing tags with the new one
    handleUpdateTags(user._id, [tag]);
    setNewTagInput("");
  };

  const removeTagFromUser = (user, tag) => {
    const updatedTags = (user.tags || []).filter(t => t !== tag);
    handleUpdateTags(user._id, updatedTags);
  };

  const syncAllTags = async () => {
    try {
      setTagUpdateLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users/migrate-tags", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: data.message });
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Migration failed." });
    } finally {
      setTagUpdateLoading(false);
    }
  };

  const addManualEmail = () => {
    if (!manualEmail) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualEmail)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    const cleanEmail = manualEmail.trim().toLowerCase();
    if (selectedEmails.includes(cleanEmail)) {
      setStatus({ type: "info", message: "This email is already in the recipient list." });
      return;
    }

    setManualEmails(prev => [...prev, cleanEmail]);
    setSelectedEmails(prev => [...prev, cleanEmail]);
    setManualEmail("");
    setStatus({ type: "success", message: `Added ${cleanEmail} to recipients.` });
  };

  const removeManualEmail = (e, email) => {
    e.stopPropagation();
    const targetEmail = email.toLowerCase();
    setManualEmails(prev => prev.filter(m => m.toLowerCase() !== targetEmail));
    setSelectedEmails(prev => prev.filter(m => m.toLowerCase() !== targetEmail));
    setStatus({ type: "info", message: "Manual entry removed." });
  };

  const getTagColor = (tag) => {
    const tagLower = tag.toLowerCase();
    if (tagLower === 'premium' || tagLower === 'vip') return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
    if (tagLower === 'rare' || tagLower === 'special') return 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30';
    if (tagLower === 'new' || tagLower === 'latest') return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    if (tagLower === 'loyal' || tagLower === 'topup') return 'bg-rose-500/15 text-rose-600 border-rose-500/30';
    if (tagLower === 'external') return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
    return 'bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]';
  };

  const toggleSelectAll = () => {
    // This will select/deselect all users currently displayed on the page
    const currentEmailsOnPage = filteredUsers.map(u => u.email);
    const allSelectedOnPage = currentEmailsOnPage.every(email => selectedEmails.includes(email));

    if (allSelectedOnPage) {
      // Deselect all on current page
      setSelectedEmails(prev => prev.filter(email => !currentEmailsOnPage.includes(email)));
    } else {
      // Select all on current page that are not already selected
      setSelectedEmails(prev => [...new Set([...prev, ...currentEmailsOnPage])]);
    }
  };

  const selectUnsentOnPage = () => {
    const unsentEmails = filteredUsers.filter(u => !u.lastPromoSentAt).map(u => u.email);
    if (unsentEmails.length === 0) {
      setStatus({ type: "info", message: "All contacts on this page were already emailed." });
      return;
    }
    const allUnsentSelected = unsentEmails.every(email => selectedEmails.includes(email));
    if (allUnsentSelected) {
      setSelectedEmails(prev => prev.filter(email => !unsentEmails.includes(email)));
    } else {
      setSelectedEmails(prev => [...new Set([...prev, ...unsentEmails])]);
    }
  };

  const formatPromoDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const toggleSelectUser = (email) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleSend = async () => {
    if (selectedEmails.length === 0) {
      setStatus({ type: "error", message: "Please select at least one recipient." });
      return;
    }
    if (!subject || !content) {
      setStatus({ type: "error", message: "Subject and Content are required." });
      return;
    }

    try {
      setSending(true);
      setStatus({ type: "info", message: `Preparing to send to ${selectedEmails.length} recipients...` });
      const token = localStorage.getItem("token");

      const batchSize = 50; // Send 50 emails per request to avoid timeouts
      const totalRecipients = selectedEmails.length;
      let totalSuccess = 0;
      let totalFailed = 0;

      for (let i = 0; i < totalRecipients; i += batchSize) {
        const currentBatch = selectedEmails.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(totalRecipients / batchSize);

        setStatus({
          type: "info",
          message: `Sending batch ${batchNumber}/${totalBatches} (${currentBatch.length} users)...`
        });

        const res = await fetch("/api/admin/promo-mail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            emails: currentBatch,
            subject,
            content,
            imageUrl,
          }),
        });

        const data = await res.json();
        if (data.success) {
          totalSuccess += data.report.success;
          totalFailed += data.report.failed;

          // Instantly update user status in UI
          const batchEmailSet = new Set(currentBatch.map(e => e.toLowerCase().trim()));
          setUsers(prev => prev.map(u => {
            if (u.email && batchEmailSet.has(u.email.toLowerCase().trim())) {
              return {
                ...u,
                lastPromoSentAt: new Date().toISOString(),
                promoSentCount: (u.promoSentCount || 0) + 1
              };
            }
            return u;
          }));

          // Update stats after each success
          fetchStats();
        } else {
          // If a whole batch fails (e.g. server error)
          totalFailed += currentBatch.length;
          console.error(`Batch ${batchNumber} failed:`, data.message);
        }

        // Add a small delay between batches to be extra safe with rate limits
        if (i + batchSize < totalRecipients) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setStatus({
        type: "success",
        message: `Transmission complete: ${totalSuccess} sent, ${totalFailed} failed.`
      });
      setSubject("");
      setContent("");
      setImageUrl("");
      setSelectedEmails([]);
      fetchUsers();
      fetchStats();

    } catch (err) {
      console.error("Transmission Error:", err);
      setStatus({ type: "error", message: "An error happened while sending. Some emails may still be sent." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ================= PREMIUM DASHBOARD HEADER ================= */}
      {/* ================= PREMIUM DASHBOARD HEADER ================= */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-end flex-wrap gap-2 pb-2.5 border-b border-[var(--border)]/70">
          <div className="flex items-center gap-2 shrink-0">
            <button 
               onClick={() => {
                 fetchStats();
                 fetchUsers();
               }}
               className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
               title="Refresh stats"
            >
              <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* COMBINED 1-ROW STATS BAR */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 sm:p-2.5 shadow-2xs">
          <div className="grid grid-cols-3 divide-x divide-[var(--border)]/70">
            {/* Mails Today */}
            <div className="px-2 sm:px-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="min-w-0">
                <span className="text-[7.5px] sm:text-[8.5px] uppercase tracking-wider font-extrabold text-[var(--muted)] truncate block">
                  Mails Today
                </span>
                <div className="flex items-baseline gap-1 mt-0.5 justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm font-black text-emerald-400 tabular-nums leading-none">
                    {stats.todayEmails.toLocaleString()}
                  </span>
                  <span className="text-[7.5px] font-bold text-[var(--muted)] hidden md:inline truncate">
                    Campaign
                  </span>
                </div>
              </div>
              <Send size={14} className="text-emerald-400/80 hidden sm:block shrink-0" />
            </div>

            {/* External */}
            <div className="px-2 sm:px-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="min-w-0">
                <span className="text-[7.5px] sm:text-[8.5px] uppercase tracking-wider font-extrabold text-[var(--muted)] truncate block">
                  External
                </span>
                <div className="flex items-baseline gap-1 mt-0.5 justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm font-black text-blue-400 tabular-nums leading-none">
                    {manualEmails.length.toLocaleString()}
                  </span>
                  <span className="text-[7.5px] font-bold text-[var(--muted)] hidden md:inline truncate">
                    Manual
                  </span>
                </div>
              </div>
              <Globe size={14} className="text-blue-400/80 hidden sm:block shrink-0" />
            </div>

            {/* Database */}
            <div className="px-2 sm:px-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="min-w-0">
                <span className="text-[7.5px] sm:text-[8.5px] uppercase tracking-wider font-extrabold text-[var(--muted)] truncate block">
                  Database
                </span>
                <div className="flex items-baseline gap-1 mt-0.5 justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm font-black text-indigo-400 tabular-nums leading-none">
                    {totalRecords.toLocaleString()}
                  </span>
                  <span className="text-[7.5px] font-bold text-[var(--muted)] hidden md:inline truncate">
                    Contacts
                  </span>
                </div>
              </div>
              <Users size={14} className="text-indigo-400/80 hidden sm:block shrink-0" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: User Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Header with Filter Toggle and Select All */}
          <div className="flex items-center justify-between px-1 gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-2 truncate">
              <Users size={14} className="text-[var(--accent)] shrink-0" /> Recipients ({selectedEmails.length})
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Expandable Filter Toggle */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  showFilters || selectedRole !== "all" || selectedTag || selectedPromoStatus !== "all"
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
                    : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.03]"
                }`}
              >
                <Filter size={11} />
                <span>Filters</span>
                {(selectedRole !== "all" || selectedTag || selectedPromoStatus !== "all") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                )}
                {showFilters ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>

              {/* Quick Select Unsent on page */}
              <button
                type="button"
                onClick={selectUnsentOnPage}
                className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:brightness-110 active:scale-95 transition-all px-2 py-1 border border-emerald-500/30 rounded bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center gap-1"
                title="Select all unsent contacts on this page"
              >
                <CheckCheck size={11} />
                <span>+ Unsent</span>
              </button>

              <button
                aria-label="button"
                onClick={toggleSelectAll}
                className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] hover:brightness-110 active:scale-95 transition-all px-1.5 py-1"
              >
                {filteredUsers.every(u => selectedEmails.includes(u.email)) && filteredUsers.length > 0 ? "Deselect Page" : "Select Page"}
              </button>
            </div>
          </div>

          {/* Quick Filter Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1 custom-scrollbar">
            {[
              { id: "all", label: "All Contacts" },
              { id: "never", label: "🟢 Unsent Only" },
              { id: "sent_today", label: "Sent Today" },
              { id: "sent_7d", label: "Sent > 7d Ago" },
              { id: "sent", label: "Sent Before" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setSelectedPromoStatus(tab.id); setPage(1); }}
                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedPromoStatus === tab.id
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                    : "bg-[var(--card)]/80 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Expandable Filter Drawer */}
          {showFilters && (
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Send History Filter */}
              <div>
                <span className="block text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Filter by Promo History
                </span>
                <div className="flex flex-wrap gap-1 items-center">
                  {[
                    { id: "all", label: "All" },
                    { id: "never", label: "Never Sent (Unsent)" },
                    { id: "sent_today", label: "Sent Today" },
                    { id: "sent_7d", label: "Sent > 7 Days Ago" },
                    { id: "sent", label: "Sent (Anytime)" },
                  ].map((item) => (
                    <button
                      aria-label="button"
                      key={item.id}
                      onClick={() => { setSelectedPromoStatus(item.id); setPage(1); }}
                      className={`px-2.5 py-1 rounded text-[9.5px] font-bold uppercase tracking-wider transition-colors ${
                        selectedPromoStatus === item.id
                          ? "bg-[var(--accent)] text-white"
                          : "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <span className="block text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Filter by Role
                </span>
                <div className="flex flex-wrap gap-1 items-center">
                  {["all", "user", "member", "admin", "owner", "external"].map((role) => (
                    <button
                      aria-label="button"
                      key={role}
                      onClick={() => { setSelectedRole(role); setPage(1); }}
                      className={`px-2.5 py-1 rounded text-[9.5px] font-bold uppercase tracking-wider transition-colors ${
                        selectedRole === role
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag / Category Filter */}
              <div>
                <span className="block text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Category / Tag
                </span>
                <div className="relative group">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] opacity-50" size={12} />
                  <select
                    value={selectedTag || ""}
                    onChange={(e) => { setSelectedTag(e.target.value || null); setPage(1); }}
                    className="w-full h-8 pl-8 pr-8 rounded border border-[var(--border)] bg-[var(--background)] text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-colors"
                  >
                    <option value="" className="bg-[var(--background)] text-[var(--foreground)]">All Categories & Tags</option>
                    {uniqueTags.map(tag => (
                      <option key={tag} value={tag} className="bg-[var(--background)] text-[var(--foreground)]">
                        #{tag.toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Manual External Email Entry */}
              <div>
                <span className="block text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Add External Recipient
                </span>
                <div className="flex gap-1.5">
                  <div className="relative flex-1 group">
                    <UserPlus className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] opacity-50" size={13} />
                    <input
                      type="text"
                      placeholder="Type external Gmail..."
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addManualEmail()}
                      className="w-full h-8 pl-8 pr-2.5 rounded border border-[var(--border)] bg-[var(--background)] text-xs outline-none transition-colors placeholder:text-[var(--muted)]/40 text-[var(--foreground)] focus:border-[var(--accent)]/50"
                    />
                  </div>
                  <button
                    aria-label="Add external email"
                    onClick={addManualEmail}
                    className="px-3 h-8 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-bold text-[10px] uppercase tracking-wider flex items-center justify-center hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors shrink-0"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Input Always Visible */}
          <div className="px-1">
            <SearchInput
              placeholder="Search by name or email..."
              value={search}
              onChange={setSearch}
              size="sm"
            />
          </div>

          <div className="px-1 flex justify-end">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalRecords}
              itemLabel="Records"
              onPageChange={setPage}
              size="sm"
              hideOnSinglePage
            />
          </div>

          <div className="h-[450px] overflow-y-auto border border-[var(--border)] rounded bg-[var(--background)] custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <LoadingSpinner size="lg" color="accent" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Loading contact list...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              [...filteredUsers]
                .sort((a, b) => {
                  const aSelected = selectedEmails.includes(a.email);
                  const bSelected = selectedEmails.includes(b.email);
                  if (aSelected && !bSelected) return -1;
                  if (!aSelected && bSelected) return 1;
                  return 0;
                })
                .map(u => (
                  <div
                    key={u._id}
                    onClick={() => toggleSelectUser(u.email)}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors border-b border-[var(--border)]/50 last:border-0 relative group ${selectedEmails.includes(u.email) ? 'bg-[var(--accent)]/5' : 'bg-transparent hover:bg-[var(--foreground)]/[0.02]'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-[10px] uppercase tracking-widest shrink-0 ${selectedEmails.includes(u.email) ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)] text-[var(--muted)] bg-[var(--background)]'}`}>
                        {u.isManual ? <Globe size={14} /> : (u.name?.charAt(0).toUpperCase() || 'U')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-[var(--foreground)] truncate leading-tight">{u.name}</p>
                          {u.isManual && <span className="px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-[8px] font-black uppercase tracking-widest shrink-0">Manual</span>}
                        </div>
                        <p className="text-[11px] text-[var(--muted)]/60 font-medium truncate lowercase leading-tight mb-1">{u.email}</p>

                        {/* Tags & Send History Display */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {/* Dedicated Last Sent Status Badge */}
                          {!u.isManual && (
                            u.lastPromoSentAt ? (
                              <span 
                                title={`Last sent: ${new Date(u.lastPromoSentAt).toLocaleString()} (${u.promoSentCount || 1} total)`}
                                className="px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-600 text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm"
                              >
                                <Clock size={10} className="text-blue-500 shrink-0" />
                                <span>Last Sent: {formatPromoDate(u.lastPromoSentAt)}</span>
                                {(u.promoSentCount > 1) && <span className="px-1 rounded bg-blue-500/20 text-blue-700 text-[7.5px] font-bold">{u.promoSentCount}x</span>}
                              </span>
                            ) : (
                              <span 
                                title="Has not received any promotional emails"
                                className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                                <span>Last Sent: Never</span>
                              </span>
                            )
                          )}

                          {u.tags?.map(tag => (
                            <span key={tag} className={`px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${getTagColor(tag)}`}>
                              {tag}
                              {!u.isManual && (
                                <button aria-label="button" onClick={(e) => { e.stopPropagation(); removeTagFromUser(u, tag); }} className="opacity-60 hover:opacity-100 hover:text-[var(--foreground)]">
                                  <X size={10} />
                                </button>
                              )}
                            </span>
                          ))}
                          {!u.isManual && editingTagsUserId !== u._id && (
                            <button aria-label="button"
                              onClick={(e) => { e.stopPropagation(); setEditingTagsUserId(u._id); }}
                              className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 border border-[var(--border)] rounded px-1.5 py-0.5"
                            >
                              <Plus size={8} /> Tag
                            </button>
                          )}
                        </div>

                        {/* Tag Selection Only */}
                        {editingTagsUserId === u._id && (
                          <div className="mt-3 space-y-2 p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-black lowercase tracking-tight text-[var(--accent)] flex items-center gap-1.5">
                                <Plus size={10} /> Select Category (1 Max)
                              </p>
                              <button aria-label="button" onClick={() => setEditingTagsUserId(null)} className="p-1 px-2 text-[10px] font-black lowercase text-rose-500 hover:bg-rose-500/10 rounded-lg">
                                Close
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {ALLOWED_TAGS.map(tag => {
                                const isActive = u.tags?.includes(tag);
                                return (
                                  <button aria-label="button"
                                    key={tag}
                                    onClick={() => isActive ? removeTagFromUser(u, tag) : addTagToUser(u, tag)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-black lowercase border transition-all hover:scale-105 active:scale-95 shadow-sm ${isActive
                                        ? getTagColor(tag).replace('15', '100').replace('600', 'white') + " border-transparent"
                                        : getTagColor(tag) + " opacity-40 hover:opacity-100"
                                      }`}
                                  >
                                    {isActive ? `✓ ${tag}` : `+ ${tag}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center shrink-0 ml-2">
                      {u.isManual && (
                        <button aria-label="button"
                          onClick={(e) => removeManualEmail(e, u.email)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors mr-2 group/remove"
                          title="Remove permanently"
                        >
                          <Trash2 size={14} className="opacity-40 group-hover/remove:opacity-100 transition-opacity" />
                        </button>
                      )}
                      {selectedEmails.includes(u.email) ? (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
                          <CheckSquare size={12} className="text-white" />
                        </div>
                      ) : (
                        <Square size={18} className="text-[var(--muted)]/30" />
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                <Users size={40} className="text-[var(--muted)]/20 mb-3" />
                <p className="text-sm font-semibold text-[var(--muted)]">No contacts found</p>
                <p className="text-[10px] text-[var(--muted)]/60 mt-1">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Email Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1 gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
              <Mail size={14} className="text-[var(--accent)]" /> Email Composer
            </h3>
            <div className="flex items-center gap-1 bg-[var(--foreground)]/[0.04] p-0.5 rounded-lg border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setComposerMode("edit")}
                className={`px-2.5 py-1 rounded-md text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  composerMode === "edit"
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Edit3 size={11} />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setComposerMode("preview")}
                className={`px-2.5 py-1 rounded-md text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  composerMode === "preview"
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Eye size={11} />
                <span>Live Preview</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 border border-[var(--border)] rounded-xl bg-[var(--background)] p-4 sm:p-5 relative overflow-hidden">
            {composerMode === "preview" ? (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* Preview Toolbar: Device Switch & Subject Header */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)] shrink-0">Subject:</span>
                    <span className="font-bold text-[var(--foreground)] text-xs truncate">
                      {subject || <span className="italic text-[var(--muted)]/50 font-normal">No subject provided</span>}
                    </span>
                  </div>

                  {/* Device Toggle */}
                  <div className="flex items-center gap-1 bg-[var(--background)] p-0.5 rounded-md border border-[var(--border)] shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                        previewDevice === "mobile"
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <Smartphone size={11} />
                      <span className="hidden xs:inline">Mobile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                        previewDevice === "desktop"
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <Monitor size={11} />
                      <span className="hidden xs:inline">Desktop</span>
                    </button>
                  </div>
                </div>

                {/* Email Mockup Container */}
                <div className="p-3 sm:p-6 rounded-xl bg-[#0f172a]/5 dark:bg-black/30 border border-slate-200/80 dark:border-slate-800 text-[#0f172a] shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar flex justify-center">
                  {previewDevice === "mobile" ? (
                    /* SMARTPHONE DEVICE FRAME */
                    <div className="w-full max-w-[340px] bg-slate-950 p-2 sm:p-2.5 rounded-[36px] shadow-2xl border-[3px] border-slate-800 relative transition-all">
                      {/* Speaker & Dynamic Island / Notch */}
                      <div className="flex items-center justify-between px-4 pt-1.5 pb-2 text-[10px] text-slate-400 font-bold">
                        <span>9:41</span>
                        <div className="w-16 h-3.5 bg-black rounded-full mx-auto" />
                        <div className="flex items-center gap-1 text-[9px]">
                          <span>5G</span>
                          <div className="w-3.5 h-2 border border-slate-400 rounded-sm p-[1px]">
                            <div className="w-full h-full bg-slate-400 rounded-[0.5px]" />
                          </div>
                        </div>
                      </div>

                      {/* Phone Screen Canvas */}
                      <div className="bg-[#f8fafc] rounded-[26px] overflow-hidden p-3.5 sm:p-4 text-[#0f172a] font-sans shadow-inner">
                        {/* Brand Header */}
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/60">
                          <img src="https://mlbbtopup.in/logoBB.png" alt="Logo" className="h-5 w-auto object-contain" />
                          <span className="font-black text-xs text-[#0f172a] tracking-tight">mlbbtopup.in</span>
                        </div>

                        {/* Banner Image */}
                        {imageUrl && (
                          <img src={imageUrl} alt="Promotion Banner" className="w-full rounded-lg mb-3 object-cover max-h-40 block border border-slate-100 shadow-sm" />
                        )}

                        {/* Body Content */}
                        {content ? (
                          <div
                            className="text-xs text-[#334155] leading-relaxed mb-4 whitespace-pre-wrap font-sans"
                            dangerouslySetInnerHTML={{ __html: content }}
                          />
                        ) : (
                          <p className="text-xs text-slate-400 italic mb-4 leading-relaxed">
                            (Your message body content will render here in real-time)
                          </p>
                        )}

                        {/* Footer */}
                        <div className="border-t border-slate-200/60 mt-4 pt-2.5 text-center text-[9px] text-[#94a3b8] leading-tight">
                          <p className="mb-0.5"><span className="text-[#2563eb] font-semibold">mlbbtopup.in</span> • Support</p>
                          <p className="text-[8.5px] text-[#cbd5e1]">© 2026 mlbbtopup.in. All rights reserved.</p>
                        </div>
                      </div>

                      {/* Home Indicator Bar */}
                      <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
                    </div>
                  ) : (
                    /* DESKTOP EMAIL CANVAS */
                    <div className="w-full max-w-[460px] bg-white p-5 sm:p-6 rounded-xl border border-[#e2e8f0] shadow-sm font-sans">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <img src="https://mlbbtopup.in/logoBB.png" alt="Logo" className="h-6 w-auto object-contain" />
                        <span className="font-extrabold text-sm text-[#0f172a] tracking-tight">mlbbtopup.in</span>
                      </div>

                      {/* Banner Image */}
                      {imageUrl && (
                        <img src={imageUrl} alt="Promotion Banner" className="w-full rounded-lg mb-4 object-cover max-h-48 block border border-slate-100" />
                      )}

                      {/* Body Content */}
                      {content ? (
                        <div
                          className="text-xs text-[#334155] leading-relaxed mb-5 whitespace-pre-wrap font-sans"
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      ) : (
                        <p className="text-xs text-slate-400 italic mb-5 leading-relaxed">
                          (Your message body content will render here in real-time)
                        </p>
                      )}

                      {/* Footer */}
                      <div className="border-t border-[#f1f5f9] mt-6 pt-3 text-center text-[10px] text-[#94a3b8] leading-tight">
                        <p className="mb-1"><span className="text-[#2563eb] font-semibold">mlbbtopup.in</span> • Support</p>
                        <p className="text-[9px] text-[#cbd5e1]">© 2026 mlbbtopup.in. All rights reserved.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Subject Line</label>
                  <input
                    type="text"
                    placeholder="Ex: Exclusive Offer for You! 🎉"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Banner Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="Ex: https://example.com/banner.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40"
                  />
                  {imageUrl && (
                    <div className="mt-2 rounded overflow-hidden border border-[var(--border)] aspect-video bg-[var(--foreground)]/[0.02] relative group">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Image Preview</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Message Body</label>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-bold text-[var(--muted)]/40 uppercase tracking-widest">Supports HTML</span>
                      <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-widest cursor-help" title="Use HTML tags like <b>, <br>, <p> etc.">Rich Format</span>
                    </div>
                  </div>
                  <textarea
                    placeholder="Dear customer, we have a special promotion for you..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-[180px] p-3 rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none resize-y custom-scrollbar leading-relaxed placeholder:text-[var(--muted)]/40"
                  />
                </div>
              </>
            )}

            <AnimatePresence mode="wait">
              {status.message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 rounded flex items-center gap-2 text-xs font-bold border ${status.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : status.type === 'error'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                    }`}
                >
                  {status.type === 'info' ? <Loader2 className="animate-spin" size={14} /> : <AlertCircle size={14} />}
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <button aria-label="button"
              onClick={handleSend}
              disabled={sending || selectedEmails.length === 0}
              className="w-full h-10 mt-2 rounded border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)] font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[var(--accent)] hover:text-white active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-colors"
            >
              {sending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Send size={14} />
                  <span>Send to {selectedEmails.length} Recipients</span>
                </>
              )}
              {sending && <span className="ml-1">Transmitting...</span>}
            </button>
          </div>
        </motion.div>
      </div>

    {/* Collapsible Recent Campaigns */}
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/30 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsRecentCampaignsOpen(!isRecentCampaignsOpen)}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[var(--card)]/50 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
            <Mail size={14} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] truncate">
              Recent Campaigns ({recentLogs.length})
            </h3>
            <p className="text-[10px] text-[var(--muted)] truncate">
              View transmission history and reuse previous email templates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded bg-[var(--border)]/60 text-[var(--foreground)]">
            {isRecentCampaignsOpen ? "Hide History" : "Show History"}
          </span>
          <div className="p-1 rounded text-[var(--muted)]">
            {isRecentCampaignsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {isRecentCampaignsOpen && (
        <div className="p-4 sm:p-5 border-t border-[var(--border)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 hover:bg-[var(--foreground)]/[0.02] transition-colors overflow-hidden flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2.5 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-black text-[var(--foreground)] truncate uppercase tracking-tight leading-none">{log.subject}</p>
                      <p className="text-[9.5px] text-[var(--muted)] font-medium mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      aria-label="button"
                      onClick={() => useTemplate(log)}
                      className="shrink-0 px-2.5 py-1 rounded border border-[var(--accent)]/30 text-[9px] font-bold uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)] hover:text-white transition-colors"
                    >
                      Use Template
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className="text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-emerald-500/20 text-emerald-600 bg-emerald-500/10">
                      <span className="mr-1">✓</span>{log.successCount} Sent
                    </span>
                    <span className="text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-rose-500/20 text-rose-600 bg-rose-500/10">
                      <span className="mr-1">✕</span>{log.failedCount} Failed
                    </span>
                    <span className="text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-[var(--accent)]/20 text-[var(--accent)] bg-[var(--accent)]/5 truncate max-w-[120px]">
                      <span className="mr-1 opacity-70">👤</span>By {log.sentBy}
                    </span>
                  </div>

                  {/* Decorative content preview */}
                  <div className="p-2.5 rounded border border-[var(--border)] bg-[var(--foreground)]/[0.02] mt-auto">
                    <div
                      className="text-[9.5px] text-[var(--muted)] font-mono line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: (log.content || "").replace(/<[^>]*>?/gm, ' ') }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center rounded-xl border border-dashed border-[var(--border)]">
                <p className="text-xs font-bold text-[var(--muted)]">No campaign history found yet.</p>
                <p className="text-[9.5px] font-mono text-[var(--muted)] mt-1">Sent emails will appear here for quick reuse.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

// ================= HELPER COMPONENTS =================
function StatTile({ icon, label, value, sub, color }) {
  const colorMap = {
    emerald: { border: "#22c55e", bg: "rgba(34,197,94,0.1)", text: "#22c55e" },
    amber:   { border: "#f59e0b", bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
    blue:    { border: "#3b82f6", bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
    indigo:  { border: "#818cf8", bg: "rgba(129,140,248,0.1)", text: "#818cf8" },
  };
  const theme = colorMap[color] || colorMap.indigo;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-2.5 sm:p-3 transition-colors">
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: theme.border }} />
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[8.5px] sm:text-[9.5px] uppercase tracking-wider font-extrabold text-[var(--muted)] truncate leading-tight">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base sm:text-lg font-black leading-none tracking-tight text-[var(--foreground)]">
              {value}
            </span>
            {sub && (
              <span className="text-[8px] font-bold text-[var(--muted)] opacity-60 truncate">
                {sub}
              </span>
            )}
          </div>
        </div>
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: theme.bg, color: theme.text }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
