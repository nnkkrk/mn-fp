"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiStar, FiCalendar, FiCheckCircle, FiArrowRight, FiCheck,
  FiYoutube, FiSmartphone, FiGlobe, FiMessageCircle,
  FiZap, FiRefreshCw, FiClock, FiList, FiLock, FiTrendingUp,
  FiExternalLink, FiAlertCircle, FiUsers, FiChevronLeft, FiChevronRight, 
  FiPlay, FiTarget, FiBox, FiArrowLeft, FiGift, FiInfo, FiAlertTriangle, FiPlus
} from "react-icons/fi";
import { Icons } from "@/components/icons";
import { Pagination, EmptyState, LoadingSpinner, SectionTitle } from "@/components/common";
import { formatCoins, formatCurrency, formatNumber, formatDate, formatDateTime } from "@/utils";
import Link from "next/link";
import NativeBanner from "@/components/Ads/NativeBanner";
import CustomBanner1 from "@/components/Ads/CustomBanner1";

import { TaskSkeleton, TransactionSkeleton } from "../Skeleton/Skeleton";
import { ADS_CONFIG } from "@/lib/adsConstants";
import confetti from "canvas-confetti";
import api from "@/lib/axios";


// ──────────────────────────────────────────── TYPES ──────────────────────────
interface Task {
  taskId: string;
  title: string;
  icon: string;
  reward: number;
  type: string;
  url: string;
  status: "available" | "pending" | "completed";
}

interface CoinHistory {
  type: "earn" | "spend";
  coins: number;
  source: string;
  description: string;
  createdAt: string;
}

const TASK_ICONS: Record<string, any> = {
  youtube: <FiYoutube className="text-rose-500" />,
  site: <FiGlobe className="text-blue-500" />,
  app: <FiSmartphone className="text-emerald-500" />,
  social: <FiMessageCircle className="text-sky-500" />,
  custom: <FiStar className="text-amber-500" />,
};

const ICON_STYLES: Record<string, string> = {
  youtube: "bg-rose-500/10 text-rose-400",
  site: "bg-blue-500/10 text-blue-400",
  app: "bg-emerald-500/10 text-emerald-400",
  social: "bg-sky-500/10 text-sky-400",
  custom: "bg-amber-500/10 text-amber-400",
};

