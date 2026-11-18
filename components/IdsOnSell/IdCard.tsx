import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface IdCardProps {
  item: any;
}

export default function IdCard({ item }: IdCardProps) {
  const totalHeroes = item.heroes?.total ?? item.heroes;
  const totalSkins = item.skins?.total ?? item.skins;
  const collectionTier =
    item.collection?.tier ||
    item.collectionLevel ||
    (typeof item.collection === "string" ? item.collection : null);

  const rentAvailable = item.rent?.available;
  const rentPrice = item.rent?.price;
  const rentDuration = item.rent?.durationHours || 24;

  return (
    <Link
      href={`/idsonsell/${item.slug}`}
      className="group relative rounded-2xl overflow-hidden
                 bg-[var(--card)] border border-[var(--border)]
                 transition-all duration-300 flex flex-col
                 hover:-translate-y-1
                 hover:border-[var(--accent)]/60
                 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.4)]"
    >
      {/* ── IMAGE THUMBNAIL ── */}
      <div className="relative h-40 w-full overflow-hidden bg-black/20 shrink-0">
        <Image
          src={item.media?.images?.[0] || item.image || "/logo.png"}
          alt={item.title || "Gaming ID"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* RENT BADGE */}
        {rentAvailable && (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-md backdrop-blur-xs">
            Rent ₹{rentPrice}/{rentDuration}h
          </span>
        )}

        {/* COLLECTION BADGE (ON IMAGE BOTTOM) */}
        {collectionTier && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md border border-white/10 text-amber-400">
            🏆 {collectionTier}
          </div>
        )}
      </div>

      {/* ── CLEAN, UNCLUTTERED CARD BODY ── */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 text-[var(--foreground)]">
        <div className="space-y-1.5">
          {/* TITLE */}
          <h2 className="font-bold text-sm leading-snug line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
            {item.title}
          </h2>

          {/* KEY STATS (HEROES & SKINS) */}
          <div className="flex items-center gap-3 text-[11px] font-semibold text-[var(--muted)]">
            {totalHeroes !== undefined && totalHeroes !== null && (
              <span className="flex items-center gap-1">
                <span>🎭</span> {totalHeroes}+ Heroes
              </span>
            )}
            <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
            {totalSkins !== undefined && totalSkins !== null && (
              <span className="flex items-center gap-1">
                <span>🎨</span> {totalSkins}+ Skins
              </span>
            )}
          </div>
        </div>

        {/* PRICE & ACTION FOOTER */}
        <div className="pt-2.5 border-t border-[var(--border)]/60 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted)]">
              Buy Price
            </div>
            <div className="text-lg font-black text-[var(--accent)] leading-none mt-0.5">
              ₹{item.price}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rentAvailable && (
              <div className="text-right">
                <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Rent
                </div>
                <div className="text-xs font-black text-emerald-500 leading-none mt-0.5">
                  ₹{rentPrice}/day
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
