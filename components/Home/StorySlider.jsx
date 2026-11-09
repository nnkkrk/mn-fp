"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";


const storyData = [
  // {
  //   id: 5,
  //   title: "BGMI",
  //   badge: "Sale",
  //   color: "#f59e0b", // Orange
  //   image: "/game-assets/bgmi-logo.webp",
  //   link: "/games/bgmi-manual",
  // },
  // {
  //   id: 0,
  //   title: "Weekly Pass",
  //   badge: "Best",
  //   color: "#15803d", // Green
  //   image: "/game-assets/weeklypass.webp",
  //   link: "/games/mobile-legends114?type=weekly-pass",
  // },
  {
    id: 1,
    title: "Weekly Bundle",
    badge: "Hot",
    color: "#b91c1c", // Red
    image: "/game-assets/weekly-monthly-bundle.webp",
    link: "/games/weeklymonthly-bundle646",
    slug: "weeklymonthly-bundle646",
  },
  {
    id: 2,
    title: "MLBB India",
    badge: "Live",
    color: "#15803d", // Green
    image: "/game-assets/mlbbindia.webp",
    link: "/games/mobile-legends114",
    slug: "mobile-legends114",
  },
  {
    id: 3,
    title: "MLBB Double",
    badge: "New",
    color: "#1d4ed8", // Blue
    image: "/game-assets/double-dias.webp",
    link: "/games/mlbb-double332",
    slug: "mlbb-double332",
  },
  {
    id: 4,
    title: "MLBB Small",
    color: "#7e22ce", // Purple
    image: "/game-assets/mlbb-ph-small.webp",
    link: "/games/mobile-legends-philippines888",
    slug: "mobile-legends-philippines888",
  },

  {
    id: 5,
    title: "Starlight",
    badge: "Hot",
    color: "#0e7490", // Cyan
    image: "/game-assets/starkight.webp",
    link: "/games/starlight-card-manual",
    slug: "starlight-card-manual",
  },
  {
    id: 6,
    title: "Honour of Kings",
    badge: "New",
    color: "#15803d", // Green
    image: "/game-assets/hok.webp",
    link: "/games/honor-of-kings57",
    slug: "honor-of-kings57",
  },
  // {
  //   id: 7,
  //   title: "Membership",
  //   badge: "VIP",
  //   color: "#db2777", // Pink
  //   image: "/membership/silver-m.webp",
  //   link: "/games/membership/silver-membership",
  //   slug: "silver-membership",
  // },
  // {
  //   id: 8,
  //   title: "Reseller",
  //   badge: "B2B",
  //   color: "#ca8a04", // Yellow/Gold
  //   image: "/membership/reseller-m.webp",
  //   link: "/games/membership/reseller-membership",
  //   slug: "reseller-membership",
  // },
];

export default function StorySlider() {
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

  const visibleStories = storyData.filter((item) => {
    if (outOfStockSlugs.includes(item.slug)) return false;
    return true;
  });

  if (visibleStories.length === 0) {
    return null;
  }

  return (
    <section className="relative py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-3 md:gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory relative z-10">
          {visibleStories.map((item) => (
            <div
              key={item.id}
              className="opacity-100"
            >
              <Link
                href={item.link}
                className="group relative flex flex-col items-center min-w-[72px] md:min-w-[82px] snap-center"
              >
                <div className="relative">
                  {/* Clean Colored Ring (Static, No Animation) */}
                  <div
                    className="relative p-[2px] rounded-full z-10"
                    style={{
                      background: item.color || 'var(--accent)'
                    }}
                  >
                    <div className="p-0.5 rounded-full bg-[var(--background)]">
                      <div className="relative w-[58px] h-[58px] md:w-[70px] md:h-[70px] rounded-full overflow-hidden">
                        <Image
                          src={item.image}
                          alt=""
                          role="presentation"
                          fill
                          sizes="(max-width: 768px) 58px, 70px"
                          priority={item.id <= 2}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title - Clean & Static */}
                <div className="mt-2 h-[24px] md:h-[28px] w-full max-w-[76px] md:max-w-[88px] flex items-start justify-center text-center">
                  <span className="text-[9px] md:text-[10px] font-bold text-[var(--muted)] group-hover:text-[var(--foreground)] tracking-wider text-center uppercase leading-[1.2] line-clamp-2">
                    {item.title}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