// ──────────────────────────────── ADSTERRA CARD ──────────────────────────────
function AdsterraCard({ lastAdReward, adId, adLink, title, onReward, showToast, reward, cooldownMs }: {
  lastAdReward: string | null;
  adId: string;
  adLink: string;
  title?: string;
  onReward: (newBal: number, adId: string, lastTime: string) => void;
  showToast: (m: string, t: "success" | "error") => void;
  reward?: number;
  cooldownMs?: number;
}) {
  const [opened, setOpened] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [cooldownText, setCooldownText] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cooldown effect
  useEffect(() => {
    if (!lastAdReward) {
      setCooldownText(null);
      return;
    }

    const updateCooldown = () => {
      const last = new Date(lastAdReward).getTime();
      const diff = Date.now() - last;
      const currentCooldownMs = cooldownMs || ADS_CONFIG.COOLDOWN_MS;
      const remains = currentCooldownMs - diff;

      if (remains > 0) {
        const mins = Math.floor(remains / 60000);
        const secs = Math.floor((remains % 60000) / 1000);
        setCooldownText(`${mins}m ${secs}s`);
      } else {
        setCooldownText(null);
      }
    };

    updateCooldown();
    const inv = setInterval(updateCooldown, 1000);
    return () => clearInterval(inv);
  }, [lastAdReward]);

  const handleOpen = () => {
    if (cooldownText) return showToast(`Please wait ${cooldownText} for next ad`, "error");
    window.open(adLink, "_blank", "noopener,noreferrer");
    setOpened(true);
    setTimer(15);
  };

  useEffect(() => {
    if (timer === null || timer <= 0) return;
    timerRef.current = setTimeout(() => setTimer((t) => (t !== null ? t - 1 : null)), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timer]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const { data } = await api.post("/api/coins/ad-reward", { adId });
      if (data.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#3b82f6', '#60a5fa', '#ffffff']
        });
        showToast(data.message, "success");
        onReward(data.newBalance, adId, data.transaction?.createdAt || new Date().toISOString());
        setOpened(false);
        setTimer(null);
      } else {
        showToast(data.message, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Reward claim failed", "error");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border p-3 flex flex-col gap-2 overflow-hidden group transition-all ${cooldownText ? "border-[var(--border)] bg-[var(--card)]/20 opacity-80" : "border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 shadow-lg shadow-blue-500/5"
        }`}
    >
      <div className="absolute top-0 right-0 p-1.5">
        <span className={`text-[6px] font-black uppercase tracking-widest px-1 py-0.5 rounded ${cooldownText ? "text-[var(--muted)]/40 bg-[var(--card)]/40" : "text-blue-400/50 bg-blue-500/10"
          }`}>
          {cooldownText ? "Cooldown" : "Bonus"}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform ${cooldownText ? "bg-[var(--card)]/40 grayscale" : "bg-blue-500/10 group-hover:scale-110"
          }`}>
          <FiPlay size={14} className={cooldownText ? "text-[var(--muted)]/40 text-xl" : "text-blue-400 text-xl"} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-tight shrink-0 truncate ${cooldownText ? "text-[var(--muted)]/60" : ""}`}>
            {cooldownText ? "Locked" : (title || "Watch Ad")}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <FiStar className={cooldownText ? "text-[var(--muted)]/30 text-[8px]" : "text-blue-400 text-[8px]"} />
            <span className={`font-black text-[9px] ${cooldownText ? "text-[var(--muted)]/40" : "text-blue-400"}`}>
              +{reward || ADS_CONFIG.REWARD_COINS} BBC
            </span>
          </div>
        </div>
        {!opened ? (
          <motion.button
            whileHover={{ scale: cooldownText ? 1 : 1.05 }} whileTap={{ scale: cooldownText ? 1 : 0.95 }}
            onClick={handleOpen}
            disabled={!!cooldownText}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all min-w-[75px] justify-center ${cooldownText
              ? "bg-[var(--card)]/40 text-amber-400/80 border border-amber-500/20 cursor-not-allowed"
              : "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              }`}
          >
            {cooldownText ? <><FiClock size={10} /> {cooldownText}</> : <><FiPlay size={10} /> Watch</>}
          </motion.button>
        ) : timer !== null && timer > 0 ? (
          <button aria-label="button"
            disabled
            className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400/50 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase cursor-not-allowed shadow-none min-w-[75px] justify-center"
          >
            <FiClock size={10} className="animate-pulse" /> {timer}s
          </button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleClaim}
            disabled={claiming}
            className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-emerald-500/20 min-w-[75px] justify-center"
          >
            {claiming ? <FiRefreshCw className="animate-spin text-xs" /> : "Claim"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────── TASK CARD ──────────────────────────────────
function TaskCard({ task, onClaim, pendingClaims, isUnlocked, isWatchingAd, adTimer, onStartAd }: {
  task: Task;
  onClaim: (id: string) => Promise<any>;
  pendingClaims: Set<string>;
  isUnlocked?: boolean;
  isWatchingAd?: boolean;
  adTimer?: number | null;
  onStartAd?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isPending = pendingClaims.has(task.taskId);

  const handleAction = async () => {
    if (task.status === "completed" || isPending) return;

    setLoading(true);
    if (task.url && task.url !== "#") {
      window.open(task.url, "_blank", "noopener,noreferrer");
    }

    // Slight delay to simulate user clicking before we show claim
    setTimeout(async () => {
      await onClaim(task.taskId);
      setLoading(false);
    }, 1500);
  };

  const getButtonContent = () => {
    if (isPending) return <><FiClock /> Pending</>;
    if (task.status === "completed") return <><FiCheck /> Completed</>;
    if (loading) return <FiRefreshCw className="animate-spin" />;
    return <><FiArrowRight /> Go</>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative rounded-2xl border p-4 flex items-center gap-4 transition-all ${task.status === "completed"
        ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
        : "bg-[var(--card)]/40 border-[var(--border)]"
        }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl ${ICON_STYLES[task.type] || ICON_STYLES.custom}`}>
        {TASK_ICONS[task.type] || TASK_ICONS.custom}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black uppercase tracking-tight truncate">{task.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <FiStar className="text-amber-400 text-[10px]" />
          <span className="text-amber-400 font-black text-[10px]">+{task.reward} BBC</span>
        </div>
      </div>

      {!isUnlocked && task.status !== "completed" && !isPending ? (
        <div className="shrink-0">
          {isWatchingAd ? (
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20`}>
              <FiClock className="animate-pulse" /> {adTimer}s
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onStartAd}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-purple-600/20"
            >
              Unlock
            </motion.button>
          )}
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: task.status === "completed" ? 1 : 1.05 }}
          whileTap={{ scale: task.status === "completed" ? 1 : 0.95 }}
          onClick={handleAction}
          disabled={task.status === "completed" || isPending || loading}
          className={`shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${task.status === "completed"
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
            : isPending
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-default"
              : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
            }`}
        >
          {getButtonContent()}
        </motion.button>
      )}
    </motion.div>
  );
}

