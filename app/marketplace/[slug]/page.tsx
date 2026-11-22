import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ids from "@/data/idsOnSell";
import { connectDB } from "@/lib/mongodb";
import TradeId from "@/models/TradeId";
import ShareButton from "./ShareButton";
import IdPurchaseBox from "./IdPurchaseBox";
import IdImageSlider from "./IdImageSlider";
import IdDetailClient from "./IdDetailClient";
import {
  ArrowLeft,
  Server,
  Lock,
  BadgeCheck,
  Gamepad2,
  Shirt,
  Trophy,
  Crown,
} from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getAccount(slug: string) {
  try {
    await connectDB();
    const normalized = slug.toLowerCase().trim();
    const item = await TradeId.findOne({
      $or: [{ slug: normalized }, { id: slug.trim() }],
    }).lean();
    if (item) {
      return JSON.parse(JSON.stringify(item));
    }
  } catch (err) {
    console.error("Error fetching account from DB:", err);
  }
  return ids.find((i: any) => i.slug === slug || i.id === slug) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item: any = await getAccount(slug);
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
      url: `https://mlbbtopup.in/marketplace/${item.slug}`,
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
  const item: any = await getAccount(slug);
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
      <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-28 sm:pb-16 space-y-3.5 text-[var(--foreground)]">
        {/* ── TOP NAV BAR ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
          >
            <ArrowLeft size={13} />
            <span>Marketplace</span>
          </Link>

          {/* SHARE: JUST NAME, PRICE, LINK & IMAGE */}
          <ShareButton
            title={item.title}
            price={item.price}
            url={`${siteUrl}/marketplace/${item.slug}`}
            imageUrl={itemImages[0]}
          />
        </div>

        {/* ── MOBILE HEADER (TITLE WITH VERIFIED BADGE & ID) ── */}
        <div className="lg:hidden space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-[10px] font-mono font-bold text-[var(--muted)]">
              ID: {item.id}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[#38bdf8] text-[10px] font-bold">
              <BadgeCheck size={12} className="fill-[#38bdf8] text-black shrink-0" />
              <span>Verified Account</span>
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black leading-snug tracking-tight text-[var(--foreground)]">
            <span>{item.title}</span>
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

            {/* ── SPECS, SERVER, REBIND & HIGHLIGHTS (DISPLAYED DIRECTLY UNDER IMAGES) ── */}
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 sm:p-5 space-y-3.5 shadow-xs">
              {/* Bullet Points Specifications (Clean & Generic Multi-Game) */}
              {(() => {
                const bullets: string[] = (item.bulletPoints && item.bulletPoints.length > 0)
                  ? item.bulletPoints
                  : Array.isArray(item.specs) && item.specs.length > 0 && typeof item.specs[0] === "string"
                  ? item.specs
                  : [];

                if (bullets.length > 0) {
                  return (
                    <div className="space-y-2.5 p-3.5 rounded-xl bg-[var(--background)]/80 border border-[var(--border)]">
                      <div className="text-[11px] font-black uppercase tracking-wider text-[var(--foreground)] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <BadgeCheck size={14} className="text-emerald-400" />
                          <span>Account Specifications</span>
                        </span>
                        <span className="text-[10px] text-[var(--muted)] font-bold">{bullets.length} Key Features</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {bullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2 text-xs font-semibold text-[var(--foreground)]">
                            <span className="text-[var(--accent)] font-black text-sm shrink-0 leading-none mt-0.5">•</span>
                            <span className="leading-snug">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Key Specs: Modern Gaming Dashboard HUD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Array.isArray(item.specs) && item.specs.length > 0 ? (
                  item.specs.slice(0, 4).map((spec: any, sIdx: number) => {
                    const colors = [
                      { border: "hover:border-sky-500/40", text: "text-sky-500 dark:text-sky-400", sub: "text-sky-600 dark:text-sky-400/90" },
                      { border: "hover:border-purple-500/40", text: "text-purple-500 dark:text-purple-400", sub: "text-purple-600 dark:text-purple-400/90" },
                      { border: "hover:border-cyan-500/40", text: "text-blue-500 dark:text-cyan-400", sub: "text-blue-600 dark:text-cyan-400/90" },
                      { border: "hover:border-amber-500/40", text: "text-amber-500 dark:text-amber-400", sub: "text-amber-600 dark:text-amber-400/90" },
                    ];
                    const c = colors[sIdx % colors.length];
                    return (
                      <div
                        key={sIdx}
                        className={`p-3 rounded-2xl bg-[var(--background)] dark:bg-white/[0.03] border border-[var(--border)] ${c.border} transition-all group flex flex-col justify-between shadow-xs`}
                      >
                        <div className="flex items-center justify-between text-[var(--muted)]">
                          <span className="text-[10px] font-bold uppercase tracking-wider truncate mr-1">
                            {spec.label}
                          </span>
                          <Gamepad2 size={15} className={`${c.text} shrink-0`} />
                        </div>
                        <div className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight mt-1.5 leading-snug line-clamp-1" title={spec.value}>
                          {spec.value}
                        </div>
                        <div className={`text-[9.5px] font-semibold ${c.sub} mt-1 truncate`}>
                          {spec.subtext || "Verified Spec"}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    {/* Heroes */}
                    <div className="p-3 rounded-2xl bg-[var(--background)] dark:bg-white/[0.03] border border-[var(--border)] hover:border-sky-500/40 transition-all group flex flex-col justify-between shadow-xs">
                      <div className="flex items-center justify-between text-[var(--muted)]">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Heroes</span>
                        <Gamepad2 size={16} className="text-sky-500 dark:text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
                      </div>
                      <div className="text-lg sm:text-xl font-black text-[var(--foreground)] tracking-tight mt-1.5 leading-none">
                        {totalHeroes ? `${totalHeroes}+` : "N/A"}
                      </div>
                      <div className="text-[9.5px] font-semibold text-sky-600 dark:text-sky-400/90 mt-1">
                        All Meta Unlocked
                      </div>
                    </div>

                    {/* Skins */}
                    <div className="p-3 rounded-2xl bg-[var(--background)] dark:bg-white/[0.03] border border-[var(--border)] hover:border-purple-500/40 transition-all group flex flex-col justify-between shadow-xs">
                      <div className="flex items-center justify-between text-[var(--muted)]">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Skins</span>
                        <Shirt size={16} className="text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                      </div>
                      <div className="text-lg sm:text-xl font-black text-[var(--foreground)] tracking-tight mt-1.5 leading-none">
                        {totalSkins ? `${totalSkins}+` : "N/A"}
                      </div>
                      <div className="text-[9.5px] font-semibold text-purple-600 dark:text-purple-400/90 mt-1">
                        Rare & Collector
                      </div>
                    </div>

                    {/* Rank */}
                    <div className="p-3 rounded-2xl bg-[var(--background)] dark:bg-white/[0.03] border border-[var(--border)] hover:border-cyan-500/40 transition-all group flex flex-col justify-between shadow-xs">
                      <div className="flex items-center justify-between text-[var(--muted)]">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Current Rank</span>
                        <Trophy size={16} className="text-blue-500 dark:text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                      </div>
                      <div className="text-lg sm:text-xl font-black text-[var(--accent)] tracking-tight mt-1.5 leading-none">
                        {item.rank?.current || "Mythic"}
                      </div>
                      <div className="text-[9.5px] font-semibold text-blue-600 dark:text-cyan-400/90 mt-1">
                        {item.rank?.highest ? `Peak: ${item.rank.highest}` : "Tournament Ready"}
                      </div>
                    </div>

                    {/* Collection */}
                    <div className="p-3 rounded-2xl bg-[var(--background)] dark:bg-white/[0.03] border border-[var(--border)] hover:border-amber-500/40 transition-all group flex flex-col justify-between shadow-xs">
                      <div className="flex items-center justify-between text-[var(--muted)]">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Collection</span>
                        <Crown size={16} className="text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                      </div>
                      <div className="text-base sm:text-lg font-black text-amber-500 dark:text-amber-400 tracking-tight mt-1.5 leading-snug">
                        {collectionTier || "Standard"}
                      </div>
                      <div className="text-[9.5px] font-semibold text-amber-600 dark:text-amber-400/90 mt-1">
                        {item.collection?.points ? `${item.collection.points.toLocaleString("en-IN")} Pts` : "High Collector"}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* All Specs List (if more than 4 specs) */}
              {Array.isArray(item.specs) && item.specs.length > 4 && (
                <div className="p-3 rounded-xl bg-[var(--background)]/60 border border-[var(--border)] space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Additional Specifications</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {item.specs.slice(4).map((s: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                        <div className="text-[10px] text-[var(--muted)] font-bold">{s.label}</div>
                        <div className="font-black text-xs text-[var(--foreground)]">{s.value}</div>
                        {s.subtext && <div className="text-[9px] text-[var(--muted)]">{s.subtext}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Server, Safe Rebind & Highlight Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[var(--border)]/60 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-[var(--foreground)]/[0.04] border border-[var(--border)] flex items-center gap-1.5 text-[var(--foreground)]">
                  <Server size={12} className="text-[var(--accent)]" />
                  <span>{item.account?.server || "India"} Server</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5">
                  <Lock size={12} />
                  <span>{item.account?.loginType ? `${item.account.loginType} Verified` : "100% Safe Rebind"}</span>
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

            {/* ON MOBILE: PURCHASE BOX SHOWN UNDER SPECS */}
            <div className="lg:hidden pb-16">
              <IdPurchaseBox item={item} url={`${siteUrl}/marketplace/${item.slug}`} />
            </div>
          </div>

          {/* ── RIGHT COLUMN: DESKTOP STICKY PURCHASE BOX (5 COLS) ── */}
          <div className="hidden lg:block lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            {/* TITLE & ID HEADER (DESKTOP) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-[10px] font-mono font-bold text-[var(--muted)]">
                  ID: {item.id}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[#38bdf8] text-[10px] font-bold">
                  <BadgeCheck size={12} className="fill-[#38bdf8] text-black shrink-0" />
                  <span>Verified Account</span>
                </span>
              </div>
              <h1 className="text-2xl font-black leading-snug tracking-tight text-[var(--foreground)]">
                <span>{item.title}</span>
              </h1>
            </div>

            {/* PURCHASE BOX */}
            <IdPurchaseBox item={item} url={`${siteUrl}/marketplace/${item.slug}`} />
          </div>
        </div>
      </main>
    </IdDetailClient>
  );
}
