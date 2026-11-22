"use client";

import { useState, useEffect } from "react";
import { 
  Layout, 
  Layers, 
  Sparkles, 
  Globe, 
  MessageSquare, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Smartphone,
  Save,
  ExternalLink
} from "lucide-react";
import { InfoTooltip, SectionTitle } from "@/components/common";

const UiSettingsTab = () => {
  const [settings, setSettings] = useState({ 
    showTopNoticeBanner: false,
    showHomeEarnPromotion: false,
    showTradeMarketplaceBanner: false,
    showCustomWebBanner: false,
    showGamesWebBanner: false,
    showGiveawayBanner: true,
    showPwaInstallBanner: true,
    showPlayStoreBanner: true,
  });
  const [playStoreUrlInput, setPlayStoreUrlInput] = useState("https://play.google.com/store/apps/details?id=in.bluebuff.games");
  const [playStoreAppNameInput, setPlayStoreAppNameInput] = useState("Bluebuff Games");
  const [savingUrl, setSavingUrl] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        if (data.data.playStoreUrl) setPlayStoreUrlInput(data.data.playStoreUrl);
        if (data.data.playStoreAppName) setPlayStoreAppNameInput(data.data.playStoreAppName);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlayStoreDetails = async () => {
    try {
      setSavingUrl(true);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playStoreUrl: playStoreUrlInput.trim(),
          playStoreAppName: playStoreAppNameInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setMessage({ type: "success", text: "Play Store details updated successfully." });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update Play Store details" });
      }
    } catch (err) {
      console.error("Failed to update Play Store details", err);
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSavingUrl(false);
    }
  };

  const toggleBanner = async (bannerKey) => {
    try {
      setSavingKey(bannerKey);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");
      const newValue = !settings[bannerKey];

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [bannerKey]: newValue }),
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setMessage({ type: "success", text: `Settings updated.` });
      } else {
        setMessage({ type: "error", text: data.message || "Could not update settings" });
      }
    } catch (err) {
      console.error("Failed to update setting", err);
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSavingKey(null);
    }
  };

  const formatTitle = (key) => {
    if (key === "showPwaInstallBanner") return "MLBB Topup (PWA Floating Banner)";
    if (key === "showPlayStoreBanner") return "Bluebuff Games (Play Store Floating Banner)";
    return key.replace(/^show/, "").replace(/([A-Z])/g, " $1").trim();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-[var(--accent)]" size={28} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Loading UI settings...</p>
      </div>
    );
  }

  const sections = [
    {
      title: "Top Banners",
      subtitle: "Promotional notices and highlight banners on the homepage",
      icon: <Sparkles size={15} className="text-amber-400" />,
      accent: "#f59e0b",
      keys: [
        "showTopNoticeBanner",
        "showHomeEarnPromotion",
        "showTradeMarketplaceBanner",
        "showCustomWebBanner",
        "showGamesWebBanner",
        "showGiveawayBanner"
      ]
    },
    {
      title: "Community Popups",
      subtitle: "Engagement prompts and social group join popups",
      icon: <MessageSquare size={15} className="text-cyan-400" />,
      accent: "#06b6d4",
      keys: [
        "showTelegramPopup",
        "showWhatsappPopup",
        "showGamesPopup",
        "showJoinUsPopup"
      ]
    },
    {
      title: "Homepage Sections",
      subtitle: "Main product feeds, carousels, and activity widgets",
      icon: <Layout size={15} className="text-purple-400" />,
      accent: "#a855f7",
      keys: [
        "showGameBannerCarousel",
        "showStorySlider",
        "showBattleRoyaleSection",
        "showFlashSale",
        "showHomeQuickActions",
        "showEventsSection"
      ]
    },
    {
      title: "App Install Banners",
      subtitle: "Floating install prompts for PWA and Google Play Store",
      icon: <Smartphone size={15} className="text-sky-400" />,
      accent: "#0ea5e9",
      keys: [
        "showPwaInstallBanner",
        "showPlayStoreBanner"
      ]
    },
    {
      title: "Global UI Elements",
      subtitle: "Persistent site-wide navigation and components",
      icon: <Globe size={15} className="text-emerald-400" />,
      accent: "#10b981",
      keys: [
        "showBottomNav"
      ]
    }
  ];

  return (
    <div className="space-y-5 pb-8 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-end flex-wrap gap-2 pb-2.5 border-b border-[var(--border)]/70 mb-2">
        <button 
          aria-label="button"
          onClick={fetchSettings}
          className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] active:scale-95 transition-all flex items-center justify-center cursor-pointer ml-auto shrink-0"
          title="Refresh settings"
        >
          <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {message.text && (
        <div className={`p-2.5 flex items-center gap-2 text-xs font-bold uppercase rounded-lg border ${
          message.type === "success" 
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((sec) => (
          <div key={sec.title} className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/30">
            <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: sec.accent }} />
            
            <div className="px-3.5 sm:px-4 py-2.5 border-b border-[var(--border)] flex items-center gap-2">
              <div className="shrink-0">
                {sec.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] truncate">
                  {sec.title}
                </h3>
                <p className="text-[9.5px] text-[var(--muted)] truncate">{sec.subtitle}</p>
              </div>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {sec.keys.map((key) => {
                const isEnabled = !!settings[key];
                const isSaving = savingKey === key;

                return (
                  <div key={key} className="flex flex-col">
                    <div 
                      className="px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-[var(--foreground)]/[0.01] transition-colors"
                    >
                      <span className="text-xs font-bold text-[var(--foreground)] truncate">
                        {formatTitle(key)}
                      </span>

                      <button 
                        aria-label={`Toggle ${formatTitle(key)}`}
                        onClick={() => toggleBanner(key)}
                        disabled={isSaving}
                        className={`relative w-8 h-4 rounded-full transition-colors outline-none flex items-center px-0.5 shrink-0 ${
                          isEnabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                        } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${
                          isEnabled ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    {key === "showPlayStoreBanner" && isEnabled && (
                      <div className="px-3.5 sm:px-4 py-2.5 bg-[var(--foreground)]/[0.02] border-t border-[var(--border)] space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1">
                            <label className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">
                              App Name
                            </label>
                            <input
                              type="text"
                              value={playStoreAppNameInput}
                              onChange={(e) => setPlayStoreAppNameInput(e.target.value)}
                              placeholder="Bluebuff Games"
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                            />
                          </div>
                          <div className="flex-[2]">
                            <label className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">
                              Google Play URL
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                type="url"
                                value={playStoreUrlInput}
                                onChange={(e) => setPlayStoreUrlInput(e.target.value)}
                                placeholder="https://play.google.com/store/apps/details?id=in.bluebuff.games"
                                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                              />
                              <button
                                onClick={handleSavePlayStoreDetails}
                                disabled={savingUrl}
                                className="px-3 py-1.5 bg-[var(--accent)] text-black text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shrink-0 flex items-center gap-1"
                              >
                                {savingUrl ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UiSettingsTab;
