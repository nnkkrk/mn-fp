"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import { FiChevronRight, FiZap } from "react-icons/fi";

export default function GameCardGrid({ game, isOutOfStock, index = 0 }) {
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
    <div className="h-full">
      <Link
        href={disabled ? "#" : `/games/${game.gameSlug}`}
        className={`group relative flex flex-col h-full rounded-2xl overflow-hidden border
        ${disabled
            ? "opacity-60 cursor-not-allowed border-[var(--border)] bg-[var(--background)]"
            : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/60 hover:shadow-[0_10px_22px_-10px_rgba(var(--accent-rgb),0.25)] transition-all duration-300"
          }`}
      >
        {/* IMAGE CONTAINER */}
        <div className="relative w-full aspect-square p-1.5 pb-0 shrink-0">
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-[var(--foreground)]/[0.04] border border-black/10 dark:border-white/15 border-b-[3px] border-b-black/25 dark:border-b-black/60 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.28)] group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_20px_-4px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.35)] active:translate-y-0.5 active:border-b transition-all duration-300">
            <Image
              src={game.gameImageId?.image || logo}
              alt={game.gameName}
              fill
              sizes="(max-width: 768px) 33vw, 25vw"
              quality={75}
              className={`object-cover transition-transform duration-300 group-hover:scale-105
                ${disabled
                  ? "grayscale blur-[2px]"
                  : ""
                }`}
            />

            {/* Top specular sheen + subtle bottom vignette for 3D depth */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/50 opacity-80" />

            {/* TAG / BADGE */}
            {!disabled && (displayTagName || game.tagId) && (
              <div className="absolute top-1.5 left-1.5 z-20">
                <span
                  className="text-[6.5px] sm:text-[7.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-b-2 backdrop-blur-md shadow-[0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center gap-0.5 leading-none"
                  style={{
                    background: tagBg || game?.tagId?.tagBackground || "rgba(var(--accent-rgb), 0.25)",
                    color: tagColor || game?.tagId?.tagColor || "#ffffff",
                    borderColor: tagBg ? `${tagBg}99` : (game?.tagId?.tagBackground || "rgba(var(--accent-rgb), 0.4)"),
                  }}
                >
                  {displayTagName === "Manual" && <FiZap size={8} fill="currentColor" />}
                  {displayTagName || game?.tagId?.tagName}
                </span>
              </div>
            )}

            {/* OUT OF STOCK OVERLAY */}
            {disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
                <span className="px-2.5 py-1 rounded-md bg-red-500/90 text-white text-[8px] font-black uppercase tracking-widest italic text-center leading-tight">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-2 py-2 sm:px-2.5 sm:py-2.5 relative flex-1 flex items-center justify-between gap-1.5">
          <h3
            className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-tight leading-tight flex-1 line-clamp-2
            ${disabled ? "text-[var(--muted)]" : "text-[var(--foreground)]"}`}
          >
            {game.gameName}
          </h3>
          {!disabled && (
            <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[var(--border)] border-b-2 bg-[var(--foreground)]/[0.05] text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-white transition-colors shrink-0">
              <FiChevronRight size={11} />
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
