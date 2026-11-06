"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function GameSwitcher() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const scrollContainerRef = useRef(null);

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    const isWeeklyPassQuery = searchParams.get("type") === "weekly-pass";
    const currentSlug = params?.slug;
    const WEEKLY_PASS_SLUG = "mobile-legends114";

    useEffect(() => {
        let mounted = true;

        async function fetchGames() {
            try {
                const res = await fetch("/api/games");
                const json = await res.json();

                if (!mounted) return;

                let fetchedGames = json?.data?.games || [];
                const oosSlugs = json?.data?.outOfStockSlugs || [];

                // Filter out any out-of-stock games
                fetchedGames = fetchedGames.filter((g) => !oosSlugs.includes(g.gameSlug));

                const isWeeklyPassOOS =
                    oosSlugs.includes(WEEKLY_PASS_SLUG) ||
                    oosSlugs.includes("weekly-pass816") ||
                    oosSlugs.includes("flash-weekly621");

                const weeklyPassSource = isWeeklyPassOOS ? null : fetchedGames.find(
                    (g) => g.gameSlug === WEEKLY_PASS_SLUG
                );

                if (weeklyPassSource) {
                    const alreadyExists = fetchedGames.some(
                        (g) =>
                            g.gameSlug === WEEKLY_PASS_SLUG &&
                            g.gameName === "Weekly Pass"
                    );

                    if (!alreadyExists) {
                        fetchedGames.push({
                            ...weeklyPassSource,
                            gameName: "Weekly Pass",
                            _variant: "weekly-pass",
                            gameSlug: WEEKLY_PASS_SLUG,
                            gameImageId: {
                                image: "/game-assets/weeklypass.webp",
                            },
                        });
                    }
                }

                fetchedGames.sort((a, b) => a.gameName.localeCompare(b.gameName));
                setGames(fetchedGames);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load games for switcher:", err);
                setLoading(false);
            }
        }

        fetchGames();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!loading && games.length > 0 && scrollContainerRef.current) {
            const activeIndex = games.findIndex(g => {
                const isVariant = g._variant === "weekly-pass";
                if (isVariant && isWeeklyPassQuery && g.gameSlug === currentSlug) return true;
                if (!isVariant && !isWeeklyPassQuery && g.gameSlug === currentSlug) return true;
                return false;
            });

            if (activeIndex !== -1) {
                const container = scrollContainerRef.current;
                const element = container.children[activeIndex];
                if (element) {
                    const scrollLeft = element.offsetLeft - (container.clientWidth / 2) + (element.clientWidth / 2);
                    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                }
            }
        }
    }, [loading, games, currentSlug, isWeeklyPassQuery]);

    const handleSwitch = (game) => {
        if (game._variant === "weekly-pass") {
            router.push(`/games/${game.gameSlug}?type=weekly-pass`);
        } else {
            router.push(`/games/${game.gameSlug}`);
        }
    };

    if (!loading && games.length === 0) return null;

    if (loading) return (
        <div className="w-full flex gap-2.5 overflow-hidden mb-3">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5" />
            ))}
        </div>
    );

    return (
        <div className="w-full mb-2 relative z-20">
            <div className="flex items-center justify-between mb-1.5 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-[2px] bg-[var(--accent)]" />
                    <h3 className="text-[9px] sm:text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.25em] opacity-50">
                        Switch Game
                    </h3>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1.5 -mx-4 px-4 scrollbar-hide snap-x no-scrollbar pt-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {games.map((game, idx) => {
                    const isVariant = game._variant === "weekly-pass";
                    const isActive = (isVariant && isWeeklyPassQuery && game.gameSlug === currentSlug) ||
                        (!isVariant && !isWeeklyPassQuery && game.gameSlug === currentSlug);

                    return (
                        <div
                            key={`${game.gameSlug}-${idx}-${isVariant ? 'wp' : 'reg'}`}
                            className="flex-shrink-0 w-[54px] sm:w-[60px] flex flex-col items-center gap-1.5 snap-center cursor-pointer"
                            onClick={() => handleSwitch(game)}
                        >
                            <button aria-label="button"
                                className={`
                                    relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl group transition-all cursor-pointer
                                    ${isActive
                                        ? "ring-2 ring-[var(--accent)]"
                                        : "opacity-45 hover:opacity-100 grayscale hover:grayscale-0"
                                    }
                                `}
                            >
                                <div className="relative w-full h-full rounded-xl overflow-hidden bg-[var(--card)] ring-1 ring-white/10 group-hover:ring-white/20">
                                    <Image
                                        src={game.gameImageId?.image || "/placeholder.jpg"}
                                        alt={game.gameName}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`} />
                                </div>
                            </button>

                            {/* Game Name Label - 2 lines wrapped */}
                            <p className={`
                                text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider text-center w-full block line-clamp-2 leading-[1.2] min-h-[20px]
                                ${isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)] opacity-60 group-hover:opacity-100'}
                            `}>
                                {game.gameName}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
