"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import GameBannerCarousel from "./GameBannerCarousel";
import TopNoticeBanner from "./TopNoticeBanner";
import StorySlider from "./StorySlider";
import BattleRoyaleSection from "./BattleRoyaleSection";
import TradeMarketplaceBanner from "./TradeMarketplaceBanner";
import HomeEarnPromotion from "./HomeEarnPromotion";
import SEOContent from "./SEOContent";
import SupportBanner from "./SupportBanner";
import AAdsBanner from "@/components/Ads/AAdsBanner";
import CustomWebBanner from "./CustomWebBanner";
import GamesWebBanner from "./GamesWebBanner";
import GiveawayBanner from "./GiveawayBanner";

// Lazy-load below-fold & heavy components to reduce initial bundle
const FlashSale = dynamic(() => import("./FlashSale"), { ssr: false });
const HomeQuickActions = dynamic(() => import("./HomeQuickActions"), { ssr: false });
const GameCatalogSection = dynamic(() => import("@/components/Games/GameCatalogSection"), { 
  ssr: false,
  loading: () => <div className="min-h-screen w-full animate-pulse bg-[var(--background)]"></div>
});

export default function HeroSection({ bannerSettings, initialBanners }: { bannerSettings?: any; initialBanners?: any[] }) {

  // If bannerSettings isn't passed (e.g. client navigation before cache warms up), default to showing GiveawayBanner only
  const bs = bannerSettings || { 
    showGiveawayBanner: true, 
    showGameBannerCarousel: true,
    showStorySlider: true,
    showFlashSale: true
  };

  const activeBanners = useMemo(() => {
    return [
      bs.showTopNoticeBanner && <TopNoticeBanner key="topnotice" />,
      bs.showHomeEarnPromotion && <HomeEarnPromotion key="earn" />,
      bs.showTradeMarketplaceBanner && <TradeMarketplaceBanner key="trade" />,
      bs.showCustomWebBanner && <CustomWebBanner key="custom" />,
      bs.showGamesWebBanner && <GamesWebBanner key="games" />,
      bs.showGiveawayBanner && <GiveawayBanner key="giveaway" />
    ].filter(Boolean);
  }, [bs]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanners.length, isPaused]);

  return (
    <>
      {activeBanners.length > 0 && (
        <div 
          className="w-full max-w-7xl mx-auto overflow-hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] w-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {activeBanners.map((BannerNode, idx) => (
              <div key={idx} className="w-full shrink-0">
                {BannerNode}
              </div>
            ))}
          </div>
        </div>
      )}
     

      {bs.showGameBannerCarousel !== false && <GameBannerCarousel initialBanners={initialBanners} />}

      <div className="space-y-1 mt-2">
        {bs.showStorySlider !== false && <StorySlider />}
        {bs.showBattleRoyaleSection !== false && <BattleRoyaleSection />}

        {bs.showFlashSale !== false && <FlashSale />}
      </div>


        {bs.showHomeQuickActions !== false && (
        <div className="space-y-1">
          <HomeQuickActions />
        </div>
      )}

      <GameCatalogSection />
      <SupportBanner />
    
      <SEOContent />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center py-2">
        <AAdsBanner />
      </div>
    </>

  );
}
