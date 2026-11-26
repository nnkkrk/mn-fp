"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BUFFY_COLORS,
  MASCOT_SIZES,
  type BuffyMood,
  type MascotSize,
} from "./constants";

export type { BuffyMood, MascotSize };

export interface BuffyMascotProps {
  /** Visual mood / pose of Buff-y */
  mood?: BuffyMood;
  /** Preset size token (overridden by className if both provided) */
  size?: MascotSize;
  /** Width/height CSS class for the mascot SVG */
  className?: string;
  /** Accessible label */
  label?: string;
  /** Optional logo/sign content for Buff-y to hold in front with both hands */
  children?: ReactNode;
  /** Optional speech bubble text shown beside Buff-y */
  speech?: string;
}

/**
 * Buff-y — Simple, cute cartoon-anime Mini Blue Buff mascot.
 * Supports multiple poses (idle, happy, thinking, loading, error, sleepy),
 * optional `speech` bubble, and optional `children` so Buff-y can hold a logo or sign.
 */
export default function BuffyMascot({
  mood = "idle",
  size = "lg",
  className,
  label = "Buff-y the Blue Buff mascot",
  children,
  speech,
}: BuffyMascotProps) {
  const isHappy = mood === "happy";
  const isError = mood === "error";
  const isLoading = mood === "loading";
  const isThinking = mood === "thinking";
  const isSleepy = mood === "sleepy";
  const isHolding = Boolean(children);

  const sizeClass = className ?? MASCOT_SIZES[size];
  const outline = BUFFY_COLORS.outline;

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center select-none"
      role="img"
      aria-label={label}
    >
      {speech && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 20, delay: 0.1 }}
          className="relative z-30 mb-0.5 flex flex-col items-center"
        >
          <div
            className={`px-3.5 py-1 rounded-full text-white text-[11px] font-black uppercase tracking-wider shadow-md ${
              isError ? "bg-rose-500" : isThinking || isLoading ? "bg-amber-500" : "bg-emerald-500"
            }`}
          >
            <span>{speech}</span>
          </div>
          <span
            className={`w-0 h-0 border-x-[6px] border-x-transparent border-t-[7px] -mt-[1px] ${
              isError ? "border-t-rose-500" : isThinking || isLoading ? "border-t-amber-500" : "border-t-emerald-500"
            }`}
            aria-hidden="true"
          />
        </motion.div>
      )}
      <svg
        viewBox="0 38 180 148"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} overflow-visible drop-shadow-[0_10px_20px_rgba(37,99,235,0.16)]`}
      >
        {/* Ground shadow (only when standalone) */}
        {!isHolding && (
          <motion.ellipse
            cx="90"
            cy="174"
            rx="36"
            ry="7"
            fill="#0f172a"
            opacity="0.12"
            animate={{
              rx: isLoading ? [35, 29, 35] : [36, 31, 36],
              opacity: [0.14, 0.08, 0.14],
            }}
            transition={{ duration: isLoading ? 0.9 : 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* SLEEPY Zzz BUBBLE */}
        {isSleepy && (
          <motion.text
            x="132"
            y="48"
            fill={BUFFY_COLORS.bodyShadow}
            fontSize="16"
            fontWeight="800"
            animate={{ y: [48, 38, 48], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            Zzz
          </motion.text>
        )}

        {/* MAIN CARTOON ANIME CHIBI BODY */}
        <motion.g
          animate={{
            y: isHappy ? [0, -7, 0] : isSleepy ? [0, 2, 0] : [0, -4, 0],
            rotate: isError ? [-2.5, 2.5, -2.5, 0] : isSleepy ? [-2, 0, -2] : 0,
          }}
          transition={{
            duration: isHappy ? 0.8 : isSleepy ? 3.2 : 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "90px 116px" }}
        >
          {/* Cute stubby crystal ears */}
          <path
            d="M54 74 C44 62, 44 50, 52 47 C59 45, 67 54, 70 67 Z"
            fill={BUFFY_COLORS.earFill}
            stroke={outline}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M126 74 C136 62, 136 50, 128 47 C121 45, 113 54, 110 67 Z"
            fill={BUFFY_COLORS.earFill}
            stroke={outline}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Tiny stubby feet (hidden behind held sign when holding) */}
          {!isHolding && (
            <>
              <ellipse cx="68" cy="156" rx="12" ry="8" fill={BUFFY_COLORS.bodyDark} stroke={outline} strokeWidth="3.5" />
              <ellipse cx="112" cy="156" rx="12" ry="8" fill={BUFFY_COLORS.bodyDark} stroke={outline} strokeWidth="3.5" />
            </>
          )}

          {/* Standalone side arms (when not holding a sign) */}
          {!isHolding && (
            <>
              <motion.ellipse
                cx="37"
                cy={isSleepy ? 124 : 118}
                rx="9"
                ry="12"
                fill={BUFFY_COLORS.bodyBase}
                stroke={outline}
                strokeWidth="3.5"
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.ellipse
                cx="143"
                cy={isSleepy ? 124 : 112}
                rx="9"
                ry="12"
                fill={BUFFY_COLORS.bodyBase}
                stroke={outline}
                strokeWidth="3.5"
                animate={
                  isHappy || mood === "idle"
                    ? { y: [0, -5, 0], rotate: [0, -14, 8, 0] }
                    : { y: [0, 3, 0] }
                }
                transition={{ duration: isHappy ? 0.8 : 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "140px 118px" }}
              />
            </>
          )}

          {/* Mochi / Chibi Body Base */}
          <rect
            x="42"
            y="60"
            width="96"
            height="96"
            rx="44"
            fill={BUFFY_COLORS.bodyBase}
            stroke={outline}
            strokeWidth="3.8"
          />

          {/* Cel-shaded shadow crescent */}
          <path
            d="M134 94 C136 128, 118 152, 84 152 C68 152, 56 146, 49 136 C60 144, 76 146, 94 143 C118 139, 131 120, 134 94 Z"
            fill={BUFFY_COLORS.bodyShadow}
          />

          {/* Soft cel-shaded top-left highlight */}
          <ellipse
            cx="68"
            cy="75"
            rx="14"
            ry="6"
            transform="rotate(-22 68 75)"
            fill={BUFFY_COLORS.bodyHighlight}
            opacity="0.7"
          />

          {/* Cute lighter face patch */}
          <ellipse cx="90" cy={isHolding ? 105 : 112} rx="34" ry="25" fill={BUFFY_COLORS.facePatch} opacity="0.92" />

          {/* ANIME EYES & EXPRESSION */}
          {isHappy ? (
            <g transform={isHolding ? "translate(0, -6)" : undefined}>
              <path
                d="M68 108 Q74 99 80 108"
                stroke={outline}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M100 108 Q106 99 112 108"
                stroke={outline}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M84 118 Q87 123 90 118 Q93 123 96 118"
                stroke={outline}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          ) : isSleepy ? (
            <g transform={isHolding ? "translate(0, -6)" : undefined}>
              {/* Sleepy closed curved eyes */}
              <path
                d="M68 106 Q74 113 80 106"
                stroke={outline}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M100 106 Q106 113 112 106"
                stroke={outline}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Tiny sleepy o mouth */}
              <circle cx="90" cy="120" r="2.6" fill={outline} />
            </g>
          ) : isError ? (
            <g transform={isHolding ? "translate(0, -6)" : undefined}>
              <path
                d="M69 102 L78 107 L69 112"
                stroke={outline}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M111 102 L102 107 L111 112"
                stroke={outline}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M83 121 Q86.5 117 90 121 T97 121"
                stroke={outline}
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : (
            <g transform={isHolding ? "translate(0, -6)" : undefined}>
              <motion.g
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{
                  duration: 4.0,
                  repeat: Infinity,
                  times: [0, 0.9, 0.94, 0.98, 1],
                }}
                style={{ transformOrigin: "90px 106px" }}
              >
                <ellipse cx="74" cy={isThinking ? 104 : 106} rx="7.5" ry="9" fill={outline} />
                <ellipse cx="74" cy={isThinking ? 108 : 110} rx="4.5" ry="2.5" fill={BUFFY_COLORS.eyeGlow} opacity="0.85" />
                <circle cx="71.5" cy={isThinking ? 100.5 : 102.5} r="3" fill="#ffffff" />
                <circle cx="76.5" cy={isThinking ? 106.5 : 108.5} r="1.3" fill="#ffffff" />

                <ellipse cx="106" cy={isThinking ? 104 : 106} rx="7.5" ry="9" fill={outline} />
                <ellipse cx="106" cy={isThinking ? 108 : 110} rx="4.5" ry="2.5" fill={BUFFY_COLORS.eyeGlow} opacity="0.85" />
                <circle cx="103.5" cy={isThinking ? 100.5 : 102.5} r="3" fill="#ffffff" />
                <circle cx="108.5" cy={isThinking ? 106.5 : 108.5} r="1.3" fill="#ffffff" />
              </motion.g>

              {isThinking ? (
                <circle cx="90" cy="120" r="2.8" fill={outline} />
              ) : (
                <path
                  d="M84 118 Q87 122 90 118 Q93 122 96 118"
                  stroke={outline}
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}
            </g>
          )}

          {/* Soft anime cheek blush */}
          <ellipse cx="63" cy={isHolding ? 110 : 116} rx="4.5" ry="2.6" fill={BUFFY_COLORS.blush} opacity="0.7" />
          <ellipse cx="117" cy={isHolding ? 110 : 116} rx="4.5" ry="2.6" fill={BUFFY_COLORS.blush} opacity="0.7" />

          {/* Tiny belly diamond (visible when standalone) */}
          {!isHolding && (
            <polygon
              points="90,141 95,147 90,153 85,147"
              fill={BUFFY_COLORS.diamond}
              stroke={outline}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}
        </motion.g>
      </svg>

      {/* HELD LOGO / SIGN WITH BOTH PAWS GRIPPING THE EDGES */}
      {isHolding && (
        <motion.div
          animate={{ y: isHappy ? [0, -3, 0] : [0, -1.5, 0] }}
          transition={{ duration: isHappy ? 0.8 : 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-20 -mt-9 sm:-mt-10 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 28 24"
            className="w-7 h-6 -mr-3.5 z-30 shrink-0 drop-shadow-sm"
            aria-hidden="true"
          >
            <ellipse cx="14" cy="12" rx="11" ry="9" fill={BUFFY_COLORS.bodyBase} stroke={outline} strokeWidth="3.2" />
            <ellipse cx="11" cy="9" rx="4" ry="2" fill={BUFFY_COLORS.bodyHighlight} opacity="0.75" />
          </svg>

          <div className="relative z-20 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-[var(--card)]/95 backdrop-blur-md border-2 border-[#172554]/20 dark:border-[#60a5fa]/30 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.2)]">
            {children}
          </div>

          <svg
            viewBox="0 0 28 24"
            className="w-7 h-6 -ml-3.5 z-30 shrink-0 drop-shadow-sm"
            aria-hidden="true"
          >
            <ellipse cx="14" cy="12" rx="11" ry="9" fill={BUFFY_COLORS.bodyBase} stroke={outline} strokeWidth="3.2" />
            <ellipse cx="11" cy="9" rx="4" ry="2" fill={BUFFY_COLORS.bodyHighlight} opacity="0.75" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
