"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv,
  Globe,
  Coins,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Save,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Check,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Layers,
  Bell,
  MousePointer,
  Tag,
  Code,
  Power
} from "lucide-react";
import { LoadingSpinner, SectionTitle } from "@/components/common";

/**
 * Standard iOS-style Toggle Switch
 */
function ToggleSwitch({ checked, onChange, disabled = false, size = "md" }) {
  const isSm = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 ${
        isSm ? "h-5 w-9" : "h-6 w-11"
      } ${checked ? "bg-emerald-500" : "bg-[var(--border)] hover:bg-[var(--foreground)]/20"}`}
    >
      <span
        className={`pointer-events-none inline-block transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          isSm ? "h-3.5 w-3.5" : "h-4.5 w-4.5"
        } ${checked ? (isSm ? "translate-x-4.5" : "translate-x-5.5") : "translate-x-1"}`}
      />
    </button>
  );
}

export default function AdsMonetizationTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("formats"); // "formats" | "channels" | "advanced"

  // Master & Direct Monetization
  const [adsterraLink, setAdsterraLink] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [defaultRewardCoins, setDefaultRewardCoins] = useState(1);
  const [defaultCooldownMinutes, setDefaultCooldownMinutes] = useState(30);
  const [channels, setChannels] = useState([]);

  // Ad Format Controls
  const [enableBanners, setEnableBanners] = useState(true);
  const [enableSocialBar, setEnableSocialBar] = useState(false);
  const [enablePopunder, setEnablePopunder] = useState(false);
  const [showAdBadge, setShowAdBadge] = useState(true);
  const [adBadgeText, setAdBadgeText] = useState("Ad");

  // Adsterra Keys & Scripts
  const [nativeBannerId, setNativeBannerId] = useState("c755433b5487dae7313fbaa97a482b40");
  const [nativeBannerSrc, setNativeBannerSrc] = useState("https://pl29207483.effectivecpmnetwork.com/c755433b5487dae7313fbaa97a482b40/invoke.js");
  const [socialBarSrc, setSocialBarSrc] = useState("https://pl29247592.effectivecpmnetwork.com/a5/bb/66/a5bb66c93c9892d321190ff4ef0081a4.js");
  const [popunderSrc, setPopunderSrc] = useState("https://pl29813171.effectivecpmnetwork.com/22/23/95/2223956ef92dbcb14085fcaa81bc9718.js");
  const [banner320x50Key, setBanner320x50Key] = useState("183ee4e45520fb7aa8e1d934a0970c31");
  const [banner300x250Key, setBanner300x250Key] = useState("12769ff4f11c1254fd7310aea93f838d");

  // Modal State for Add / Edit Channel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [channelForm, setChannelForm] = useState({
    id: "",
    title: "",
    link: "",
    reward: 1,
    cooldownMinutes: 25,
    enabled: true,
  });

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchAdsConfig();
  }, []);

  const fetchAdsConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/ads-config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setAdsterraLink(d.adsterraLink || "");
        setEnabled(d.enabled !== false);
        setEnableBanners(d.enableBanners !== false);
        setEnableSocialBar(d.enableSocialBar === true);
        setEnablePopunder(d.enablePopunder === true);
        setShowAdBadge(d.showAdBadge !== false);
        setAdBadgeText(d.adBadgeText || "Ad");

        if (d.nativeBannerId) setNativeBannerId(d.nativeBannerId);
        if (d.nativeBannerSrc) setNativeBannerSrc(d.nativeBannerSrc);
        if (d.socialBarSrc) setSocialBarSrc(d.socialBarSrc);
        if (d.popunderSrc) setPopunderSrc(d.popunderSrc);
        if (d.banner320x50Key) setBanner320x50Key(d.banner320x50Key);
        if (d.banner300x250Key) setBanner300x250Key(d.banner300x250Key);

        setDefaultRewardCoins(d.defaultRewardCoins ?? 1);
        setDefaultCooldownMinutes(d.defaultCooldownMinutes ?? 30);

        const chs = (d.channels || []).map((c) => ({
          id: c.id,
          title: c.title,
          link: c.link,
          reward: c.reward ?? 1,
          cooldownMinutes: Math.max(1, Math.round((c.cooldownMs || 1500000) / 60000)),
          enabled: c.enabled !== false,
        }));
        setChannels(chs);
      }
    } catch (err) {
      console.error("Failed to load ads config:", err);
      setMessage({ type: "error", text: "Failed to load ads configuration" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async (overrideChannels, overrideConfig = {}) => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");

      const channelsToSave = overrideChannels || channels;

      const payload = {
        adsterraLink: adsterraLink.trim(),
        enabled: overrideConfig.enabled !== undefined ? overrideConfig.enabled : enabled,
        enableBanners: overrideConfig.enableBanners !== undefined ? overrideConfig.enableBanners : enableBanners,
        enableSocialBar: overrideConfig.enableSocialBar !== undefined ? overrideConfig.enableSocialBar : enableSocialBar,
        enablePopunder: overrideConfig.enablePopunder !== undefined ? overrideConfig.enablePopunder : enablePopunder,
        showAdBadge: overrideConfig.showAdBadge !== undefined ? overrideConfig.showAdBadge : showAdBadge,
        adBadgeText: (overrideConfig.adBadgeText || adBadgeText).trim(),
        nativeBannerId: nativeBannerId.trim(),
        nativeBannerSrc: nativeBannerSrc.trim(),
        socialBarSrc: socialBarSrc.trim(),
        popunderSrc: popunderSrc.trim(),
        banner320x50Key: banner320x50Key.trim(),
        banner300x250Key: banner300x250Key.trim(),
        defaultRewardCoins: Number(defaultRewardCoins),
        defaultCooldownMinutes: Number(defaultCooldownMinutes),
        channels: channelsToSave.map((c) => ({
          id: c.id,
          title: c.title,
          link: c.link,
          reward: Number(c.reward),
          cooldownMinutes: Number(c.cooldownMinutes),
          cooldownMs: Number(c.cooldownMinutes) * 60 * 1000,
          enabled: c.enabled,
        })),
      };

      const res = await fetch("/api/admin/ads-config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3500);
      } else {
        setMessage({ type: "error", text: json.message || "Failed to update settings" });
      }
    } catch (err) {
      console.error("Error saving ads config:", err);
      setMessage({ type: "error", text: "Network error saving settings" });
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Master Kill Switch / Enabler
  const isAllAdsDisabled = !enabled && !enableBanners && !enableSocialBar && !enablePopunder;

  const handleToggleAllAds = async () => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");

      const willEnable = isAllAdsDisabled;
      const nextEnabled = willEnable;
      const nextEnableBanners = willEnable;
      const nextEnableSocialBar = false;
      const nextEnablePopunder = false;

      setEnabled(nextEnabled);
      setEnableBanners(nextEnableBanners);
      setEnableSocialBar(nextEnableSocialBar);
      setEnablePopunder(nextEnablePopunder);

      const payload = {
        enabled: nextEnabled,
        enableBanners: nextEnableBanners,
        enableSocialBar: nextEnableSocialBar,
        enablePopunder: nextEnablePopunder,
      };

      const res = await fetch("/api/admin/ads-config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({
          type: "success",
          text: willEnable
            ? "Ads re-enabled (Banners active, Popups muted)"
            : "All ads disabled site-wide!",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      } else {
        setMessage({ type: "error", text: json.message || "Failed to toggle ads" });
      }
    } catch (err) {
      console.error("Error toggling all ads:", err);
      setMessage({ type: "error", text: "Network error toggling ads" });
    } finally {
      setSaving(false);
    }
  };

  // Channels management
  const handleOpenAdd = () => {
    setEditingIndex(null);
    setChannelForm({
      id: `watch_${channels.length + 1}`,
      title: `Channel ${channels.length + 1}`,
      link: "",
      reward: defaultRewardCoins || 1,
      cooldownMinutes: 25,
      enabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    setChannelForm({ ...channels[index] });
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!channelForm.title.trim() || !channelForm.link.trim()) {
      alert("Please provide both channel title and ad link URL.");
      return;
    }

    const updated = [...channels];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...channelForm };
    } else {
      updated.push({
        ...channelForm,
        id: channelForm.id.trim() || `watch_${Date.now()}`,
      });
    }

    setChannels(updated);
    setIsModalOpen(false);
    handleSaveAll(updated);
  };

  const handleDeleteChannel = (index) => {
    if (!confirm(`Are you sure you want to delete ${channels[index].title}?`)) return;
    const updated = channels.filter((_, i) => i !== index);
    setChannels(updated);
    handleSaveAll(updated);
  };

  const handleToggleChannel = (index) => {
    const updated = [...channels];
    updated[index].enabled = !updated[index].enabled;
    setChannels(updated);
    handleSaveAll(updated);
  };

  const handleApply2xRewards = () => {
    const updated = channels.map((c) => ({
      ...c,
      reward: Math.max(1, c.reward * 2),
    }));
    setChannels(updated);
    handleSaveAll(updated);
    setMessage({ type: "success", text: "Applied 2x Coin Boost to all channels!" });
  };

  const handleApplyQuickCooldown = () => {
    const updated = channels.map((c) => ({
      ...c,
      cooldownMinutes: 15,
    }));
    setChannels(updated);
    handleSaveAll(updated);
    setMessage({ type: "success", text: "Set 15-minute quick cooldown on all channels!" });
  };

  const handleCopyLink = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LoadingSpinner size="lg" color="accent" />
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Loading Ads Configuration...</p>
      </div>
    );
  }

  const activeChannelsCount = channels.filter((c) => c.enabled).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
            isAllAdsDisabled
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          }`}>
            {isAllAdsDisabled ? "All Ads Muted" : "Active"}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Refresh */}
          <button
            type="button"
            onClick={fetchAdsConfig}
            disabled={saving}
            className="w-8 h-8 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-all flex items-center justify-center cursor-pointer shrink-0 border border-transparent hover:border-[var(--border)]"
            title="Refresh settings"
          >
            <RefreshCcw size={13} className={saving ? "animate-spin" : ""} />
          </button>

          {/* 1-Click Master Kill / Enable Switch */}
          <button
            type="button"
            onClick={handleToggleAllAds}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 border shadow-xs ${
              isAllAdsDisabled
                ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border-rose-500/30"
            }`}
            title={isAllAdsDisabled ? "Enable ads site-wide" : "Instantly disable all ads site-wide"}
          >
            <Power size={13} className={isAllAdsDisabled ? "" : "animate-pulse"} />
            <span>{isAllAdsDisabled ? "Enable Ads" : "1-Click Disable All"}</span>
          </button>

          {/* Save All Button */}
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground,white)] font-bold text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. ALERT MESSAGE BANNER */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border ${
              message.type === "success"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-rose-400 bg-rose-500/10 border-rose-500/20"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MINIMAL STATUS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Status */}
        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider block">Global Monetization</span>
            <span className="text-xs font-black text-[var(--foreground)] mt-0.5 block">
              {enabled && !isAllAdsDisabled ? "Online & Serving" : "Paused / Disabled"}
            </span>
          </div>
          <ToggleSwitch checked={enabled && !isAllAdsDisabled} onChange={() => handleToggleAllAds()} size="sm" />
        </div>

        {/* Banners Status */}
        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider block">Banner Placements</span>
            <span className="text-xs font-black text-[var(--foreground)] mt-0.5 block">
              {enableBanners && !isAllAdsDisabled ? "Banners Active" : "Banners Muted"}
            </span>
          </div>
          <ToggleSwitch checked={enableBanners && !isAllAdsDisabled} onChange={(val) => setEnableBanners(val)} size="sm" />
        </div>

        {/* Channels Count */}
        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider block">Rewarded Channels</span>
            <span className="text-xs font-black text-[var(--foreground)] mt-0.5 block">
              {activeChannelsCount} of {channels.length} Channels Active
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("channels")}
            className="text-[10px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
          >
            Manage →
          </button>
        </div>
      </div>

      {/* 4. SEGMENTED SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--card)]/60 border border-[var(--border)] overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("formats")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "formats"
              ? "bg-[var(--foreground)]/10 text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
          }`}
        >
          <Layers size={13} className={activeTab === "formats" ? "text-amber-400" : ""} />
          <span>Ad Formats & Placements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("channels")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "channels"
              ? "bg-[var(--foreground)]/10 text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
          }`}
        >
          <Tv size={13} className={activeTab === "channels" ? "text-blue-400" : ""} />
          <span>Watch & Earn Channels</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[var(--foreground)]/10 text-[var(--foreground)]">
            {channels.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("advanced")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "advanced"
              ? "bg-[var(--foreground)]/10 text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
          }`}
        >
          <Code size={13} className={activeTab === "advanced" ? "text-purple-400" : ""} />
          <span>Adsterra Script Keys</span>
        </button>
      </div>

      {/* 5. TAB CONTENT */}
      {/* ===================== TAB 1: AD FORMATS & PLACEMENTS ===================== */}
      {activeTab === "formats" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Format Toggle Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Banner Ads */}
            <div className="p-4 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Tv size={14} />
                  </div>
                  <span className="text-xs font-black uppercase text-[var(--foreground)]">Banner Ads</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  320x50, 300x250, native, and footer banners in sidebar, blog, and coin rewards.
                </p>
              </div>
              <ToggleSwitch checked={enableBanners} onChange={(val) => setEnableBanners(val)} />
            </div>

            {/* Pop-up / Social Bar */}
            <div className="p-4 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Bell size={14} />
                  </div>
                  <span className="text-xs font-black uppercase text-[var(--foreground)]">Pop-up / Social Bar</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Floating alerts and push notification modals. Disabled by default for clean UX.
                </p>
              </div>
              <ToggleSwitch checked={enableSocialBar} onChange={(val) => setEnableSocialBar(val)} />
            </div>

            {/* Popunder Redirects */}
            <div className="p-4 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <MousePointer size={14} />
                  </div>
                  <span className="text-xs font-black uppercase text-[var(--foreground)]">Popunder Redirects</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Background new-tab redirects on clicks. Recommended kept disabled.
                </p>
              </div>
              <ToggleSwitch checked={enablePopunder} onChange={(val) => setEnablePopunder(val)} />
            </div>

            {/* Overlapping Badge */}
            <div className="p-4 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Tag size={14} />
                  </div>
                  <span className="text-xs font-black uppercase text-[var(--foreground)]">Overlapping "Ad" Badge</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Floating badge on top edges of banner cards.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Label:</span>
                  <input
                    type="text"
                    value={adBadgeText}
                    onChange={(e) => setAdBadgeText(e.target.value)}
                    placeholder="Ad"
                    className="w-24 px-2 py-1 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
              <ToggleSwitch checked={showAdBadge} onChange={(val) => setShowAdBadge(val)} />
            </div>
          </div>

          {/* Direct Monetization URL & Fallbacks */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Globe size={14} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-[var(--foreground)]">
                  Primary Adsterra Direct URL
                </h3>
                <p className="text-[10px] text-[var(--muted)]">
                  Used for high-CPM gateway redirects and task unlock verification
                </p>
              </div>
            </div>

            {/* Direct URL Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                  <Link2 size={14} />
                </div>
                <input
                  type="url"
                  value={adsterraLink}
                  onChange={(e) => setAdsterraLink(e.target.value)}
                  placeholder="https://www.profitablecpmratenetwork.com/..."
                  className="w-full pl-9 pr-20 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] font-mono outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(adsterraLink)}
                  className="absolute right-1.5 top-1.5 px-2 py-1 rounded-lg bg-[var(--card)] hover:bg-[var(--foreground)]/10 text-[var(--muted)] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {adsterraLink && (
                <button
                  type="button"
                  onClick={() => window.open(adsterraLink, "_blank", "noopener,noreferrer")}
                  className="px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--foreground)]/5 text-[var(--foreground)] text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  title="Test link"
                >
                  <span>Test</span>
                  <ExternalLink size={12} className="text-[var(--muted)]" />
                </button>
              )}
            </div>

            {/* Default Reward & Cooldown Fallbacks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]/50">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Default Reward (Fallback)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={defaultRewardCoins}
                    onChange={(e) => setDefaultRewardCoins(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  />
                  <span className="absolute right-3 top-2 text-[10px] font-bold text-[var(--muted)]">BBC</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Default Cooldown (Fallback)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={defaultCooldownMinutes}
                    onChange={(e) => setDefaultCooldownMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  />
                  <span className="absolute right-3 top-2 text-[10px] font-bold text-[var(--muted)]">Minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: WATCH & EARN CHANNELS ===================== */}
      {activeTab === "channels" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Toolbar with Multipliers and Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" />
                Quick Boosts:
              </span>
              <button
                type="button"
                onClick={handleApply2xRewards}
                className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
              >
                <Zap size={11} />
                <span>2x Coins</span>
              </button>
              <button
                type="button"
                onClick={handleApplyQuickCooldown}
                className="px-2.5 py-1 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--border)] text-[var(--foreground)] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
              >
                <Clock size={11} />
                <span>15m Cooldown</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus size={13} />
              <span>Add Channel</span>
            </button>
          </div>

          {/* Channel Cards */}
          <div className="space-y-2">
            {channels.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[var(--card)]/20 border border-dashed border-[var(--border)]">
                <Tv size={24} className="mx-auto text-[var(--muted)]/40 mb-2" />
                <p className="text-xs font-bold text-[var(--muted)]">No Watch & Earn channels configured yet.</p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="mt-2 text-xs text-[var(--accent)] font-bold hover:underline cursor-pointer"
                >
                  + Add your first ad channel
                </button>
              </div>
            ) : (
              channels.map((channel, idx) => (
                <div
                  key={channel.id || idx}
                  className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    channel.enabled
                      ? "bg-[var(--card)]/30 border-[var(--border)] hover:border-[var(--accent)]/40"
                      : "bg-[var(--card)]/10 border-[var(--border)]/40 opacity-50"
                  }`}
                >
                  {/* Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        channel.enabled
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-[var(--foreground)]/5 border-[var(--border)] text-[var(--muted)]"
                      }`}
                    >
                      <Tv size={14} />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-[var(--foreground)] truncate">
                          {channel.title}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--foreground)]/5 text-[var(--muted)] border border-[var(--border)]">
                          {channel.id}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-[var(--muted)] truncate max-w-sm">
                        {channel.link || "No URL"}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Stats */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center gap-1">
                        <Coins size={10} />
                        +{channel.reward} BBC
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center gap-1">
                        <Clock size={10} />
                        {channel.cooldownMinutes}m
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {channel.link && (
                        <button
                          type="button"
                          onClick={() => window.open(channel.link, "_blank", "noopener,noreferrer")}
                          className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                          title="Test URL"
                        >
                          <ExternalLink size={12} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleChannel(idx)}
                        className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        title={channel.enabled ? "Disable" : "Enable"}
                      >
                        {channel.enabled ? <Eye size={12} className="text-emerald-400" /> : <EyeOff size={12} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(idx)}
                        className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteChannel(idx)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--muted)] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: SCRIPT KEYS & URLS ===================== */}
      {activeTab === "advanced" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-[var(--foreground)]">
                Adsterra Placement Zone Keys & Script URLs
              </h3>
              <p className="text-[10px] text-[var(--muted)] mt-0.5">
                Technical IDs connected to your Adsterra publisher account. Modify only when creating new ad zones.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[var(--muted)]">320x50 Banner Key (Sidebar / Footer)</label>
                <input
                  type="text"
                  value={banner320x50Key}
                  onChange={(e) => setBanner320x50Key(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[var(--muted)]">300x250 Banner Key (Medium Box)</label>
                <input
                  type="text"
                  value={banner300x250Key}
                  onChange={(e) => setBanner300x250Key(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[var(--muted)]">Native Container ID</label>
                <input
                  type="text"
                  value={nativeBannerId}
                  onChange={(e) => setNativeBannerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[var(--muted)]">Native Banner Script URL</label>
                <input
                  type="text"
                  value={nativeBannerSrc}
                  onChange={(e) => setNativeBannerSrc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[var(--muted)]">Social Bar (Popup) Script URL</label>
                <input
                  type="text"
                  value={socialBarSrc}
                  onChange={(e) => setSocialBarSrc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[var(--muted)]">Popunder Script URL</label>
                <input
                  type="text"
                  value={popunderSrc}
                  onChange={(e) => setPopunderSrc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADD / EDIT CHANNEL MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Tv size={15} className="text-amber-400" />
                  <h3 className="text-xs font-black uppercase text-[var(--foreground)]">
                    {editingIndex !== null ? "Edit Ad Channel" : "Add Watch & Earn Channel"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* ID & Title */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--muted)]">Channel ID</label>
                    <input
                      type="text"
                      value={channelForm.id}
                      onChange={(e) => setChannelForm({ ...channelForm, id: e.target.value })}
                      placeholder="e.g. watch_5"
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--muted)]">Title</label>
                    <input
                      type="text"
                      value={channelForm.title}
                      onChange={(e) => setChannelForm({ ...channelForm, title: e.target.value })}
                      placeholder="Channel Title"
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                {/* Link */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[var(--muted)]">Adsterra Direct Link (URL)</label>
                  <input
                    type="url"
                    value={channelForm.link}
                    onChange={(e) => setChannelForm({ ...channelForm, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Reward & Cooldown */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--muted)]">Reward (Coins)</label>
                    <input
                      type="number"
                      min="0"
                      value={channelForm.reward}
                      onChange={(e) => setChannelForm({ ...channelForm, reward: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--muted)]">Cooldown (Mins)</label>
                    <input
                      type="number"
                      min="1"
                      value={channelForm.cooldownMinutes}
                      onChange={(e) => setChannelForm({ ...channelForm, cooldownMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                {/* Status Switch */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <span className="text-[11px] font-bold text-[var(--foreground)]">Enable Channel</span>
                  <ToggleSwitch
                    checked={channelForm.enabled}
                    onChange={(val) => setChannelForm({ ...channelForm, enabled: val })}
                    size="sm"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModal}
                  className="px-4 py-1.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground,white)] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Save Channel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
