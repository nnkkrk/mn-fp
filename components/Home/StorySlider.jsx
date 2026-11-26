"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";
import { useBuyStore } from "@/store/useBuyStore";

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
 * Horizontal strip of "Most Selling Items" selected by the owner.
 * Displays game name, item image, item name, price, and discount badge,
 * linking directly to `/games/[gameSlug]?item=[itemSlug]`.
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
        {/* Section Heading */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M12.5 2.5C12.5 2.5 17 6.4 17 11.2C17 14.9 14.3 17.8 11.2 18.4C13.1 16.9 13.7 14.6 12.6 12.5C11.9 14.2 10.6 15.1 9.5 15.3C9.9 13.4 9.1 11.4 7.7 10.1C6.2 11.7 5.5 13.8 6.1 16C4.4 14.7 3.5 12.6 4 10.2C4.7 6.7 8.4 4.1 12.5 2.5Z"
                fill="#f59e0b"
              />
              <path
                d="M12.2 10.5C12.2 10.5 15 12.8 15 15.8C15 18.4 13.1 20.5 10.5 21C8 20.5 6.5 18.6 6.8 16.1C7.4 17.2 8.4 17.6 9.3 17.4C8.9 15.8 9.9 13.5 12.2 10.5Z"
                fill="#fbbf24"
              />
            </svg>
            <h2 className="text-sm sm:text-base font-black tracking-tight text-[var(--foreground)]">
              Most Selling Items
            </h2>
          </div>
        </div>

        {/* Horizontal Product Strip */}
        <div className="flex gap-3 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          {items.map((item, idx) => {
            const href = `/games/${item.gameSlug}/buy/${item.itemSlug}`;
            const sell = Number(item.sellingPrice) || 0;
            const dummy = Number(item.dummyPrice) || 0;
            const hasDiscount = dummy > sell && sell > 0;
            const discountPct = hasDiscount ? Math.round(((dummy - sell) / dummy) * 100) : 0;

            return (
              <Link
                key={`${item.gameSlug}-${item.itemSlug}-${idx}`}
                href={href}
                onClick={() =>
                  useBuyStore.getState().setSelectedBuyItem({
                    slug: item.gameSlug,
                    itemSlug: item.itemSlug,
                    name: item.itemName,
                    price: sell,
                    dummy,
                    image: item.image || "",
                  })
                }
                className="group relative shrink-0 snap-start min-w-[200px] sm:min-w-[220px] rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/50 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgba(var(--accent-rgb),0.28)] transition-all duration-200 p-3 flex items-center gap-3"
              >
                {/* Item Image (no outer border) */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                  <Image
                    src={item.image || "/game-assets/weeklypass.webp"}
                    alt={item.itemName}
                    fill
                    sizes="56px"
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Game Name + Item Name + Price */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] truncate">
                      {item.gameName || "Game"}
                    </p>
                    <FiArrowUpRight
                      size={13}
                      className="text-[var(--muted)]/60 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                    />
                  </div>

                  <p className="text-xs sm:text-sm font-extrabold text-[var(--foreground)] truncate leading-snug">
                    {item.itemName}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs sm:text-sm font-black text-[var(--foreground)] tabular-nums">
                      ₹{sell}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-[10px] text-[var(--muted)] line-through tabular-nums">
                          ₹{dummy}
                        </span>
                        <span className="ml-auto px-1.5 py-0.5 rounded-md bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold leading-none">
                          -{discountPct}%
                        </span>
                      </>
                    )}
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
