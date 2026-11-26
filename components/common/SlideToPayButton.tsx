"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { FiChevronsRight, FiCheck } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";

export interface SlideToPayButtonProps {
  /** Called when the user slides past the threshold */
  onConfirm: () => void;
  /** Disable dragging (e.g. unverified player, insufficient balance, processing) */
  disabled?: boolean;
  /** Show processing state */
  loading?: boolean;
  /** Label shown inside the track */
  label?: string;
  /** Disabled label override */
  disabledLabel?: string;
}

const THUMB_SIZE = 46;
const TRACK_PADDING = 4;

/**
 * Tactile, pill-shaped "Slide to Pay" control with GPU-accelerated fill.
 */
export default function SlideToPayButton({
  onConfirm,
  disabled = false,
  loading = false,
  label = "Slide to Pay",
  disabledLabel,
}: SlideToPayButtonProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [completed, setCompleted] = useState(false);

  const x = useMotionValue(0);
  const maxDrag = Math.max(0, trackWidth - THUMB_SIZE - TRACK_PADDING * 2);

  useEffect(() => {
    const updateWidth = () => {
      if (!trackRef.current) return;
      setTrackWidth(trackRef.current.offsetWidth);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!loading && completed) {
      const timer = setTimeout(() => {
        setCompleted(false);
        animate(x, 0, { type: "spring", stiffness: 420, damping: 32, mass: 0.8 });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [loading, completed, x]);

  const fillScaleX = useTransform(x, (latest) => {
    if (trackWidth <= 0) return 0;
    return Math.min(1, Math.max(0, (latest + THUMB_SIZE + TRACK_PADDING) / trackWidth));
  });

  const textOpacity = useTransform(x, [0, Math.max(1, maxDrag * 0.55)], [1, 0]);
  const isLocked = disabled || loading;

  const handleDragEnd = () => {
    if (isLocked || maxDrag <= 0) return;
    if (x.get() >= maxDrag * 0.72) {
      setCompleted(true);
      animate(x, maxDrag, { type: "spring", stiffness: 500, damping: 34, mass: 0.7 });
      onConfirm();
    } else {
      animate(x, 0, { type: "spring", stiffness: 450, damping: 30, mass: 0.8 });
    }
  };

  return (
    <div
      ref={trackRef}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-label={label}
      aria-disabled={isLocked}
      onKeyDown={(e) => {
        if (!isLocked && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onConfirm();
        }
      }}
      className={`relative w-full h-14 rounded-full overflow-hidden select-none flex items-center border-2 transition-colors touch-pan-y ${
        isLocked
          ? "bg-[var(--muted)]/12 border-[var(--border)]/60 cursor-not-allowed"
          : "bg-[var(--card)] border-[var(--accent)]/35 shadow-[0_6px_20px_-8px_rgba(var(--accent-rgb),0.28)]"
      }`}
    >
      {/* GPU-Accelerated Progress Fill */}
      {!isLocked && (
        <motion.div
          style={{ scaleX: fillScaleX, transformOrigin: "left center" }}
          className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-blue-600 pointer-events-none will-change-transform rounded-full"
        />
      )}

      {/* Track Label */}
      <motion.span
        style={{ opacity: isLocked ? 1 : textOpacity }}
        className={`relative z-10 w-full text-center text-[13px] font-extrabold uppercase tracking-wider pointer-events-none pl-10 flex items-center justify-center gap-1.5 ${
          isLocked ? "text-[var(--muted)]" : "text-[var(--accent)]"
        }`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <LoadingSpinner size="xs" color="current" />
            <span>Processing...</span>
          </span>
        ) : disabled && disabledLabel ? (
          disabledLabel
        ) : (
          <>
            <span>{label}</span>
            <motion.span
              animate={{ x: [0, 4, 0], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <FiChevronsRight size={16} />
            </motion.span>
          </>
        )}
      </motion.span>

      {/* Draggable Circular Thumb */}
      {!loading && (
        <motion.div
          drag={isLocked ? false : "x"}
          dragConstraints={{ left: 0, right: maxDrag }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x, left: TRACK_PADDING, width: THUMB_SIZE, height: THUMB_SIZE }}
          whileHover={isLocked ? undefined : { scale: 1.03 }}
          whileDrag={isLocked ? undefined : { scale: 1.06 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={`absolute z-20 rounded-full flex items-center justify-center will-change-transform ${
            isLocked
              ? "bg-[var(--muted)]/25 text-[var(--muted)] cursor-not-allowed"
              : "bg-gradient-to-b from-[var(--accent)] to-blue-600 text-white cursor-grab active:cursor-grabbing shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_14px_-2px_rgba(var(--accent-rgb),0.55)]"
          }`}
        >
          {completed ? <FiCheck size={19} strokeWidth={2.5} /> : <FiChevronsRight size={20} />}
        </motion.div>
      )}
    </div>
  );
}
