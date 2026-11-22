"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Eye,
  EyeOff,
  RefreshCcw,
  Gamepad2,
  Link as LinkIcon,
  Type,
  ImageIcon,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { SectionTitle } from "@/components/common";

const isVideoUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
};

export default function BannersTab({ banners, onRefresh }) {
  const [form, setForm] = useState({
    bannerImage: "",
    bannerTitle: "",
    bannerSlug: "",
    bannerLink: "",
    bannerSummary: "",
    gameId: "",
    isShow: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ================= ADD / UPDATE ================= */

  const addBanner = async () => {
    if (!form.bannerImage || !form.bannerTitle || !form.bannerSlug) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          gameId: form.gameId
            ? form.gameId.split(",").map((g) => g.trim())
            : [],
        }),
      });

      if (res.ok) {
        resetForm();
        onRefresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setIsFormOpen(true);
    setForm({
      bannerImage: b.bannerImage || "",
      bannerTitle: b.bannerTitle || "",
      bannerSlug: b.bannerSlug || "",
      bannerLink: b.bannerLink || "",
      bannerSummary: b.bannerSummary || "",
      gameId: b.gameId?.join(", ") || "",
      isShow: b.isShow ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateBanner = async () => {
    if (!form.bannerSlug) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/banners/editbanner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          gameId: form.gameId
            ? form.gameId.split(",").map((g) => g.trim())
            : [],
        }),
      });

      if (res.ok) {
        resetForm();
        onRefresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShow = async (slug, isShow) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/banners/editbanner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bannerSlug: slug, isShow: !isShow }),
      });

      if (res.ok) {
        onRefresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setIsFormOpen(false);
    setForm({
      bannerImage: "",
      bannerTitle: "",
      bannerSlug: "",
      bannerLink: "",
      bannerSummary: "",
      gameId: "",
      isShow: true,
    });
  };

  return (
    <div className="space-y-3 pb-8 animate-in fade-in duration-300">

      {/* ================= COMPACT HEADER SECTION ================= */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
        <SectionTitle
          size="xs"
          subtitle="Media & Promos"
          title="Active"
          highlight="Banners"
        />
          <button aria-label="button"
            onClick={onRefresh}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-all cursor-pointer shrink-0"
            title="Refresh List"
          >
            <RefreshCcw size={12} />
          </button>
        </div>

        <button
          onClick={() => {
            if (isFormOpen) {
              resetForm();
            } else {
              setIsFormOpen(true);
            }
          }}
          className="h-7 px-2.5 rounded-lg bg-[var(--accent)] text-white text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-[var(--accent-hover)] transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Plus size={12} className={isFormOpen ? "rotate-45 transition-transform" : "transition-transform"} />
          <span>{isFormOpen ? (editingId ? "Cancel Edit" : "Close Form") : "New Banner"}</span>
        </button>
      </div>

      {/* ================= COMPACT FORM CARD (EXPANDABLE) ================= */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`relative rounded-xl border bg-[var(--card)] p-3 sm:p-4 overflow-hidden ${editingId ? "border-[var(--accent)]" : "border-[var(--border)]"}`}
          >
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${editingId ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-[var(--foreground)]/5 text-[var(--muted)]"}`}>
                  {editingId ? <Edit3 size={12} /> : <Plus size={12} />}
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] leading-none">
                    {editingId ? "Edit Banner" : "New Banner"}
                  </h3>
                  <p className="text-[8.5px] text-[var(--muted)] mt-0.5">
                    {editingId ? "Update existing banner details" : "Configure promo banner & links"}
                  </p>
                </div>
              </div>

              <div className="flex bg-[var(--foreground)]/[0.04] p-0.5 rounded-lg border border-[var(--border)]">
                <button aria-label="button"
                  onClick={() => setForm({ ...form, isShow: true })}
                  className={`px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    form.isShow ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Visible
                </button>
                <button aria-label="button"
                  onClick={() => setForm({ ...form, isShow: false })}
                  className={`px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    !form.isShow ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Hidden
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
              {/* FORM FIELDS */}
              <div className="lg:col-span-8 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Title</label>
                    <input
                      value={form.bannerTitle}
                      onChange={(e) => setForm({ ...form, bannerTitle: e.target.value })}
                      className="w-full h-8 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] text-[var(--foreground)] focus:border-[var(--accent)] outline-none font-bold placeholder:text-[var(--muted)]/40"
                      placeholder="Banner Title"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Slug</label>
                    <input
                      value={form.bannerSlug}
                      onChange={(e) => setForm({ ...form, bannerSlug: e.target.value })}
                      disabled={!!editingId}
                      className="w-full h-8 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] text-[var(--foreground)] focus:border-[var(--accent)] outline-none font-mono font-bold disabled:opacity-50 placeholder:text-[var(--muted)]/40"
                      placeholder="banner-slug"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Media URL (Image or MP4 Video)</label>
                  <input
                    value={form.bannerImage}
                    onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                    className="w-full h-8 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] text-[var(--foreground)] focus:border-[var(--accent)] outline-none font-mono placeholder:text-[var(--muted)]/40"
                    placeholder="https://... (image or .mp4 video)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Banner Link</label>
                    <input
                      value={form.bannerLink}
                      onChange={(e) => setForm({ ...form, bannerLink: e.target.value })}
                      className="w-full h-8 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] text-[var(--foreground)] focus:border-[var(--accent)] outline-none font-mono placeholder:text-[var(--muted)]/40"
                      placeholder="/games/..."
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Associated Games (comma-separated)</label>
                    <input
                      value={form.gameId}
                      onChange={(e) => setForm({ ...form, gameId: e.target.value })}
                      className="w-full h-8 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] text-[var(--foreground)] focus:border-[var(--accent)] outline-none font-bold placeholder:text-[var(--muted)]/40"
                      placeholder="mlbb, bgmi"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Summary</label>
                  <textarea
                    value={form.bannerSummary}
                    onChange={(e) => setForm({ ...form, bannerSummary: e.target.value })}
                    className="w-full h-14 bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-[11px] text-[var(--foreground)] focus:border-[var(--accent)] outline-none resize-none placeholder:text-[var(--muted)]/40 font-medium"
                    placeholder="Short description..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button aria-label="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[9px] font-black uppercase tracking-wider text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button aria-label="button"
                    onClick={editingId ? updateBanner : addBanner}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[9px] font-black uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : (editingId ? "Update Banner" : "Create Banner")}
                  </button>
                </div>
              </div>

              {/* PREVIEW PANEL */}
              <div className="lg:col-span-4 flex flex-col justify-between">
                <div>
                  <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Live Preview</label>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)] flex items-center justify-center">
                    {form.bannerImage ? (
                      <>
                        {isVideoUrl(form.bannerImage) ? (
                          <video
                            src={form.bannerImage}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={form.bannerImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <h4 className="text-white text-xs font-black leading-tight line-clamp-1">
                            {form.bannerTitle || "Title Preview"}
                          </h4>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-3 text-[var(--muted)]/40">
                        <ImageIcon size={20} className="mb-1" />
                        <p className="text-[8.5px] font-black uppercase tracking-wider">No Media URL</p>
                      </div>
                    )}
                  </div>
                </div>

                {form.bannerLink && (
                  <div className="mt-2 p-1.5 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-1.5 text-[8.5px] font-mono text-[var(--muted)] truncate">
                    <LinkIcon size={10} className="shrink-0" />
                    <span className="truncate">{form.bannerLink}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= COMPACT LIST SECTION ================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
          <AnimatePresence mode="popLayout">
            {banners?.map((b, idx) => (
              <motion.div
                key={b._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.02 }}
                className="group relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)] flex flex-col justify-between transition-colors hover:border-[var(--accent)]/40"
              >
                {/* Banner Thumbnail */}
                <div className="relative aspect-[16/9] overflow-hidden bg-[var(--background)]">
                  {isVideoUrl(b.bannerImage) ? (
                    <video
                      src={b.bannerImage}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={b.bannerImage}
                      alt={b.bannerTitle}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-1.5 right-1.5">
                    {b.isShow ? (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/90 text-[7px] font-black text-white uppercase tracking-wider backdrop-blur-md">
                        Visible
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/90 text-[7px] font-black text-white uppercase tracking-wider backdrop-blur-md">
                        Hidden
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-1.5 left-2 right-2">
                    <p className="text-[10px] sm:text-[11px] font-black text-white truncate leading-tight drop-shadow-sm">
                      {b.bannerTitle}
                    </p>
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div className="px-2 py-1.5 flex items-center justify-between gap-1.5 border-t border-[var(--border)] bg-[var(--card)]">
                  <span className="text-[8.5px] font-mono font-bold text-[var(--muted)] truncate">
                    /{b.bannerSlug}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button aria-label="button"
                      onClick={() => toggleShow(b.bannerSlug, b.isShow)}
                      disabled={isSubmitting}
                      className="w-5.5 h-5.5 rounded-md bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                      title={b.isShow ? "Hide Banner" : "Show Banner"}
                    >
                      {b.isShow ? <Eye size={11} /> : <EyeOff size={11} />}
                    </button>
                    <button aria-label="button"
                      onClick={() => startEdit(b)}
                      className="w-5.5 h-5.5 rounded-md bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center cursor-pointer"
                      title="Edit Banner"
                    >
                      <Edit3 size={11} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
    </div>
  );
}
