"use client";

import Image from "next/image";
import Link from "next/link";
import { FiZap, FiClock } from "react-icons/fi";
import { useEffect, useState } from "react";
import { ProductCardSkeleton } from "../Skeleton/Skeleton";
import { SectionTitle } from "@/components/common";

const DEFAULT_FLASH_ITEMS = [
  {
    id: "fs_1",
    name: "Weekly Pass",
    game: "MLBB",
    image: "/game-assets/weeklypass.webp",
    price: "₹151",
    originalPrice: "₹170",
    slug: "flash-weekly621",
    badge: "Hot",
  },
  {
    id: "fs_2",
    name: "Blessing Welkin",
    game: "Genshin",
    image: "/game-assets/genshin.webp",
    price: "₹405",
    originalPrice: "₹450",
    slug: "genshin-impact265",
    badge: "Sale",
  },
  {
    id: "fs_3",
    name: "Starlight Card",
    game: "MLBB",
    image: "/game-assets/starkight.webp",
    price: "₹240",
    originalPrice: "₹299",
    slug: "starlight-card-manual",
    badge: "New",
  },
  {
    id: "fs_4",
    name: "Weekly Bundle",
    game: "MLBB",
    image: "/game-assets/weekly-monthly-bundle.webp",
    price: "₹84",
    originalPrice: "₹100",
    slug: "weeklymonthly-bundle646",
    badge: "Value",
  },
  {
    id: "fs_5",
    name: "Weekly Card plus",
    game: "HOK",
    image: "/game-assets/hok.webp",
    price: "₹385",
    originalPrice: "₹450",
    slug: "honor-of-kings57",
    badge: "Best",
  },
];

export default function FlashSale() {
  const [saleConfig, setSaleConfig] = useState({
    title: "Flash Sale",
    enabled: true,
    endTime: null,
    items: DEFAULT_FLASH_ITEMS,
  });

  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const [loading, setLoading] = useState(true);

  // Fetch dynamic Flash Sale configuration
  useEffect(() => {
    let isMounted = true;
    fetch("/api/flash-sale")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          setSaleConfig({
            title: json.data.title || "Flash Sale",
            enabled: json.data.enabled !== false,
            endTime: json.data.endTime,
            items: json.data.items && json.data.items.length > 0 ? json.data.items : DEFAULT_FLASH_ITEMS,
          });
        }
      })
      .catch((err) => console.error("FlashSale fetch failed", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time countdown against endTime
  useEffect(() => {
    const updateCountdown = () => {
      if (!saleConfig.endTime) {
        // Fallback relative cycle
        setTimeLeft((prev) => {
          if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
          if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
          return { hours: 12, minutes: 0, seconds: 0 };
        });
        return;
      }

      const diff = new Date(saleConfig.endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [saleConfig.endTime]);

  if (!saleConfig.enabled || (!loading && saleConfig.items.length === 0)) {
    return null;
  }

  return (
    <section className="relative py-2 px-4 overflow-hidden border-b border-[var(--border)] bg-[var(--card)]/20">
      <div className="max-w-7xl mx-auto">
        {/* Header Strip */}
        <div className="mb-2">
          <SectionTitle
            size="sm"
            accentColor="amber"
            subtitle="Limited Time Deals"
            icon={<FiZap size={10} className="text-amber-500 fill-amber-500" />}
            title={saleConfig.title.split(" ")[0]}
            highlight={saleConfig.title.split(" ").slice(1).join(" ") || "Sale"}
            actionLayout="row"
            action={
              <div className="flex items-center gap-1.5 bg-[var(--card)] border border-amber-500/25 px-2.5 py-1 rounded-full shadow-xs">
                <FiClock className="text-amber-500 shrink-0" size={11} />
                <div className="flex items-center gap-1 font-bold text-[9.5px] sm:text-[10.5px] tabular-nums text-amber-500">
                  <span className="opacity-60 text-[7.5px] uppercase tracking-wider text-[var(--foreground)] mr-0.5 hidden min-[360px]:inline">
                    Ends In
                  </span>
                  <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="opacity-30 text-[var(--foreground)]">:</span>
                  <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="opacity-30 text-[var(--foreground)]">:</span>
                  <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                </div>
              </div>
            }
          />
        </div>

        {/* Horizontal Cards Slider */}
        <div className="overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          <div className="flex gap-2 sm:gap-2.5 px-0.5 min-w-max md:min-w-0">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[118px] sm:w-[135px] md:w-[160px]">
                  <ProductCardSkeleton />
                </div>
              ))
            ) : (
              saleConfig.items.map((item) => (
                <div key={item.id} className="snap-start">
                  <Link
                    href={`/games/${item.slug}`}
                    className="group relative block w-[118px] sm:w-[135px] md:w-[160px] bg-gradient-to-b from-[var(--card)] to-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] rounded-lg p-2 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-0.5 shadow-xs hover:shadow-sm overflow-hidden"
                  >
                    {/* Top rim specular highlight line */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none" />

                    {/* Ambient radial glow on hover */}
                    <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none bg-amber-500" />

                    {/* Subtle hover gradient wash */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent transition-opacity duration-300 pointer-events-none" />

                    {/* Simple Flash Sale Watermark SVG inside card */}
                    <svg
                      viewBox="0 0 100 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute right-0 bottom-0 h-full w-20 sm:w-24 text-amber-500 opacity-[0.05] dark:opacity-[0.09] group-hover:opacity-[0.16] transition-all duration-300 pointer-events-none select-none"
                    >
                      <path d="M40 60 L65 0 H76 L51 60 H40 Z" fill="currentColor" />
                      <path d="M62 60 L87 0 H96 L71 60 H62 Z" fill="currentColor" />
                    </svg>

                    {/* Badge & Game Tag */}
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
                      <span className="text-[7px] md:text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-500 text-black shadow-xs">
                        {item.game}
                      </span>
                      {item.badge && item.badge !== "Hot" && (
                        <span className="text-[6.5px] md:text-[7px] font-black uppercase px-1 py-0.5 rounded-sm bg-rose-600 text-white shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Image Container */}
                    <div className="relative aspect-[16/13] rounded-md overflow-hidden mb-1.5 border border-white/10 bg-[var(--background)]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 140px, 185px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />
                    </div>

                    {/* Info */}
                    <div className="space-y-0.5 px-0.5 pt-0.5 relative z-10">
                      <h3 className="text-[10.5px] md:text-[12px] font-black uppercase tracking-tight text-[var(--foreground)] truncate group-hover:text-amber-500 leading-tight">
                        {item.name}
                      </h3>

                      <div className="flex items-baseline justify-between pt-0.5">
                        <span className="text-[12px] md:text-[13.5px] font-black italic text-[var(--foreground)] leading-none">
                          {item.price}
                        </span>
                        <span className="text-[8.5px] md:text-[9.5px] font-semibold text-[var(--muted)] line-through decoration-red-500/80">
                          {item.originalPrice}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
