"use client";

import React from "react";

/**
 * CORE SKELETON PRIMITIVES
 */
export const SkeletonBase = ({ className = "" }) => (
  <div className={`shimmer-overlay bg-[var(--foreground)]/[0.06] border border-transparent rounded-lg ${className}`} />
);

export const SkeletonCircle = ({ size = "w-10 h-10", className = "" }) => (
  <SkeletonBase className={`${size} rounded-full ${className}`} />
);

export const SkeletonBox = ({ height = "h-24", className = "" }) => (
  <SkeletonBase className={`w-full ${height} ${className}`} />
);

export const SkeletonText = ({ width = "w-3/4", height = "h-3", className = "" }) => (
  <SkeletonBase className={`${width} ${height} rounded-md ${className}`} />
);

/**
 * COMPOSITE SKELETONS (Specific Use Cases)
 */

// 1. TOURNAMENT CARD SKELETON
export const TournamentSkeleton = () => (
  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3.5">
    <div className="flex justify-between items-start">
      <div className="space-y-1.5 flex-1">
        <SkeletonText width="w-3/4" height="h-4" />
        <SkeletonText width="w-1/2" height="h-2.5" className="opacity-60" />
      </div>
      <SkeletonBase className="h-5 w-14 rounded-full shrink-0" />
    </div>
    <div className="flex justify-between items-center pt-1">
      <SkeletonText width="w-28" height="h-3" className="opacity-50" />
      <SkeletonText width="w-14" height="h-2.5" className="opacity-40" />
    </div>
    <div className="h-1.5 w-full bg-[var(--foreground)]/[0.04] rounded-full overflow-hidden">
      <div className="h-full w-1/3 bg-[var(--foreground)]/[0.08]" />
    </div>
    <SkeletonBase className="h-5 w-20 rounded-md opacity-50" />
    <SkeletonBase className="h-9 w-full rounded-xl opacity-60" />
  </div>
);

// 2. PRODUCT/GAME CARD SKELETON
export const ProductSkeleton = () => (
  <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-2.5 space-y-2.5">
    <SkeletonBox height="aspect-square" className="rounded-xl" />
    <div className="space-y-1.5 px-0.5">
      <SkeletonText width="w-3/4" height="h-3.5" />
      <SkeletonText width="w-1/3" height="h-2.5" className="opacity-50" />
    </div>
    <div className="flex justify-between items-center px-0.5 pt-0.5">
      <SkeletonText width="w-14" height="h-4" />
      <SkeletonCircle size="w-7 h-7" />
    </div>
  </div>
);

// 3. BLOG POST SKELETON
export const BlogSkeleton = () => (
  <div className="space-y-3 p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
    <SkeletonBox height="aspect-video" className="rounded-xl" />
    <div className="space-y-2 pt-1">
      <SkeletonText width="w-full" height="h-4" />
      <SkeletonText width="w-2/3" height="h-3" className="opacity-60" />
      <div className="flex items-center gap-2.5 pt-2">
        <SkeletonCircle size="w-5 h-5" />
        <SkeletonText width="w-20" height="h-2.5" />
      </div>
    </div>
  </div>
);

// 4. TABLE ROW SKELETON
export const TableRowSkeleton = ({ cols = 4 }) => (
  <tr className="border-b border-[var(--border)]/40">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-3 py-3">
        <SkeletonText width="w-full" height="h-2.5" className="opacity-60" />
      </td>
    ))}
  </tr>
);

// 5. ORDER SKELETON (for Dashboard Orders)
export const OrderSkeleton = () => (
  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-3.5 h-3.5 rounded bg-[var(--foreground)]/10" />
        <SkeletonText width="w-24" height="h-3" />
      </div>
      <SkeletonText width="w-20" height="h-2.5" className="opacity-50" />
    </div>
    <div className="flex items-center justify-between pt-1">
      <div className="space-y-1.5">
        <SkeletonText width="w-36" height="h-3.5" />
        <div className="flex gap-2">
          <SkeletonText width="w-16" height="h-2" className="opacity-50" />
          <SkeletonText width="w-14" height="h-2" className="opacity-50" />
        </div>
      </div>
      <div className="text-right space-y-1.5">
        <SkeletonText width="w-14" height="h-4" />
        <SkeletonText width="w-10" height="h-2" className="opacity-40" />
      </div>
    </div>
  </div>
);

// 6. TRANSACTION SKELETON (for Wallet/Coin History)
export const TransactionSkeleton = () => (
  <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)]/40">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.08]" />
      <div className="space-y-1">
        <SkeletonText width="w-28" height="h-3" />
        <SkeletonText width="w-16" height="h-2" className="opacity-50" />
      </div>
    </div>
    <SkeletonText width="w-12" height="h-3" />
  </div>
);

