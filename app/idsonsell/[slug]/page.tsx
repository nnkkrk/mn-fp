import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ids from "@/data/idsOnSell";
import ShareButton from "./ShareButton";
import IdPurchaseBox from "./IdPurchaseBox";
import {
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Server,
  Lock,
  Layers,
  CheckCircle2,
} from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const item: any = ids.find((i) => i.slug === slug);
  if (!item) notFound();

  const siteUrl = "https://mlbbtopup.in";
  const rent = item.rent;
  const totalHeroes = item.heroes?.total ?? item.heroes;
  const totalSkins = item.skins?.total ?? item.skins;
  const collectionTier =
    item.collection?.tier ||
    item.collectionLevel ||
    (typeof item.collection === "string" ? item.collection : null);
  const tags: string[] = item.tags || item.highlights || [];
  const details = item.details || item.description;

  const shareText = `🔥 MLBB Account For Sale: ${item.title}
🎭 Heroes: ${totalHeroes ? `${totalHeroes}+` : "N/A"}
🎨 Skins: ${totalSkins ? `${totalSkins}+` : "N/A"}
${collectionTier ? `🏆 Collection: ${collectionTier}\n` : ""}Price: ₹${item.price}`;

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-4 text-[var(--foreground)]">
      {/* ── TOP NAV BAR ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/idsonsell"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
        >
          <ArrowLeft size={13} />
          <span>Marketplace</span>
        </Link>

        <ShareButton
          text={shareText}
          url={`${siteUrl}/idsonsell/${item.slug}`}
        />
      </div>

      {/* ── MOBILE HEADER (TITLE & ID SHOWN FIRST ON MOBILE) ── */}
      <div className="lg:hidden space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
            Verified Gaming Account
          </span>
          <span className="text-[11px] font-bold text-[var(--muted)]">
            ID: {item.id}
          </span>
        </div>
        <h1 className="text-xl font-black leading-tight tracking-tight text-[var(--foreground)]">
          {item.title}
        </h1>
      </div>

      {/* ── MAIN 2-COLUMN PRODUCT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
        {/* ── LEFT COLUMN: MEDIA & DETAILS (7 COLS) ── */}
        <div className="lg:col-span-7 space-y-4">
          {/* IMAGE BANNER */}
          <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black/20 border border-[var(--border)] shadow-xs">
            <Image
              src={item.media?.images?.[0] || item.media?.fallbackImage || item.image || "/logo.png"}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-md">
                <ShieldCheck size={12} /> Verified ID
              </span>
            </div>

            {rent?.available && (
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black shadow-md">
                Rent ₹{rent.price} / {rent.durationHours || 24}h
              </span>
            )}

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white/90">
              <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1">
                <Server size={12} /> {item.account?.server || "India"} Server
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Lock size={12} /> 100% Safe Rebind
              </span>
            </div>
          </div>

          {/* ON MOBILE ONLY: PURCHASE BOX SHOWN RIGHT UNDER IMAGE */}
          <div className="lg:hidden">
            <IdPurchaseBox item={item} />
          </div>

          {/* QUICK SPECS MATRIX */}
          <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <Layers size={13} className="text-[var(--accent)]" />
              Key Specifications
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50">
                <div className="text-[9px] font-bold uppercase text-[var(--muted)]">Heroes</div>
                <div className="text-sm font-black text-[var(--foreground)] mt-0.5">
                  🎭 {totalHeroes ? `${totalHeroes}+` : "N/A"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50">
                <div className="text-[9px] font-bold uppercase text-[var(--muted)]">Skins</div>
                <div className="text-sm font-black text-[var(--foreground)] mt-0.5">
                  🎨 {totalSkins ? `${totalSkins}+` : "N/A"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50">
                <div className="text-[9px] font-bold uppercase text-[var(--muted)]">Tier</div>
                <div className="text-xs font-black text-amber-500 mt-1 truncate" title={collectionTier}>
                  🏆 {collectionTier || "Standard"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50">
                <div className="text-[9px] font-bold uppercase text-[var(--muted)]">Rank</div>
                <div className="text-xs font-black text-[var(--accent)] mt-1 truncate">
                  🎖️ {item.rank?.current || "Mythic"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50">
                <div className="text-[9px] font-bold uppercase text-[var(--muted)]">Server</div>
                <div className="text-xs font-black text-[var(--foreground)] mt-1 truncate">
                  🌐 {item.account?.server || "India"}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50">
                <div className="text-[9px] font-bold uppercase text-[var(--muted)]">Rebind</div>
                <div className="text-xs font-black text-emerald-500 mt-1 truncate">
                  🔒 100% Safe
                </div>
              </div>
            </div>
          </div>

          {/* OVERVIEW & HIGHLIGHTS */}
          <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 sm:p-5 space-y-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <Sparkles size={13} className="text-[var(--accent)]" />
              Account Highlights
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {details && (
              <p className="text-xs sm:text-[13px] text-[var(--foreground)]/85 leading-relaxed font-medium pt-2 border-t border-[var(--border)]/60">
                {details}
              </p>
            )}
          </div>

          {/* SAFETY GUARANTEES */}
          <div className="rounded-2xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/70 p-4 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
              Buyer Protection & Guarantees
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium text-[var(--foreground)]/80">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Verified Ownership</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Safe Moonton Transfer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>WhatsApp Handover</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: DESKTOP STICKY PURCHASE BOX (5 COLS) ── */}
        <div className="hidden lg:block lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          {/* TITLE & ID HEADER (DESKTOP) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
                Verified Gaming Account
              </span>
              <span className="text-[11px] font-bold text-[var(--muted)]">
                ID: {item.id}
              </span>
            </div>
            <h1 className="text-2xl font-black leading-tight tracking-tight text-[var(--foreground)]">
              {item.title}
            </h1>
          </div>

          {/* PURCHASE BOX */}
          <IdPurchaseBox item={item} />
        </div>
      </div>
    </main>
  );
}
