"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import CustomWebBanner from "../Home/CustomWebBanner";
import AAdsBanner from "../Ads/AAdsBanner";
import api from "@/lib/axios";
import { FiHeart, FiChevronRight, FiChevronDown, FiLogOut, FiCheckCircle, FiShield, FiZap, FiMenu, FiX, FiLayers, FiCompass, FiGrid, FiShoppingBag, FiMessageSquare, FiUser, FiUsers, FiKey, FiGift, FiAward, FiDownload, FiBell, FiCalendar } from "react-icons/fi";
import { CopyButton } from "@/components/common";
import { 
  isPushNotificationSupported, 
  isDeviceAlreadySubscribed, 
  getNotificationPermission, 
  subscribeToPush 
} from "@/lib/pushNotification";

import { useAuthStore } from "@/store/useAuthStore";

/* ================= CONFIG ================= */
const HEADER_CONFIG = {
  logo: {
    src: "/logoBB.png",
    alt: "mlbbtopup.in",
    width: 140,
    height: 40,
  },

  nav: [
    { label: "Services", href: "/services", icon: <FiGrid size={14} />, colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { label: "News", href: "/blog", icon: <FiLayers size={14} />, colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { label: "Giveaways", href: "/giveaways", icon: <FiGift size={14} />, colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  ],

  userMenu: {
    common: [
      { label: "Events Calendar", href: "#", icon: <FiCalendar size={20} />, desc: "Tournaments & Schedule", colorClass: "text-blue-400", isHighlight: true, comingSoon: true },
      { label: "My Orders", href: "/dashboard/orders", icon: <FiShoppingBag size={20} />, desc: "Track your top-ups", colorClass: "text-cyan-400" },
      { label: "My Wallet", href: "/dashboard/wallet", icon: <FiLayers size={20} />, desc: "Balance & Recharge", colorClass: "text-pink-400" },
      { label: "Earn BBC", href: "/dashboard/coins", icon: <FiZap size={18} />, desc: "FREE Tasks, Check-in & Games", colorClass: "text-yellow-400" },
      { label: "Redeem Code", href: "/dashboard/redeem", icon: <FiGift size={18} />, desc: "Claim gift credits", colorClass: "text-emerald-400" },
      { label: "Refer & Earn", href: "/dashboard/referral", icon: <FiUsers size={18} />, desc: "Earn rewards", colorClass: "text-indigo-400" },
      { label: "My Tournaments", href: "/dashboard/tournaments", icon: <FiAward size={18} />, desc: "View your joined scrims", colorClass: "text-rose-400" },

      { label: "My Profile", href: "/dashboard/me", icon: <FiUser size={18} />, desc: "View & Edit Profile", colorClass: "text-[var(--foreground)]/80" },
      { label: "API Setup", href: "https://api.bluebuff.in", icon: <FiKey size={18} />, desc: "Developer API Access", colorClass: "text-slate-400" },
      { label: "Support", href: "/dashboard/support", icon: <FiMessageSquare size={18} />, desc: "Get help 24/7", colorClass: "text-sky-400" },
    ],
    roles: {
      owner: { label: "Admin Console", href: "/owner-panal", icon: <FiZap size={18} />, colorClass: "text-purple-400" },
    },
  },
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Zustand state
  const { user, walletBalance, setWalletBalance, updateUser, logout, token, _hasHydrated } = useAuthStore();
  
  const [activeNav, setActiveNav] = useState("/");
  const [balanceLoading, setBalanceLoading] = useState(true);


  const dropdownRef = useRef(null);

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) {
      setLoading(false);
      setBalanceLoading(false);
      return;
    }

    api.get("/api/auth/me")
      .then((r) => r.data)
      .then((d) => {
        if (d.success) {
          updateUser({
            name: d.user.name,
            email: d.user.email,
            userId: d.user.id || d.user.userId,
            avatar: d.user.avatar || "",
            userType: d.user.userType || "user",
            phone: d.user.phone,
          });
          
          if (d.user.wallet !== undefined) {
            setWalletBalance(d.user.wallet);
          }
        } else {
          logout();
        }
      })
      .finally(() => {
        setLoading(false);
        setBalanceLoading(false);
      });
  }, [_hasHydrated, token, updateUser, setWalletBalance, logout]);

  /* ================= PWA INSTALL LOGIC ================= */
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [pwaToastMsg, setPwaToastMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator && window.navigator.standalone === true);
    const installed = standalone || localStorage.getItem("pwa_installed") === "true";

    setIsStandalone(Boolean(standalone));
    setIsPwaInstalled(Boolean(installed));

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      localStorage.setItem("pwa_installed", "true");
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    return () => window.removeEventListener("appinstalled", handleAppInstalled);
  }, []);

  const showPwaToast = (msg) => {
    setPwaToastMsg(msg);
    setTimeout(() => setPwaToastMsg(""), 3500);
  };

  const handleInstallPWA = async () => {
    if (isStandalone) {
      showPwaToast("📱 You are using the installed app!");
      return;
    }
    if (isPwaInstalled) {
      showPwaToast("✅ App is already installed on your device!");
      return;
    }

    const prompt = window.__pwaPrompt;
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setIsPwaInstalled(true);
        localStorage.setItem("pwa_installed", "true");
        fetch("/api/pwa/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "installed" }) }).catch(() => {});
        showPwaToast("🎉 App installed successfully!");
      }
      window.__pwaPrompt = null;
    } else {
      window.dispatchEvent(new Event("show-pwa-modal"));
    }
  };

  const [showLogoutToast, setShowLogoutToast] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setShowLogoutToast(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  };

  /* ================= SCROLL (OPTIMIZED RAF) ================= */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isOver = window.scrollY > 20;
          setScrolled((prev) => (prev !== isOver ? isOver : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Prevent background scroll only when drawer is open
  useEffect(() => {
    if (!userMenuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [userMenuOpen]);

  return (
    <header
      className={`fixed top-0 w-full transition-all duration-500 ${scrolled
        ? "backdrop-blur-3xl bg-[var(--background)]/80 shadow-2xl border-b border-[var(--border)] active-header"
        : "bg-transparent"
        } opacity-100 translate-y-0`}
      style={{ zIndex: userMenuOpen ? 2147483647 : 1000 }}
    >
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Left section */}
          <div className="flex items-center xl:flex-1 justify-start">
            <Link
              href="/"
              className="relative z-10 flex-shrink-0"
              onClick={() => {
                setUserMenuOpen(false);
                setActiveNav("/");
              }}
            >
              <div className="hover:scale-105 active:scale-95 transition-transform duration-300">
                <Image
                  src="/logoBB.png"
                  alt={HEADER_CONFIG.logo.alt}
                  width={HEADER_CONFIG.logo.width}
                  height={HEADER_CONFIG.logo.height}
                  priority
                  className="h-9 w-auto transition-all duration-300 logo-light-theme"
                />
                <Image
                  src="/logoBB-dark.png"
                  alt={HEADER_CONFIG.logo.alt}
                  width={HEADER_CONFIG.logo.width}
                  height={HEADER_CONFIG.logo.height}
                  priority
                  className="h-9 w-auto transition-all duration-300 logo-dark-theme"
                />
              </div>
            </Link>
          </div>

          {/* Center section */}
          <nav className="hidden xl:flex items-center space-x-1 shrink-0 justify-center">
            {HEADER_CONFIG.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveNav(item.href)}
                className="relative px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] italic text-[var(--muted)] hover:text-[var(--accent)] transition-all group flex items-center gap-2"
              >
                <span className="relative z-10 opacity-70 group-hover:opacity-100 transition-all">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-[var(--accent)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)] transition-all duration-300 ${activeNav === item.href ? "w-full" : "w-0"}`}
                />
                <div className="absolute inset-0 bg-[var(--accent)]/0 group-hover:bg-[var(--accent)]/5 transition-colors duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 xl:flex-1">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallPWA}
                className={`relative flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border transition-all duration-200 group backdrop-blur-md ${
                  isStandalone || isPwaInstalled
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] border-[var(--border)]/60 text-[var(--foreground)]/60 hover:text-[var(--accent)] hover:border-[var(--accent)]/40"
                }`}
                aria-label={isStandalone ? "App Running" : isPwaInstalled ? "App Installed" : "Install App"}
                title={isStandalone ? "App Running (Standalone Mode)" : isPwaInstalled ? "App Installed" : "Install App"}
              >
                {isStandalone || isPwaInstalled ? (
                  <FiCheckCircle size={14} className="z-10 text-emerald-400" />
                ) : (
                  <FiDownload size={14} className="z-10 group-hover:translate-y-[1px] transition-transform" />
                )}
                
                {/* SPINNING ORBIT RING */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 rounded-full border border-dashed pointer-events-none ${
                    isStandalone || isPwaInstalled ? "border-emerald-500/30" : "border-[var(--foreground)]/20"
                  }`}
                />
              </motion.button>

              {/* TOAST POPUP */}
              {pwaToastMsg && (
                <div className="fixed top-14 sm:top-16 right-3 sm:right-6 z-[9999] max-w-xs animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-none">
                  <div className="px-3.5 py-2 rounded-xl bg-[var(--card)] border border-emerald-500/30 shadow-2xl text-[11px] font-bold text-[var(--foreground)] backdrop-blur-xl flex items-center gap-2">
                    <span>{pwaToastMsg}</span>
                  </div>
                </div>
              )}
            </div>

            {/* NOTIFICATION TOGGLE */}
            <NotificationToggle user={user} />

            <div className="flex items-center gap-1.5 sm:gap-2" ref={dropdownRef}>
              <ThemeToggle />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUserMenuOpen((p) => !p)}
                className="relative flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-[var(--border)]/60 bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] hover:border-[var(--accent)]/40 transition-all duration-200 cursor-pointer overflow-hidden group"
                aria-label="User Menu"
                title={user?.name || "Account"}
              >
                {user?.avatar ? (
                  <Image src={user.avatar} alt={`${user.name || "User"} Profile Avatar`} width={28} height={28} className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="text-[var(--foreground)]/60 group-hover:text-[var(--foreground)] text-xs transition-colors" />
                )}
              </motion.button>

              <>
                <div
                  onClick={() => setUserMenuOpen(false)}
                  className={`fixed inset-0 bg-black/80 backdrop-blur-xl z-[2147483646] cursor-pointer transition-opacity duration-500 ${userMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                />

                <div
                  className={`fixed right-0 top-0 h-[100dvh] w-[85%] max-w-[380px] bg-[var(--background)] dark:bg-[#050505] border-l border-[var(--border)] z-[2147483647] shadow-[-20px_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${userMenuOpen ? "translate-x-0" : "translate-x-full"}`}
                  style={{ background: 'var(--background)', opacity: 1 }}
                >
                  <div className="absolute inset-0 bg-[var(--background)] pointer-events-none" style={{ background: 'var(--background)', opacity: 1 }} />
                  <div
                    className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-[radial-gradient(circle,var(--accent)_0%,transparent_60%)] blur-[100px] pointer-events-none opacity-10"
                  />
                  {/* Dark overlay for extra depth */}
                  <div className="absolute inset-0 bg-[var(--foreground)]/[0.02] pointer-events-none" />

                  {/* Compact Profile Header */}
                  <div className="relative z-10 p-3 px-4 flex items-center justify-between border-b border-[var(--border)] gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {user ? (
                        <>
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border)] shadow-sm shrink-0">
                            {user?.avatar ? (
                              <Image src={user.avatar} alt={`${user.name || "User"} Profile Avatar`} width={32} height={32} className="object-cover w-full h-full rounded-full" />
                            ) : (
                              <div className="w-full h-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] text-sm font-black rounded-full">{user.name?.charAt(0)}</div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-bold text-[var(--foreground)] truncate leading-tight">{user.name}</span>
                              <span className="text-[6px] font-black uppercase px-1 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/10 italic tracking-widest shrink-0">
                                {user.userType === "owner" ? "owner" : user.userType === "admin" ? "reseller" : user.userType === "member" ? "member" : "user"}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-[var(--foreground)] opacity-70 truncate italic leading-tight">{user.email}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]"><FiUser size={16} /></div>
                          <span className="text-sm font-bold">Guest Account</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {user && (
                        <button onClick={handleLogout} className="w-7 h-7 rounded-full hover:bg-red-500/10 flex items-center justify-center text-red-500 transition-colors" title="Logout"><FiLogOut size={14} /></button>
                      )}
                      <button onClick={() => setUserMenuOpen(false)} className="w-7 h-7 rounded-full hover:bg-[var(--foreground)]/5 flex items-center justify-center text-[var(--muted)] transition-colors" aria-label="Close User Menu"><FiX size={18} /></button>
                    </div>
                  </div>

                  <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

                    {!user ? (
                      <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                        {/* Quick Nav for Guests */}
                        <div className="grid grid-cols-3 gap-2 w-full mb-1">
                          {HEADER_CONFIG.nav.map((item) => (
                            <Link 
                              key={item.label} 
                              href={item.href} 
                              onClick={() => setUserMenuOpen(false)} 
                              className="flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl bg-[var(--card)]/60 border border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--card)] text-[var(--foreground)] transition-all group shadow-sm"
                            >
                              <span className="text-[var(--accent)] group-hover:scale-110 transition-transform">{item.icon}</span>
                              <span className="text-[9px] font-extrabold uppercase tracking-wider">{item.label}</span>
                            </Link>
                          ))}
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                          <FiZap size={28} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-[var(--foreground)]">Sign in required</h3>
                          <p className="text-xs text-[var(--muted)]">Login to access your personalized squad dashboard</p>
                        </div>
                        <Link 
                          href="/login" 
                          onClick={() => setUserMenuOpen(false)} 
                          className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] hover:opacity-95 active:scale-[0.98] transition-all text-center shadow-lg flex items-center justify-center gap-2 group cursor-pointer !text-black"
                          style={{ color: '#000000' }}
                        >
                          <FiUser className="w-4 h-4 text-black stroke-[2.5]" style={{ color: '#000000' }} />
                          <span className="text-black font-black text-xs uppercase tracking-wider" style={{ color: '#000000' }}>
                            Login / Sign In
                          </span>
                        </Link>

                        <div className="w-full pt-3 border-t border-[var(--border)]/40 flex flex-col gap-1">
                          <Link
                            href="/dashboard/support"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between py-2 px-3 rounded-xl bg-[var(--foreground)]/[0.03] hover:bg-[var(--card)] border border-[var(--border)] transition-all group"
                          >
                            <div className="flex items-center gap-2">
                              <FiMessageSquare size={14} className="text-sky-400 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-bold text-[var(--foreground)]">Support & Help</span>
                            </div>
                            <FiChevronRight size={13} className="text-[var(--muted)] group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {HEADER_CONFIG.nav.map((item) => (
                            <Link 
                              key={item.label} 
                              href={item.href} 
                              onClick={() => setUserMenuOpen(false)} 
                              className="flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl bg-[var(--card)]/60 border border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--card)] text-[var(--foreground)] transition-all group shadow-sm"
                            >
                              <span className="text-[var(--accent)] group-hover:scale-110 transition-transform">{item.icon}</span>
                              <span className="text-[9px] font-extrabold uppercase tracking-wider">{item.label}</span>
                            </Link>
                          ))}
                        </div>

                        <div className="space-y-1">
                          {/* Main Row: Highlighted Events Calendar + Orders & Wallet */}
                          <div className="flex flex-col gap-1.5 mb-1.5">
                            {HEADER_CONFIG.userMenu.common.slice(0, 3).map((item) => {
                              const isEventCalendar = item.label === "Events Calendar";
                              const isEventHighlight = item.isHighlight || isEventCalendar;

                              if (isEventCalendar) {
                                return (
                                  <div
                                    key={item.label}
                                    className="relative flex items-center justify-between p-2.5 rounded-2xl shadow-sm transition-all overflow-hidden bg-blue-500/[0.05] border border-blue-500/20 opacity-80 cursor-not-allowed select-none"
                                    title="Coming Soon"
                                  >
                                    <div className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
                                      <div className={`shrink-0 ${item.colorClass || "text-blue-400"}`}>
                                        {item.icon}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)] truncate leading-none mb-1 flex items-center gap-1.5">
                                          {item.label}
                                          <span className="px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                                            Coming Soon
                                          </span>
                                        </p>
                                        <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest truncate leading-none">{item.desc}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <Link 
                                  key={item.label} 
                                  href={item.href} 
                                  onClick={() => setUserMenuOpen(false)} 
                                  className="relative flex items-center justify-between p-2.5 rounded-2xl shadow-sm transition-all group overflow-hidden bg-[var(--card)] border border-transparent hover:border-[var(--accent)]/30 hover:shadow-md"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
                                    <div className={`shrink-0 transition-transform group-hover:scale-110 ${item.colorClass || "text-[var(--accent)]"}`}>{item.icon}</div>
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)] truncate leading-none mb-1 flex items-center gap-1.5">
                                        {item.label}
                                      </p>
                                      <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest truncate leading-none">{item.desc}</p>
                                    </div>
                                  </div>
                                  {item.label === "My Wallet" && (
                                    <div className="shrink-0 ml-2 relative z-10">
                                      {balanceLoading ? (
                                        <div className="h-4 w-10 bg-[var(--foreground)]/10 animate-pulse rounded" />
                                      ) : (
                                        <span className="text-xs font-black text-[var(--accent)]">₹{walletBalance}</span>
                                      )}
                                    </div>
                                  )}
                                </Link>
                              );
                            })}
                          </div>

                          {/* 4 Items in 2x2 Grid */}
                          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                            {HEADER_CONFIG.userMenu.common.slice(3, 7).map((item) => (
                              <Link key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)} className="relative flex items-center p-2.5 rounded-2xl bg-[var(--card)] shadow-sm border border-transparent hover:border-[var(--accent)]/30 hover:shadow-md transition-all group overflow-hidden gap-2.5">
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className={`shrink-0 transition-transform group-hover:scale-110 relative z-10 ${item.colorClass || "text-[var(--foreground)]"}`}>{item.icon}</div>
                                <div className="flex flex-col min-w-0 relative z-10">
                                  <p className="text-[9px] font-black text-[var(--foreground)] leading-none uppercase tracking-widest truncate mb-0.5">{item.label}</p>
                                  <p className="text-[7px] text-[var(--muted)] font-bold uppercase tracking-widest truncate leading-none">{item.desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>

                          {/* Remaining items list */}
                          <div className="flex flex-col gap-0.5">
                            {HEADER_CONFIG.userMenu.common.slice(7).map((item) => (
                              <Link key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} onClick={() => setUserMenuOpen(false)} className="flex items-center justify-between py-2 px-3 rounded-2xl bg-transparent hover:bg-[var(--card)] hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-2.5">
                                  <div className={`shrink-0 transition-transform group-hover:scale-110 ${item.colorClass || "text-[var(--muted)] group-hover:text-[var(--accent)]"}`}>{item.icon}</div>
                                  <div className="flex flex-col">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] leading-none mb-0.5">{item.label}</p>
                                    <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest leading-none">{item.desc}</p>
                                  </div>
                                </div>
                                <FiChevronRight size={14} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                              </Link>
                            ))}
                          </div>
                        </div>

                        {user?.userType === "owner" && (
                          <div className="relative mt-2 group">
                            <Link
                              href="/owner-panal"
                              onClick={() => setUserMenuOpen(false)}
                              className="relative flex items-center justify-between p-2.5 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/30 rounded-2xl transition-all group overflow-hidden"
                            >
                              <div className="flex items-center gap-3 relative z-10 w-full">
                                <div className="relative flex-shrink-0">
                                  <div className="shrink-0 text-purple-400 group-hover:scale-110 transition-transform">
                                    <FiZap size={20} />
                                  </div>
                                  <div className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </div>
                                </div>

                                <div className="flex flex-col min-w-0 flex-1">
                                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)] mb-0.5">Admin Console</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 uppercase tracking-widest">Elite Access</span>
                                    <span className="text-[8px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-emerald-400"></span>Active</span>
                                  </div>
                                </div>

                                <FiChevronRight size={14} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                              </div>
                            </Link>
                          </div>
                        )}
                      </>
                    )}

                  </div>

                  {/* Drawer Footer */}
                  <div className="relative z-10 py-2 px-3 border-t border-[var(--border)] bg-[var(--foreground)]/[0.02] flex flex-col items-center justify-center gap-2 shrink-0">
                    <div className="text-center text-[9px] text-[var(--foreground)] opacity-75 font-mono tracking-wider flex flex-col items-center justify-center">
                      <span>A Product from <a href="https://bluebuff.in" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] font-bold hover:underline">bluebuff.in</a></span>
                    </div>

                    {/* A-Ads Banner Ad */}
                    <AAdsBanner />
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>

      {showLogoutToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2000] opacity-100 translate-y-0 transition-all duration-500">
          <div className="px-6 py-3 rounded-full bg-[var(--card)] border border-green-500/20 flex items-center gap-3 shadow-xl backdrop-blur-xl">
            <FiCheckCircle className="text-green-500" size={18} />
            <span className="text-xs font-bold text-[var(--foreground)]">Logout Successful</span>
          </div>
        </div>
      )}

    </header>
  );
}

