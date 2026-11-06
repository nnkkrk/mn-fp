"use client";

import Link from "next/link";
import Image from "next/image";
import { FiChevronRight } from "react-icons/fi";
import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/common";

const brGames = [
  {
    id: "bgmi",
    title: "Battlegrounds Mobile India",
    name: "BGMI",
    tag: "INDIA",
    flag: "🇮🇳",
    feature: "Instant UC Top-Up",
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    borderHover: "hover:border-orange-500/50 hover:shadow-orange-500/10",
    glowColor: "bg-orange-500",
    tagBadge: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    svgColor: "text-orange-500",
    thumbBorder: "from-orange-500/40 via-[var(--border)] to-transparent",
    image: "/game-assets/bgmi_india.webp",
    link: "/games/bgmi226",
  },
  {
    id: "pubg",
    title: "PUBG Mobile",
    name: "PUBG",
    tag: "GLOBAL",
    flag: "🌐",
    feature: "Direct Fast Delivery",
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    glowColor: "bg-amber-500",
    tagBadge: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    svgColor: "text-amber-500",
    thumbBorder: "from-amber-500/40 via-[var(--border)] to-transparent",
    image: "/game-assets/bgmi-logo.webp",
    link: "/games/pubg-mobile138",
  },
];

export default function BattleRoyaleSection() {
  return (
    <section className="relative py-1.5 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Compact & Premium */}
        <div className="mb-1.5 px-0.5">
          <SectionTitle
            size="sm"
            accentColor="orange"
            subtitle="India & Global"
            title="Battle"
            highlight="Royale"
          />
        </div>

        {/* Cards Grid - Compact 2 Columns */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {brGames.map((game) => (
            <Link
              key={game.id}
              href={game.link}
              className={`group relative overflow-hidden rounded-lg bg-gradient-to-b from-[var(--card)] to-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] p-2 sm:p-2.5 ${game.borderHover} cursor-pointer transition-all duration-300 hover:-translate-y-0.5 shadow-xs hover:shadow-sm`}
            >
              {/* Top rim specular highlight line */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none" />

              {/* Ambient radial glow on hover */}
              <div
                className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none ${game.glowColor}`}
              />

              {/* Subtle hover gradient wash */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r ${game.gradient} transition-opacity duration-300 pointer-events-none`}
              />

              {/* Premium Tactical Watermark SVG inside card */}
              <svg
                viewBox="0 0 120 70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`absolute -right-2 bottom-0 h-full w-24 sm:w-28 ${game.svgColor} opacity-[0.06] dark:opacity-[0.10] group-hover:opacity-[0.18] transition-all duration-300 pointer-events-none select-none`}
              >
                {/* Precision angled speed slashes */}
                <path d="M48 70 L78 0 H90 L60 70 H48 Z" fill="currentColor" />
                <path d="M74 70 L104 0 H114 L84 70 H74 Z" fill="currentColor" />
                {/* Tactical target reticle */}
                <circle cx="98" cy="22" r="11" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
                <circle cx="98" cy="22" r="2.5" fill="currentColor" />
                <line x1="84" y1="22" x2="112" y2="22" stroke="currentColor" strokeWidth="0.75" />
                <line x1="98" y1="8" x2="98" y2="36" stroke="currentColor" strokeWidth="0.75" />
              </svg>

              <div className="flex items-center gap-2 sm:gap-2.5 relative z-10">
                {/* Game Thumbnail - Gradient Ring & Elevation */}
                <div className={`relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-md p-[1px] bg-gradient-to-br ${game.thumbBorder} shadow-2xs`}>
                  <div className="relative w-full h-full rounded-[5px] overflow-hidden bg-[var(--background)]">
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      sizes="(max-width: 640px) 40px, 48px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  {/* Row 1: Name + Flag Badge */}
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                    <span className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-[var(--foreground)] group-hover:text-amber-500 transition-colors truncate">
                      {game.name}
                    </span>

                    <span
                      className={`text-[6.5px] sm:text-[7px] font-black px-1 py-[0.5px] rounded uppercase tracking-wider border ${game.tagBadge} shrink-0`}
                    >
                      {game.flag} {game.tag}
                    </span>
                  </div>

                  {/* Row 2: Feature Text */}
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                    <p className="text-[7.5px] sm:text-[8.5px] text-[var(--muted)] font-medium truncate leading-tight">
                      {game.feature}
                    </p>
                  </div>
                </div>

                {/* Sleek Action Chevron */}
                <div className="w-5 h-5 rounded-md bg-[var(--foreground)]/[0.04] border border-[var(--border)]/60 text-[var(--muted)] group-hover:text-[var(--foreground)] group-hover:border-amber-500/40 group-hover:bg-amber-500/10 flex items-center justify-center transition-all duration-300 shrink-0 hidden sm:flex group-hover:translate-x-0.5">
                  <FiChevronRight size={11} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