// ══════════════════════════════════ MAIN COMPONENT ════════════════════════════
type TabKey = "checkin" | "tasks" | "watch" | "convert" | "history";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "checkin", label: "Check-in", icon: <FiCalendar size={13} /> },
  { key: "watch", label: "Ads", icon: <FiPlay size={13} /> },
  { key: "tasks", label: "Tasks", icon: <FiZap size={13} /> },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CoinsTab() {
  const [activeTab, setActiveTab] = useState<TabKey>("checkin");
  const [lastResult, setLastResult] = useState<{ amount: number; id: number } | null>(null);
  const [coins, setCoins] = useState(0);
  const [historyLimit] = useState(10);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [rewards, setRewards] = useState([2, 3, 5, 7, 10, 12, 15]);
  const [nextReward, setNextReward] = useState(2);

  // Bottom sheet modal drawer states
  const [showConvertSheet, setShowConvertSheet] = useState(false);
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when either bottom sheet is open
  useEffect(() => {
    if (showConvertSheet || showHistorySheet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showConvertSheet, showHistorySheet]);

  // Dynamic ad channel rewards tracking
  const [adRewardTimes, setAdRewardTimes] = useState<Record<string, string | null>>({});

  // Dynamic ads configuration
  const [adsConfig, setAdsConfig] = useState({
    adsterraLink: ADS_CONFIG.ADSTERRA_LINK,
    enabled: true,
    channels: ADS_CONFIG.WATCH_EARN_CHANNELS,
  });

  const [history, setHistory] = useState<CoinHistory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingClaims, setPendingClaims] = useState<Set<string>>(new Set());
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksPages, setTasksPages] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Conversion state
  const [convertCoins, setConvertCoins] = useState("");
  const [converting, setConverting] = useState(false);
  const convertPreview = convertCoins ? (parseInt(convertCoins) / 100).toFixed(2) : null;

  // Ad Gateway State (for Tasks)
  const [unlockedTaskIds, setUnlockedTaskIds] = useState<Set<string>>(new Set());
  const [activeAdTarget, setActiveAdTarget] = useState<string | null>(null);
  const [adTimer, setAdTimer] = useState<number | null>(null);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateCoins = (newVal: any, resultAmount?: number) => {
    if (typeof newVal === "number" && !isNaN(newVal)) {
      setCoins(newVal);
      if (resultAmount !== undefined && resultAmount !== 0) {
        setLastResult({ amount: resultAmount, id: Date.now() });
        setTimeout(() => setLastResult(null), 3000);
      }
    } else if (typeof newVal === "string" && !isNaN(parseInt(newVal))) {
      const val = parseInt(newVal);
      setCoins(val);
      if (resultAmount !== undefined && resultAmount !== 0) {
        setLastResult({ amount: resultAmount, id: Date.now() });
        setTimeout(() => setLastResult(null), 3000);
      }
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    // We'll use the browser's alert for now since we don't have a toast component in this file
    // Ideally use a custom toast UI
    const event = new CustomEvent("show-toast", { detail: { message, type } });
    window.dispatchEvent(event);
  };

  const fetchData = useCallback(async () => {
    try {
      // Fire requests simultaneously
      const [balRes, taskRes, adsRes] = await Promise.all([
        api.get(`/api/coins/balance?historyPage=${historyPage}`),
        api.get(`/api/coins/tasks?page=${tasksPage}`),
        api.get(`/api/coins/ads-config`).catch(() => null),
      ]);

      if (adsRes?.data?.success && adsRes.data.data) {
        setAdsConfig({
          adsterraLink: adsRes.data.data.adsterraLink || ADS_CONFIG.ADSTERRA_LINK,
          enabled: adsRes.data.data.enabled !== false,
          channels: adsRes.data.data.channels && adsRes.data.data.channels.length > 0 
            ? adsRes.data.data.channels 
            : ADS_CONFIG.WATCH_EARN_CHANNELS,
        });
      }

      const bal = balRes.data;
      const tData = taskRes.data;

      // Balance & History
      if (bal.success) {
        updateCoins(bal.coins);
        setCheckedInToday(bal.checkedInToday);
        setStreak(bal.streak || 0);
        setNextReward(bal.nextReward || 5);
        setRewards(bal.rewards || [5, 7, 10, 15, 20, 25, 50]);

        const rewardMap: Record<string, string | null> = {};
        bal.adRewards?.forEach((r: any) => { rewardMap[r.id] = r.lastTime; });
        setAdRewardTimes(rewardMap);

        setHistory(bal.history || []);
        setHistoryPages(bal.historyPages || 1);
      }

      // Tasks
      if (tData.success) {
        setTasks(tData.tasks);
        setTasksPages(tData.pages);
        setPendingClaims(new Set(tData.pendingClaimIds || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [historyPage, tasksPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckin = async () => {
    // Open Ad first
    window.open(adsConfig.adsterraLink, "_blank", "noopener,noreferrer");

    setCheckinLoading(true);
    try {
      const { data } = await api.post("/api/coins/checkin");
      if (data.success) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff']
        });
        showToast(data.message, "success");
        setCoins(data.newBalance);
        setCheckedInToday(true);
        setStreak(data.streak);
        fetchData(); // Refresh history
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Check-in failed", "error");
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    try {
      const { data } = await api.post("/api/coins/claim", { taskId });
      if (data.success) {
        showToast(data.message, "success");
        setPendingClaims(prev => new Set([...prev, taskId]));
        return data;
      } else {
        showToast(data.message, "error");
        return data;
      }
    } catch {
      showToast("Claim failed", "error");
    }
  };

  const handleConvert = async () => {
    if (!convertCoins || isNaN(parseInt(convertCoins))) return;
    setConverting(true);
    try {
      const { data } = await api.post("/api/coins/convert", { amount: parseInt(convertCoins) });
      if (data.success) {
        showToast(data.message, "success");
        updateCoins(data.newCoins);
        setConvertCoins("");
        fetchData();
        setActiveTab("checkin");
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Conversion failed", "error");
    } finally {
      setConverting(false);
    }
  };

  // ── AD GATEWAY LOGIC ──
  const handleStartAd = (targetId: string) => {
    window.open(adsConfig.adsterraLink, "_blank", "noopener,noreferrer");
    setActiveAdTarget(targetId);
    setAdTimer(15);
  };

  useEffect(() => {
    if (adTimer === null || adTimer <= 0) {
      if (adTimer === 0 && activeAdTarget) {
        setUnlockedTaskIds(prev => new Set([...prev, activeAdTarget]));
        setActiveAdTarget(null);
        setAdTimer(null);
      }
      return;
    }
    adTimerRef.current = setTimeout(() => setAdTimer(t => (t ? t - 1 : 0)), 1000);
    return () => { if (adTimerRef.current) clearTimeout(adTimerRef.current); };
  }, [adTimer, activeAdTarget]);
  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4 px-2 py-4">
      {/* Balance Skeleton */}
      <div className="h-32 w-full bg-[var(--card)]/40 rounded-[1.5rem] animate-pulse border border-[var(--border)]" />
      
      {/* Tabs Skeleton */}
      <div className="h-14 w-full bg-[var(--card)]/40 rounded-2xl animate-pulse border border-[var(--border)]" />
      
      {/* Content Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  const incompleteTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="max-w-3xl mx-auto space-y-3 pb-16 px-2 pt-0.5">

      <SectionTitle
        subtitle="REWARDS & TASKS"
        title="BBC COINS"
        accentColor="amber"
        icon={<FiStar className="text-amber-400" size={13} />}
        description="Daily check-ins, rewarded videos, and tasks to earn BBC Coins"
        className="mb-1"
      />

      {/* ── TOP PROMO BANNER ────────────────────────────────────────── */}
      <a
        href="https://games.bluebuff.in"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-purple-500/10 border border-amber-500/25 hover:border-amber-500/40 transition-all shadow-xs overflow-hidden"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <FiGift size={16} className="text-amber-500 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black text-amber-500 hover:underline flex items-center gap-1">
                games.bluebuff.in
                <FiExternalLink size={10} />
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500">
                Play & Earn
              </span>
            </div>
            <p className="text-[9.5px] text-[var(--muted)] font-medium truncate mt-0.5">
              Play and earn UC, Diamonds & more for popular games!
            </p>
          </div>
        </div>
        <FiArrowRight size={13} className="text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </a>

      {/* ── UNIFIED HERO DASHBOARD (CLEAN & BORDERLESS) ───────────────── */}
      <div className="relative py-2 sm:py-3">
        <div className="flex flex-col gap-3.5">
          {/* Top row: Balance on left, Stats on right */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1.5 w-fit">
                <FiStar className="text-amber-500 fill-amber-500/40" size={11} />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">BBC Coins</span>
              </div>
              <div className="flex items-baseline gap-2 relative">
                <span className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight tabular-nums leading-none">
                  {coins || 0}
                </span>
                <span className="text-xs font-black uppercase text-amber-500 tracking-wider">BBC</span>
                <AnimatePresence>
                  {lastResult && (
                    <motion.div
                      key={lastResult.id}
                      initial={{ opacity: 0, y: 10, scale: 0.5 }}
                      animate={{ opacity: 1, y: -20, scale: 1.1 }}
                      exit={{ opacity: 0, y: -35, scale: 0.8 }}
                      className={`absolute -right-2 top-0 font-black text-xs pointer-events-none ${
                        lastResult.amount > 0 ? "text-emerald-400" : "text-rose-500"
                      }`}
                    >
                      {lastResult.amount > 0 ? `+${lastResult.amount}` : lastResult.amount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[10px] text-[var(--muted)] font-mono">
                ≈ {formatCurrency((coins || 0) / 100)}
              </p>
            </div>

            {/* Streak & Next Reward: Flat stat pills */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-[var(--foreground)]/[0.04]">
                <div className="flex items-center gap-1 text-[var(--foreground)] font-black text-sm tabular-nums leading-none">
                  <FiZap size={12} className="text-amber-500 fill-amber-500/40" />
                  <span>{streak}</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--muted)] mt-1">Streak</span>
              </div>

              <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-amber-500/[0.08]">
                <div className="flex items-center gap-0.5 text-amber-500 font-black text-sm tabular-nums leading-none">
                  <span>+{nextReward}</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-amber-500/90 mt-1">Next</span>
              </div>
            </div>
          </div>

          {/* Integrated Actions Toolbar (Convert, History) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Convert BBC Coins"
              onClick={() => setShowConvertSheet(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[var(--foreground)]/[0.04] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.08] active:scale-[0.98]"
            >
              <FiTrendingUp size={12} className="text-emerald-500" />
              <span>Convert</span>
            </button>
            <button
              type="button"
              aria-label="Transaction History"
              onClick={() => setShowHistorySheet(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[var(--foreground)]/[0.04] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.08] active:scale-[0.98]"
            >
              <FiList size={12} className="text-blue-500" />
              <span>History</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ──────────────────────────────────────────────── */}
      {!loading && (
        <div className="space-y-3">
          {/* Tab bar (Segmented Pill) */}
          <div className="grid grid-cols-3 gap-1 bg-[var(--foreground)]/[0.03] p-1 rounded-xl">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button aria-label={tab.label}
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                    isActive
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-black"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span className={isActive ? "text-[var(--accent)]" : "opacity-75"}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.key === "tasks" && incompleteTasks.length > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center ${
                      isActive ? "bg-[var(--accent)] text-white" : "bg-blue-500 text-white"
                    }`}>
                      {incompleteTasks.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── ALL TAB CONTENT ──────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">

            {/* ══ CHECK-IN ══ */}
            {activeTab === "checkin" && (
              <motion.div key="checkin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="py-2 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FiCalendar className="text-amber-500 shrink-0" size={18} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">Daily Check-in</p>
                      <p className="text-[10px] text-[var(--muted)] font-bold tracking-tight mt-0.5">
                        {checkedInToday ? `Day ${streak} claimed today ✓` : `Claim your Day ${streak + 1} bonus`}
                      </p>
                    </div>
                  </div>
                  {streak > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-xl">
                      <FiZap size={12} className="text-amber-500 fill-amber-500/30" />
                      <span className="text-amber-500 font-black text-xs">{streak}</span>
                      <span className="text-amber-500/60 font-bold text-[9px] uppercase">/7</span>
                    </div>
                  )}
                </div>

                {/* 7-day visual tracker cards */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1">
                  {rewards.map((reward, i) => {
                    const day = i + 1;
                    const isCompleted = day <= (checkedInToday ? streak : streak);
                    const isToday = day === streak && checkedInToday;
                    const isCurrent = day === (checkedInToday ? streak : streak + 1);

                    return (
                      <div
                        key={day}
                        className={`flex flex-col items-center justify-between py-2.5 px-1 rounded-xl border transition-all min-h-[66px] ${
                          isToday
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                            : isCompleted
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                            : isCurrent && !checkedInToday
                            ? "bg-[var(--card)] border-amber-500/60 ring-1 ring-amber-500/40 shadow-2xs"
                            : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)]"
                        }`}
                      >
                        <span className="text-[8px] font-black uppercase tracking-tight text-[var(--muted)]">{DAY_LABELS[i]}</span>
                        
                        <div className="flex items-center justify-center my-0.5">
                          {isCompleted ? (
                            <FiCheck className="text-emerald-500 text-xs stroke-[3]" />
                          ) : (
                            <span className={`text-[11px] font-black tabular-nums ${
                              isCurrent ? "text-amber-500 font-black" : "text-[var(--foreground)]"
                            }`}>
                              +{reward}
                            </span>
                          )}
                        </div>

                        <span className="text-[7.5px] font-bold text-[var(--muted)]/60 uppercase">
                          {day === 7 ? "🎉" : "BBC"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA Action Button */}
                <motion.button
                  whileHover={{ scale: checkedInToday ? 1 : 1.005 }}
                  whileTap={{ scale: checkedInToday ? 1 : 0.98 }}
                  onClick={handleCheckin}
                  disabled={checkedInToday || checkinLoading}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    checkedInToday
                    ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 cursor-default"
                    : "bg-[var(--accent)] hover:opacity-95 text-white shadow-2xs active:scale-[0.98]"
                  }`}
                >
                  {checkinLoading ? (
                    <FiRefreshCw className="animate-spin text-sm" />
                  ) : checkedInToday ? (
                    <><FiCheckCircle size={14} /> Checked In — Day {streak}</>
                  ) : (
                    <><FiCalendar size={14} /> Check In (+{nextReward} BBC)</>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* ══ TASKS ══ */}
            {activeTab === "tasks" && (
              <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiZap className="text-[var(--accent)] text-sm" />
                    <p className="text-[11px] font-black uppercase tracking-wide">Earn Tasks</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingClaims.size > 0 && (
                      <span className="text-[8px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        {pendingClaims.size} pending
                      </span>
                    )}
                    <button aria-label="button" onClick={fetchData} className="text-[var(--muted)]/40 hover:text-[var(--muted)] transition-colors">
                      <FiRefreshCw className="text-xs" />
                    </button>
                  </div>
                </div>

                {pendingClaims.size > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                    <FiAlertCircle className="text-amber-400 text-xs shrink-0" />
                    <p className="text-[8px] text-amber-400 font-bold">Claims require admin approval before coins are awarded.</p>
                  </div>
                )}


                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-[var(--muted)]/40">
                    <FiList className="text-3xl mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-wide">No tasks available</p>
                    <p className="text-[9px] mt-1">Check back soon!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incompleteTasks.map((task) => (
                      <TaskCard
                        key={task.taskId}
                        task={task}
                        onClaim={handleClaimTask}
                        pendingClaims={pendingClaims}
                        isUnlocked={unlockedTaskIds.has(task.taskId)}
                        isWatchingAd={activeAdTarget === task.taskId}
                        adTimer={activeAdTarget === task.taskId ? adTimer : null}
                        onStartAd={() => handleStartAd(task.taskId)}
                      />
                    ))}
                    {completedTasks.length > 0 && (
                      <>
                        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/30 pt-2">Completed</p>
                        {completedTasks.map((task) => (
                          <div key={task.taskId} className="opacity-40">
                            <TaskCard
                              task={task}
                              onClaim={async () => ({})}
                              pendingClaims={pendingClaims}
                              isUnlocked={true}
                            />
                          </div>
                        ))}
                      </>
                    )}

                    <Pagination page={tasksPage} totalPages={tasksPages} onPageChange={setTasksPage} size="sm" hideOnSinglePage />
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ WATCH ADS ══ */}
            {activeTab === "watch" && (
              <motion.div key="watch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <FiPlay className="text-blue-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide">Watch Ads & Earn</p>
                    <p className="text-[9px] text-[var(--muted)]/60 font-bold uppercase">Earn daily rewards instantly</p>
                  </div>
                </div>

                {!adsConfig.enabled ? (
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
                    <p className="text-xs font-bold text-amber-400">Ad rewards are temporarily paused.</p>
                    <p className="text-[10px] text-[var(--muted)] mt-1">Please check back soon for bonus channels!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adsConfig.channels.map((channel) => (
                      <AdsterraCard
                        key={channel.id}
                        adId={channel.id}
                        title={channel.title}
                        adLink={channel.link}
                        reward={(channel as any).reward}
                        cooldownMs={(channel as any).cooldownMs}
                        lastAdReward={adRewardTimes[channel.id] || null}
                        onReward={(bal, id, lastTime) => {
                          setCoins(bal);
                          setAdRewardTimes(prev => ({ ...prev, [id]: lastTime }));
                        }}
                        showToast={showToast}
                      />
                    ))}
                  </div>
                )}

                <div className="relative rounded-2xl border border-[var(--border)] bg-gradient-to-br from-blue-500/5 to-indigo-500/5 p-3 overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FiAlertCircle className="text-blue-400 text-sm" />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-wide text-white/80">Ad Information</h5>
                      <p className="text-[9px] text-[var(--muted)] mt-1 leading-relaxed">
                        Watch the full 15 seconds to be eligible for rewards. You can claim this bonus once every 45 minutes. Make sure your internet connection is stable.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      )}
      {/* Adsterra Banners */}
      <NativeBanner />

      {/* ══ CONVERT TO WALLET BOTTOM SHEET ══ */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showConvertSheet && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowConvertSheet(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-[9999]"
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full sm:max-w-md bg-[var(--card)] border-t sm:border border-[var(--border)] rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 pb-8 sm:pb-5 z-[10000] max-h-[85vh] overflow-y-auto"
              >
                {/* Drag handle */}
                <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-3" />

                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]/60">
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className="text-emerald-500" size={16} />
                    <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">Convert to Wallet</span>
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setShowConvertSheet(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer"
                  >
                    <Icons.x size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--muted)] font-medium">Conversion Rate</span>
                    <span className="font-bold text-[var(--foreground)]">100 BBC = ₹1</span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                      <FiStar className="text-amber-500" size={14} />
                    </div>
                    <input
                      type="number"
                      value={convertCoins}
                      onChange={(e) => setConvertCoins(e.target.value)}
                      placeholder="Enter coins (min 100)"
                      className="w-full pl-10 pr-4 h-12 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm font-bold outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--muted)]/50"
                    />
                  </div>

                  {convertPreview && (
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl">
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">You'll receive</span>
                      <span className="text-emerald-500 font-black text-sm">₹{convertPreview}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      await handleConvert();
                      setShowConvertSheet(false);
                    }}
                    disabled={converting || !convertCoins || parseInt(convertCoins) < 100 || parseInt(convertCoins) > coins}
                    className="w-full py-3 rounded-xl bg-[var(--accent)] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                  >
                    {converting ? <FiRefreshCw className="animate-spin" /> : <><FiArrowRight size={14} /> Add to Wallet</>}
                  </button>

                  <div className="flex items-center gap-2 px-3 py-2 bg-[var(--foreground)]/[0.02] border border-[var(--border)]/60 rounded-xl">
                    <FiLock className="text-[var(--muted)]/60 shrink-0" size={12} />
                    <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">Min 100 BBC · Instant Wallet Credit</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ══ COIN HISTORY BOTTOM SHEET ══ */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showHistorySheet && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowHistorySheet(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-[9999]"
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full sm:max-w-md bg-[var(--card)] border-t sm:border border-[var(--border)] rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 pb-8 sm:pb-5 z-[10000] max-h-[85vh] overflow-y-auto"
              >
                {/* Drag handle */}
                <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-3" />

                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]/60">
                  <div className="flex items-center gap-2">
                    <FiList className="text-blue-500" size={16} />
                    <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">Coin History</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Refresh history"
                      onClick={fetchData}
                      className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-lg cursor-pointer"
                    >
                      <FiRefreshCw size={13} />
                    </button>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setShowHistorySheet(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer"
                    >
                      <Icons.x size={16} />
                    </button>
                  </div>
                </div>

                {history.length === 0 ? (
                  <EmptyState
                    icon={Icons.list}
                    title="No Transactions Yet"
                    description="Complete tasks or check in daily to earn BBC Coins!"
                    size="sm"
                  />
                ) : (
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2.5 border-b border-[var(--border)]/30 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            item.type === "earn" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                          }`}>
                            <FiStar size={12} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold truncate max-w-[200px]">{item.description}</p>
                            <p className="text-[8px] text-[var(--muted)] font-mono">
                              {formatDate(item.createdAt, { style: "short" })}
                            </p>
                          </div>
                        </div>
                        <span className={`font-black text-xs ${item.type === "earn" ? "text-amber-500" : "text-rose-500"}`}>
                          {item.type === "earn" ? "+" : "-"}{formatCoins(item.coins)}
                        </span>
                      </div>
                    ))}

                    <Pagination
                      page={historyPage}
                      totalPages={historyPages}
                      onPageChange={setHistoryPage}
                      size="sm"
                      hideOnSinglePage
                    />
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
