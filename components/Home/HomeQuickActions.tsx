"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gift,
  Inbox,
  LifeBuoy,
  Wallet,
  BookOpen,
  Zap,
} from "lucide-react";

/* ===================== CONFIG ===================== */

const quickActions = [
  { title: "Giveaway", href: "/giveaways", icon: Gift, color: "#f43f5e" },
  { title: "Orders", href: "/dashboard/orders", icon: Inbox, color: "#64748b" },
  { title: "Support", href: "/dashboard/support", icon: LifeBuoy, color: "#06b6d4" },
  { title: "Wallet", href: "/dashboard/wallet", icon: Wallet, color: "#10b981" },
  { title: "Blog", href: "/blog", icon: BookOpen, color: "#eab308", isHighlight: true },
  { title: "Earn", href: "/dashboard/coins", icon: Zap, color: "#a855f7", isHighlight: true },
];

/* ===================== COMPONENT ===================== */

export default function HomeQuickActions() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
  }, []);

  const getTargetHref = (item: any) => {
    const isAuthProtected = item.title === "Orders" || item.title === "Support";
    if (isAuthProtected && !isLoggedIn) {
      return `/login?redirect=${item.href}`;
    }
    return item.href;
  };

  const ActionCard = ({ item }: any) => {
    const Icon = item.icon;
    const isHighlight = item.isHighlight;
    const highlightColor = item.color || "#a855f7";

    return (
      <div className="flex-1 opacity-100">
        <Link
          href={getTargetHref(item)}
          className="group relative flex flex-col items-center justify-center py-1.5 px-0.5"
        >
          {/* Icon Section */}
          <div className="relative flex items-center justify-center p-1.5 rounded-xl">
            {isHighlight && (
              <>
                <div
                  className="absolute inset-0 rounded-xl opacity-90"
                  style={{
                    background: `linear-gradient(to bottom right, ${highlightColor}, ${highlightColor}DD)`,
                  }}
                />
                <div className="absolute inset-0 border border-white/20 rounded-xl" />
              </>
            )}

            {/* The Icon */}
            <div className={`
              relative z-10
              ${isHighlight ? "text-white" : ""}
            `}>
              <Icon
                size={20}
                strokeWidth={isHighlight ? 2.5 : 1.5}
                style={{ color: isHighlight ? undefined : item.color }}
              />
            </div>
          </div>

          {/* Title */}
          <span
            className={`
              mt-1 text-[8px] sm:text-[9px] font-black tracking-[0.05em] uppercase
              ${isHighlight ? "font-black" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"}
            `}
            style={{ color: isHighlight ? highlightColor : undefined }}
          >
            {item.title}
          </span>
        </Link>
      </div>
    );
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 mt-1">
      <div className="relative z-10 max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
        <div className="flex justify-between gap-1">
          {quickActions.map((item) => (
            <ActionCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
