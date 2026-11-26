"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Swords, Shirt, Crown, Clock, XCircle } from "lucide-react";

interface IdCardProps {
  item: any;
}

function getRentDisplay(rent: any) {
  if (!rent?.available) return null;

  const price = rent.price;
  const duration = rent.durationHours || 24;

  if (rent.isRented) {
    if (rent.availableAgainAt) {
      const diff = new Date(rent.availableAgainAt).getTime() - Date.now();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const days = Math.floor(hours / 24);

        const timeStr = days > 0
          ? `${days}d ${hours % 24}h`
          : `${hours}h ${minutes}m`;

        return {
          isRented: true,
          label: `On Rent • Avail in ${timeStr}`,
          color: "bg-amber-400 text-black border border-amber-300",
          footerText: `Avail in ${timeStr}`,
        };
      }
    }
    return {
      isRented: true,
      label: "Currently On Rent",
      color: "bg-amber-400 text-black border border-amber-300",
      footerText: "On Rent",
    };
  }

  return {
    isRented: false,
    label: `Rent ₹${price}/${duration}h`,
    color: "bg-emerald-500 text-black border border-emerald-400",
    footerText: `₹${price}/${duration}h`,
  };
}

export default function IdCard({ item }: IdCardProps) {
  const totalHeroes = item.heroes?.total ?? item.heroes;
  const totalSkins = item.skins?.total ?? item.skins;
  const collectionTier =
    item.collection?.tier ||
    item.collectionLevel ||
    (typeof item.collection === "string" ? item.collection : null);

  const isUnstocked = item.stockStatus === "unstocked";
  const rentDisplay = getRentDisplay(item.rent);

  return (
    <Link
      href={`/marketplace/${item.slug || item.id}`}
      className={`group relative rounded-2xl overflow-hidden
                 border transition-all duration-300 flex flex-col
                 hover:-translate-y-1 active:scale-[0.985]
                 will-change-transform ${
                   isUnstocked
                     ? "bg-[var(--card)]/60 border-red-500/30 opacity-80"
                     : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]/60 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.4)]"
                 }`}
    >
      {/* ── IMAGE THUMBNAIL ── */}
      <div className="relative h-40 w-full overflow-hidden bg-black/20 shrink-0">
        <Image
          src={item.media?.images?.[0] || item.image || "/logo.png"}
          alt={item.title || "Gaming ID"}
          fill
          unoptimized
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            isUnstocked ? "grayscale-[40%]" : ""
          }`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* STOCK STATUS BADGE OR GAME BADGE (TOP LEFT) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {isUnstocked ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md backdrop-blur-xs flex items-center gap-1">
              <XCircle size={10} />
              <span>Out of Stock</span>
            </span>
          ) : (
            item.id && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white/90 border border-white/10">
                {item.id}
              </span>
            )
          )}

          {/* Game Pill Badge */}
          {item.game && item.game !== "mlbb" && (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[var(--accent)] text-white shadow-xs">
              {item.game === "coc" ? "COC ⚔️" : item.game === "bgmi" ? "BGMI 🎯" : item.game === "freefire" ? "FF 🔥" : item.game === "valorant" ? "VALO ⚡" : item.game.toUpperCase()}
            </span>
          )}
        </div>

        {/* RENT STATUS BADGE (TOP RIGHT) */}
        {rentDisplay && (
          <span
            className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-xs flex items-center gap-1 ${rentDisplay.color}`}
          >
            {rentDisplay.isRented && <Clock size={10} />}
            <span>{rentDisplay.label}</span>
          </span>
        )}

        {/* COLLECTION BADGE (ON IMAGE BOTTOM) */}
        {collectionTier && (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-400 flex items-center gap-1.5 shadow-sm">
            <Crown size={11} className="text-amber-400" />
            <span>{collectionTier}</span>
          </div>
        )}
      </div>

      {/* ── CLEAN CARD BODY ── */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 text-[var(--foreground)]">
        <div className="space-y-1.5">
          {/* TITLE */}
          <h2 className="font-bold text-sm leading-snug line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
            {item.title}
          </h2>

          {/* KEY STATS & BULLET POINTS */}
          {(() => {
            const bullets: string[] = (item.bulletPoints && item.bulletPoints.length > 0)
              ? item.bulletPoints
              : Array.isArray(item.specs) && item.specs.length > 0
              ? item.specs.map((s: any) => (typeof s === "string" ? s : `${s.label ? s.label + ": " : ""}${s.value || ""}`))
              : [];

            if (bullets.length > 0) {
              return (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--muted)] flex-wrap">
                  {bullets.slice(0, 2).map((b, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 truncate max-w-[170px]">
                      {idx > 0 && <span className="w-1 h-1 rounded-full bg-[var(--border)] shrink-0" />}
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                      <span className="text-[var(--foreground)] font-bold truncate">{b}</span>
                    </span>
                  ))}
                  {item.account?.server && (
                    <span className="text-[9px] uppercase font-bold text-[var(--muted)] bg-[var(--foreground)]/[0.04] px-1.5 py-0.5 rounded border border-[var(--border)]">
                      {item.account.server}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div className="flex items-center gap-2.5 text-[11px] font-semibold text-[var(--muted)] flex-wrap">
                {totalHeroes !== undefined && totalHeroes !== null && (
                  <span className="flex items-center gap-1.5">
                    <Swords size={12} className="text-sky-400 shrink-0" />
                    <span>{totalHeroes}+ Heroes</span>
                  </span>
                )}
                {totalSkins !== undefined && totalSkins !== null && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                    <span className="flex items-center gap-1.5">
                      <Shirt size={12} className="text-purple-400 shrink-0" />
                      <span>{totalSkins}+ Skins</span>
                    </span>
                  </>
                )}
                {item.account?.server && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                      {item.account.server}
                    </span>
                  </>
                )}
              </div>
            );
          })()}
        </div>

        {/* PRICE & ACTION FOOTER */}
        <div className="pt-2.5 border-t border-[var(--border)]/60 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted)]">
              {isUnstocked ? "Status" : "Buy Price"}
            </div>
            <div
              className={`text-lg font-black leading-none mt-0.5 ${
                isUnstocked ? "text-red-400 text-sm font-bold uppercase" : "text-[var(--accent)]"
              }`}
            >
              {isUnstocked ? "Unstocked" : `₹${Number(item.price).toLocaleString("en-IN")}`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rentDisplay && (
              <div className="text-right">
                <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Rent
                </div>
                <div
                  className={`text-xs font-black leading-none mt-0.5 ${
                    rentDisplay.isRented
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-emerald-500"
                  }`}
                >
                  {rentDisplay.footerText}
                </div>
              </div>
            )}

            <div className="w-6 h-6 rounded-full bg-[var(--foreground)]/5 group-hover:bg-[var(--accent)] group-hover:text-white flex items-center justify-center text-[var(--muted)] transition-all">
              <ArrowUpRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
