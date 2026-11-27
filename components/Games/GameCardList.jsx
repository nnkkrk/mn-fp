"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import { FiArrowRight, FiZap } from "react-icons/fi";

export default function GameCardList({ game, isOutOfStock, index = 0 }) {
  const disabled = isOutOfStock(game.gameName);

  let displayTagName = game?.tagId?.tagName;
  let tagBg = game?.tagId?.tagBackground;
  let tagColor = game?.tagId?.tagColor;

  if (game?.gameSlug === "mobile-legends-philippines888") {
    displayTagName = "MLBB Small India";
    tagBg = "#991b1b";
    tagColor = "#ffffff";
  } else if (game?.gameSlug === "bgmi226") {
    displayTagName = "Indian";
    tagBg = "#1e3a8a";
    tagColor = "#ffffff";
  } else if (game?.gameSlug === "mobile-legends-united-states41" || game?.gameSlug?.includes("united-states")) {
    displayTagName = "US";
    tagBg = "#1e3a8a";
    tagColor = "#ffffff";
  } else if (game?.gameSlug === "mlbbbr178" || game?.gameSlug?.includes("br178")) {
    displayTagName = "Brazil";
    tagBg = "#15803d";
    tagColor = "#ffffff";
  } else if (game?.gameSlug === "mlbbtr112" || game?.gameSlug?.includes("tr112")) {
    displayTagName = "Turkey";
    tagBg = "#b91c1c";
    tagColor = "#ffffff";
  }

  return (
    <div>
      <Link
        href={disabled ? "#" : `/games/${game.gameSlug}`}
        className={`group relative flex items-center gap-3.5 sm:gap-4 p-2.5 sm:p-3 rounded-2xl border overflow-hidden
        ${disabled
            ? "opacity-50 grayscale cursor-not-allowed border-[var(--border)] bg-[var(--card)]/50"
            : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/60 hover:shadow-[0_10px_22px_-10px_rgba(var(--accent-rgb),0.25)] transition-all duration-300"
          }`}
      >
        {/* 3D IMAGE CONTAINER */}
        <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-[var(--foreground)]/[0.04] border border-black/10 dark:border-white/15 border-b-[3px] border-b-black/25 dark:border-b-black/60 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.28)] group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_20px_-4px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.35)] active:translate-y-0.5 active:border-b transition-all duration-300">
            <Image
              src={game.gameImageId?.image || logo}
              alt={game.gameName}
              fill
              sizes="96px"
              quality={70}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Top specular sheen + subtle bottom vignette for 3D depth */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/45 opacity-80" />
          </div>
        </div>

        {/* INFO SYSTEM */}
        <div className="flex-1 min-w-0 pr-1">
          <h3
            className={`text-xs sm:text-sm font-extrabold uppercase tracking-tight leading-snug line-clamp-2 mb-1.5
            ${disabled ? "text-[var(--muted)]" : "text-[var(--foreground)]"}`}
          >
            {game.gameName}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {!disabled && (displayTagName || game.tagId) && (
              <span
                className="text-[7px] sm:text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-b-2 shadow-[0_2px_6px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.28)] flex items-center gap-1 leading-none"
                style={{
                  background: tagBg || game?.tagId?.tagBackground || "rgba(var(--accent-rgb), 0.25)",
                  color: tagColor || game?.tagId?.tagColor || "#ffffff",
                  borderColor: tagBg ? `${tagBg}99` : (game?.tagId?.tagBackground || "rgba(var(--accent-rgb), 0.4)"),
                }}
              >
                {displayTagName === "Manual" && <FiZap size={9} fill="currentColor" />}
                {displayTagName || game?.tagId?.tagName}
              </span>
            )}
            {disabled && (
              <span className="px-2.5 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-500 text-[8px] font-black uppercase tracking-widest italic">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* ACTION SYSTEM */}
        {!disabled && (
          <div className="relative shrink-0 pr-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[var(--border)] border-b-2 bg-[var(--foreground)]/[0.04] flex items-center justify-center text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] group-hover:text-white group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] transition-all duration-200">
              <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}
