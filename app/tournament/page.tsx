"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAward, FiChevronRight, FiSearch,
  FiZap, FiUsers, FiStar, FiGrid, FiClock, FiLayers, FiCheck
} from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";
import Image from "next/image";
import Link from "next/link";
import { TournamentSkeleton } from "@/components/Skeleton/Skeleton";
import { StatusBadge, SectionTitle, EmptyState } from "@/components/common";
import { formatCoins, formatDateTime } from "@/utils";

interface Tournament {
  _id: string;
  game: string;
  title: string;
  subtitle?: string;
  format: string;
  prize: string;
  slots: number;
  slotsFilled: number;
  entryCoins: number;
  status: "open" | "upcoming" | "ongoing" | "closed" | "ended";
  startsAt?: string;
  winner?: string | null;
}

const GAME_META: Record<string, { name: string; tag: string; logo: string; href: string }> = {
  mlbb: {
    name: "Mobile Legends: Bang Bang",
    tag: "MLBB",
    logo: "/game-assets/mlbbindia.webp",
    href: "/tournament/mlbb",
  },
  freefire: {
    name: "Free Fire MAX",
    tag: "Free Fire",
    logo: "/logoBB.png",
    href: "/tournament/freefire",
  },
  codm: {
    name: "Call of Duty: Mobile",
    tag: "CODM",
    logo: "/logoBB.png",
    href: "/tournament/codm",
  },
};

