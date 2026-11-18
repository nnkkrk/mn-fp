import Link from "next/link";
import Image from "next/image";

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

  const tags: string[] = item.tags || item.highlights || [];
  const details = item.details || item.description;

  return (
    <Link
      href={`/idsonsell/${item.slug}`}
      className="group relative rounded-xl sm:rounded-2xl overflow-hidden
                 bg-[var(--card)] border border-[var(--border)]
                 transition-all duration-300 flex flex-col
                 hover:-translate-y-1
                 hover:border-[var(--accent)]
                 hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.5)]"
    >
      {/* ── IMAGE (COMPACT) ── */}
      <div className="relative h-36 w-full overflow-hidden bg-black/10 shrink-0">
        <Image
          src={item.media?.images?.[0] || item.image || "/logo.png"}
          alt={item.title || "Gaming ID"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* RENT BADGE ON IMAGE */}
        {rentAvailable && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-md">
            Rent ₹{rentPrice} / {rentDuration}h
          </span>
        )}
      </div>

      {/* ── CONTENT (COMPACT PADDING & SPACING) ── */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2 text-[var(--foreground)]">
        <div className="space-y-1.5">
          {/* TITLE */}
          <h2 className="font-bold text-sm leading-snug line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
            {item.title}
          </h2>

          {/* HEROES & SKINS */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted)]">
            {totalHeroes !== undefined && totalHeroes !== null && (
              <span>🎭 {totalHeroes}+ Heroes</span>
            )}
            {totalSkins !== undefined && totalSkins !== null && (
              <span>🎨 {totalSkins}+ Skins</span>
            )}
          </div>

          {/* COLLECTION LEVEL */}
          {collectionTier && (
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <span>🏆 Collection: {collectionTier}</span>
            </div>
          )}

          {/* OPTIONAL DETAILS (COMPACT) */}
          {details && (
            <p className="text-[11px] text-[var(--muted)] line-clamp-1 leading-snug">
              {details}
            </p>
          )}

          {/* TAGS (COMPACT PILLS) */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--foreground)]/5 text-[var(--foreground)]/80 border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* PRICE & RENT FOOTER (COMPACT) */}
        <div className="pt-2 border-t border-[var(--border)]/60 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase font-bold text-[var(--muted)]">Price</div>
            <div className="text-lg font-black text-[var(--accent)] leading-none">
              ₹{item.price}
            </div>
          </div>

          {rentAvailable && (
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-[var(--muted)]">Rental</div>
              <div className="text-[11px] font-bold text-emerald-500 leading-none">
                Rent ₹{rentPrice}/day
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HOVER GLOW */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-xl sm:rounded-2xl ring-1 ring-[var(--accent)]/30 transition" />
    </Link>
  );
}
