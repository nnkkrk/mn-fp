"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import Loader from "@/components/Loader/Loader";
import { GameSlugSkeleton } from "@/components/Skeleton/Skeleton";
import MLBBPurchaseGuide from "@/components/HelpImage/MLBBPurchaseGuide";
import api from "@/lib/axios";

import GameSwitcher from "@/components/GameDetail/GameSwitcher";

import GameHeader from "@/components/GameDetail/GameHeader";
import PackageSelector from "@/components/GameDetail/PackageSelector";
import BuyPanel from "@/components/GameDetail/BuyPanel";
import { Gamepad2, Home } from "lucide-react";

import { Suspense } from "react";

function GameDetailContent() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const buyPanelRef = useRef<HTMLDivElement | null>(null);

  const [game, setGame] = useState<any>(null);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [viewMode, setViewMode] = useState<"slider" | "grid">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** ✅ detect weekly pass */
  const isWeeklyPass = searchParams.get("type") === "weekly-pass";
  const isBGMI =
    game?.gameName?.toLowerCase() === "pubg mobile" ||
    game?.gameName?.toLowerCase() === "bgmi" ||
    slug?.toString().startsWith("bgmi") ||
    slug?.toString().startsWith("pubg");

  const isGenshin =
    game?.gameName?.toLowerCase().includes("genshin") ||
    slug?.toString().startsWith("genshin-impact");
  const isHOK =
    game?.gameName?.toLowerCase().includes("honor") ||
    slug?.toString().startsWith("honor-of-kings");

  const isWuwa =
    slug?.toString().toLowerCase().startsWith("wuthering-of-waves");
  const isWWM =
    slug?.toString().toLowerCase().startsWith("where-winds-meet");

  /* ================= FETCH GAME ================= */
  useEffect(() => {
    setLoading(true);
    setError(null);

    api.get(`/api/games/${slug}`)
      .then((res) => res.data)
      .then((data) => {
        if (!data.data || !data.data.itemId || data.data.itemId.length === 0) {
          setError("No data found for this game");
          setLoading(false);
          return;
        }

        if (data.data.isOutOfStock || data.data.gameAvailablity === false) {
          setError("This game is currently out of stock. Please check back later or explore other games.");
          setLoading(false);
          return;
        }

        const sortedItems = [...data.data.itemId].sort(
          (a, b) => a.sellingPrice - b.sellingPrice
        );

        const inStockItems = sortedItems.filter(
          (i: any) => !i.isOutOfStock && i.itemAvailablity !== false
        );

        if (inStockItems.length === 0) {
          setError("All items for this product are currently out of stock. Please check back later.");
          setLoading(false);
          return;
        }

        setGame({
          ...data.data,
          allItems: sortedItems,
        });

        /** ✅ default active item to first in-stock item */
        setActiveItem(inStockItems[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching game:", err);
        setError("Failed to load game data");
        setLoading(false);
      });
  }, [slug]);

  /* ================= WEEKLY PASS AUTO-SELECT (NOT FILTER) ================= */
  useEffect(() => {
    if (!game?.allItems || !isWeeklyPass) return;

    const weeklyPass = game.allItems.find(
      (i: any) =>
        i.itemName === "Weekly Pass" &&
        i.itemSlug === "weekly-pass816"
    );

    if (weeklyPass) {
      setActiveItem(weeklyPass);
    }
  }, [game, isWeeklyPass]);

  if (loading) {
    return <GameSlugSkeleton />;
  }

  if (error || !game || !activeItem) {
    return (
      <section className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          {/* Gaming Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--accent)]/20 blur-3xl rounded-full" />
              <div className="w-20 h-20 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl flex items-center justify-center relative z-10">
                <Gamepad2 className="w-10 h-10 text-[var(--accent)]" strokeWidth={1.75} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 bg-gradient-to-r from-[var(--accent)] to-purple-400 bg-clip-text text-transparent">
            {error?.includes("out of stock") ? "Product Out of Stock" : "Game Not Found"}
          </h2>

          {/* Message */}
          <p className="text-[var(--muted)] mb-8 text-sm sm:text-base max-w-sm mx-auto">
            {error || "We couldn't find any packages for this game. Please check the game name or explore all games."}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              aria-label="Back to Games"
              onClick={() => router.push("/games")}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[var(--accent)] to-purple-600 hover:from-[var(--accent)] hover:to-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 flex items-center justify-center gap-2"
            >
              <Gamepad2 size={16} />
              <span>Back to Games</span>
            </button>
            <button
              aria-label="Back to Home"
              onClick={() => router.push("/")}
              className="w-full sm:w-auto px-6 py-3 bg-[var(--card)] hover:bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--foreground)] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Home size={16} />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ================= ITEMS ================= */
  const items = game.allItems;

  /** ✅ HIDE OUT OF STOCK ITEMS */
  const visibleItems = items.filter((item: any) => !item.isOutOfStock && item.itemAvailablity !== false);

  /* ================= HELPERS ================= */
  const calculateDiscount = (selling: number, dummy: number) => {
    if (!dummy || dummy <= selling) return null;
    return Math.round(((dummy - selling) / dummy) * 100);
  };

  const scrollToItem = (item: any) => {
    setActiveItem(item);

    const index = visibleItems.findIndex(
      (i: any) => i.itemSlug === item.itemSlug
    );

    const el = sliderRef.current?.children[index] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", inline: "center" });

    buyPanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const goBuy = (item: any) => {
    if (redirecting) return;
    setRedirecting(true);

    const query = new URLSearchParams({
      name: item.itemName,
      price: item.sellingPrice.toString(),
      dummy: item.dummyPrice?.toString() || "",
      image: item.itemImageId?.image || "",
    });
    const basePath = `/games/${slug}/buy`;

    router.push(
      `${basePath}/${item.itemSlug}?${query.toString()}`
    );
  };

  /* ================= RENDER ================= */
  return (
    <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-3 sm:px-4 pb-28 pt-2">
      <div className="w-full max-w-6xl mx-auto space-y-2.5">
        {/* ================= SWITCH GAME ================= */}
        <GameSwitcher />

        {/* ================= HEADER ================= */}
        <GameHeader game={game} />

        {/* ================= PACKAGE SELECTOR ================= */}
        <PackageSelector
          items={visibleItems}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sliderRef={sliderRef}
          buyPanelRef={buyPanelRef}
          calculateDiscount={calculateDiscount}
          scrollToItem={scrollToItem}
        />

        {/* ================= PURCHASE GUIDE ================= */}
        {!isBGMI && (
          <div className="w-full mt-6">
            <MLBBPurchaseGuide />
          </div>
        )}
      </div>

      {/* ================= BUY PANEL ================= */}
      <BuyPanel
        activeItem={activeItem}
        gameAvailablity={game.gameAvailablity}
        redirecting={redirecting}
        goBuy={goBuy}
        calculateDiscount={calculateDiscount}
        buyPanelRef={buyPanelRef}
      />
    </section>
  );
}

export default function GameDetailPage() {
  return (
    <Suspense fallback={<GameSlugSkeleton />}>
      <GameDetailContent />
    </Suspense>
  );
}
