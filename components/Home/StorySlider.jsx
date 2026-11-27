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
              {/* Trophy cup */}
              <path
                d="M7 4H17V10.5C17 13.26 14.76 15.5 12 15.5C9.24 15.5 7 13.26 7 10.5V4Z"
                fill="#f59e0b"
              />
              {/* Trophy handles */}
              <path
                d="M7 5.5H4.5C3.95 5.5 3.5 5.95 3.5 6.5V8C3.5 9.66 4.84 11 6.5 11H7"
                stroke="#f59e0b"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M17 5.5H19.5C20.05 5.5 20.5 5.95 20.5 6.5V8C20.5 9.66 19.16 11 17.5 11H17"
                stroke="#f59e0b"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              {/* Highlight & stem/base */}
              <path d="M9.5 6.5H12.5L11.5 11.5H9.5V6.5Z" fill="#fde68a" fillOpacity="0.65" />
              <rect x="10.75" y="15" width="2.5" height="3.2" fill="#d97706" />
              <rect x="8" y="18" width="8" height="2.4" rx="1.2" fill="#f59e0b" />
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
                className="group relative overflow-hidden shrink-0 snap-start min-w-[218px] sm:min-w-[238px] rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/50 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgba(var(--accent-rgb),0.28)] transition-all duration-200 p-3 flex items-center gap-3"
              >
                {/* Decorative corner SVG 3D isometric cube wireframe */}
                <svg
                  viewBox="0 0 88 88"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none absolute -top-1 -right-1 w-20 h-20 text-[var(--accent)] opacity-[0.08] group-hover:opacity-[0.16] transition-opacity duration-300"
                  aria-hidden="true"
                >
                  <path
                    d="M66 10L82 19V37L66 46L50 37V19L66 10Z"
                    stroke="currentColor"
                    strokeWidth="1.1"
                  />
                  <path
                    d="M50 19L66 28L82 19M66 28V46"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>

                {/* Item Image floating over a 3D isometric pedestal SVG */}
                <div className="relative w-14 h-14 sm:w-[60px] sm:h-[60px] shrink-0 flex items-center justify-center">
                  {/* 3D Isometric Pedestal SVG */}
                  <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="pointer-events-none absolute inset-0 w-full h-full"
                    aria-hidden="true"
                  >
                    {/* Soft ground shadow */}
                    <ellipse
                      cx="32"
                      cy="53"
                      rx="20"
                      ry="5"
                      fill="currentColor"
                      className="text-black/15 dark:text-black/45"
                    />
                    {/* 3D Pedestal top face */}
                    <path
                      d="M32 37L54 45.5L32 54L10 45.5L32 37Z"
                      className="fill-[var(--accent)]/15 stroke-[var(--accent)]/35"
                      strokeWidth="1"
                    />
                    {/* 3D Pedestal left/right extruded thickness */}
                    <path
                      d="M10 45.5V49.5L32 58V54L10 45.5Z"
                      className="fill-[var(--accent)]/25"
                    />
                    <path
                      d="M54 45.5V49.5L32 58V54L54 45.5Z"
                      className="fill-[var(--accent)]/12"
                    />
                  </svg>

                  <Image
                    src={item.image || "/game-assets/weeklypass.webp"}
                    alt={item.itemName}
                    fill
                    sizes="60px"
                    className="relative z-[1] object-contain p-1.5 -translate-y-1 drop-shadow-[0_6px_8px_rgba(0,0,0,0.22)] group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-300"
                  />
                </div>

                {/* Game Name + Item Name + Price */}
                <div className="relative z-[1] min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <div className="flex items-center gap-1 min-w-0">
                      {idx < 3 && (
                        <svg
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3 shrink-0"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 1L8.7 4.5L12.5 5L9.7 7.7L10.4 11.5L7 9.7L3.6 11.5L4.3 7.7L1.5 5L5.3 4.5L7 1Z"
                            fill={idx === 0 ? "#f59e0b" : idx === 1 ? "#94a3b8" : "#d97706"}
                          />
                        </svg>
                      )}
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] truncate">
                        {item.gameName || "Game"}
                      </p>
                    </div>
                    <FiArrowUpRight
                      size={13}
                      className="text-[var(--muted)]/60 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                    />
                  </div>

                  <p className="text-xs sm:text-sm font-extrabold text-[var(--foreground)] truncate leading-snug">
                    {item.itemName}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-xs sm:text-sm font-black text-[var(--foreground)] tabular-nums">
                      ₹{sell}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-[10px] text-[var(--muted)] line-through tabular-nums">
                          ₹{dummy}
                        </span>
                        <span className="ml-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/14 border border-emerald-500/20 border-b-2 border-b-emerald-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold leading-none">
                          <svg
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-2.5 h-2.5 shrink-0"
                            aria-hidden="true"
                          >
                            <path
                              d="M2 6.2L6.2 2H10V5.8L5.8 10L2 6.2Z"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinejoin="round"
                            />
                            <circle cx="7.8" cy="4.2" r="0.8" fill="currentColor" />
                          </svg>
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
