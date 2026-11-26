"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerSkeleton } from "../Skeleton/Skeleton";

const isVideoUrl = (url?: string) => {
  if (!url || typeof url !== "string") return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
};

export default function GameBannerCarousel({ initialBanners = [] }: { initialBanners?: any[] }) {
  const [banners, setBanners] = useState<any[]>(initialBanners);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(initialBanners.length === 0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (initialBanners.length > 0) {
      setBanners(initialBanners);
      setLoading(false);
      return;
    }

    fetch("/api/game-banners")
      .then((r) => r.json())
      .then((d) => setBanners(d?.data ?? []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, [initialBanners]);

  /* AUTO PLAY */
  useEffect(() => {
    if (!banners.length || isPaused) return;

    intervalRef.current = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [banners.length, isPaused, current]);

  const paginate = (newDirection: number) => {
    const nextPage = (current + newDirection + banners.length) % banners.length;
    setCurrent(nextPage);
  };

  const getIndex = (offset: number) => {
    return (current + offset + banners.length) % banners.length;
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 mt-6">
      <BannerSkeleton />
    </div>
  );
  if (!banners.length) return null;

  const currentBanner = banners[current];
  const prevBanner = banners[getIndex(-1)];
  const nextBanner = banners[getIndex(1)];
  const showMulti = banners.length > 1;

  return (
    <section className="relative max-w-7xl mx-auto px-2 sm:px-4 mt-4 sm:mt-6">
      {/* DESKTOP VIEW (3-Banner Highlighted Coverflow Layout) */}
      {showMulti ? (
        <div 
          className="hidden md:flex items-center justify-center gap-2 lg:gap-3 relative py-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Preview Slide */}
          <div 
            onClick={() => paginate(-1)}
            className="w-[11%] lg:w-[12%] h-[200px] lg:h-[235px] shrink-0 rounded-none overflow-hidden relative opacity-40 hover:opacity-85 scale-[0.92] hover:scale-95 transition-all duration-500 cursor-pointer border border-[var(--border)] shadow-sm bg-[var(--card)] group"
          >
            {isVideoUrl(prevBanner.bannerImage) ? (
              <video
                src={prevBanner.bannerImage}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
              />
            ) : (
              <Image
                src={prevBanner.bannerImage || logo}
                alt={prevBanner.bannerTitle || "Previous"}
                fill
                sizes="250px"
                className="object-cover object-top"
              />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                <ChevronLeft size={18} />
              </div>
            </div>
          </div>

          {/* Center Highlighted Slide (ACTIVE FOCUS - NO BORDER RADIUS) */}
          <div className="flex-1 h-[240px] lg:h-[285px] rounded-none overflow-hidden relative opacity-100 scale-100 z-20 border border-[var(--border)] shadow-xl bg-[var(--card)] group">
            <Link href={currentBanner.bannerLink || "/"} className="relative block w-full h-full overflow-hidden">
              {isVideoUrl(currentBanner.bannerImage) ? (
                <video
                  src={currentBanner.bannerImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover object-top sm:object-[center_15%] transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                />
              ) : (
                <Image
                  src={currentBanner.bannerImage || logo}
                  alt={currentBanner.bannerTitle}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 85vw, 1150px"
                  className="object-cover object-top sm:object-[center_15%] transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                />
              )}

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

              {/* Content Overlay - Without LIVE FEATURE */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-7 z-10 pointer-events-none">
                <div className="max-w-xl">
                  <h2 className="text-white font-black text-xl md:text-3xl lg:text-4xl tracking-tighter leading-[0.95] uppercase mb-0.5 italic drop-shadow-lg">
                    {currentBanner.bannerTitle}
                  </h2>
                </div>
              </div>
            </Link>

            {/* Navigation Controls */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500">
              <button aria-label="Previous slide"
                onClick={() => paginate(-1)}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-white hover:text-black transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button aria-label="Next slide"
                onClick={() => paginate(1)}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-white hover:text-black transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Minimalist Slide Counter */}
            <div className="absolute bottom-4 right-6 z-30 flex items-end gap-3 pointer-events-none">
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-white font-black text-xl tracking-tighter tabular-nums leading-none drop-shadow">
                    0{current + 1}
                  </span>
                  <span className="text-white/40 font-bold text-[9px]">/0{banners.length}</span>
                </div>
                <div className="h-[2.5px] w-14 bg-white/20 relative overflow-hidden rounded-full backdrop-blur-sm">
                  <div className="absolute inset-0 bg-[var(--accent)] origin-left transition-transform duration-500 ease-out" style={{ transform: `scaleX(${((current + 1) / banners.length)})` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Preview Slide */}
          <div 
            onClick={() => paginate(1)}
            className="w-[11%] lg:w-[12%] h-[200px] lg:h-[235px] shrink-0 rounded-none overflow-hidden relative opacity-40 hover:opacity-85 scale-[0.92] hover:scale-95 transition-all duration-500 cursor-pointer border border-[var(--border)] shadow-sm bg-[var(--card)] group"
          >
            {isVideoUrl(nextBanner.bannerImage) ? (
              <video
                src={nextBanner.bannerImage}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
              />
            ) : (
              <Image
                src={nextBanner.bannerImage || logo}
                alt={nextBanner.bannerTitle || "Next"}
                fill
                sizes="250px"
                className="object-cover object-top"
              />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* MOBILE / SINGLE BANNER VIEW (NO BORDER RADIUS, NO LIVE FEATURE) */}
      <div
        className={`${showMulti ? "md:hidden" : "block"} relative w-full h-[175px] sm:h-[225px] rounded-none overflow-hidden border border-[var(--border)] shadow-xl group bg-[var(--card)]`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Link href={currentBanner.bannerLink || "/"} className="relative block w-full h-full overflow-hidden">
          {isVideoUrl(currentBanner.bannerImage) ? (
            <video
              src={currentBanner.bannerImage}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 ease-out"
            />
          ) : (
            <Image
              src={currentBanner.bannerImage || logo}
              alt={currentBanner.bannerTitle}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
              className="object-cover object-top transition-transform duration-300 ease-out"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 z-10">
            <div className="max-w-xl">
              <h2 className="text-white font-black text-xl sm:text-3xl tracking-tighter leading-[0.95] uppercase mb-1 italic drop-shadow-lg">
                {currentBanner.bannerTitle}
              </h2>
            </div>
          </div>
        </Link>

        {showMulti && (
          <>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500">
              <button aria-label="Previous slide"
                onClick={() => paginate(-1)}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-white hover:text-black transition-all duration-300 shadow-2xl"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button aria-label="Next slide"
                onClick={() => paginate(1)}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-white hover:text-black transition-all duration-300 shadow-2xl"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="absolute bottom-4 right-4 z-30 flex items-end gap-4 pointer-events-none">
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-white font-black text-lg tracking-tighter tabular-nums leading-none drop-shadow">
                    0{current + 1}
                  </span>
                  <span className="text-white/40 font-bold text-[9px]">/0{banners.length}</span>
                </div>
                <div className="h-[2px] w-12 bg-white/20 relative overflow-hidden rounded-full backdrop-blur-sm">
                  <div className="absolute inset-0 bg-[var(--accent)] origin-left transition-transform duration-500 ease-out" style={{ transform: `scaleX(${((current + 1) / banners.length)})` }} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
