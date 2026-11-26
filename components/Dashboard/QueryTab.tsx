"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPhoneAlt,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import { FiChevronDown, FiZap, FiTarget, FiMail, FiRefreshCw, FiClock, FiCheckCircle, FiAlertCircle, FiList } from "react-icons/fi";
import { QuerySkeleton } from "../Skeleton/Skeleton";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { StatusBadge, Pagination, LoadingSpinner, EmptyState, SectionTitle } from "@/components/common";
import { Icons } from "@/components/icons";
import { formatDateTime } from "@/utils";

const SUPPORT_CONFIG = {
  header: {
    title: "Support",
    highlight: "Help",
    subtitle: "How can we help you today?",
  },
  contacts: {
    title: "Contact Us",
    items: [
      { id: "phone", title: "Phone", value: `+91 ${process.env.NEXT_PUBLIC_SUPPORT_PHONE}`, href: `tel:+91${process.env.NEXT_PUBLIC_SUPPORT_PHONE}`, icon: <FaPhoneAlt /> },
      { id: "instagram", title: "Instagram", value: "@mlbbtopup.in", href: "https://www.instagram.com/mlbbtopup.in", icon: <FaInstagram /> },
      { id: "whatsapp", title: "WhatsApp", value: "Chat now", href: "https://whatsapp.com/channel/0029Vb87jgR17En1n5PKy129", icon: <FaWhatsapp /> },
    ],
  },
  queryTypes: ["Order Issue", "Payment Failure", "Wallet Issue", "General"],
};

type Query = {
  _id: string;
  type: string;
  message: string;
  status: string;
  orderId?: string;
  adminReply?: string;
  createdAt: string;
};

