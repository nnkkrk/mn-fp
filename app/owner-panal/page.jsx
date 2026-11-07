"use client";

// Fresh HMR invalidation
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { LoadingSpinner, SectionTitle, SearchInput } from "@/components/common";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
  FiPocket,
  FiDatabase,
  FiGift,
  FiZap,
  FiUsers,
  FiKey,
  FiStar,
  FiShoppingCart,
  FiRepeat,
  FiMessageSquare,
  FiTag,
  FiImage,
  FiAward,
  FiSettings,
  FiLayout,
  FiSmartphone,
  FiFileText,
  FiShield,
  FiBarChart2,
  FiCalendar,
  FiTv,
  FiPackage,
} from "react-icons/fi";
import ProductCatalogTab from "@/components/admin/ProductCatalogTab";

import AuthGuard from "@/components/AuthGuard";
import UsersTab from "@/components/admin/UsersTab";
import MembershipsTab from "@/components/admin/MembershipsTab";
import OrdersTab from "@/components/admin/OrdersTab";
import PricingTab from "@/components/admin/PricingTab";
import TransactionsTab from "@/components/admin/TransactionsTab";
import SupportQueriesTab from "@/components/admin/SupportQueriesTab";
import BannersTab from "@/components/admin/BannersTab";
import StatsTab from "@/components/admin/StatsTab";
import SettingsTab from "@/components/admin/SettingsTab";
import RedeemCodesTab from "@/components/admin/RedeemCodesTab";
import ApiKeysTab from "@/components/admin/ApiKeysTab";
import UsdtTab from "@/components/admin/UsdtTab";
import PromotionalTab from "@/components/admin/PromotionalTab";
import CoinsAdminTab from "@/components/admin/CoinsAdminTab";
import AdsMonetizationTab from "@/components/admin/AdsMonetizationTab";
import FlashSaleTab from "@/components/admin/FlashSaleTab";
import TournamentsAdminTab from "@/components/admin/TournamentsAdminTab";
import EventsAdminTab from "@/components/admin/EventsAdminTab";


import UiSettingsTab from "@/components/admin/UiSettingsTab";
import PwaStatsTab from "@/components/admin/PwaStatsTab";
import GiveawayAdminTab from "@/components/admin/GiveawayAdminTab";
import BlocklistTab from "@/components/admin/BlocklistTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import ActivityTab from "@/components/admin/ActivityTab";
import BlogsTab from "@/components/admin/BlogsTab";


const MENU_CATEGORIES = [
  {
    category: "Insights & Overview",
    items: [
      { id: "analytics", label: "Analytics & Growth", icon: FiBarChart2 },
      { id: "activity", label: "Live Activity", icon: FiZap },
      { id: "pwa-stats", label: "App & PWA Stats", icon: FiSmartphone },
    ]
  },
  {
    category: "Orders & Finance",
    items: [
      { id: "orders", label: "Orders", icon: FiShoppingCart },
      { id: "transactions", label: "Transactions", icon: FiRepeat },
      { id: "wallet", label: "Wallet Balances", icon: FiPocket },
      { id: "usdt", label: "USDT Crypto", icon: FiDatabase },
    ]
  },
  {
    category: "Products & Pricing",
    items: [
      { id: "catalog", label: "Product Catalog", icon: FiPackage },
      { id: "pricing", label: "Pricing & Margins", icon: FiTag },
      { id: "flash-sale", label: "Flash Sale & Deals", icon: FiZap },
    ]
  },
  {
    category: "Users & Support",
    items: [
      { id: "users", label: "User Accounts", icon: FiUsers },
      { id: "memberships", label: "Memberships & VIP", icon: FiShield },
      { id: "queries", label: "Support Queries", icon: FiMessageSquare },
      { id: "blocklist", label: "Blocklist / Fraud", icon: FiShield },
    ]
  },
  {
    category: "Marketing & Rewards",
    items: [
      { id: "promotional", label: "Promotions & Offers", icon: FiStar },
      { id: "coins", label: "Coin Rewards", icon: FiZap },
      { id: "redeem", label: "Redeem Codes", icon: FiGift },
      { id: "giveaway", label: "Giveaways", icon: FiGift },
      { id: "tournaments", label: "Tournaments", icon: FiAward },
      { id: "events", label: "Events Calendar", icon: FiCalendar },
    ]
  },
  {
    category: "Content & Storefront",
    items: [
      { id: "banners", label: "Store Banners", icon: FiImage },
      { id: "blogs", label: "Blogs & Articles", icon: FiFileText },
      { id: "ads", label: "Ads & Monetization", icon: FiTv },
    ]
  },
  {
    category: "System & Settings",
    items: [
      { id: "ui-settings", label: "UI & Layout", icon: FiLayout },
      { id: "api-keys", label: "API Keys", icon: FiKey },
      { id: "settings", label: "General Settings", icon: FiSettings },
    ]
  }
];

