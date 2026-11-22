"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  RefreshCcw,
  Filter,
  X,
  Smartphone,
  Lock,
  RotateCw,
  BookOpen,
  Globe,
  Layers
} from "lucide-react";
import { SearchInput, SectionTitle, LoadingSpinner, Pagination, EmptyState } from "@/components/common";

const GAME_OPTIONS = [
  { id: "all", label: "All Games" },
  { id: "mlbb", label: "MLBB" },
  { id: "esports", label: "Esports" },
  { id: "freefire", label: "Free Fire" },
  { id: "pubg", label: "PUBG" },
];

const TYPE_OPTIONS = [
  { id: "all", label: "All Types" },
  { id: "Guides", label: "Guides" },
  { id: "News", label: "News" },
  { id: "Updates", label: "Updates" },
  { id: "Esports", label: "Esports" },
];

export default function BlogsTab() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [gameFilter, setGameFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Selected blog for mobile screen preview
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [previewMode, setPreviewMode] = useState("live"); // "live" | "reader"
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  // Mobile / tablet screen toggle view (< lg)
  const [mobileTab, setMobileTab] = useState("list"); // "list" | "preview"

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, debouncedSearch, gameFilter, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, gameFilter, typeFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedBlog) {
      setIframeLoading(true);
    }
  }, [selectedBlog?.slug]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      let url = `/api/blogs?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`;
      if (gameFilter !== "all") url += `&game=${encodeURIComponent(gameFilter)}`;
      if (typeFilter !== "all") url += `&type=${encodeURIComponent(typeFilter)}`;
      const res = await api.get(url);
      if (res.data?.success) {
        const fetchedBlogs = res.data.blogs || [];
        setBlogs(fetchedBlogs);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
        }
        if (fetchedBlogs.length > 0) {
          setSelectedBlog((prev) => {
            if (prev) {
              const matched = fetchedBlogs.find(
                (b) => b.slug === prev.slug || b._id === prev._id
              );
              if (matched) return matched;
            }
            return fetchedBlogs[0];
          });
        } else {
          setSelectedBlog(null);
        }
      }
    } catch (error) {
      console.error("Error fetching blogs", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (slug) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await api.delete(`/api/blogs/${slug}`);
      if (res.data?.success) {
        setBlogs((prev) => {
          const updated = prev.filter((b) => b.slug !== slug);
          if (selectedBlog?.slug === slug) {
            setSelectedBlog(updated[0] || null);
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Error deleting blog", error);
    }
  };

  const activeFilterCount = (gameFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || debouncedSearch.trim() !== "";

  /* ── BOTTOM SHEET FILTER DRAWER ── */
  const sheetContent = (
    <AnimatePresence>
      {showFilters && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowFilters(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-[9999]"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-md bg-[var(--card)] border-t sm:border border-[var(--border)] rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 pb-8 sm:pb-5 z-[10000] max-h-[85vh] overflow-y-auto"
          >
            {/* Drag Handle */}
            <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]/60">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[var(--accent)]" />
                <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">Filter Articles</span>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full border border-[var(--accent)]/20">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setGameFilter("all");
                      setTypeFilter("all");
                    }}
                    className="text-[11px] font-semibold text-[var(--muted)] hover:text-rose-400 transition-colors cursor-pointer mr-1"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setShowFilters(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Section 1: Game Filter */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1.5">
                <span>Select Game</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GAME_OPTIONS.map((g) => {
                  const isSelected = gameFilter === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGameFilter(g.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-2xs font-bold"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Section 2: Content Type */}
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1.5">
                <span>Article Type</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TYPE_OPTIONS.map((t) => {
                  const isSelected = typeFilter === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTypeFilter(t.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-2xs font-bold"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply Action Button */}
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
    <div className="space-y-3 pb-8 animate-in fade-in duration-300">
      {/* ── HEADER / TOOLBAR (ROW 1) ── */}
      <div className="flex items-center justify-end gap-3 pb-2.5 border-b border-[var(--border)]/70">
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchBlogs}
            disabled={loading}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Refresh blogs"
          >
            <RefreshCcw size={12} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>

          {/* New Blog CTA Button */}
          <button
            type="button"
            aria-label="New Blog"
            title="New Blog"
            onClick={() => router.push("/owner-panal/blogs/new")}
            style={{ color: "#ffffff" }}
            className="h-7 px-2.5 rounded-lg bg-[var(--accent)] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1 shadow-2xs active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus size={13} color="#ffffff" style={{ color: "#ffffff" }} className="stroke-[2.5]" />
            <span className="hidden sm:inline">New Blog</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER ROW (ROW 2) ── */}
      <div className="flex items-center gap-2 w-full">
        <SearchInput
          value={searchQuery}
          onChange={(val) => {
            setCurrentPage(1);
            setSearchQuery(val);
          }}
          placeholder="Search by title, game, or slug..."
          loading={loading}
          variant="pill"
          className="flex-1"
        />

        {/* Filter Trigger Button */}
        <button
          type="button"
          aria-label="Filter blogs"
          title="Filters"
          onClick={() => setShowFilters(true)}
          className={`w-8.5 h-8.5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 relative ${
            activeFilterCount > 0
              ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-2xs"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
          }`}
        >
          <Filter size={13} style={{ color: activeFilterCount > 0 ? "#ffffff" : undefined }} />
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
              setGameFilter("all");
              setTypeFilter("all");
              setSearchQuery("");
            }}
            className="px-2 h-8.5 rounded-full text-rose-500 hover:bg-rose-500/10 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── MOBILE / TABLET VIEW SWITCHER (< lg) ── */}
      <div className="flex lg:hidden items-center p-1 rounded-xl bg-[var(--card)] border border-[var(--border)] gap-1">
        <button
          type="button"
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === "list"
              ? "bg-[var(--accent)] text-white shadow-2xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Layers size={13} />
          <span>Articles ({blogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === "preview"
              ? "bg-[var(--accent)] text-white shadow-2xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Smartphone size={13} />
          <span>Mobile Preview</span>
          {selectedBlog && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>
      </div>

      {/* ── MAIN CONTENT: COMPACT LIST (LEFT) + MOBILE SCREEN PREVIEW (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ── LEFT COLUMN: COMPACT BLOGS LIST ── */}
        <div className={`space-y-2 lg:col-span-7 xl:col-span-7 ${mobileTab === "preview" ? "hidden lg:block" : "block"}`}>
          {loading && blogs.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2">
              <LoadingSpinner size="md" color="accent" />
              <p className="text-xs text-[var(--muted)] font-medium">Loading articles...</p>
            </div>
          ) : blogs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Blogs Found"
              description="Try adjusting your filters or search query."
              size="sm"
              variant="card"
            />
          ) : (
            <div className="space-y-1.5">
              {blogs.map((blog) => {
                const isSelected = selectedBlog?.slug === blog.slug || selectedBlog?._id === blog._id;
                return (
                  <div
                    key={blog._id || blog.slug}
                    onClick={() => {
                      setSelectedBlog(blog);
                    }}
                    className={`rounded-xl border transition-all p-2 sm:p-2.5 flex items-center justify-between gap-2.5 cursor-pointer group select-none ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)]/[0.06] shadow-xs ring-1 ring-[var(--accent)]/30"
                        : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/40 hover:bg-[var(--foreground)]/[0.015]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Compact Thumbnail */}
                      <div className="w-11 h-9 sm:w-13 sm:h-9.5 shrink-0 rounded-lg overflow-hidden bg-[var(--foreground)]/[0.05] border border-[var(--border)]/60 relative">
                        <img
                          src={blog.image || "/placeholder.jpg"}
                          alt={blog.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>

                      {/* Blog Info */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h3
                          className={`text-xs sm:text-[13px] font-bold leading-snug line-clamp-1 transition-colors ${
                            isSelected
                              ? "text-[var(--accent)]"
                              : "text-[var(--foreground)] group-hover:text-[var(--accent)]"
                          }`}
                        >
                          {blog.title}
                        </h3>

                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-[var(--muted)]">
                          <span className="uppercase font-extrabold text-[8.5px] text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.2 rounded border border-[var(--accent)]/20">
                            {blog.game}
                          </span>
                          <span className="font-medium text-[var(--foreground)]/70">{blog.type}</span>
                          <span>•</span>
                          <span>{new Date(blog.createdAt || blog.publishedAt).toLocaleDateString()}</span>
                          {isSelected && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 ml-auto">
                              ● Previewing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="flex items-center gap-0.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/blog/${blog.game}/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6.5 h-6.5 rounded-lg text-[var(--muted)] hover:text-emerald-400 hover:bg-[var(--foreground)]/[0.06] transition-all flex items-center justify-center cursor-pointer"
                        title="View live blog"
                      >
                        <ExternalLink size={12} />
                      </Link>
                      <Link
                        href={`/owner-panal/blogs/${blog.slug}`}
                        className="w-6.5 h-6.5 rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] transition-all flex items-center justify-center cursor-pointer"
                        title="Edit blog"
                      >
                        <Edit3 size={12} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteBlog(blog.slug)}
                        className="w-6.5 h-6.5 rounded-lg text-[var(--muted)] hover:text-rose-400 hover:bg-[var(--foreground)]/[0.06] transition-all flex items-center justify-center cursor-pointer"
                        title="Delete blog"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Pagination Controls */}
              <div className="pt-2">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  size="sm"
                  hideOnSinglePage
                />
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: MOBILE SCREEN PREVIEW (PROPER SIZE) ── */}
        <div className={`lg:col-span-5 xl:col-span-5 lg:sticky lg:top-4 self-start ${mobileTab === "list" ? "hidden lg:block" : "block"}`}>
          
          {/* Preview Controls Bar */}
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-1.5">
              <Smartphone size={14} className="text-[var(--accent)]" />
              <span className="text-xs font-bold text-[var(--foreground)]">Mobile Preview</span>
              <span className="text-[9.5px] font-mono text-[var(--muted)] bg-[var(--foreground)]/[0.04] px-1.5 py-0.5 rounded border border-[var(--border)]">
                375 × 680
              </span>
            </div>

            {/* Mode Switcher: Live Page vs Reader */}
            <div className="flex items-center p-0.5 rounded-lg bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-[10px]">
              <button
                type="button"
                onClick={() => setPreviewMode("live")}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  previewMode === "live"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                title="View live site in mobile viewport"
              >
                <Globe size={10} />
                <span>Live</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("reader")}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  previewMode === "reader"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                title="Instant reader content preview"
              >
                <BookOpen size={10} />
                <span>Reader</span>
              </button>
            </div>
          </div>

          {/* Device Mockup Frame (Standard 375px mobile viewport) */}
          <div className="w-full max-w-[375px] mx-auto">
            <div className="relative mx-auto w-full h-[680px] bg-slate-950 rounded-[44px] p-2.5 shadow-2xl border-[4px] border-slate-800 ring-1 ring-white/10 flex flex-col select-none">
              
              {/* Hardware Dynamic Island Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              </div>

              {/* Inner Mobile Screen Canvas */}
              <div className="relative w-full h-full bg-[var(--background)] rounded-[34px] overflow-hidden flex flex-col border border-white/5">
                
                {/* Mobile Status Bar */}
                <div className="h-8 px-5 pt-1 flex items-center justify-between text-[11px] font-semibold text-[var(--foreground)]/80 shrink-0 z-30 select-none">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-bold text-[9px]">5G</span>
                    <svg className="w-3 h-3 fill-current opacity-80" viewBox="0 0 24 24">
                      <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4z" />
                    </svg>
                    <div className="w-4 h-2.5 border border-current rounded-[2px] p-[1px] flex items-center">
                      <div className="w-2.5 h-full bg-current rounded-[0.5px]" />
                    </div>
                  </div>
                </div>

                {/* Mobile Browser Address Bar */}
                <div className="px-2.5 pb-2 pt-0.5 shrink-0 border-b border-[var(--border)]/60 bg-[var(--card)]/90 backdrop-blur-xs flex items-center gap-1.5">
                  <div className="flex-1 h-7 px-2.5 rounded-lg bg-[var(--foreground)]/[0.04] border border-[var(--border)] flex items-center justify-between gap-1 text-[11px] min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden text-[var(--muted)]">
                      <Lock size={10} className="shrink-0 text-emerald-500" />
                      <span className="truncate text-[9.5px] font-medium text-[var(--foreground)]/80">
                        {selectedBlog
                          ? `mlbbtopup.in/blog/${selectedBlog.game}/${selectedBlog.slug}`
                          : "mlbbtopup.in/blog"}
                      </span>
                    </div>
                  </div>

                  {/* Reload Preview */}
                  <button
                    type="button"
                    onClick={() => {
                      setIframeLoading(true);
                      setIframeKey((k) => k + 1);
                    }}
                    className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] flex items-center justify-center transition-all cursor-pointer shrink-0"
                    title="Reload mobile preview"
                  >
                    <RotateCw size={11} className={iframeLoading ? "animate-spin text-[var(--accent)]" : ""} />
                  </button>

                  {/* Open Live Link */}
                  {selectedBlog && (
                    <Link
                      href={`/blog/${selectedBlog.game}/${selectedBlog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] flex items-center justify-center transition-all shrink-0"
                      title="Open in new window"
                    >
                      <ExternalLink size={11} />
                    </Link>
                  )}
                </div>

                {/* Mobile Screen Viewport */}
                <div className="relative flex-1 w-full h-full bg-[var(--background)] overflow-hidden">
                  {!selectedBlog ? (
                    <div className="flex-1 h-full flex flex-col items-center justify-center p-6 text-center text-[var(--muted)]">
                      <Smartphone size={32} className="text-[var(--muted)]/30 mb-2 stroke-1" />
                      <p className="text-xs font-semibold text-[var(--foreground)]/70">No Article Selected</p>
                      <p className="text-[10px] text-[var(--muted)] mt-1 max-w-[200px]">
                        Click any blog in the left list to see its mobile screen preview
                      </p>
                    </div>
                  ) : previewMode === "live" ? (
                    /* LIVE IFRAME VIEW */
                    <div className="relative w-full h-full">
                      {iframeLoading && (
                        <div className="absolute inset-0 bg-[var(--background)]/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                          <LoadingSpinner size="sm" color="accent" />
                          <span className="text-[10px] font-medium text-[var(--muted)]">Loading mobile preview...</span>
                        </div>
                      )}
                      <iframe
                        key={`${selectedBlog.slug}-${iframeKey}`}
                        src={`/blog/${selectedBlog.game}/${selectedBlog.slug}`}
                        onLoad={() => setIframeLoading(false)}
                        className="w-full h-full border-0 select-text"
                        title={selectedBlog.title}
                      />
                    </div>
                  ) : (
                    /* QUICK READER VIEW */
                    <div className="w-full h-full overflow-y-auto custom-scrollbar p-3.5 space-y-3 bg-[var(--background)] select-text text-left">
                      {selectedBlog.image && (
                        <div className="w-full h-36 rounded-xl overflow-hidden border border-[var(--border)]/60 bg-[var(--card)] relative">
                          <img
                            src={selectedBlog.image}
                            alt={selectedBlog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="uppercase font-extrabold text-[8.5px] text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded border border-[var(--accent)]/20">
                            {selectedBlog.game}
                          </span>
                          <span className="text-[10px] font-medium text-[var(--foreground)]/80">{selectedBlog.type}</span>
                          <span className="text-[10px] text-[var(--muted)]">•</span>
                          <span className="text-[10px] text-[var(--muted)]">
                            {new Date(selectedBlog.createdAt || selectedBlog.publishedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h2 className="text-sm font-black text-[var(--foreground)] leading-snug">
                          {selectedBlog.title}
                        </h2>

                        {selectedBlog.excerpt && (
                          <p className="text-[11px] text-[var(--muted)] italic leading-relaxed border-l-2 border-[var(--accent)]/50 pl-2">
                            {selectedBlog.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Content rendering */}
                      <div className="border-t border-[var(--border)]/60 pt-2.5">
                        {selectedBlog.content ? (
                          <div
                            className="text-xs text-[var(--foreground)]/90 leading-relaxed space-y-2 whitespace-pre-wrap font-sans"
                            dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                          />
                        ) : (
                          <p className="text-xs text-[var(--muted)] italic">No content available for this post.</p>
                        )}
                      </div>

                      {/* Tags */}
                      {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                        <div className="pt-2 border-t border-[var(--border)]/40 flex flex-wrap gap-1">
                          {selectedBlog.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[9px] font-semibold text-[var(--muted)] bg-[var(--foreground)]/[0.03] px-2 py-0.5 rounded-md border border-[var(--border)]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Home Indicator Bar */}
                <div className="py-1.5 flex justify-center shrink-0 bg-[var(--card)]/90 border-t border-[var(--border)]/30">
                  <div className="w-28 h-1 bg-slate-500/50 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── PORTAL MOUNTED BOTTOM SHEET ── */}
      {mounted && typeof document !== "undefined"
        ? createPortal(sheetContent, document.body)
        : null}
    </div>
  );
}
