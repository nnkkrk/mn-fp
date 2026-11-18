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
      className="group relative rounded-2xl overflow-hidden
                 bg-[var(--card)] border border-[var(--border)]
                 transition-all duration-300 flex flex-col
                 hover:-translate-y-1
                 hover:border-[var(--accent)]
                 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)]"
    >
      {/* ── IMAGE ── */}
      <div className="relative h-44 w-full overflow-hidden bg-black/10 shrink-0">
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
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-md">
            Rent ₹{rentPrice} / {rentDuration}h
          </span>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-[var(--foreground)]">
        <div className="space-y-2.5">
          {/* TITLE */}
          <h2 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
            {item.title}
          </h2>

          {/* HEROES & SKINS */}
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
            {totalHeroes !== undefined && totalHeroes !== null && (
              <span>🎭 {totalHeroes}+ Heroes</span>
            )}
            {totalSkins !== undefined && totalSkins !== null && (
              <span>🎨 {totalSkins}+ Skins</span>
            )}
          </div>

          {/* COLLECTION LEVEL */}
          {collectionTier && (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              <span>🏆 Collection: {collectionTier}</span>
            </div>
          )}

          {/* OPTIONAL DETAILS (show only if available) */}
          {details && (
            <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
              {details}
            </p>
          )}

          {/* TAGS (show only if available) */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--foreground)]/5 text-[var(--foreground)]/80 border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* PRICE & RENT FOOTER */}
        <div className="pt-2.5 border-t border-[var(--border)]/60 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Price</div>
            <div className="text-xl font-black text-[var(--accent)] leading-tight">
              ₹{item.price}
            </div>
          </div>

          {rentAvailable && (
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Rental</div>
              <div className="text-xs font-black text-emerald-500">
                Rent ₹{rentPrice}/day
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HOVER GLOW */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl ring-1 ring-[var(--accent)]/30 transition" />
    </Link>
  );
}