// 7. TASK SKELETON (for Coins Tasks)
export const TaskSkeleton = () => (
  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/[0.08] shrink-0" />
    <div className="flex-1 space-y-1.5">
      <SkeletonText width="w-3/4" height="h-3" />
      <SkeletonText width="w-20" height="h-2" className="opacity-50" />
    </div>
    <div className="w-14 h-7 rounded-lg bg-[var(--foreground)]/[0.08] shrink-0" />
  </div>
);

// 8. API KEY SKELETON (for Dashboard API Keys)
export const ApiKeySkeleton = () => (
  <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--foreground)]/[0.08]" />
        <div className="space-y-1.5">
          <SkeletonText width="w-28" height="h-3.5" />
          <SkeletonText width="w-36" height="h-2" className="opacity-50" />
        </div>
      </div>
      <div className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.08]" />
    </div>
    <div className="space-y-2">
      <SkeletonText width="w-full" height="h-2" className="opacity-40" />
      <div className="h-1.5 w-full bg-[var(--foreground)]/[0.05] rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-2.5">
      <div className="h-10 rounded-xl bg-[var(--foreground)]/[0.05]" />
      <div className="h-10 rounded-xl bg-[var(--foreground)]/[0.05]" />
    </div>
  </div>
);

// 9. QUERY SKELETON (for Support Queries)
export const QuerySkeleton = () => (
  <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
    <div className="flex items-start justify-between">
      <div className="space-y-1.5 flex-1">
        <SkeletonText width="w-16" height="h-2" className="opacity-50" />
        <SkeletonText width="w-3/4" height="h-3" />
        <SkeletonText width="w-1/2" height="h-2" className="opacity-40" />
      </div>
      <div className="w-14 h-5 rounded-full bg-[var(--foreground)]/[0.08]" />
    </div>
  </div>
);

// 10. GAME SELECT SKELETON (for Tournament Game Selection)
export const GameSelectSkeleton = () => (
  <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
    <div className="w-13 h-13 rounded-xl bg-[var(--foreground)]/[0.08]" />
    <div className="text-center space-y-1.5">
      <SkeletonText width="w-16" height="h-3" />
      <SkeletonText width="w-10" height="h-2" className="opacity-40 mx-auto" />
    </div>
  </div>
);

// 11. PRODUCT CARD SKELETON (for Game Grids & Flash Sales)
export const ProductCardSkeleton = () => (
  <div className="p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2">
    <div className="aspect-square rounded-xl bg-[var(--foreground)]/[0.06] shimmer-overlay" />
    <div className="space-y-1.5 px-1 pb-0.5">
      <SkeletonText width="w-12" height="h-2" className="opacity-50" />
      <SkeletonText width="w-full" height="h-3" />
      <div className="flex justify-between items-center pt-0.5">
        <SkeletonText width="w-10" height="h-3.5" />
        <SkeletonText width="w-8" height="h-2" className="opacity-40" />
      </div>
    </div>
  </div>
);

// 11b. PRODUCT LIST SKELETON (for Game List view)
export const ProductListSkeleton = () => (
  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
    <div className="w-14 h-14 shrink-0 rounded-lg bg-[var(--foreground)]/[0.06] shimmer-overlay" />
    <div className="flex-1 space-y-2 min-w-0">
      <SkeletonText width="w-3/4 max-w-[180px]" height="h-3.5" />
      <div className="w-16 h-4 rounded-md bg-[var(--foreground)]/[0.06]" />
    </div>
    <SkeletonCircle size="w-8 h-8 shrink-0" />
  </div>
);

// 12. STORY SKELETON (for Story Slider)
export const StorySkeleton = () => (
  <div className="flex flex-col items-center gap-2 min-w-[70px] md:min-w-[80px]">
    <div className="p-0.5 rounded-full bg-[var(--foreground)]/[0.06]">
      <div className="w-[56px] h-[56px] md:w-[68px] md:h-[68px] rounded-full bg-[var(--foreground)]/[0.08] shimmer-overlay" />
    </div>
    <SkeletonText width="w-10" height="h-2" className="opacity-50" />
  </div>
);

// 13. BANNER SKELETON (for Game Banner Carousel)
export const BannerSkeleton = () => (
  <div className="relative h-[200px] sm:h-[260px] md:h-[300px] rounded-none overflow-hidden border border-[var(--border)] bg-[var(--card)] shimmer-overlay">
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 space-y-3">
      <SkeletonText width="w-16" height="h-2" className="opacity-50" />
      <SkeletonText width="w-2/3 max-w-[320px]" height="h-8" />
    </div>
  </div>
);

