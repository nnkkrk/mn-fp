"use client";

import { useState, useRef, TouchEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  images: string[];
  title: string;
  rent?: {
    available: boolean;
    price: number;
    durationHours?: number;
  };
}

export default function IdImageSlider({
  images,
  title,
  rent,
}: Props) {
  // Restrict to max 3 images as requested
  const slideImages = (images && images.length > 0 ? images : ["/logo.png"]).slice(0, 3);
  const totalSlides = slideImages.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const paginate = (newDirection: number) => {
    if (totalSlides <= 1) return;
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = totalSlides - 1;
      if (next >= totalSlides) next = 0;
      return next;
    });
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next
      paginate(1);
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev
      paginate(-1);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div
      className="relative aspect-[16/10] sm:aspect-[4/3] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black/20 border border-[var(--border)] shadow-xs select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── IMAGE SLIDE WITH ANIMATION ── */}
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={slideImages[currentIndex]}
              alt={`${title} - image ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Subtle Gradient for Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* ── OVERLAY: TOP RIGHT BADGES ── */}
      <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex items-center gap-1.5 z-10 pointer-events-auto">
        {rent?.available && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black shadow-md">
            Rent ₹{rent.price} / {rent.durationHours || 24}h
          </span>
        )}

        {totalSlides > 1 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-black/60 text-white/90 backdrop-blur-md border border-white/10 shadow-sm">
            {currentIndex + 1}/{totalSlides}
          </span>
        )}
      </div>

      {/* ── NAVIGATION ARROWS (IF MULTIPLE SLIDES) ── */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              paginate(-1);
            }}
            aria-label="Previous Image"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              paginate(1);
            }}
            aria-label="Next Image"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* ── SLIDER DOTS (IF MULTIPLE SLIDES) ── */}
      {totalSlides > 1 && (
        <div className="absolute bottom-2.5 sm:bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
          {slideImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              aria-label={`Go to image ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? "w-5 bg-[var(--accent)] shadow-xs"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
