"use client";

import React, { ReactNode } from "react";
import InfoTooltip from "./InfoTooltip";

export type SectionTitleSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type SectionTitleAlign = "left" | "center" | "right";
export type SectionTitleColor =
  | "accent"
  | "amber"
  | "orange"
  | "purple"
  | "emerald"
  | "cyan"
  | "rose"
  | "blue"
  | string;

export interface SectionTitleProps {
  /** Subtitle / eyebrow text or node (e.g. "NEWS & BLOGS") */
  subtitle?: ReactNode;
  /** Main title (e.g. "LATEST" or "LATEST NEWS") */
  title?: ReactNode;
  /** Highlighted word or part in accent color. If omitted and highlightLastWord is true, the last word of a string title is auto-highlighted */
  highlight?: ReactNode;
  /** Auto-highlight the last word if title is a multi-word string and highlight is omitted. Default: true */
  highlightLastWord?: boolean;
  /** Optional descriptive subtext under the title */
  description?: ReactNode;
  /** Optional tooltip info content rendered in an info (i) icon */
  info?: ReactNode;
  /** Placement for the info icon: "title" (next to main title) or "subtitle" (next to subtitle eyebrow). Default: "title" */
  infoPlacement?: "title" | "subtitle";
  /** Component size scale: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" (default: "lg") */
  size?: SectionTitleSize;
  /** Optional custom font size / class for the title (overrides size's default font size) */
  fontSize?: string;
  /** Alignment: "left" | "center" | "right" (default: "left") */
  align?: SectionTitleAlign;
  /** Color theme for accent line and highlighted word (default: "accent") */
  accentColor?: SectionTitleColor;
  /** HTML tag for the title element (default: "h2") */
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "div";
  /** Whether to show the accent line next to the subtitle (default: true) */
  showLine?: boolean;
  /** Optional icon to render with the subtitle */
  icon?: ReactNode;
  /** Optional pulsing live dot */
  pulse?: boolean;
  /** Optional right-side action element (e.g. search, filters, buttons, countdown) */
  action?: ReactNode;
  /** Layout for action element: "responsive" (stacks on mobile, row on desktop) or "row" (always one row side-by-side). Default: "responsive" */
  actionLayout?: "responsive" | "row";
  /** Subtle neon glow effect on the highlighted text */
  glow?: boolean;
  /** Additional wrapper class names */
  className?: string;
  /** Additional title class names */
  titleClassName?: string;
  /** Additional subtitle class names */
  subtitleClassName?: string;
  /** Children element rendered beneath title */
  children?: ReactNode;
}

const COLOR_MAP: Record<string, { text: string; bg: string; glow: string; border: string }> = {
  accent: {
    text: "text-[var(--accent)]",
    bg: "bg-[var(--accent)]",
    glow: "drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]",
    border: "border-[var(--accent)]",
  },
  amber: {
    text: "text-amber-500",
    bg: "bg-amber-500",
    glow: "drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]",
    border: "border-amber-500",
  },
  orange: {
    text: "text-orange-500",
    bg: "bg-orange-500",
    glow: "drop-shadow-[0_0_12px_rgba(249,115,22,0.45)]",
    border: "border-orange-500",
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-500",
    glow: "drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]",
    border: "border-purple-500",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500",
    glow: "drop-shadow-[0_0_12px_rgba(52,211,153,0.45)]",
    border: "border-emerald-500",
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-400",
    glow: "drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]",
    border: "border-cyan-400",
  },
  rose: {
    text: "text-rose-400",
    bg: "bg-rose-500",
    glow: "drop-shadow-[0_0_12px_rgba(251,113,133,0.45)]",
    border: "border-rose-500",
  },
  blue: {
    text: "text-blue-500",
    bg: "bg-blue-500",
    glow: "drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]",
    border: "border-blue-500",
  },
};

/** Centralized font size and typography tokens for headings across the application */
export const TITLE_SIZES = {
  xs: "text-xs sm:text-sm font-black italic uppercase tracking-tight",
  sm: "text-sm sm:text-base font-black italic uppercase tracking-tight",
  md: "text-base sm:text-xl md:text-2xl font-[1000] italic uppercase tracking-tighter leading-none",
  lg: "text-xl sm:text-3xl font-[1000] italic uppercase tracking-tighter leading-none",
  xl: "text-2xl sm:text-4xl md:text-5xl font-[1000] italic uppercase tracking-tighter leading-none",
  "2xl": "text-3xl sm:text-5xl md:text-6xl font-[1000] italic uppercase tracking-tighter leading-none",
} as const;

