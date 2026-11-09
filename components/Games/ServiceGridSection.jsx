"use client";

import Image from "next/image";
import Link from "next/link";
import { FiEye, FiZap, FiTv, FiShield, FiChevronRight } from "react-icons/fi";
import { SectionTitle } from "@/components/common";

export default function ServiceGridSection({
  title,
  total,
  items,
  hrefPrefix,
  showCategory = true,
  ctaText = "View Details",
  isOutOfStock,
}) {
  if (!items?.length) return null;

  // Determine icon and gradient based on title
  const isOtt = title?.toLowerCase().includes("ott");
  const config = isOtt
    ? { icon: FiTv, gradient: "from-purple-500 to-indigo-600" }
    : { icon: FiShield, gradient: "from-amber-400 to-orange-500" };

  const Icon = config.icon;

  return (
    <section className="relative mb-4 sm:mb-6 px-1">
      {/* HEADER SYSTEM */}
      {title && (
        <div className="mb-6">
          <SectionTitle
            size="md"
            subtitle={`${total || items.length} Elite Items`}
            icon={<Icon size={12} className="text-[var(--accent)]" />}
            title={title}
          />
        </div>
      )}

      {/* GRID SYSTEM (Responsive Columns) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-6 md:gap-5 px-2 sm:px-0">
        {items.map((item, index) => {
          const disabled = Boolean(
            (isOutOfStock && isOutOfStock(item)) ||
            item.available === false ||
            item.isOutOfStock === true
          );

          return (
            <div key={item.slug || index}>
              <Link
                href={disabled ? "#" : `${hrefPrefix}/${item.slug}`}
                className={`group relative block rounded-none overflow-hidden border transition-all duration-300 ${
                  disabled
                    ? "opacity-60 cursor-not-allowed border-[var(--border)] bg-[var(--background)]"
                    : "border-[var(--border)] bg-[var(--card)]/40 backdrop-blur-xl hover:border-[var(--accent)]/50 shadow-sm"
                }`}
              >
                {/* IMAGE CONTAINER */}
                <div className="relative w-full aspect-square p-2 sm:p-3 flex items-center justify-center shrink-0 bg-black/10 overflow-hidden">
                  
                  {/* Decorative Tactical SVG Background */}
                  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/[0.08] via-transparent to-purple-500/[0.05] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Corner Tech Brackets SVG */}
                    <svg
                      className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] text-[var(--accent)] opacity-40 group-hover:opacity-80 transition-opacity duration-300"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M 0 12 L 0 0 L 12 0" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M 88 0 L 100 0 L 100 12" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M 0 88 L 0 100 L 12 100" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M 88 100 L 100 100 L 100 88" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>

                  {/* Main card */}
                  <div className="relative w-[88%] h-[88%] z-10 border border-white/10 bg-[var(--background)] shadow-sm group-hover:scale-[1.03] transition-transform duration-300">
                    <Image
                      src={item.image}
                      alt={item.gameName || item.name}
                      fill
                      sizes="(max-width: 768px) 33vw, 25vw"
                      quality={75}
                      className={`object-cover rounded-none ${disabled ? "grayscale blur-[1.5px]" : ""}`}
                    />

                    {/* OVERLAYS */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

                    {/* CATEGORY & MANUAL BADGES */}
                    {!disabled && (
                      <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-start gap-1.5">
                        {showCategory && item.category && (
                          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white">
                            {item.category}
                          </span>
                        )}
                        {item.isManual && (
                          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded bg-amber-500/80 backdrop-blur-md border border-amber-400/30 text-white flex items-center gap-1">
                            <FiZap size={8} fill="currentColor" />
                            Manual
                          </span>
                        )}
                      </div>
                    )}

                    {/* OUT OF STOCK OVERLAY */}
                    {disabled && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                        <span className="px-2.5 py-1 rounded-md bg-red-500/90 text-white text-[7.5px] font-black uppercase tracking-widest italic text-center leading-tight shadow-md">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-2 sm:p-2.5 relative">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-tight italic leading-tight line-clamp-2 text-[var(--foreground)]">
                      {item.gameName || item.name}
                    </h3>
                    <FiChevronRight className="text-[var(--muted)]" size={14} />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${disabled ? "bg-red-500" : "bg-[var(--accent)]/40"}`} />

                    {disabled ? (
                      <span className="flex-1 text-right text-[7px] font-black text-red-500 uppercase tracking-widest">
                        • Out of Stock
                      </span>
                    ) : item.isManual ? (
                      <span className="flex-1 text-right text-[7px] font-black text-amber-500 uppercase tracking-widest opacity-80">
                        • Manual
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
