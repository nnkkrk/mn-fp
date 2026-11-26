"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";

const DEFAULT_FEATURED_ITEMS = [
  {
    gameSlug: "mobile-legends114",
    gameName: "MLBB India",
    itemSlug: "weekly-pass816",
    itemName: "Weekly Pass",
    sellingPrice: 155,
    dummyPrice: 170,
    image: "/game-assets/weeklypass.webp",
  },
  {
    gameSlug: "weeklymonthly-bundle646",
    gameName: "Weekly Bundle",
    itemSlug: "weekly-bundle",
    itemName: "Weekly Bundle",
    sellingPrice: 83,
    dummyPrice: 100,
    image: "/game-assets/weekly-monthly-bundle.webp",
  },
  {
    gameSlug: "starlight-card-manual",
    gameName: "Starlight Card",
    itemSlug: "starlight-normal",
    itemName: "Starlight Card",
    sellingPrice: 280,
    dummyPrice: 299,
    image: "/game-assets/starkight.webp",
  },
];

/**
 * Horizontal strip of individual featured items selected by the owner.
 * Displays game name, item image, item name, and price, linking directly
 * to `/games/[gameSlug]?item=[itemSlug]` with that item pre-selected.
 */
export default function StorySlider({ featuredItems = [] }) {
  const [outOfStockSlugs, setOutOfStockSlugs] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/games")
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        setOutOfStockSlugs(json?.data?.outOfStockSlugs || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const sourceItems =
    Array.isArray(featuredItems) && featuredItems.length > 0
      ? featuredItems
      : DEFAULT_FEATURED_ITEMS;

  const items = sourceItems.filter(
    (item) => item?.gameSlug && item?.itemSlug && !outOfStockSlugs.includes(item.gameSlug)
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="relative py-3 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          {items.map((item, idx) => {
            const href = `/games/${item.gameSlug}?item=${encodeURIComponent(item.itemSlug)}`;
            const sell = Number(item.sellingPrice) || 0;
            const dummy = Number(item.dummyPrice) || 0;
            const hasDiscount = dummy > sell && sell > 0;
            const discountPct = hasDiscount ? Math.round(((dummy - sell) / dummy) * 100) : 0;

            return (
              <Link
                key={`${item.gameSlug}-${item.itemSlug}-${idx}`}
                href={href}
                className="group relative shrink-0 snap-start min-w-[176px] sm:min-w-[196px] rounded-2xl border border-[var(--border)]/80 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--accent)]/[0.06] hover:border-[var(--accent)]/60 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(var(--accent-rgb),0.28)] transition-all duration-200 p-2.5 sm:p-3 flex items-center gap-3 overflow-hidden"
              >
                {/* Discount Tag */}
                {discountPct > 0 && (
                  <span className="absolute top-0 right-0 px-1.5 py-0.5 rounded-bl-lg bg-[var(--accent)] text-white text-[9px] font-black tracking-tight leading-none">
                    -{discountPct}%
                  </span>
                )}

                {/* Item Image Pedestal */}
                <div className="relative w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-xl overflow-hidden shrink-0 border border-[var(--border)]/60 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--accent-rgb),0.14),transparent_72%)] bg-[var(--foreground)]/[0.03] p-1">
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <Image
                      src={item.image || "/game-assets/weeklypass.webp"}
                      alt={item.itemName}
                      fill
                      sizes="52px"
                      className="object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Game Name + Item Name + Price */}
                <div className="min-w-0 flex-1 pr-1">
                  {item.gameName && (
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] truncate leading-none mb-1">
                      {item.gameName}
                    </p>
                  )}
                  <p className="text-xs sm:text-[13px] font-extrabold text-[var(--foreground)] truncate leading-tight">
                    {item.itemName}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-[var(--foreground)] tabular-nums">
                        ₹{sell}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-[var(--muted)] line-through tabular-nums">
                          ₹{dummy}
                        </span>
                      )}
                    </div>
                    <FiArrowUpRight
                      size={13}
                      className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