export const SUBTITLE_SIZES = {
  xs: "text-[8px] sm:text-[9px] tracking-[0.2em]",
  sm: "text-[9px] sm:text-[10px] tracking-[0.25em]",
  md: "text-[10px] sm:text-xs tracking-[0.25em]",
  lg: "text-[9px] sm:text-xs tracking-[0.3em]",
  xl: "text-xs sm:text-sm tracking-[0.3em]",
  "2xl": "text-xs sm:text-sm tracking-[0.35em]",
} as const;

export const SIZE_STYLES: Record<
  SectionTitleSize,
  {
    subtitle: string;
    line: string;
    title: string;
    desc: string;
    gap: string;
    subGap: string;
  }
> = {
  xs: {
    subtitle: SUBTITLE_SIZES.xs,
    line: "w-3.5 h-[1.5px]",
    title: TITLE_SIZES.xs,
    desc: "text-[9px] text-[var(--muted)]",
    gap: "gap-0.5",
    subGap: "gap-1.5",
  },
  sm: {
    subtitle: SUBTITLE_SIZES.sm,
    line: "w-4 h-[1.5px]",
    title: TITLE_SIZES.sm,
    desc: "text-[10px] sm:text-xs text-[var(--muted)]",
    gap: "gap-1",
    subGap: "gap-2",
  },
  md: {
    subtitle: SUBTITLE_SIZES.md,
    line: "w-5 h-[2px]",
    title: TITLE_SIZES.md,
    desc: "text-xs text-[var(--muted)]",
    gap: "gap-1 sm:gap-1.5",
    subGap: "gap-2",
  },
  lg: {
    subtitle: SUBTITLE_SIZES.lg,
    line: "w-6 sm:w-8 h-[1.5px] sm:h-[2px]",
    title: TITLE_SIZES.lg,
    desc: "text-xs sm:text-sm text-[var(--muted)]",
    gap: "gap-1.5 sm:gap-2",
    subGap: "gap-2 sm:gap-2.5",
  },
  xl: {
    subtitle: SUBTITLE_SIZES.xl,
    line: "w-8 sm:w-10 h-[2px]",
    title: TITLE_SIZES.xl,
    desc: "text-sm text-[var(--muted)]",
    gap: "gap-2",
    subGap: "gap-2.5",
  },
  "2xl": {
    subtitle: SUBTITLE_SIZES["2xl"],
    line: "w-10 sm:w-14 h-[2.5px]",
    title: TITLE_SIZES["2xl"],
    desc: "text-sm sm:text-base text-[var(--muted)]",
    gap: "gap-2.5",
    subGap: "gap-3",
  },
};

export const SECTION_TITLE_SIZES = SIZE_STYLES;