function NotificationToggle({ user }) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSubscribed(isDeviceAlreadySubscribed());
    }
  }, []);

  const handleToggle = async () => {
    if (loading) return;

    if (!isPushNotificationSupported()) {
      showNotificationToast("Push notifications not supported on this browser");
      return;
    }

    const permission = getNotificationPermission();

    if (subscribed || permission === "granted") {
      showNotificationToast("🔔 Notifications are enabled!");
      return;
    }

    if (permission === "denied") {
      showNotificationToast("⚠️ Notifications blocked in browser. Please allow in site settings.");
      return;
    }

    setLoading(true);
    try {
      const res = await subscribeToPush(user?.userId);
      if (res.success) {
        setSubscribed(true);
        showNotificationToast("🎉 Notifications turned ON!");
      } else {
        showNotificationToast(res.error || "Could not enable notifications");
      }
    } catch {
      showNotificationToast("Something went wrong enabling notifications");
    } finally {
      setLoading(false);
    }
  };

  const showNotificationToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        disabled={loading}
        className="relative flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] border border-[var(--border)]/60 text-[var(--foreground)]/60 hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-all duration-200 group backdrop-blur-md"
        aria-label="Turn on notifications"
        title={subscribed ? "Notifications Enabled" : "Turn ON Notifications"}
      >
        <FiBell size={14} className={`z-10 group-hover:rotate-12 transition-transform ${loading ? "animate-spin" : ""}`} />
        
        {/* SPINNING ORBIT RING */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed border-[var(--foreground)]/20 pointer-events-none"
        />

        {/* INDICATOR DOT */}
        <div className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full border border-[var(--background)] z-20 transition-colors ${
          subscribed ? "bg-emerald-500" : "bg-amber-500"
        }`} />
      </motion.button>

      {/* MINI TOAST */}
      {toastMsg && (
        <div className="fixed top-14 sm:top-16 right-3 sm:right-6 z-[9999] max-w-xs animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-none">
          <div className="px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xl text-[11px] font-bold text-[var(--foreground)] backdrop-blur-xl flex items-center gap-2">
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
