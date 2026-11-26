/**
 * Centralized mascot constants, color tokens, size presets, and pose metadata
 * for easy reuse across the application.
 */

export type BuffyMood = "idle" | "happy" | "thinking" | "loading" | "error" | "sleepy";

export type MascotSize = "xs" | "sm" | "md" | "lg" | "xl";

export const BUFFY_COLORS = {
  outline: "#172554",
  bodyBase: "#3b82f6",
  bodyShadow: "#2563eb",
  bodyDark: "#1d4ed8",
  bodyHighlight: "#93c5fd",
  earFill: "#38bdf8",
  facePatch: "#eff6ff",
  blush: "#fda4af",
  diamond: "#38bdf8",
  diamondLight: "#bae6fd",
  diamondMid: "#7dd3fc",
  diamondSleepy: "#94a3b8",
  eyeGlow: "#38bdf8",
} as const;

export const MASCOT_SIZES: Record<MascotSize, string> = {
  xs: "w-14 h-14",
  sm: "w-24 h-24",
  md: "w-32 h-32",
  lg: "w-40 h-40",
  xl: "w-48 h-48",
} as const;

export const MASCOT_POSES: Record<
  BuffyMood,
  { label: string; description: string }
> = {
  idle: { label: "Idle", description: "Friendly waving pose" },
  happy: { label: "Happy", description: "Celebrating with ^ ω ^ eyes" },
  thinking: { label: "Thinking", description: "Curious / waiting for input" },
  loading: { label: "Loading", description: "Energetic diamond spin" },
  error: { label: "Error", description: "Flustered > < expression" },
  sleepy: { label: "Sleepy", description: "Offline / resting with Zzz" },
} as const;
