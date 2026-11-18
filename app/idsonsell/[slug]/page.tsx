import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ids from "@/data/idsOnSell";
import ShareButton from "./ShareButton";
import IdPurchaseBox from "./IdPurchaseBox";
import IdImageSlider from "./IdImageSlider";
import IdDetailClient from "./IdDetailClient";
import {
  ArrowLeft,
  Server,
  Lock,
  BadgeCheck,
  Swords,
  Sparkles,
  Award,
  Crown,
} from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item: any = ids.find((i) => i.slug === slug);
  if (!item) return { title: "Account Not Found" };

  const rawImage =
    item.media?.images?.[0] || item.media?.fallbackImage || item.image || "/logoBB.png";
  const absoluteImageUrl = rawImage.startsWith("http")
    ? rawImage
    : `https://mlbbtopup.in${rawImage}`;

  return {
    title: `${item.title} - ₹${item.price} | MT Marketplace`,
    description: `Buy or rent ${item.title} for ₹${item.price} on MLBB Top Up India. Verified account with safe Moonton rebind.`,
    openGraph: {
      title: `${item.title} - ₹${item.price}`,
      description: `Price: ₹${item.price} | Verified MLBB Account for Sale`,
      url: `https://mlbbtopup.in/idsonsell/${item.slug}`,
      images: [
        {
          url: absoluteImageUrl,
          width: 800,
          height: 500,
          alt: item.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} - ₹${item.price}`,
      description: `Price: ₹${item.price} | MLBB Account Marketplace`,
      images: [absoluteImageUrl],
    },
  };
}

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

  const itemImages =
    item.media?.images?.length
      ? item.media.images
      : [item.image || "/logoBB.png"];

  return (
    <IdDetailClient>
      <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-3.5 text-[var(--foreground)]">
        {/* ── TOP NAV BAR ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/idsonsell"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
          >
            <ArrowLeft size={13} />
            <span>Marketplace</span>
          </Link>

          {/* SHARE: JUST NAME, PRICE, LINK & IMAGE */}
          <ShareButton
            title={item.title}
            price={item.price}
            url={`${siteUrl}/idsonsell/${item.slug}`}
            imageUrl={itemImages[0]}
          />
        </div>

        {/* ── MOBILE HEADER (TITLE WITH BLUE TICK & ID) ── */}
        <div className="lg:hidden space-y-1">
          <div className="text-[11px] font-bold text-[var(--muted)]">
            ID: {item.id}
          </div>
          <h1 className="text-xl font-black leading-tight tracking-tight text-[var(--foreground)] flex items-center gap-1.5">
            <span>{item.title}</span>
            <BadgeCheck size={20} className="fill-[#38bdf8] text-white shrink-0 inline-block" />
          </h1>
        </div>

        {/* ── MAIN 2-COLUMN PRODUCT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
          {/* ── LEFT COLUMN: MEDIA & DETAILS (7 COLS) ── */}
          <div className="lg:col-span-7 space-y-4">
            {/* IMAGE SLIDER (CLEAN, NO BOTTOM OVERLAYS, MAX 3) */}
            <IdImageSlider
              images={itemImages}
              title={item.title}
              rent={rent}
            />

            {/* ON MOBILE ONLY: PURCHASE BOX SHOWN RIGHT UNDER IMAGE */}
            <div className="lg:hidden">
              <IdPurchaseBox item={item} url={`${siteUrl}/idsonsell/${item.slug}`} />
            </div>

            {/* ── SIMPLIFIED SPECS, SERVER, REBIND & HIGHLIGHTS (ALL IN ONE) ── */}
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 sm:p-5 space-y-3.5 shadow-xs">
              {/* 4-Item Key Specs with Sleek Vector Icons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Heroes */}
                <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-400">
                    <Swords size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Heroes</div>
                    <div className="text-sm font-black text-[var(--foreground)] leading-none mt-0.5 truncate">
                      {totalHeroes ? `${totalHeroes}+` : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Skins */}
                <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 text-pink-400">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Skins</div>
                    <div className="text-sm font-black text-[var(--foreground)] leading-none mt-0.5 truncate">
                      {totalSkins ? `${totalSkins}+` : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Rank */}
                <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                    <Award size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Rank</div>
                    <div className="text-xs sm:text-sm font-black text-[var(--accent)] leading-none mt-0.5 truncate">
                      {item.rank?.current || "Mythic"}
                    </div>
                  </div>
                </div>

                {/* Collection */}
                <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                    <Crown size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Collection</div>
                    <div className="text-xs sm:text-sm font-black text-amber-400 leading-tight mt-0.5 truncate" title={collectionTier}>
                      {collectionTier || "Standard"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Server, Safe Rebind (moved down from image) & Highlight Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[var(--border)]/60 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-[var(--foreground)]/[0.04] border border-[var(--border)] flex items-center gap-1.5 text-[var(--foreground)]">
                  <Server size={12} className="text-[var(--accent)]" />
                  <span>{item.account?.server || "India"} Server</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5">
                  <Lock size={12} />
                  <span>100% Safe Rebind</span>
                </span>

                {tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description Text */}
              {details && (
                <p className="text-xs sm:text-[13px] text-[var(--foreground)]/85 leading-relaxed font-medium pt-2.5 border-t border-[var(--border)]/60">
                  {details}
                </p>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: DESKTOP STICKY PURCHASE BOX (5 COLS) ── */}
          <div className="hidden lg:block lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            {/* TITLE & ID HEADER (DESKTOP) */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[var(--muted)]">
                ID: {item.id}
              </div>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-[var(--foreground)] flex items-center gap-2">
                <span>{item.title}</span>
                <BadgeCheck size={22} className="fill-[#38bdf8] text-white shrink-0 inline-block" />
              </h1>
            </div>

            {/* PURCHASE BOX */}
            <IdPurchaseBox item={item} url={`${siteUrl}/idsonsell/${item.slug}`} />
          </div>
        </div>
      </main>
    </IdDetailClient>
  );
}
