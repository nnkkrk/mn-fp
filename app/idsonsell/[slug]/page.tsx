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
  Trophy,
  Server,
  Lock,
  Calendar,
  Layers,
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
    <main className="min-h-screen max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 text-[var(--foreground)]">
      {/* ── TOP NAV BAR ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/idsonsell"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
        >
          <ArrowLeft size={14} />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition">
          <ShareButton
            text={shareText}
            url={`${siteUrl}/idsonsell/${item.slug}`}
          />
        </div>
      </div>

      {/* ── MAIN 2-COLUMN PRODUCT GRID ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
        {/* ── LEFT COLUMN: MEDIA & FULL DETAILS (7 cols) ── */}
        <div className="lg:col-span-7 space-y-5">
          {/* IMAGE CARD */}
          <div className="relative aspect-[16/10] sm:h-84 w-full rounded-2xl overflow-hidden bg-black/20 border border-[var(--border)] shadow-md">
            <Image
              src={item.media?.images?.[0] || item.media?.fallbackImage || item.image || "/logo.png"}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            {/* BADGES ON IMAGE */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-md">
                <ShieldCheck size={13} />
                Verified ID
              </span>
            </div>

            {rent?.available && (
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-black shadow-md">
                Rent ₹{rent.price} / {rent.durationHours || 24}h
              </span>
            )}

            {/* SERVER / REBIND STRIP OVERLAY */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-white/90">
              {item.account?.server && (
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1">
                  <Server size={12} /> {item.account.server}
                </span>
              )}
              {item.account?.loginType && (
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1">
                  <Lock size={12} /> {item.account.loginType}
                </span>
              )}
              {item.account?.rebindable !== undefined && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  100% Safe Rebind
                </span>
              )}
            </div>
          </div>

          {/* ── COMPLETE SPECIFICATIONS GRID ── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                <Layers size={14} className="text-[var(--accent)]" />
                Account Specifications
              </span>
              <span className="text-[11px] font-bold text-[var(--muted)]">
                ID: {item.id}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Total Heroes */}
              <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Heroes</div>
                <div className="text-base font-black text-[var(--foreground)] mt-0.5">
                  🎭 {totalHeroes ? `${totalHeroes}+` : "N/A"}
                </div>
              </div>

              {/* Total Skins */}
              <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Skins</div>
                <div className="text-base font-black text-[var(--foreground)] mt-0.5">
                  🎨 {totalSkins ? `${totalSkins}+` : "N/A"}
                </div>
              </div>

              {/* Collection Tier */}
              <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Collection Tier</div>
                <div className="text-xs sm:text-sm font-black text-amber-500 mt-1 truncate">
                  🏆 {collectionTier || "Standard"}
                </div>
              </div>

              {/* Current Rank */}
              <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Current Rank</div>
                <div className="text-xs sm:text-sm font-black text-[var(--accent)] mt-1 truncate">
                  🎖️ {item.rank?.current || "Mythic"}
                </div>
              </div>

              {/* Peak Rank */}
              <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Peak Rank</div>
                <div className="text-xs sm:text-sm font-black text-purple-400 mt-1 truncate">
                  <Trophy size={12} className="inline mr-1" />
                  {item.rank?.highest || "Mythic Glory"}
                </div>
              </div>

              {/* Account Age */}
              <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Account Age</div>
                <div className="text-xs sm:text-sm font-black text-[var(--foreground)] mt-1 truncate">
                  <Calendar size={12} className="inline mr-1 text-[var(--muted)]" />
                  {item.account?.accountAgeYears ? `${item.account.accountAgeYears} Years` : "Established"}
                </div>
              </div>
            </div>
          </div>

          {/* ── HIGHLIGHT TAGS ── */}
          {tags.length > 0 && (
            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[var(--accent)]" />
                Featured Highlights
              </div>
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
            </div>
          )}

          {/* ── ACCOUNT DESCRIPTION & OVERVIEW ── */}
          {details && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                About this Account
              </div>
              <p className="text-xs sm:text-sm text-[var(--foreground)]/90 leading-relaxed font-medium">
                {details}
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: INTERACTIVE ACTION BOX (5 cols) ── */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          {/* TITLE & HEADER */}
          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1.5 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
              Verified MLBB ID
            </span>
            <h1 className="text-lg sm:text-xl font-black leading-snug tracking-tight text-[var(--foreground)]">
              {item.title}
            </h1>
          </div>

          {/* INTERACTIVE BUY / RENT ACTION BOX */}
          <IdPurchaseBox item={item} />
        </div>
      </div>
    </main>
  );
}