export default function QueryTab() {
  const [queryType, setQueryType] = useState("");
  const [queryMessage, setQueryMessage] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [orderId, setOrderId] = useState("");
  const [querySuccess, setQuerySuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [myQueries, setMyQueries] = useState<Query[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [showMyQueries, setShowMyQueries] = useState(true);
  const [queryPage, setQueryPage] = useState(1);
  const [queryPagination, setQueryPagination] = useState({ total: 0, totalPages: 1 });
  const QUERY_LIMIT = 10;
  const hasNewReply = myQueries.some((q) => q.adminReply);

  const fetchMyQueries = useCallback(async (page = 1) => {
    const email = useAuthStore.getState().user?.email;
    if (!email) return;
    setLoadingQueries(true);
    try {
      const { data } = await api.get(
        `/api/support/query?email=${encodeURIComponent(email)}&page=${page}&limit=${QUERY_LIMIT}`
      );
      if (data.success) {
        setMyQueries(data.queries || []);
        setQueryPagination(data.pagination || { total: 0, totalPages: 1 });
      }
    } catch {
      // silently fail
    } finally {
      setLoadingQueries(false);
    }
  }, [QUERY_LIMIT]);

  // initial load + auto-refresh every 30s to pick up admin replies
  useEffect(() => {
    fetchMyQueries(queryPage);
    const interval = setInterval(() => fetchMyQueries(queryPage), 30000);
    return () => clearInterval(interval);
  }, [fetchMyQueries, queryPage]);

  const handleSubmit = async () => {
    if (!queryType || !queryMessage.trim() || !phoneNo.trim()) return;
    setIsSubmitting(true);
    const user = useAuthStore.getState().user;
    try {
      const { data } = await api.post("/api/support/query", {
        name: user?.name || null,
        email: user?.email || null,
        phoneNo: phoneNo.trim(),
        orderId: orderId.trim() || null,
        type: queryType,
        message: queryMessage,
      });
      if (data.success) {
        setQuerySuccess("Message sent.");
        setQueryType(""); setQueryMessage(""); setOrderId("");
        setShowMyQueries(true);
        setQueryPage(1);
        await fetchMyQueries(1);
      } else {
        setQuerySuccess(data.message || "Could not send message. Try again.");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Connection error. Please try again.";
      setQuerySuccess(errorMessage);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setQuerySuccess(""), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <SectionTitle
        subtitle="HELP & ASSISTANCE"
        title={SUPPORT_CONFIG.header.title}
        highlight={SUPPORT_CONFIG.header.highlight}
        description={SUPPORT_CONFIG.header.subtitle}
        pulse
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* CONTACTS */}
        <div className="space-y-4">
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted)] flex items-center gap-2">
            <FiTarget className="text-[var(--accent)]" size={10} /> {SUPPORT_CONFIG.contacts.title}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {SUPPORT_CONFIG.contacts.items.map((item, idx) => (
              <motion.a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex items-center gap-2 py-2 px-1.5 rounded-lg hover:bg-[var(--foreground)]/[0.04] transition-all"
              >
                <div className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-tight text-[var(--foreground)] truncate">{item.title}</p>
                  <p className="text-[8px] font-medium text-[var(--muted)]/70 truncate">{item.value}</p>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--accent)]/5 border border-[var(--accent)]/10 flex items-center justify-between border-dashed">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
              <span className="text-[8px] font-black tracking-widest text-[#22c55e] uppercase">We're Online</span>
            </div>
            <span className="text-[8px] font-black tracking-widest text-[var(--muted)] uppercase opacity-40">We reply in ~15 mins</span>
          </div>
        </div>

        {/* FORM */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[var(--card)]/40 border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <FiMail className="text-[var(--accent)]" size={14} />
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-[var(--foreground)]">Send Message</h3>
          </div>

          <AnimatePresence mode="wait">
            {querySuccess && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-2.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <FiZap size={10} className="animate-pulse" /> {querySuccess}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                What&apos;s your issue?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORT_CONFIG.queryTypes.map((type) => {
                  const selected = queryType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setQueryType(type)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left truncate ${
                        selected
                          ? "bg-[var(--accent)]/12 border-[var(--accent)] text-[var(--accent)] shadow-xs"
                          : "bg-[var(--background)]/50 border-[var(--border)]/60 text-[var(--foreground)]/80 hover:border-[var(--accent)]/40"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              className="w-full p-4 rounded-2xl h-24 bg-[var(--background)]/50 border border-white/5 text-[11px] font-bold tracking-wider outline-none focus:border-[var(--accent)] resize-none transition-all placeholder:text-[var(--muted)]/40 text-[var(--foreground)]"
              placeholder="Write your problem here..."
              value={queryMessage}
              onChange={(e) => setQueryMessage(e.target.value)}
            />

            <input
              type="tel"
              className="w-full p-3.5 rounded-xl bg-[var(--background)]/50 border border-white/5 text-[10px] font-black tracking-widest outline-none focus:border-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--muted)]/40"
              placeholder="Your phone number *"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              required
            />

            <input
              type="text"
              className="w-full p-3.5 rounded-xl bg-[var(--background)]/50 border border-white/5 text-[10px] font-black tracking-widest outline-none focus:border-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--muted)]/40"
              placeholder="Order ID (if you have one)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />

            <button aria-label="button"
              disabled={!queryType || !queryMessage || !phoneNo.trim() || isSubmitting}
              onClick={handleSubmit}
              className="w-full p-3.5 rounded-2xl bg-[var(--accent)] text-black font-black uppercase tracking-widest italic text-[10px] shadow-lg hover:shadow-[0_8px_16px_-4px_rgba(var(--accent-rgb),0.3)] hover:scale-[1.01] active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <LoadingSpinner size="xs" color="current" /> : "Send"}
            </button>
          </div>
        </div>
      </div>

      {/* MY QUERIES SECTION */}
      <div className="rounded-3xl bg-[var(--card)]/30 border border-white/5 overflow-hidden">
        <button aria-label="button"
          onClick={() => setShowMyQueries((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <FiList className="text-[var(--accent)]" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">My Queries</span>
            {myQueries.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-[8px] font-black">
                {myQueries.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="button"
              onClick={(e) => { e.stopPropagation(); fetchMyQueries(); }}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors text-[var(--muted)] hover:text-[var(--accent)]"
            >
              <FiRefreshCw size={12} className={loadingQueries ? "animate-spin" : ""} />
            </button>
            <FiChevronDown
              size={14}
              className={`text-[var(--muted)] transition-transform duration-200 ${showMyQueries ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        <AnimatePresence>
          {showMyQueries && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-3">
                {loadingQueries ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <QuerySkeleton key={i} />
                    ))}
                  </div>
                ) : myQueries.length === 0 ? (
                  <EmptyState
                    icon={Icons.mail}
                    title="No Queries Submitted"
                    description="Have an issue with your order? Submit a ticket above."
                    size="sm"
                  />
                ) : (
                  myQueries.map((q) => {
                    return (
                      <motion.div
                        key={q._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-[var(--background)]/50 border border-white/5 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[var(--accent)] text-[9px] font-black uppercase tracking-widest italic">{q.type}</span>
                            <p className="text-[11px] font-semibold text-[var(--foreground)] leading-snug">{q.message}</p>
                            {q.orderId && (
                              <span className="text-[8px] font-mono text-[var(--muted)] truncate">Order: {q.orderId}</span>
                            )}
                          </div>
                          <StatusBadge status={q.status} size="sm" />
                        </div>

                        {/* Admin Reply */}
                        {q.adminReply && (
                          <div className="mt-2 p-3 rounded-xl border space-y-1" style={{ background: "rgba(var(--accent-rgb, 0,200,200),0.08)", borderColor: "rgba(var(--accent-rgb, 0,200,200),0.25)" }}>
                            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-1">
                              <FiCheckCircle size={8} /> Support Reply
                            </p>
                            <p className="text-[11px] text-[var(--foreground)] leading-snug font-medium">{q.adminReply}</p>
                          </div>
                        )}
                        <p className="text-[8px] text-[var(--muted)] font-medium flex items-center gap-1">
                          <FiClock size={8} /> {formatDateTime(q.createdAt)}
                        </p>
                      </motion.div>
                    );
                  })
                )}

                {/* Pagination */}
                <div className="pt-2">
                  <Pagination
                    page={queryPage}
                    totalPages={queryPagination.totalPages}
                    totalItems={queryPagination.total}
                    itemLabel="Queries"
                    onPageChange={setQueryPage}
                    size="sm"
                    hideOnSinglePage
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