export function SectionTitle({
  subtitle,
  title,
  highlight,
  highlightLastWord = true,
  description,
  info,
  infoPlacement = "title",
  size = "lg",
  fontSize,
  align = "left",
  accentColor = "accent",
  as: Component = "h2",
  showLine = true,
  icon,
  pulse = false,
  action,
  actionLayout = "responsive",
  glow = false,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
  children,
}: SectionTitleProps) {
  const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.lg;
  const colorConfig = COLOR_MAP[accentColor] || {
    text: accentColor.startsWith("text-") ? accentColor : "text-[var(--accent)]",
    bg: accentColor.startsWith("bg-") ? accentColor : "bg-[var(--accent)]",
    glow: "drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]",
    border: "border-[var(--accent)]",
  };

  // Align styling
  const alignClass = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }[align];

  const subtitleAlignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  // Helper to render the title with highlighted accent
  const renderTitleContent = () => {
    if (!title && !highlight) return null;

    // Case 1: Title is not a string (ReactNode or already parsed)
    if (typeof title !== "string") {
      return (
        <>
          {title}
          {highlight && (
            <>
              {" "}
              <span className={`${colorConfig.text} ${glow ? colorConfig.glow : ""}`}>
                {highlight}
              </span>
            </>
          )}
        </>
      );
    }

    const trimmedTitle = title.trim();

    // Case 2: Explicit highlight passed as a string
    if (typeof highlight === "string" && highlight.trim()) {
      const trimmedHighlight = highlight.trim();
      const lowerTitle = trimmedTitle.toLowerCase();
      const lowerHighlight = trimmedHighlight.toLowerCase();

      if (lowerTitle.includes(lowerHighlight)) {
        const index = lowerTitle.indexOf(lowerHighlight);
        const before = trimmedTitle.slice(0, index);
        const match = trimmedTitle.slice(index, index + trimmedHighlight.length);
        const after = trimmedTitle.slice(index + trimmedHighlight.length);

        return (
          <>
            {before && <span className="text-[var(--foreground)]">{before}</span>}
            <span className={`${colorConfig.text} ${glow ? colorConfig.glow : ""}`}>
              {match}
            </span>
            {after && <span className="text-[var(--foreground)]">{after}</span>}
          </>
        );
      }

      // Title does not contain highlight; append highlight
      return (
        <>
          <span className="text-[var(--foreground)]">{trimmedTitle}</span>{" "}
          <span className={`${colorConfig.text} ${glow ? colorConfig.glow : ""}`}>
            {trimmedHighlight}
          </span>
        </>
      );
    }

    // Case 3: Explicit highlight as ReactNode (not string)
    if (highlight) {
      return (
        <>
          <span className="text-[var(--foreground)]">{trimmedTitle}</span>{" "}
          <span className={`${colorConfig.text} ${glow ? colorConfig.glow : ""}`}>
            {highlight}
          </span>
        </>
      );
    }

    // Case 4: No explicit highlight provided, auto-highlight last word if multi-word string
    if (highlightLastWord && trimmedTitle.includes(" ")) {
      const words = trimmedTitle.split(/\s+/);
      const lastWord = words.pop();
      const mainPart = words.join(" ");

      return (
        <>
          <span className="text-[var(--foreground)]">{mainPart}</span>{" "}
          <span className={`${colorConfig.text} ${glow ? colorConfig.glow : ""}`}>
            {lastWord}
          </span>
        </>
      );
    }

    // Case 5: Single word or no highlight
    return <span className="text-[var(--foreground)]">{trimmedTitle}</span>;
  };

  const lineElement = showLine ? (
    <div
      className={`${sizeConfig.line} ${colorConfig.bg} rounded-full shrink-0 transition-all`}
    />
  ) : null;

  const content = (
    <div className={`flex flex-col ${alignClass} ${sizeConfig.gap}`}>
      {/* ── Subtitle / Eyebrow Row ── */}
      {subtitle && (
        <div
          className={`flex items-center ${sizeConfig.subGap} ${subtitleAlignClass} font-black uppercase ${sizeConfig.subtitle} ${colorConfig.text} italic select-none ${subtitleClassName}`}
        >
          {align === "center" && lineElement}
          {align !== "center" && align !== "right" && lineElement}
          {icon && <span className="shrink-0">{icon}</span>}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {subtitle}
            {info && infoPlacement === "subtitle" && (
              <InfoTooltip
                content={info}
                position="top"
                className="not-italic font-normal normal-case ml-1"
                iconSize={12}
              />
            )}
          </div>
          {align === "center" && lineElement}
          {align === "right" && lineElement}
        </div>
      )}

      {/* ── Main Title Row ── */}
      {(title || highlight) && (
        <Component
          className={`${fontSize || sizeConfig.title} text-[var(--foreground)] ${titleClassName}`}
        >
          <span className="inline-flex items-center gap-2">
            <span>{renderTitleContent()}</span>
            {info && infoPlacement === "title" && (
              <InfoTooltip
                content={info}
                position="top"
                className="not-italic font-normal normal-case inline-flex align-middle"
                iconSize={15}
              />
            )}
          </span>
          {pulse && (
            <span
              className={`inline-block w-2 h-2 rounded-full ${colorConfig.bg} animate-pulse ml-2.5 align-middle`}
            />
          )}
        </Component>
      )}

      {/* ── Optional Description ── */}
      {description && (
        <p className={`${sizeConfig.desc} font-medium leading-relaxed max-w-2xl`}>
          {description}
        </p>
      )}

      {children}
    </div>
  );

  // If there's an action, wrap in responsive flex container
  if (action) {
    const layoutClasses =
      actionLayout === "row"
        ? "flex flex-row items-center justify-between gap-2.5 sm:gap-3"
        : "flex flex-col md:flex-row md:items-end justify-between gap-3";

    return (
      <div
        className={`${layoutClasses} relative ${className}`}
      >
        <div className="min-w-0">{content}</div>
        <div className="shrink-0 relative z-10">{action}</div>
      </div>
    );
  }

  return <div className={`relative ${className}`}>{content}</div>;
}

export default SectionTitle;