// 14. GAME DETAIL (SLUG) SKELETON
export const GameSlugSkeleton = () => (
  <div className="min-h-screen bg-[var(--background)] px-4 pb-10 pt-2 space-y-5">
    {/* 1. GameSwitcher Skeleton */}
    <div className="max-w-7xl mx-auto flex items-center gap-3 py-2 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 w-[54px]">
          <SkeletonBase className="w-10 h-10 rounded-xl opacity-60" />
          <SkeletonText width="w-10" height="h-2" className="opacity-40" />
        </div>
      ))}
    </div>

    {/* 2. GameHeader Skeleton */}
    <div className="max-w-7xl mx-auto">
      <div className="relative p-3 sm:p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SkeletonBox height="w-12 h-12" className="rounded-xl shrink-0 opacity-70" />
          <div className="space-y-1.5">
            <SkeletonText width="w-36 sm:w-48" height="h-4" />
            <SkeletonText width="w-24" height="h-2.5" className="opacity-50" />
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          <div className="w-20 h-7 rounded-lg bg-[var(--foreground)]/[0.06]" />
        </div>
      </div>
    </div>

    {/* 3. PackageSelector Skeleton */}
    <div className="max-w-7xl mx-auto space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
        <SkeletonText width="w-24" height="h-4" />
        <div className="w-14 h-6 rounded-full bg-[var(--foreground)]/[0.06]" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
            <div className="w-full aspect-square rounded-lg bg-[var(--foreground)]/[0.06] shimmer-overlay" />
            <SkeletonText width="w-full" height="h-3" />
            <SkeletonText width="w-1/2" height="h-3.5" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * GRID WRAPPERS
 */
export const SkeletonGrid = ({ children, count = 3, cols = "grid-cols-1 md:grid-cols-3", gap = "gap-4" }) => (
  <div className={`grid ${cols} ${gap}`}>
    {Array.from({ length: count }).map((_, i) => (
      <React.Fragment key={i}>{children}</React.Fragment>
    ))}
  </div>
);

// 12. ID ON SELL CARD SKELETON
export const IdCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)] flex flex-col space-y-3">
    <div className="relative h-40 w-full bg-[var(--foreground)]/[0.06] shimmer-overlay" />
    <div className="p-3.5 space-y-3">
      <div className="space-y-1.5">
        <SkeletonText width="w-4/5" height="h-4" />
        <div className="flex items-center gap-2 pt-0.5">
          <SkeletonText width="w-20" height="h-3" />
          <SkeletonText width="w-20" height="h-3" />
        </div>
      </div>
      <div className="pt-2 border-t border-[var(--border)]/60 flex items-end justify-between">
        <div className="space-y-1">
          <SkeletonText width="w-12" height="h-2.5" />
          <SkeletonText width="w-20" height="h-5" />
        </div>
        <SkeletonCircle size="w-6 h-6" />
      </div>
    </div>
  </div>
);

// 13. IDS MARKETPLACE PAGE SKELETON
export const IdsMarketplaceSkeleton = () => (
  <main className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-200">
    <div className="space-y-1.5">
      <SkeletonText width="w-28" height="h-3" />
      <SkeletonText width="w-44" height="h-7" />
    </div>

    <SkeletonBase className="w-full h-9 sm:h-9.5 rounded-full" />

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <IdCardSkeleton key={i} />
      ))}
    </div>
  </main>
);

// 14. ID DETAIL PAGE SKELETON
export const IdDetailSkeleton = () => (
  <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-3.5 animate-in fade-in duration-200">
    <div className="flex items-center justify-between">
      <SkeletonBase className="w-28 h-7 rounded-full" />
      <SkeletonBase className="w-16 h-7 rounded-full" />
    </div>

    <div className="lg:hidden space-y-1.5">
      <SkeletonText width="w-20" height="h-2.5" />
      <SkeletonText width="w-3/4" height="h-6" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
      <div className="lg:col-span-7 space-y-4">
        <div className="aspect-[16/10] sm:aspect-[4/3] w-full rounded-2xl sm:rounded-3xl bg-[var(--foreground)]/[0.06] shimmer-overlay border border-[var(--border)]" />

        <div className="lg:hidden p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <SkeletonBase className="w-full h-8 rounded-full" />
          <div className="flex justify-between items-center">
            <SkeletonText width="w-24" height="h-6" />
            <SkeletonBase className="w-28 h-5 rounded-full" />
          </div>
          <SkeletonBase className="w-full h-9 rounded-xl" />
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <SkeletonText width="w-12" height="h-2.5" />
                <SkeletonText width="w-16" height="h-4" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2 border-t border-[var(--border)]/60">
            <SkeletonBase className="w-24 h-6 rounded-full" />
            <SkeletonBase className="w-28 h-6 rounded-full" />
            <SkeletonBase className="w-20 h-6 rounded-full" />
          </div>
          <div className="space-y-1.5 pt-2 border-t border-[var(--border)]/60">
            <SkeletonText width="w-full" height="h-3" />
            <SkeletonText width="w-4/5" height="h-3" />
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-5 space-y-4">
        <div className="space-y-1.5">
          <SkeletonText width="w-20" height="h-2.5" />
          <SkeletonText width="w-full" height="h-7" />
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <SkeletonBase className="w-full h-8 rounded-full" />
          <div className="flex justify-between items-center">
            <SkeletonText width="w-24" height="h-6" />
            <SkeletonBase className="w-28 h-5 rounded-full" />
          </div>
          <SkeletonBase className="w-full h-10 rounded-xl" />
        </div>
      </div>
    </div>
  </main>
);
