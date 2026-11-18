"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Gamepad2, 
  Store,
  Trophy, 
  CalendarDays, 
  ShoppingBag, 
  Headset 
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeHomeTab, setActiveHomeTab] = useState<"topup" | "marketplace">("topup");

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show when scrolling up or at the very top of page
      if (currentScrollY <= 20) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 6) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > 6) {
        // Scrolling up
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleSheetState = (e: any) => {
      setSheetOpen(Boolean(e.detail?.isOpen));
    };
    window.addEventListener("app-sheet-toggle" as any, handleSheetState);
    return () => window.removeEventListener("app-sheet-toggle" as any, handleSheetState);
  }, []);

  // Sync active home tab state (topup vs marketplace)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "marketplace" || tabParam === "topup") {
      setActiveHomeTab(tabParam as "topup" | "marketplace");
    } else {
      setActiveHomeTab("topup");
    }

    const handleTabEvent = (e: any) => {
      const tab = e.detail?.tab;
      if (tab === "topup" || tab === "marketplace") {
        setActiveHomeTab(tab);
      }
    };
    window.addEventListener("home-tab-change" as any, handleTabEvent);
    return () => window.removeEventListener("home-tab-change" as any, handleTabEvent);
  }, [pathname]);

  // Hide BottomNav on admin, auth pages, blog, inside game detail pages, or when sheet/modal is open
  const hideOnRoutes = ["/admin", "/owner-panal", "/login", "/register", "/blog"];
  if (
    sheetOpen ||
    pathname?.startsWith("/games/") ||
    hideOnRoutes.some((route) => pathname?.startsWith(route))
  ) {
    return null;
  }

  const isHomeTopupActive = pathname === "/";
  const isMarketplaceActive = pathname?.startsWith("/idsonsell");

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleMarketplaceClick = () => {
    router.push("/idsonsell");
  };

  const navItems = [
    { 
      label: "Games", 
      icon: Gamepad2, 
      isActive: pathname === "/games" || pathname.startsWith("/games/"), 
      action: () => router.push("/games") 
    },
    { 
      label: "Marketplace", 
      icon: Store, 
      isActive: isMarketplaceActive, 
      action: handleMarketplaceClick 
    },
    { 
      label: "Events", 
      icon: CalendarDays, 
      isActive: pathname === "/events" || pathname.startsWith("/events/"), 
      action: () => router.push("/events") 
    },
    { 
      label: "Tournaments", 
      icon: Trophy, 
      isActive: pathname === "/dashboard/tournaments", 
      action: () => router.push("/dashboard/tournaments") 
    },
    { 
      label: "Orders", 
      icon: ShoppingBag, 
      isActive: pathname === "/dashboard/orders", 
      action: () => router.push("/dashboard/orders") 
    },
    { 
      label: "Support", 
      icon: Headset, 
      isActive: pathname === "/dashboard/support", 
      action: () => router.push("/dashboard/support") 
    },
  ];

  return (
    <div className={`md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-[100] pointer-events-none w-auto max-w-[98%] flex justify-center px-1 transition-all duration-300 ease-in-out ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"
    }`}>
      {/* Floating Pill Container - Uses Dynamic Theme Variables */}
      <div className="pointer-events-auto relative flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 rounded-full bg-[var(--card)]/90 backdrop-blur-2xl border border-[var(--border)] text-[var(--foreground)] shadow-xl">
        
        {/* Combined Left Capsule: Home Button (Top Up) with Brand MT Logo + Indicator Dot */}
        <button
          onClick={handleHomeClick}
          className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 active:scale-95 shrink-0 ${
            isHomeTopupActive
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--border)]"
          }`}
          aria-label="Game Topup"
          title="Game Topup"
        >
          {/* MT Logo */}
          <div className="relative w-5 h-5 flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-white/10 bg-[#09090b]">
            <Image
              src="/pwa-icon.png"
              alt="Home"
              width={20}
              height={20}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isHomeTopupActive ? "brightness-110" : ""
              }`}
              priority
            />
          </div>

          {/* Theme Indicator Dot */}
          <span className={`w-1.5 h-1.5 rounded-full ${
            isHomeTopupActive ? "bg-white" : "bg-[var(--accent)]"
          }`} />
        </button>

        {/* Destination Icons */}
        {navItems.map((item, idx) => {
          const Icon = item.icon;

          return (
            <button
              key={idx}
              onClick={item.action}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shrink-0 active:scale-95 ${
                item.isActive
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10"
              }`}
              aria-label={item.label}
              title={item.label}
            >
              <Icon 
                size={17}
                strokeWidth={2.2}
                className={`transition-transform duration-200 ${
                  item.isActive ? "text-white scale-105" : ""
                }`} 
              />
            </button>
          );
        })}

      </div>
    </div>
  );
}
