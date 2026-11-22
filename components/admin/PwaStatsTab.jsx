"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  FiSmartphone, FiMonitor, FiTablet,
  FiDownload, FiActivity, FiRefreshCw,
  FiXCircle, FiUser, FiExternalLink,
  FiBell, FiSend, FiCheckCircle, FiAlertCircle,
  FiImage, FiTag, FiChevronDown, FiChevronUp,
  FiShoppingCart, FiCalendar, FiCheck
} from "react-icons/fi";
import { LoadingSpinner, InfoTooltip, SectionTitle } from "@/components/common";
import { formatNumber, formatPercent, formatDateTime, formatCurrency } from "@/utils";

const PRESET_IMAGES = [
  { label: "Starlight Pass", url: "/game-assets/starkight.webp" },
  { label: "Weekly Pass", url: "/game-assets/weeklypass.jpg" },
  { label: "Double Diamonds", url: "/game-assets/double-dias.jpg" },
  { label: "Rank Boost", url: "/game-assets/rankboost.jpg" },
  { label: "MLBB India", url: "/game-assets/mlbbindia.jpg" },
];

export default function PwaStatsTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays]       = useState(7);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Push broadcast state
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isSubscribersOpen, setIsSubscribersOpen] = useState(true);
  const [isInstalledUsersOpen, setIsInstalledUsersOpen] = useState(false);
  const [isRecentInstallsOpen, setIsRecentInstallsOpen] = useState(false);
  const [pushTitle, setPushTitle]   = useState("");
  const [pushBody, setPushBody]     = useState("");
  const [pushUrl, setPushUrl]       = useState("/");
  const [pushImage, setPushImage]   = useState("");
  const [pushTag, setPushTag]       = useState("promo-broadcast");
  const [pushSending, setPushSending] = useState(false);
  const [pushResult, setPushResult] = useState(null);

  const fetchStats = async (d = days) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/pwa/track?days=${d}`);
      const json = await res.json();
      setData(json);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(days); }, [days]);

  const handleSendPush = async (e) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;

    setPushSending(true);
    setPushResult(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      const res = await fetch("/api/pwa/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: pushTitle,
          body: pushBody,
          url: pushUrl || "/",
          image: pushImage.trim() || undefined,
          tag: pushTag.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPushResult({
          type: "success",
          message: `Broadcast delivered! Sent: ${json.report?.sent || 0}, Failed: ${json.report?.failed || 0} (Total: ${json.report?.total || 0})`,
        });
        setPushTitle("");
        setPushBody("");
        setPushImage("");
        setPushUrl("/");
        fetchStats(days);
      } else {
        setPushResult({ type: "error", message: json.message || "Failed to send broadcast" });
      }
    } catch (err) {
      setPushResult({ type: "error", message: err.message || "Network error sending push" });
    } finally {
      setPushSending(false);
    }
  };

  const deviceIcon = (type) => {
    if (type === "mobile")  return <FiSmartphone size={12} />;
    if (type === "tablet")  return <FiTablet size={12} />;
    return <FiMonitor size={12} />;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <LoadingSpinner size="xl" color="accent" />
    </div>
  );

  if (!data) return (
    <p className="text-center text-sm text-[var(--muted)] py-10">Failed to load PWA stats.</p>
  );

  const conversionRate = data.totalInstalls + data.dismissCount > 0
    ? Math.round((data.totalInstalls / (data.totalInstalls + data.dismissCount)) * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pb-2.5 border-b border-[var(--border)]/70">
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Timeframe Filter Dropdown */}
          <div className="relative inline-flex items-center" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`h-7 px-2.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isFilterOpen
                  ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06]"
              }`}
              title="Change timeframe"
            >
              <FiCalendar size={13} className="text-[var(--accent)]" />
              <span>
                {days === 1 ? "Today (1D)" : days === 7 ? "7 Days" : "30 Days"}
              </span>
              <FiChevronDown
                size={12}
                className={`text-[var(--muted)] transition-transform duration-200 ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-36 py-1 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Select Timeframe
                </div>
                {[
                  { id: 1, label: "Today (1D)" },
                  { id: 7, label: "Last 7 Days" },
                  { id: 30, label: "Last 30 Days" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDays(item.id);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      days === item.id
                        ? "bg-[var(--accent)]/15 text-[var(--accent)] font-semibold"
                        : "text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {days === item.id && <FiCheck size={12} className="text-[var(--accent)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            aria-label="Refresh"
            type="button"
            onClick={() => fetchStats(days)}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
            title="Refresh statistics"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>
        </div>
      </div>

      {/* ── Stat cards (Unified Total, Period, Conversions & Purchases) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <StatCard
          label="App Installs"
          value={data.totalInstalls}
          subValue={data.periodInstalls || 0}
          subLabel={`${days === 1 ? '1D' : days === 7 ? '7D' : '30D'}`}
          icon={<FiDownload size={14} />}
          color="#ef4444"
        />
        <StatCard
          label="Install Conversion"
          value={`${conversionRate}%`}
          subText={`${data.dismissCount || 0} dismissed`}
          icon={<FiUser size={14} />}
          color="#60a5fa"
        />
        <StatCard
          label="Push Subscribers"
          value={data.totalPushSubscribers || 0}
          subValue={data.periodPush || 0}
          subLabel={`${days === 1 ? '1D' : days === 7 ? '7D' : '30D'}`}
          icon={<FiBell size={14} />}
          color="#a855f7"
        />
        <StatCard
          label="Push Conversion"
          value={`${data.pushConversionRate ?? 100}%`}
          subText={`${data.pushDeniedCount || 0} rejected`}
          icon={<FiActivity size={14} />}
          color="#22c55e"
        />
        <StatCard
          label="PWA Revenue"
          value={formatCurrency(data.pwaPurchases?.periodRevenue || 0)}
          subText={`All-time: ${formatCurrency(data.pwaPurchases?.totalRevenue || 0)}`}
          icon={<FiShoppingCart size={14} />}
          color="#10b981"
        />
        <StatCard
          label="PWA Orders"
          value={data.pwaPurchases?.periodOrders || 0}
          subText={`AOV: ${formatCurrency(data.pwaPurchases?.aov || 0)}`}
          icon={<FiSmartphone size={14} />}
          color="#8b5cf6"
        />
      </div>

      {/* ── Push Notification Broadcast Section (Collapsible) ── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/30 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsBroadcastOpen(!isBroadcastOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[var(--card)]/50 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] shrink-0">
              <FiBell size={14} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] truncate">
                Send Rich Push Broadcast
              </h3>
              <p className="text-[10px] text-[var(--muted)] truncate">
                Broadcast instant push alerts with images to {data.totalPushSubscribers || 0} subscribed devices
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded bg-[var(--border)]/60 text-[var(--foreground)]">
              {isBroadcastOpen ? "Hide Console" : "Open Console"}
            </span>
            <div className="p-1 rounded text-[var(--muted)]">
              {isBroadcastOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
          </div>
        </button>

        {isBroadcastOpen && (
          <div className="p-4 sm:p-5 border-t border-[var(--border)] animate-in fade-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSendPush} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1">Notification Title *</label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="e.g. 🎉 Weekend Starlight Diamond Sale!"
                    required
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1">Target Click URL</label>
                  <input
                    type="text"
                    value={pushUrl}
                    onChange={(e) => setPushUrl(e.target.value)}
                    placeholder="e.g. /games/mlbb or /giveaways"
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1">Message Body *</label>
                <textarea
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  placeholder="e.g. Get extra diamonds on MLBB Weekly Pass. Instant delivery in 60 seconds!"
                  required
                  rows={2}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>

              {/* Banner Image & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1 flex items-center gap-1">
                    <FiImage size={11} />
                    <span>Banner Image URL (Rich Media)</span>
                  </label>
                  <input
                    type="text"
                    value={pushImage}
                    onChange={(e) => setPushImage(e.target.value)}
                    placeholder="e.g. /game-assets/starkight.webp or https://..."
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  {/* Quick Pick Presets */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.label}
                        type="button"
                        onClick={() => setPushImage(img.url)}
                        className="text-[9px] px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/50 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        + {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1 flex items-center gap-1">
                    <FiTag size={11} />
                    <span>Notification Tag (Replaces old push cleanly)</span>
                  </label>
                  <input
                    type="text"
                    value={pushTag}
                    onChange={(e) => setPushTag(e.target.value)}
                    placeholder="promo-broadcast"
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <p className="text-[9px] text-[var(--muted)] mt-1">Notifications with the same tag overwrite older notifications without stacking.</p>
                </div>
              </div>

              {/* Live Preview Card */}
              {(pushTitle || pushBody || pushImage) && (
                <div className="mt-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50">
                  <p className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)] mb-2">Live Notification Preview (Android / PC)</p>
                  <div className="max-w-sm rounded-xl bg-black border border-white/10 p-3 shadow-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <img src="/logoBB.png" alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-[10px] font-bold text-gray-300">mlbbtopup.in</span>
                      <span className="text-[9px] text-gray-500 ml-auto">now</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{pushTitle || "Notification Title"}</p>
                      <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{pushBody || "Your message body text goes here..."}</p>
                    </div>
                    {pushImage && (
                      <div className="rounded-lg overflow-hidden border border-white/10 max-h-32 bg-black/50 flex items-center justify-center">
                        <img src={pushImage} alt="Promo" className="w-full h-auto max-h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {pushResult && (
                <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${pushResult.type === "success" ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400" : "bg-red-950/40 border border-red-500/30 text-red-400"}`}>
                  {pushResult.type === "success" ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
                  <span>{pushResult.message}</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={pushSending || !pushTitle.trim() || !pushBody.trim()}
                  className="bg-[var(--accent)] text-black font-bold text-xs px-4 py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {pushSending ? (
                    <>
                      <LoadingSpinner size="sm" color="current" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <FiSend size={12} />
                      <span>Send Broadcast Notification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Combined Multi-Line Chart ── */}
      <CombinedGrowthChart
        title={`PWA & Notification Trends — Last ${days} Days`}
        dailyInstalls={data.dailyInstalls || []}
        dailyActive={data.dailyActive || []}
        dailyPush={data.dailyPush || []}
      />

      {/* ── Push Subscribers List (Collapsible) ── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/30 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsSubscribersOpen(!isSubscribersOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[var(--card)]/50 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400 shrink-0">
              <FiBell size={13} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] truncate">
                Active Push Subscribers ({data.pushSubscribers?.length ?? 0})
              </h3>
              <p className="text-[10px] text-[var(--muted)] truncate">Recent subscribed browser tokens</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded bg-[var(--border)]/60 text-[var(--foreground)]">
              {isSubscribersOpen ? "Hide" : "Show"}
            </span>
            <div className="p-1 rounded text-[var(--muted)]">
              {isSubscribersOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
          </div>
        </button>

        {isSubscribersOpen && (
          <div className="border-t border-[var(--border)] animate-in fade-in slide-in-from-top-2 duration-200">
            {!data.pushSubscribers?.length ? (
              <p className="text-center text-[12px] text-[var(--muted)] py-8">No push subscribers yet</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {data.pushSubscribers.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400">
                        <FiBell size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-[var(--foreground)] truncate">
                          {item.user?.name || item.user?.email || (item.userId ? `User: ${item.userId}` : "Anonymous Device")}
                        </p>
                        <p className="text-[10px] text-[var(--muted)] truncate">
                          {deviceIcon(item.deviceType)} {item.os || "OS"} · {item.browser || "Browser"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                        <p className="text-[9px] text-[var(--muted)] mt-1">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {item.userId && (
                        <Link
                          href={`/owner-panal?tab=users&search=${item.userId}`}
                          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-colors"
                          title="View user"
                        >
                          <FiExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Registered users who installed (Collapsible) ── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/30 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsInstalledUsersOpen(!isInstalledUsersOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[var(--card)]/50 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 shrink-0">
              <FiUser size={13} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] truncate">
                Registered Users Who Installed PWA ({data.installedUsers?.length ?? 0})
              </h3>
              <p className="text-[10px] text-[var(--muted)] truncate">Accounts tracked with installed app</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded bg-[var(--border)]/60 text-[var(--foreground)]">
              {isInstalledUsersOpen ? "Hide" : "Show"}
            </span>
            <div className="p-1 rounded text-[var(--muted)]">
              {isInstalledUsersOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
          </div>
        </button>

        {isInstalledUsersOpen && (
          <div className="border-t border-[var(--border)] animate-in fade-in slide-in-from-top-2 duration-200">
            {!data.installedUsers?.length ? (
              <p className="text-center text-[12px] text-[var(--muted)] py-8">No registered users tracked yet</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {data.installedUsers.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shrink-0 text-[var(--accent)]">
                        {item.user?.avatar
                          ? <img src={item.user.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                          : <FiUser size={14} />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-[var(--foreground)] truncate">
                          {item.user?.name || item.user?.email || item.userId}
                        </p>
                        <p className="text-[10px] text-[var(--muted)] truncate">
                          {item.user?.email || item.user?.phone || "—"} ·{" "}
                          <span className="text-[var(--accent)]">{item.user?.userType || "user"}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                          {deviceIcon(item.deviceType)} {item.os} · {item.browser}
                        </p>
                        <p className="text-[10px] text-[var(--muted)]">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {item.userId && (
                        <Link
                          href={`/owner-panal?tab=users&search=${item.userId}`}
                          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-colors"
                          title="View user"
                        >
                          <FiExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Recent installs (Collapsible) ── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/30 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsRecentInstallsOpen(!isRecentInstallsOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[var(--card)]/50 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
              <FiDownload size={13} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] truncate">
                Recent Installs ({data.recent?.length ?? 0})
              </h3>
              <p className="text-[10px] text-[var(--muted)] truncate">Latest device installations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded bg-[var(--border)]/60 text-[var(--foreground)]">
              {isRecentInstallsOpen ? "Hide" : "Show"}
            </span>
            <div className="p-1 rounded text-[var(--muted)]">
              {isRecentInstallsOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
          </div>
        </button>

        {isRecentInstallsOpen && (
          <div className="border-t border-[var(--border)] animate-in fade-in slide-in-from-top-2 duration-200">
            {!data.recent?.length ? (
              <p className="text-center text-[12px] text-[var(--muted)] py-8">No installs yet</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {data.recent.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--muted)]">{deviceIcon(item.deviceType)}</span>
                      <p className="text-[12px] font-bold text-[var(--foreground)]">
                        {item.os} · {item.browser}
                      </p>
                    </div>
                    <span className="text-[10px] text-[var(--muted)]">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, subValue, subLabel, subText, icon, color, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-2.5 sm:p-3 transition-colors ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: color }} />
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[8.5px] sm:text-[9.5px] uppercase tracking-wider font-extrabold text-[var(--muted)] truncate leading-tight">
            {label}
          </p>
          <div className="flex items-baseline flex-wrap gap-1.5 mt-1">
            <span className="text-base sm:text-lg font-black leading-none tracking-tight" style={{ color }}>
              {value}
            </span>
            {subValue !== undefined && (
              <span className="text-[8.5px] font-extrabold px-1.5 py-0.5 rounded bg-[var(--border)]/70 text-[var(--foreground)] leading-none shrink-0">
                +{subValue} <span className="opacity-60 font-semibold">{subLabel}</span>
              </span>
            )}
            {subText && (
              <span className="text-[8.5px] font-semibold text-[var(--muted)] truncate leading-none">
                {subText}
              </span>
            )}
          </div>
        </div>
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ── Combined Multi-Line Growth Chart ── */
function CombinedGrowthChart({ title, dailyInstalls, dailyActive, dailyPush }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  const len = Math.max(dailyInstalls.length, dailyActive.length, dailyPush.length, 1);
  const max = Math.max(
    ...dailyInstalls.map((d) => d.count || 0),
    ...dailyActive.map((d) => d.count || 0),
    ...dailyPush.map((d) => d.count || 0),
    1
  );

  const buildPoints = (series) => {
    return series.map((d, i) => {
      const x = (i / Math.max(len - 1, 1)) * 100;
      const y = 100 - ((d.count || 0) / max) * 90 - 5; // 5% padding top/bottom
      return `${x},${y}`;
    }).join(" ");
  };

  const installPoints = buildPoints(dailyInstalls);
  const activePoints  = buildPoints(dailyActive);
  const pushPoints    = buildPoints(dailyPush);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/30 overflow-hidden">
      {/* Header with Title and Legend */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="text-[10px] font-bold text-[var(--muted)]">Installs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            <span className="text-[10px] font-bold text-[var(--muted)]">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
            <span className="text-[10px] font-bold text-[var(--muted)]">Subscribers</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 pb-3">
        <div className="relative h-36 w-full">
          {/* SVG Lines */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            {/* Grid horizontal guideline */}
            <line x1="0" y1="50" x2="100" y2="50" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
            <line x1="0" y1="95" x2="100" y2="95" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />

            {/* Active Users Line (Green) */}
            {dailyActive.length > 1 && (
              <polyline
                points={activePoints}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Installs Line (Red) */}
            {dailyInstalls.length > 1 && (
              <polyline
                points={installPoints}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Push Subscribers Line (Purple) */}
            {dailyPush.length > 1 && (
              <polyline
                points={pushPoints}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          {/* Interactive Hover Columns */}
          <div className="absolute inset-0 flex items-end">
            {dailyInstalls.map((d, i) => {
              const activeCount  = dailyActive[i]?.count || 0;
              const installCount = d.count || 0;
              const pushCount    = dailyPush[i]?.count || 0;

              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  className="flex-1 h-full flex flex-col items-center justify-end group relative z-10 cursor-pointer"
                >
                  {/* Vertical Crosshair on Hover */}
                  {hoverIdx === i && (
                    <div className="absolute top-0 bottom-0 w-px bg-white/20 pointer-events-none" />
                  )}

                  {/* Multi-data Shared Tooltip */}
                  {hoverIdx === i && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[var(--card)] border border-[var(--border)] rounded-lg p-2 text-[9px] shadow-2xl z-20 pointer-events-none whitespace-nowrap space-y-0.5">
                      <p className="font-extrabold text-gray-400 pb-0.5 border-b border-[var(--border)] mb-0.5">{d.date}</p>
                      <div className="flex items-center justify-between gap-3 text-[#ef4444]">
                        <span>Installs:</span>
                        <span className="font-black">{installCount}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[#22c55e]">
                        <span>Active:</span>
                        <span className="font-black">{activeCount}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[#a855f7]">
                        <span>Subscribers:</span>
                        <span className="font-black">{pushCount}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex gap-1.5 mt-3 pt-1 border-t border-[var(--border)]/30">
          {dailyInstalls.map((d, i) => {
            const show = dailyInstalls.length <= 10 || i % Math.ceil(dailyInstalls.length / 7) === 0 || i === dailyInstalls.length - 1;
            return (
              <div key={i} className="flex-1 text-center">
                {show && (
                  <span className="text-[8.5px] font-bold text-[var(--muted)]">{d.date.slice(5)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
