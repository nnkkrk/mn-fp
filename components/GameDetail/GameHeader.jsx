"use client";

import { useState } from "react";
import Image from "next/image";
import { FiCheckCircle, FiShare2, FiCheck } from "react-icons/fi";

export default function GameHeader({ game }) {
  const [copied, setCopied] = useState(false);

  if (!game) return null;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = `${game.gameName} Top Up | mlbbtopup.in`;
    const text = `Top up ${game.gameName} instantly at best prices on mlbbtopup.in!`;

    // Native Web Share API (Mobile / Modern Browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    // Fallback 1: Clipboard Copy with visual feedback
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch {
        // Fallback to WhatsApp
      }
    }

    // Fallback 2: Direct WhatsApp Share
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank");
  };

  return (
    <div className="relative w-full mb-1.5 mt-0.5">
      <div className="relative py-1 px-0.5 flex items-center justify-between gap-3">
        {/* LEFT: Game Identity */}
        <div className="relative z-10 flex items-center gap-2.5 md:gap-3 min-w-0">
          {/* Clean Game Icon Container */}
          <div className="relative shrink-0">
            <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)]">
              <Image
                src={game.gameImageId?.image || "/logo.png"}
                alt={game.gameName}
                fill
                className="object-cover"
              />
            </div>

            {/* Live Indicator Dot */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--background)] rounded-full flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-emerald-500 rounded-full" />
            </div>
          </div>

          {/* Name & Origin Info */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h1 className="text-sm md:text-base font-black tracking-tight text-[var(--foreground)] leading-tight truncate uppercase">
                {game.gameName}
              </h1>
              <FiCheckCircle className="text-[var(--accent)] shrink-0" size={13} />
            </div>

            {/* Region / Tag below title */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {Boolean(game.tagId?.tagName || game.gameSlug?.includes("india") || game.gameSlug?.includes("all-region") || game.gameSlug?.includes("united-states") || game.gameSlug?.includes("br178") || game.gameSlug?.includes("tr112")) && (
                <span className="text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                  {game.tagId?.tagName || (
                    game.gameSlug?.includes("united-states") ? "US" :
                    game.gameSlug?.includes("br178") ? "Brazil" :
                    game.gameSlug?.includes("tr112") ? "Turkey" :
                    game.gameSlug?.includes("all-region") ? "All Region" : "Indian Region"
                  )}
                </span>
              )}
              {game.isValidationRequired === false && game.gameDescription && (
                <span className="text-[8px] font-bold text-[var(--muted)]/80 uppercase tracking-tight truncate">
                  {game.gameDescription}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Share Button */}
        <div className="flex items-center relative z-10 shrink-0">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--card)] hover:bg-[var(--foreground)]/5 border border-[var(--border)] hover:border-[var(--accent)]/40 text-[var(--foreground)] transition-all cursor-pointer shadow-xs active:scale-95 group"
            title="Share Game"
            aria-label="Share Game"
          >
            {copied ? (
              <>
                <FiCheck size={13} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Copied</span>
              </>
            ) : (
              <>
                <FiShare2 size={13} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] group-hover:text-[var(--foreground)]">Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
