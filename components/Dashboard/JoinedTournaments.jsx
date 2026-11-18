"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FiAward, FiLock, FiInfo, FiX, FiCheckCircle, FiClock,
  FiChevronRight, FiUsers, FiUser, FiZap, FiShield, FiHelpCircle,
  FiStar, FiCalendar, FiCopy, FiCheck
} from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";
import Image from "next/image";
import Link from "next/link";
import { TableRowSkeleton } from "@/components/Skeleton/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge, CopyButton, EmptyState, Pagination, SectionTitle } from "@/components/common";
import { Icons } from "@/components/icons";
import { formatDate, formatTime, formatCoins } from "@/utils";

const ITEMS_PER_PAGE = 6;

const GAME_META = {
  mlbb:     { name: "Mobile Legends", logo: "/logoBB.png" },
  freefire: { name: "Free Fire",      logo: "/logoBB.png" },
  codm:     { name: "COD Mobile",     logo: "/logoBB.png" },
  honorkings:{ name: "Honor of Kings", logo: "/logoBB.png" },
};

export default function JoinedTournaments({ hideTitle = false }) {
  const [entries, setEntries] = useState([]);
  const [availableTourneys, setAvailableTourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' | 'upcoming' | 'active' | 'ended' | 'available'

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("app-sheet-toggle", { detail: { isOpen: Boolean(selectedEntry) } }));
  }, [selectedEntry]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [entriesRes, tourneysRes] = await Promise.all([
          token
            ? fetch("/api/tournaments/register", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json())
            : Promise.resolve({ data: [] }),
          fetch("/api/tournaments").then((r) => r.json())
        ]);

        if (entriesRes.success) setEntries(entriesRes.data || []);
        else setEntries([]);

        if (tourneysRes.success) setAvailableTourneys(tourneysRes.data?.filter((t) => t.status !== "ended") || []);
        else setAvailableTourneys([]);
      } catch {
        setEntries([]);
        setAvailableTourneys([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = entries.length;
    const won = entries.filter((e) => e.isWinner).length;
    const active = entries.filter(
      (e) => !e.isWinner && !e.isEliminated && e.tournamentId?.status === "ongoing"
    ).length;
    const upcoming = entries.filter(
      (e) => !e.isWinner && !e.isEliminated && (e.tournamentId?.status === "upcoming" || e.tournamentId?.status === "open")
    ).length;
    const ended = entries.filter(
      (e) => e.isWinner || e.isEliminated || e.tournamentId?.status === "ended"
    ).length;
    const available = availableTourneys.length;
    return { total, won, active, upcoming, ended, available };
  }, [entries, availableTourneys]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (filter === "upcoming") {
      return entries.filter(
        (e) => !e.isWinner && !e.isEliminated && (e.tournamentId?.status === "upcoming" || e.tournamentId?.status === "open")
      );
    }
    if (filter === "active") {
      return entries.filter(
        (e) => !e.isWinner && !e.isEliminated && e.tournamentId?.status === "ongoing"
      );
    }
    if (filter === "ended") {
      return entries.filter(
        (e) => e.isWinner || e.isEliminated || e.tournamentId?.status === "ended"
      );
    }
    if (filter === "won") {
      return entries.filter((e) => e.isWinner);
    }
    return entries;
  }, [entries, filter]);

  const totalPages = Math.ceil(
    (filter === "available" ? availableTourneys.length : filteredEntries.length) / ITEMS_PER_PAGE
  );
  const currentItems =
    filter === "available"
      ? availableTourneys.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
      : filteredEntries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatusInfo = (entry) => {
    if (entry.isWinner) return { status: "completed", label: "🏆 Winner" };
    if (entry.isEliminated) return { status: "failed", label: "Eliminated" };
    if (entry.tournamentId?.status === "ongoing") return { status: "active", label: `Live · Round ${entry.currentRound || 1}` };
    if (entry.tournamentId?.status === "upcoming") return { status: "upcoming", label: `Upcoming · Round ${entry.currentRound || 1}` };
    return { status: "active", label: `Round ${entry.currentRound || 1}` };
  };

  if (loading) return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 sm:h-16 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--card)] animate-pulse" />
        ))}
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-[var(--border)]/20 animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {!hideTitle && (
        <SectionTitle
          subtitle="COMPETITIVE ARENA"
          title="MY TOURNAMENTS"
          icon={<GiTrophy className="text-[var(--accent)]" size={13} />}
          description="View your enrolled matches, live room credentials, and match history."
          className="mb-1"
        />
      )}

      {/* ── STATS OVERVIEW (COMPACT 4-COL ROW) ── */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
        {/* Total Joined */}
        <div
          onClick={() => { setFilter("all"); setCurrentPage(1); }}
          className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            filter === "all" ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[6.5px] sm:text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/60">Joined</span>
            <FiAward className="text-[var(--muted)]/40 hidden sm:block" size={12} />
          </div>
          <p className="text-sm sm:text-xl font-black text-[var(--foreground)] mt-0.5">{stats.total}</p>
        </div>

        {/* Upcoming */}
        <div
          onClick={() => { setFilter("upcoming"); setCurrentPage(1); }}
          className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            filter === "upcoming" ? "border-amber-500 bg-amber-500/15" : "border-amber-500/25 bg-amber-500/5 hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[6.5px] sm:text-[8px] font-black uppercase tracking-widest text-amber-400">Upcoming</span>
            <FiClock className="text-amber-400 hidden sm:block" size={12} />
          </div>
          <p className="text-sm sm:text-xl font-black text-amber-400 mt-0.5">{stats.upcoming}</p>
        </div>

        {/* Active / Live */}
        <div
          onClick={() => { setFilter("active"); setCurrentPage(1); }}
          className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            filter === "active" ? "border-emerald-500 bg-emerald-500/15" : "border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[6.5px] sm:text-[8px] font-black uppercase tracking-widest text-emerald-400">Active</span>
            <FiZap className="text-emerald-400 hidden sm:block" size={12} />
          </div>
          <p className="text-sm sm:text-xl font-black text-emerald-400 mt-0.5">{stats.active}</p>
        </div>

        {/* Ended */}
        <div
          onClick={() => { setFilter("ended"); setCurrentPage(1); }}
          className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            filter === "ended" ? "border-purple-500 bg-purple-500/15" : "border-purple-500/25 bg-purple-500/5 hover:border-purple-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[6.5px] sm:text-[8px] font-black uppercase tracking-widest text-purple-400">Ended</span>
            <GiTrophy className="text-purple-400 hidden sm:block" size={13} />
          </div>
          <p className="text-sm sm:text-xl font-black text-purple-400 mt-0.5">{stats.ended}</p>
        </div>
      </div>

      {/* ── HOW TO PLAY INFO (COMPACT STRIP) ── */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 sm:py-2 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5">
        <div className="flex items-center gap-2 min-w-0">
          <FiInfo size={11} className="text-[var(--accent)] shrink-0" />
          <p className="text-[7.5px] sm:text-[8.5px] text-[var(--muted)]/70 font-bold uppercase tracking-wide truncate">
            Room credentials appear <span className="text-[var(--accent)] font-black">15–30 mins</span> prior to match start
          </p>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex items-center justify-between gap-2 pt-0.5 border-b border-[var(--border)] pb-2">
        <div
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        >
          {[
            { id: "all", label: "Joined", count: stats.total },
            { id: "upcoming", label: "Upcoming", count: stats.upcoming },
            { id: "active", label: "Active", count: stats.active },
            { id: "ended", label: "Ended", count: stats.ended },
            { id: "available", label: "Available", count: stats.available },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setFilter(t.id); setCurrentPage(1); }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === t.id
                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                  : "bg-[var(--card)] text-[var(--muted)]/60 border border-[var(--border)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
        <span className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]/40 shrink-0 hidden md:inline">
          Showing {filter === "available" ? availableTourneys.length : filteredEntries.length}
        </span>
      </div>

      {/* ── AVAILABLE TOURNAMENTS LIST (WHEN 'AVAILABLE' TAB CLICKED) ── */}
      {filter === "available" ? (
        availableTourneys.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/50">No available tournaments right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentItems.map((t) => {
              const gameKey = (t.game || "mlbb").toLowerCase();
              const meta = GAME_META[gameKey] || { name: gameKey.toUpperCase(), logo: "/logoBB.png" };
              const isJoined = entries.some((e) => (e.tournamentId?._id || e.tournamentId) === t._id);
              const isFree = t.entryCoins === 0;

              return (
                <div
                  key={t._id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3.5 sm:p-4 hover:border-[var(--accent)]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--border)] shrink-0 bg-[var(--background)]">
                      <Image src={meta.logo} alt={meta.name} width={40} height={40} className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight text-[var(--foreground)] truncate">
                          {t.title}
                        </p>
                        <span className="px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-[7px] font-black uppercase">
                          {t.format}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[8px] text-[var(--muted)]/60 font-bold uppercase">
                        <span className="text-amber-500">🏆 {t.prize}</span>
                        <span>👥 {t.slotsFilled || 0}/{t.slots} slots</span>
                        {t.startsAt && <span>⏰ {formatDate(t.startsAt)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${
                      isFree ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]"
                    }`}>
                      {isFree ? "Free Entry" : formatCoins(t.entryCoins)}
                    </span>

                    {isJoined ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <FiCheck size={10} /> Registered
                      </span>
                    ) : (
                      <Link
                        href={`/tournament/${t.game || "mlbb"}?id=${t._id}`}
                        style={{ color: "#ffffff" }}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] !text-white text-[8px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
                      >
                        Join <FiChevronRight size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ── JOINED / ACTIVE / UPCOMING / ENDED LIST ── */
        filteredEntries.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/50">
              No {filter !== "all" ? filter : ""} tournaments found
            </p>
            <button
              onClick={() => { setFilter("available"); setCurrentPage(1); }}
              className="px-3.5 py-1.5 rounded-xl border border-[var(--accent)]/30 text-[8px] font-black uppercase tracking-widest text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all"
            >
              Browse Available Tournaments →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {currentItems.map((entry, idx) => {
                const statusInfo = getStatusInfo(entry);
                const gameKey = (entry.tournamentId?.game || "mlbb").toLowerCase();
                const meta = GAME_META[gameKey] || { name: gameKey.toUpperCase(), logo: "/logoBB.png" };
                const roomId = entry.assignedRoomId || entry.tournamentId?.roomId;
                const hasRoom = Boolean(roomId);

                return (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setSelectedEntry(entry)}
                    className="group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3.5 sm:p-4 hover:border-[var(--accent)]/40 transition-all duration-200 cursor-pointer shadow-sm space-y-3"
                  >
                    {/* Top row: Game + Title + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--border)] shrink-0 bg-[var(--background)]">
                          <Image src={meta.logo} alt={meta.name} width={40} height={40} className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight text-[var(--foreground)] truncate">
                              {entry.teamName ? entry.teamName : (entry.tournamentId?.title || "Tournament Match")}
                            </p>
                            <span className="px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[7px] font-bold text-[var(--muted)] uppercase shrink-0">
                              {entry.tournamentId?.format || "1v1"}
                            </span>
                          </div>
                          <p className="text-[7.5px] text-[var(--muted)]/50 font-bold uppercase tracking-widest mt-0.5 truncate">
                            {entry.teamName ? `${entry.tournamentId?.title || "Scrim"} · ` : ""}{meta.name}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={statusInfo.status}
                        label={statusInfo.label}
                        size="xs"
                      />
                    </div>

                    {/* Middle row: Prize + Match Time + Room Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[var(--border)]/60 text-[8px]">
                      {/* Prize */}
                      <div className="flex items-center gap-1.5 text-[var(--muted)]">
                        <GiTrophy size={12} className="text-amber-500 shrink-0" />
                        <span className="font-bold uppercase text-[var(--muted)]/60">Prize:</span>
                        <span className="font-black text-[var(--foreground)] uppercase truncate">
                          {entry.tournamentId?.prize || "Weekly Pass"}
                        </span>
                      </div>

                      {/* Start Time */}
                      <div className="flex items-center gap-1.5 text-[var(--muted)]">
                        <FiClock size={11} className="text-[var(--accent)] shrink-0" />
                        <span className="font-bold uppercase text-[var(--muted)]/60">Time:</span>
                        <span className="font-black text-[var(--foreground)] uppercase truncate">
                          {entry.tournamentId?.startsAt ? `${formatTime(entry.tournamentId.startsAt)} · ${formatDate(entry.tournamentId.startsAt)}` : "Schedule TBA"}
                        </span>
                      </div>

                      {/* Room Info */}
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        {hasRoom ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono font-bold text-[7.5px] uppercase">
                            <FiLock size={8} /> Room Ready: {roomId}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--border)]/30 border border-[var(--border)] text-[var(--muted)]/50 font-bold text-[7px] uppercase">
                            <FiClock size={8} /> Room Details TBA
                          </span>
                        )}
                        <div className="w-6 h-6 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:bg-[var(--accent)] group-hover:text-white group-hover:border-[var(--accent)] transition-all shrink-0">
                          <FiChevronRight size={12} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )
      )}

      {/* ── PAGINATION ── */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={filteredEntries.length}
        itemLabel="Tournaments"
        onPageChange={setCurrentPage}
        hideOnSinglePage
        size="sm"
      />

      {/* ── DETAIL BOTTOM SHEET / MODAL ── */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            {/* Sheet Container */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-[460px] rounded-t-3xl sm:rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden max-h-[88vh] sm:max-h-[90vh] flex flex-col z-10"
            >
              {/* Drag / Pull handle for mobile sheet */}
              <div className="sm:hidden flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1 rounded-full bg-[var(--muted)]/30" />
              </div>

              {/* Sheet header */}
              <div className="flex items-center justify-between px-4 py-3 sm:p-4 border-b border-[var(--border)] bg-[var(--card)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[var(--border)] shrink-0 bg-[var(--background)] flex items-center justify-center">
                    <Image
                      src={
                        (selectedEntry.tournamentId?.game || "").toLowerCase() === "mlbb"
                          ? "/game-assets/mlbbindia.webp"
                          : GAME_META[(selectedEntry.tournamentId?.game || "mlbb").toLowerCase()]?.logo || "/logoBB.png"
                      }
                      alt="Game"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                      onError={(e) => { e.currentTarget.src = "/logoBB.png"; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[7.5px] font-black uppercase tracking-widest text-[var(--accent)]">
                        {GAME_META[(selectedEntry.tournamentId?.game || "mlbb").toLowerCase()]?.name || "MLBB"}
                      </span>
                      <span className="text-[7.5px] font-bold uppercase tracking-widest text-[var(--muted)]/60">
                        · {selectedEntry.tournamentId?.format || "1v1"}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-[var(--foreground)] truncate mt-0.5">
                      {selectedEntry.teamName || selectedEntry.tournamentId?.title || "Tournament Match"}
                    </h3>
                  </div>
                </div>
                <button
                  aria-label="Close"
                  onClick={() => setSelectedEntry(null)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 transition-colors shrink-0 ml-2"
                >
                  <FiX size={13} />
                </button>
              </div>

              {/* Modal scrollable body */}
              <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-[var(--card)]">

                {/* Status Callout Banner */}
                {selectedEntry.isWinner ? (
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3">
                    <GiTrophy size={18} className="text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[9.5px] font-black uppercase text-amber-400 tracking-tight">🏆 Match Champion!</p>
                      <p className="text-[7.5px] text-amber-400/80 font-bold uppercase tracking-wide mt-0.5">
                        Congratulations! Your prize has been verified and awarded.
                      </p>
                    </div>
                  </div>
                ) : selectedEntry.isEliminated ? (
                  <div className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center gap-2">
                    <FiShield size={13} className="text-rose-400 shrink-0" />
                    <p className="text-[8px] text-rose-400/90 font-bold uppercase tracking-wide">
                      Match concluded · Eliminated in Round {selectedEntry.currentRound || 1}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-400">
                        Active In Tournament
                      </span>
                    </div>
                    <span className="text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Round {selectedEntry.currentRound || 1}
                    </span>
                  </div>
                )}

                {/* ── ROOM CREDENTIALS BOX ── */}
                <div className="p-3.5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiLock size={12} className="text-[var(--accent)]" />
                      <span className="text-[8.5px] font-black uppercase tracking-widest text-[var(--foreground)]">
                        Game Room Credentials
                      </span>
                    </div>
                    {Boolean(selectedEntry.assignedRoomId || selectedEntry.tournamentId?.roomId) && (
                      <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Live Room
                      </span>
                    )}
                  </div>

                  {selectedEntry.assignedRoomId || selectedEntry.tournamentId?.roomId ? (
                    <div className="space-y-2">
                      {[
                        { label: "Room ID", value: selectedEntry.assignedRoomId || selectedEntry.tournamentId?.roomId, key: "roomId" },
                        { label: "Room Password", value: selectedEntry.assignedRoomPassword || selectedEntry.tournamentId?.roomPassword || "None", key: "roomPass" },
                      ].map(({ label, value, key }) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                          <div>
                            <p className="text-[6.5px] font-black uppercase tracking-widest text-[var(--muted)]/50">{label}</p>
                            <p className="text-xs font-mono font-black text-[var(--foreground)] mt-0.5">{value}</p>
                          </div>
                          {value && value !== "None" && (
                            <CopyButton text={String(value)} size="sm" variant="ghost" />
                          )}
                        </div>
                      ))}
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--background)]/40 border border-[var(--border)]/50 text-[7px] text-[var(--muted)]/70 font-bold uppercase tracking-wide">
                        <FiClock size={10} className="text-amber-400 shrink-0" />
                        <span>Open Game → Custom Lobby → Enter Room ID &amp; Password</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 px-3 border border-dashed border-[var(--accent)]/25 rounded-xl bg-[var(--background)]/40 space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-[var(--foreground)]">Room Not Ready Yet</p>
                      <p className="text-[7px] text-[var(--muted)]/60 font-bold uppercase tracking-wide">
                        Room ID &amp; password will be posted here 15–30 minutes before match start.
                      </p>
                    </div>
                  )}
                </div>

                {/* ── MATCH OVERVIEW GRID ── */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-0.5">
                    <p className="text-[6.5px] font-black uppercase tracking-widest text-[var(--muted)]/40">Prize Pool</p>
                    <p className="text-[9.5px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                      <GiTrophy size={11} /> {selectedEntry.tournamentId?.prize || "Weekly Pass"}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-0.5">
                    <p className="text-[6.5px] font-black uppercase tracking-widest text-[var(--muted)]/40">Entry Paid</p>
                    <p className="text-[9.5px] font-black uppercase text-[var(--foreground)]">
                      {selectedEntry.coinsPaid === 0 ? "Free Entry" : formatCoins(selectedEntry.coinsPaid)}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-0.5">
                    <p className="text-[6.5px] font-black uppercase tracking-widest text-[var(--muted)]/40">Match Schedule</p>
                    <p className="text-[8.5px] font-black text-[var(--foreground)] uppercase truncate">
                      {selectedEntry.tournamentId?.startsAt ? formatTime(selectedEntry.tournamentId.startsAt) : "TBA"}
                    </p>
                    <p className="text-[6.5px] text-[var(--muted)]/50 uppercase">
                      {selectedEntry.tournamentId?.startsAt ? formatDate(selectedEntry.tournamentId.startsAt) : "Date TBA"}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-0.5">
                    <p className="text-[6.5px] font-black uppercase tracking-widest text-[var(--muted)]/40">Registered On</p>
                    <p className="text-[8.5px] font-black text-[var(--foreground)] uppercase truncate">
                      {selectedEntry.createdAt ? formatDate(selectedEntry.createdAt) : "Recently"}
                    </p>
                    <p className="text-[6.5px] text-[var(--muted)]/50 uppercase">
                      {selectedEntry.createdAt ? formatTime(selectedEntry.createdAt) : ""}
                    </p>
                  </div>
                </div>

                {/* ── ROSTER / GAME IDS ── */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/50">
                      Player Game IDs ({selectedEntry.gameIds?.length || 0})
                    </p>
                    {selectedEntry.teamName && (
                      <span className="text-[7px] font-bold text-[var(--accent)] uppercase">
                        Team: {selectedEntry.teamName}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                    {selectedEntry.gameIds?.map((id, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FiUser size={10} className="text-[var(--muted)]/40 shrink-0" />
                          <span className="text-[7px] font-bold uppercase text-[var(--muted)]/50">P{i + 1}:</span>
                          <span className="text-[8.5px] font-mono font-bold text-[var(--foreground)] truncate">{id}</span>
                        </div>
                        <CopyButton text={id} size="xs" variant="ghost" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── HELP / SUPPORT LINK ── */}
                <div className="pt-1 pb-4 sm:pb-1 text-center">
                  <Link
                    href="/dashboard/support"
                    className="inline-flex items-center gap-1.5 text-[8.5px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline opacity-80 hover:opacity-100 transition-opacity py-1 px-3 rounded-lg hover:bg-[var(--accent)]/5"
                  >
                    <FiHelpCircle size={11} /> Need Match Assistance? Contact Support
                  </Link>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