const VALID_TABS = [
  "analytics", "activity", "pwa-stats",
  "orders", "transactions", "catalog", "pricing", "flash-sale", "wallet", "usdt",
  "users", "memberships", "queries", "blocklist",
  "promotional", "redeem", "coins", "ads", "banners", "giveaway", "events", "tournaments", "blogs",
  "ui-settings", "api-keys", "settings"
];

export default function AdminPanalPage() {
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState("orders");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setMenuSearch("");
  }, []);

  const filteredMenuCategories = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return MENU_CATEGORIES;

    return MENU_CATEGORIES.map((category) => {
      const catMatches = category.category.toLowerCase().includes(q);
      const matchingItems = category.items.filter(
        (item) =>
          catMatches ||
          item.label.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      );

      return {
        ...category,
        items: matchingItems,
      };
    }).filter((category) => category.items.length > 0);
  }, [menuSearch]);

  const totalMatchingItems = useMemo(() => {
    return filteredMenuCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredMenuCategories]);

  // Sync activeTab with URL (?tab=xyz) & restore on reload / back-forward
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tabFromUrl = params.get("tab");

    if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
      setActiveTabState(tabFromUrl);
      localStorage.setItem("adminActiveTab", tabFromUrl);
    } else {
      const savedTab = localStorage.getItem("adminActiveTab");
      if (savedTab && VALID_TABS.includes(savedTab)) {
        setActiveTabState(savedTab);
        const newUrl = `${window.location.pathname}?tab=${savedTab}`;
        window.history.replaceState({ tab: savedTab }, "", newUrl);
      } else {
        const newUrl = `${window.location.pathname}?tab=orders`;
        window.history.replaceState({ tab: "orders" }, "", newUrl);
      }
    }

    const handlePopState = (e) => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentTab = currentParams.get("tab") || e.state?.tab || "orders";
      if (VALID_TABS.includes(currentTab)) {
        setActiveTabState(currentTab);
        localStorage.setItem("adminActiveTab", currentTab);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    if (!VALID_TABS.includes(tabId)) return;
    setActiveTabState(tabId);
    if (typeof window !== "undefined") {
      localStorage.setItem("adminActiveTab", tabId);
      const newUrl = `${window.location.pathname}?tab=${tabId}`;
      window.history.pushState({ tab: tabId }, "", newUrl);
    }
  }, []);

  const handleMenuSearchKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const firstMatch = filteredMenuCategories[0]?.items[0];
      if (firstMatch) {
        if (firstMatch.href) {
          router.push(firstMatch.href);
        } else {
          handleTabChange(firstMatch.id);
          closeSidebar();
        }
      }
    } else if (e.key === "Escape") {
      closeSidebar();
    }
  }, [filteredMenuCategories, router, handleTabChange, closeSidebar]);

  const [pinPrompt, setPinPrompt] = useState(true);
  const [pinDigits, setPinDigits] = useState(["", "", "", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [verifyingPin, setVerifyingPin] = useState(false);
  const pinInputRefs = useRef([]);

  const SECRET_KEY = "bb_admin_secure_key_99";
  
  const encryptData = (text) => {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return btoa(result);
  };

  const decryptData = (base64) => {
    let text = atob(base64);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return result;
  };

  const handleDigitChange = (index, value) => {
    if (pinError) setPinError("");
    // Strictly numeric
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const newDigits = [...pinDigits];
      newDigits[index] = "";
      setPinDigits(newDigits);
      return;
    }

    const lastChar = cleanVal.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = lastChar;
    setPinDigits(newDigits);

    // Auto-focus next box
    if (index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    // Allow navigation, control keys, and backspace/delete
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Enter" ||
      (e.ctrlKey || e.metaKey)
    ) {
      if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
        pinInputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowLeft" && index > 0) {
        pinInputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < 5) {
        pinInputRefs.current[index + 1]?.focus();
      }
      return;
    }

    // Block ANY non-numeric key press
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    if (pinError) setPinError("");
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...pinDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setPinDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, 5);
    pinInputRefs.current[nextIndex]?.focus();
  };

  useEffect(() => {
    // 12-hour expiration check
    const savedAuth = localStorage.getItem("adminAuth");
    if (savedAuth) {
      try {
        const authData = JSON.parse(decryptData(savedAuth));
        const isExpired = new Date().getTime() > authData.expiresAt;
        if (!isExpired && authData.pin) {
          setPinPrompt(false);
          // Store temporarily in sessionStorage for the interceptor
          sessionStorage.setItem("adminPin", authData.pin);
        } else {
          localStorage.removeItem("adminAuth");
        }
      } catch (e) {
        localStorage.removeItem("adminAuth");
      }
    }
    
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [resource, config] = args;
      const currentPin = sessionStorage.getItem("adminPin") || "";
      
      if (typeof resource === 'string' && resource.includes('/api/admin')) {
        config = config || {};
        config.headers = {
          ...config.headers,
          "x-admin-pin": currentPin
        };
      }
      return originalFetch(resource, config);
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const handlePinSubmit = async (e) => {
    if (e) e.preventDefault();
    const currentPin = pinDigits.join("");
    if (currentPin.length !== 6) return;

    setVerifyingPin(true);
    setPinError("");

    try {
      const res = await fetch("/api/admin-auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: currentPin }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPinError(data.message || "Wrong PIN. Please try again.");
        setPinDigits(["", "", "", "", "", ""]);
        pinInputRefs.current[0]?.focus();
        return;
      }

      // Valid PIN
      const expiresAt = new Date().getTime() + (12 * 60 * 60 * 1000); // 12 hours
      const authData = encryptData(JSON.stringify({ pin: currentPin, expiresAt }));
      localStorage.setItem("adminAuth", authData);
      sessionStorage.setItem("adminPin", currentPin);
      setPinPrompt(false);
      window.location.reload();
    } catch (err) {
      setPinError("Connection error. Please try again.");
    } finally {
      setVerifyingPin(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("userType");
    if (role === "owner") {
      setIsOwner(true);
      setLoading(false);
    } else {
      // For extra security, verify with API
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user?.userType === "owner") {
            setIsOwner(true);
            localStorage.setItem("userType", "owner");
          } else {
            router.push("/");
          }
        })
        .catch(() => router.push("/"))
        .finally(() => setLoading(false));
    }
  }, []);

  const [queries, setQueries] = useState([]);

  const [balance, setBalance] = useState(null);
  const [providerBalances, setProviderBalances] = useState({ activeProvider: "1game", oneGame: null, bluebuff: null });
  const [banners, setBanners] = useState([]);


  /* ================= TABLE CONTROLS ================= */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  /* ================= PRICING STATE ================= */
  const [pricingType, setPricingType] = useState("admin");
  const [slabs, setSlabs] = useState([{ min: 0, max: 100, percent: 0 }]);
  const [overrides, setOverrides] = useState([]);
  const [gameConfigs, setGameConfigs] = useState([]);
  const [savingPricing, setSavingPricing] = useState(false);

  /* ================= HELPERS ================= */
  const normalizeSlabs = (list) =>
    [...list].sort((a, b) => a.min - b.min);

  const resetControls = () => {
    setSearch("");
    setPage(1);
  };


  /* ================= FETCH BALANCE ================= */
  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/game/balance");
      const data = await res.json();
      if (data.success) {
        setBalance(data?.balance?.data?.balance ?? data.balance);
        setProviderBalances({
          activeProvider: data.activeProvider || "1game",
          oneGame: data.oneGame,
          bluebuff: data.bluebuff,
        });
      }
    } catch (err) {
      console.error("Balance fetch failed", err);
    }
  };


  const fetchBanners = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/banners/game-banners", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBanners(data.data || []);
  };




  /* ================= FETCH PRICING ================= */
  const fetchPricing = async (type) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/pricing?userType=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success) {
      setSlabs(
        data.data?.slabs?.length
          ? data.data.slabs
          : [{ min: 0, max: 0, percent: 0 }]
      );
      setOverrides(data.data?.overrides || []);
      setGameConfigs(data.data?.gameConfigs || []);
    }
  };

  /* ================= SAVE PRICING ================= */
  const savePricing = async () => {
    try {
      setSavingPricing(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userType: pricingType,
          slabs: normalizeSlabs(slabs),
          overrides,
          gameConfigs,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed");
      } else {
        alert("Pricing updated successfully");
      }
    } finally {
      setSavingPricing(false);
    }
  };



  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    resetControls();
  }, [activeTab]);
  useEffect(() => {
    if (activeTab === "banners") fetchBanners();
  }, [activeTab]);


  useEffect(() => {
    if (activeTab === "pricing") fetchPricing(pricingType);
  }, [activeTab, pricingType, page, search]);

  if (pinPrompt) {
    const isComplete = pinDigits.every((d) => d !== "");
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 text-white p-4">
        <form
          onSubmit={handlePinSubmit}
          className="w-full max-w-[380px] bg-neutral-900 border border-neutral-800 p-7 sm:p-8 rounded-2xl flex flex-col items-center gap-6"
        >
          {/* Key Icon */}
          <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sky-400">
            <Icons.key size={22} className="stroke-[2.2]" />
          </div>

          {/* Header */}
          <SectionTitle
            align="center"
            size="md"
            subtitle="Secure Verification"
            title="Admin"
            highlight="PIN"
            description="Enter your 6-digit PIN"
          />

          {/* Error Banner */}
          {pinError && (
            <div className="w-full py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
              {pinError}
            </div>
          )}

          {/* 6 Digit Inputs */}
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-center gap-2.5 sm:gap-3" onPaste={handlePinPaste}>
              {pinDigits.map((digit, idx) => {
                const isFilled = Boolean(digit);
                return (
                  <input
                    key={idx}
                    ref={(el) => (pinInputRefs.current[idx] = el)}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    autoFocus={idx === 0}
                    className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl outline-none select-none transition-colors ${
                      pinError
                        ? "bg-neutral-950 border-2 border-red-500 text-red-400"
                        : isFilled
                        ? "bg-neutral-950 border-2 border-sky-400 text-sky-400"
                        : "bg-neutral-950 border border-neutral-800 text-white hover:border-neutral-700 focus:border-sky-400 focus:bg-neutral-900"
                    }`}
                  />
                );
              })}
            </div>

            {/* Quick Actions (Show/Hide & Clear) */}
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1 pt-1">
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer select-none font-medium"
              >
                {showPin ? <Icons.eyeOff size={14} /> : <Icons.eye size={14} />}
                <span>{showPin ? "Hide PIN" : "Show PIN"}</span>
              </button>

              {pinDigits.some((d) => d !== "") && (
                <button
                  type="button"
                  onClick={() => {
                    setPinDigits(["", "", "", "", "", ""]);
                    setPinError("");
                    pinInputRefs.current[0]?.focus();
                  }}
                  className="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer select-none font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            aria-label="Unlock Admin Panel"
            type="submit"
            disabled={!isComplete || verifyingPin}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-sm tracking-wide disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            {verifyingPin ? (
              <>
                <span className="w-4 h-4 border-2 border-neutral-950/40 border-t-neutral-950 rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              "Unlock"
            )}
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LoadingSpinner size="xl" color="accent" />
      </div>
    );
  }

  if (!isOwner) return null;

  return (
    <AuthGuard>
      <section className="min-h-screen bg-[var(--background)] px-2 sm:px-6 py-3">
        <div className="w-full max-w-[1600px] mx-auto">
          {/* HEADER (HIGHLIGHTED & CLEAN) */}
          <header className="mb-2.5 pb-2.5 border-b border-[var(--border)]/70">
            <SectionTitle
              as="h1"
              size="sm"
              title="Admin"
              highlight={MENU_CATEGORIES.flatMap((c) => c.items).find((i) => i.id === activeTab)?.label || "Console"}
              pulse
              actionLayout="row"
              action={
                <button
                  type="button"
                  aria-label="Open Admin Menu"
                  onClick={() => setIsSidebarOpen(true)}
                  className="px-2 py-1 rounded-lg hover:bg-[var(--foreground)]/[0.06] text-[var(--foreground)] hover:text-[var(--accent)] transition-all flex items-center gap-1.5 group shrink-0 cursor-pointer"
                >
                  <FiMenu size={16} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Menu</span>
                </button>
              }
            />
          </header>


          {/* HAMBURGER SIDEBAR SLIDER MENU */}
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={closeSidebar}
          />
          <div
            className={`fixed left-0 top-0 h-[100dvh] w-[85%] max-w-[320px] bg-[var(--background)] border-r border-[var(--border)] z-[2001] shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col transition-transform duration-300 ease-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            {/* Drawer Header */}
            <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                <h2 className="text-sm font-black tracking-widest uppercase text-[var(--foreground)]">Admin Menu</h2>
                {menuSearch.trim() && (
                  <span className="text-[9px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded-full border border-[var(--accent)]/20">
                    {totalMatchingItems}
                  </span>
                )}
              </div>
              <button
                type="button"
                aria-label="Close admin menu"
                onClick={closeSidebar}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--foreground)]/5 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="p-2.5 border-b border-[var(--border)] bg-[var(--card)]/20">
              <SearchInput
                value={menuSearch}
                onChange={setMenuSearch}
                onKeyDown={handleMenuSearchKeyDown}
                placeholder="Quick search tabs..."
                size="sm"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
              {/* DUAL BALANCE WIDGET INSIDE SIDEBAR (Hidden during search for quick access) */}
              {!menuSearch.trim() && (
                <div className="px-2.5 py-1.5 border-b border-[var(--border)] bg-[var(--card)]/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[7.5px] uppercase tracking-[0.14em] text-[var(--muted)] font-black">
                      API Provider Balances
                    </span>
                    <span className="text-[7px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Live
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* 1Game Card */}
                    <div
                      className={`px-2 py-1 rounded-lg border transition-all ${
                        providerBalances.activeProvider === "1game"
                          ? "bg-emerald-500/[0.08] border-emerald-500/35 shadow-[0_0_8px_rgba(16,185,129,0.08)]"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-[var(--muted)]">1Game</span>
                        {providerBalances.activeProvider === "1game" ? (
                          <span className="text-[6.5px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1 py-0.2 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="text-[6.5px] font-bold uppercase text-[var(--muted)]/40">
                            Backup
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] font-black text-[var(--foreground)] mt-0.5 tabular-nums tracking-tight">
                        {providerBalances.oneGame?.balance !== undefined
                          ? `${providerBalances.oneGame.balance.toFixed(2)}`
                          : "---"}
                      </div>
                    </div>

                    {/* Bluebuff Card */}
                    <div
                      className={`px-2 py-1 rounded-lg border transition-all ${
                        providerBalances.activeProvider === "bluebuff"
                          ? "bg-cyan-500/[0.08] border-cyan-500/35 shadow-[0_0_8px_rgba(6,182,212,0.08)]"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-[var(--muted)]">Bluebuff</span>
                        {providerBalances.activeProvider === "bluebuff" ? (
                          <span className="text-[6.5px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 px-1 py-0.2 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="text-[6.5px] font-bold uppercase text-[var(--muted)]/40">
                            Backup
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] font-black text-[var(--foreground)] mt-0.5 tabular-nums tracking-tight">
                        {providerBalances.bluebuff?.balance !== undefined
                          ? `${providerBalances.bluebuff.balance.toFixed(2)}`
                          : "---"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORIZED MENU WITH ICONS */}
              <div className="px-3 py-3 space-y-4">
                {filteredMenuCategories.map((category) => (
                  <div key={category.category} className="space-y-1">
                    <h3 className="px-2 pb-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--muted)]/80 flex items-center justify-between">
                      <span>{category.category}</span>
                      <span className="text-[8px] font-normal text-[var(--muted)]/50">{category.items.length}</span>
                    </h3>
                    <div className="space-y-0.5">
                      {category.items.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;
                        return (
                          <button
                            type="button"
                            aria-label={item.label}
                            key={item.id}
                            onClick={() => {
                              if (item.href) {
                                router.push(item.href);
                              } else {
                                handleTabChange(item.id);
                                closeSidebar();
                              }
                            }}
                            className={`
                              w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all tracking-wide group cursor-pointer
                              ${isActive 
                                ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 shadow-xs" 
                                : "text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] border border-transparent"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                size={14}
                                className={`shrink-0 transition-colors ${
                                  isActive
                                    ? "text-[var(--accent)]"
                                    : "text-[var(--muted)] group-hover:text-[var(--foreground)]"
                                }`}
                              />
                              <span className="truncate">{item.label}</span>
                            </div>

                            {item.id === "activity" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {totalMatchingItems === 0 && (
                  <div className="py-10 px-4 text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/5 text-[var(--muted)]/60 flex items-center justify-center mx-auto">
                      <FiSearch size={14} />
                    </div>
                    <p className="text-xs font-bold text-[var(--foreground)]">No tabs match "{menuSearch}"</p>
                    <p className="text-[10px] text-[var(--muted)]/70">Try searching for orders, users, pricing, or settings</p>
                    <button
                      type="button"
                      onClick={() => setMenuSearch("")}
                      className="text-[10px] font-bold text-[var(--accent)] hover:underline mt-1 cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
              
            </div>
          </div>



          {/* PANEL CONTENT (NO OUTER CARD) */}
          <div className="w-full">
            {activeTab === "wallet" && <StatsTab />}
            {activeTab === "usdt" && <UsdtTab />}
            {activeTab === "redeem" && <RedeemCodesTab />}
            {activeTab === "coins" && <CoinsAdminTab />}
            {activeTab === "ads" && <AdsMonetizationTab />}
            {activeTab === "users" && (
              <UsersTab />
            )}
            
            {activeTab === "memberships" && (
              <MembershipsTab />
            )}

            {activeTab === "api-keys" && (
              <ApiKeysTab />
            )}

            {activeTab === "promotional" && (
              <PromotionalTab />
            )}

            {activeTab === "orders" && (
              <OrdersTab

              />
            )}

            {activeTab === "transactions" && (
              <TransactionsTab />
            )}

            {activeTab === "queries" && (
              <SupportQueriesTab

              />
            )}
            {activeTab === "banners" && (
              <BannersTab banners={banners} onRefresh={fetchBanners} />
            )}


            {activeTab === "catalog" && (
              <ProductCatalogTab
                onStockUpdated={() => {
                  fetchPricing(pricingType);
                }}
              />
            )}
            {activeTab === "pricing" && (
              <PricingTab
                pricingType={pricingType}
                setPricingType={setPricingType}
                slabs={slabs}
                setSlabs={setSlabs}
                overrides={overrides}
                setOverrides={setOverrides}
                gameConfigs={gameConfigs}
                setGameConfigs={setGameConfigs}
                savingPricing={savingPricing}
                onSave={savePricing}
              />
            )}
            {activeTab === "flash-sale" && (
              <FlashSaleTab />
            )}
            {activeTab === "events" && (
              <EventsAdminTab />
            )}
            {activeTab === "tournaments" && (
              <TournamentsAdminTab />
            )}
            {activeTab === "blogs" && (
              <BlogsTab />
            )}
            {activeTab === "ui-settings" && (
              <UiSettingsTab />
            )}
            {activeTab === "analytics" && (
              <AnalyticsTab onNavigate={handleTabChange} />
            )}
            {activeTab === "activity" && (
              <ActivityTab onNavigate={handleTabChange} />
            )}
            {activeTab === "pwa-stats" && (
              <PwaStatsTab />
            )}
            {activeTab === "giveaway" && (
              <GiveawayAdminTab />
            )}
            {activeTab === "blocklist" && (
              <BlocklistTab />
            )}
            {activeTab === "settings" && (
              <SettingsTab onProviderChange={fetchBalance} providerBalances={providerBalances} />
            )}
          </div>


        </div>
      </section>
    </AuthGuard>
  );
}