// ── Tournament Card ─────────────────────────────────────────────────────
const TournamentCard = ({ t, isJoined }: { t: Tournament; isJoined?: boolean }) => {
  const meta = GAME_META[t.game] || {
    name: t.game.toUpperCase(),
    tag: t.game.toUpperCase(),
    logo: "/logoBB.png",
    href: `/tournament/${t.game}`,
  };
  const isFree = t.entryCoins === 0;
  const pct = Math.min(100, Math.round(((t.slotsFilled || 0) / (t.slots || 1)) * 100));
  const cardHref = isJoined ? "/dashboard/tournaments" : `${meta.href}?id=${t._id}`;

  return (
    <Link href={cardHref} className="block group h-full">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className={`h-full flex flex-col justify-between overflow-hidden rounded-2xl border bg-[var(--card)] p-5 hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all duration-200 space-y-4 ${
          isJoined ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-[var(--border)]"
        }`}
      >
        {/* Top: Game info + Status */}
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)] shrink-0 flex items-center justify-center">
                <Image
                  src={meta.logo}
                  alt={meta.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                  onError={(e: any) => {
                    e.currentTarget.src = "/logoBB.png";
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[var(--accent)] px-2 py-0.5 rounded-md bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                    {meta.tag}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    {t.format}
                  </span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight text-[var(--foreground)] truncate mt-1">
                  {t.title}
                </h3>
              </div>
            </div>
            <StatusBadge status={t.status} size="xs" />
          </div>

          {/* Match Start Time Schedule */}
          {t.startsAt && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)]/60">
              <FiClock size={12} className="text-[var(--accent)] shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                Starts: <span className="text-[var(--foreground)] font-black">{formatDateTime(t.startsAt)}</span>
              </span>
            </div>
          )}
        </div>

        {/* Middle: Prize + Slots filled bar */}
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GiTrophy size={15} className="text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--muted)]">Prize Pool</span>
                <span className="text-xs font-black uppercase tracking-tight text-amber-500">
                  {t.prize}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[8px] font-black uppercase tracking-wider text-[var(--muted)] block">Registered</span>
              <div className="flex items-center gap-1 text-[var(--foreground)] justify-end">
                <FiUsers size={11} className="text-[var(--muted)]" />
                <span className="text-xs font-black tabular-nums">{t.slotsFilled || 0}/{t.slots}</span>
              </div>
            </div>
          </div>

          {/* Slots Progress Bar */}
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-[var(--border)] overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isJoined ? "bg-emerald-500" : "bg-gradient-to-r from-[var(--accent)] to-purple-400"}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: 0.1 }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">
              <span>{pct}% Filled</span>
              <span>{t.slots - (t.slotsFilled || 0)} slots left</span>
            </div>
          </div>
        </div>

        {/* Bottom: Entry Badge + Action CTA */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
              isFree
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
                : "bg-[var(--accent)]/10 border-[var(--accent)]/25 text-[var(--accent)]"
            }`}
          >
            {isFree ? <FiStar size={10} /> : <FiZap size={10} />}
            {isFree ? "Free Entry" : formatCoins(t.entryCoins)}
          </span>

          {isJoined ? (
            <span
              style={{ color: "#ffffff" }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 !text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 group-hover:bg-emerald-500 transition-all shadow-sm"
            >
              Registered <FiCheck size={11} />
            </span>
          ) : (
            <span
              style={{ color: "#ffffff" }}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] !text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 group-hover:opacity-90 group-hover:scale-105 transition-all shadow-sm"
            >
              Join <FiChevronRight size={11} />
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────
export default function TournamentHub() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [joinedIds, setJoinedIds] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/tournaments/register", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.data)) {
            const ids = d.data.map((e: any) => e.tournamentId?._id || e.tournamentId).filter(Boolean);
            setJoinedIds(ids);
          }
        })
        .catch(() => {});
    }

    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTournaments(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => tournaments.filter((t) => t.status !== "ended"), [tournaments]);
  const ended = useMemo(() => tournaments.filter((t) => t.status === "ended").slice(0, 6), [tournaments]);

  // Filtered active tournaments
  const filteredActive = useMemo(() => {
    if (selectedFilter === "all") return active;
    if (selectedFilter === "free") return active.filter((t) => t.entryCoins === 0);
    return active.filter((t) => t.game.toLowerCase() === selectedFilter.toLowerCase());
  }, [active, selectedFilter]);

  // Counts for tabs
  const mlbbCount = useMemo(() => active.filter((t) => t.game === "mlbb").length, [active]);
  const ffCount = useMemo(() => active.filter((t) => t.game === "freefire").length, [active]);
  const codmCount = useMemo(() => active.filter((t) => t.game === "codm").length, [active]);
  const freeCount = useMemo(() => active.filter((t) => t.entryCoins === 0).length, [active]);

  const filterTabs = [
    { id: "all", label: "All Tournaments", count: active.length },
    { id: "mlbb", label: "Mobile Legends", count: mlbbCount },
    { id: "freefire", label: "Free Fire", count: ffCount },
    { id: "codm", label: "COD Mobile", count: codmCount },
    { id: "free", label: "Free Entry", count: freeCount },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 space-y-5 sm:space-y-6">

        {/* ── TOP HERO HEADER & ACTION BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-3 border-b border-[var(--border)]"
        >
          <SectionTitle
            as="h1"
            subtitle="BLUE BUFF INDIA ESPORTS"
            title="COMPETITIVE ARENA"
            highlight="ARENA"
            action={
              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard/tournaments"
                  style={{ color: "#ffffff" }}
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] !text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
                >
                  <GiTrophy size={13} /> My Tournaments
                </Link>
              </div>
            }
          />
        </motion.div>

        {/* ── FILTER TABS ── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap border cursor-pointer ${
                  isSelected
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                    : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[8px] px-1.5 py-0.2 rounded-md font-bold ${
                    isSelected ? "bg-black/20 text-white" : "bg-[var(--background)] text-[var(--muted)]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── LOADING ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((j) => (
              <TournamentSkeleton key={j} />
            ))}
          </div>
        ) : filteredActive.length === 0 ? (
          <EmptyState
            icon={FiSearch}
            title="No Tournaments Found"
            description={
              selectedFilter !== "all"
                ? "No active tournaments under this category right now."
                : "New community tournaments and scrims are posted daily. Check back soon!"
            }
            size="md"
            variant="card"
            action={
              selectedFilter !== "all"
                ? {
                    label: "View All Events",
                    onClick: () => setSelectedFilter("all"),
                    variant: "outline",
                  }
                : undefined
            }
          />
        ) : (
          <div className="space-y-12">
            {/* ── ACTIVE TOURNAMENTS GRID ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiLayers className="text-[var(--accent)]" size={14} />
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">
                    Active Tournaments ({filteredActive.length})
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {filteredActive.map((t) => (
                    <motion.div
                      key={t._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TournamentCard t={t} isJoined={joinedIds.includes(t._id)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* ── BROWSE BY GAME SECTION ── */}
            <section className="space-y-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <FiGrid className="text-[var(--accent)]" size={14} />
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">
                    Browse by Game
                  </h2>
                  <p className="text-[8px] text-[var(--muted)]/50 font-bold uppercase tracking-wide">
                    Dedicated tournament rooms & custom match rules
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(GAME_META).map(([gameKey, meta]) => {
                  const count = active.filter((t) => t.game === gameKey).length;
                  return (
                    <Link
                      key={gameKey}
                      href={meta.href}
                      className="group block p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)] shrink-0 flex items-center justify-center group-hover:border-[var(--accent)]/40 transition-colors">
                          <Image
                            src={meta.logo}
                            alt={meta.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                            onError={(e: any) => {
                              e.currentTarget.src = "/logoBB.png";
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black uppercase tracking-tight text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                            {meta.name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)]">
                              {count} {count === 1 ? "Event" : "Events"} Active
                            </span>
                            <FiChevronRight
                              size={12}
                              className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* ── RECENTLY ENDED / HALL OF FAME ── */}
            {ended.length > 0 && (
              <section className="space-y-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <FiAward className="text-amber-500" size={14} />
                  <div>
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">
                      Recent Champions & Results
                    </h2>
                    <p className="text-[8px] text-[var(--muted)]/50 font-bold uppercase tracking-wide">
                      Hall of fame — Completed matches
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
                  {ended.map((t) => {
                    const meta = GAME_META[t.game] || {
                      name: t.game.toUpperCase(),
                      tag: t.game.toUpperCase(),
                      logo: "/logoBB.png",
                    };
                    return (
                      <div
                        key={t._id}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl overflow-hidden border border-[var(--border)] shrink-0 flex items-center justify-center">
                              <Image
                                src={meta.logo}
                                alt={t.game}
                                width={32}
                                height={32}
                                className="object-cover"
                                onError={(e: any) => {
                                  e.currentTarget.src = "/logoBB.png";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] font-black uppercase tracking-tight truncate text-[var(--foreground)]">
                                {t.title}
                              </p>
                              <p className="text-[7px] text-[var(--muted)]/50 uppercase tracking-widest">
                                {meta.tag} · {t.format}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status="ended" size="xs" />
                        </div>

                        <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                          <div className="flex items-center gap-2">
                            <FiAward size={13} className="text-amber-500" />
                            <div>
                              <p className="text-[6px] font-black uppercase tracking-widest text-[var(--muted)]/40">
                                Champion
                              </p>
                              <p className="text-[9px] font-black uppercase text-amber-500">
                                {t.winner || "TBA"}
                              </p>
                            </div>
                          </div>
                          <GiTrophy className="text-amber-500/20" size={18} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
