"use client";

import { FiGrid, FiList, FiCheckCircle } from "react-icons/fi";
import Image from "next/image";

export default function PackageSelector({
  items,
  activeItem,
  setActiveItem,
  viewMode,
  setViewMode,
  sliderRef,
  buyPanelRef,
  calculateDiscount,
  scrollToItem,
}) {
  return (
    <div className="w-full">
      {/* ================= HEADER & VIEW TOGGLE ================= */}
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-[1000] tracking-tighter text-[var(--foreground)] uppercase italic leading-none">
            Pick <span className="text-[var(--accent)]">Your Pack</span>
          </h2>
          <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/40 flex items-center gap-2">
            <span className="w-3 h-[1px] bg-[var(--accent)]/30 rounded-full" />
            {items.length} Packs
          </p>
        </div>

        {/* View Toggle - No Shadows */}
        <div className="flex p-0.5 rounded-full bg-[var(--background)] border border-[var(--border)] gap-0.5">
          {[
            { id: "grid", icon: FiGrid, label: "Grid view" },
            { id: "list", icon: FiList, label: "List view" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              aria-label={`Switch to ${mode.label}`}
              title={mode.label}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all duration-200 ${viewMode === mode.id
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                }`}
            >
              <mode.icon size={13} />
            </button>
          ))}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div key={viewMode}>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pb-6">
            {items.map((item) => {
              const discount = calculateDiscount(item.sellingPrice, item.dummyPrice);
              const isActive = activeItem.itemSlug === item.itemSlug;
              const isOOS = item.isOutOfStock || item.itemAvailablity === false;

              return (
                <div
                  key={item.itemSlug}
                  onClick={() => {
                    setActiveItem(item);
                    buyPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={`relative group rounded-xl p-2.5 cursor-pointer border-2 transition-all duration-300 flex flex-col justify-between min-h-[4.25rem] bg-[var(--card)]/60 backdrop-blur-sm
                  ${isActive
                      ? isOOS ? "border-rose-500/60 shadow-sm scale-[1.01] z-10" : "border-[var(--accent)] shadow-sm scale-[1.01] z-10"
                      : isOOS ? "border-[var(--border)]/60 opacity-70 hover:opacity-100" : "border-[var(--border)] hover:border-[var(--accent)]/40"
                    }`}
                >
                  {/* WRAPPED CORNER BADGE */}
                  {isOOS ? (
                    <div className="absolute -top-1 -left-1 z-20">
                       <div className="relative scale-[0.7] origin-top-left">
                          <div className="absolute top-4 left-0.5 w-1.2 h-2 bg-rose-600 brightness-[0.4]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
                          <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white text-[8px] font-black uppercase pl-2 pr-3.5 py-0.5 shadow-sm corner-ribbon flex items-center relative overflow-hidden">
                            OUT OF SERVICE
                          </div>
                       </div>
                    </div>
                  ) : discount > 0 && (
                    <div className="absolute -top-1 -left-1 z-20">
                       <div className="relative scale-[0.7] origin-top-left">
                          <div className="absolute top-4 left-0.5 w-1.2 h-2 bg-[var(--accent)] brightness-[0.4]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
                          <div className="bg-gradient-to-br from-[var(--accent)] via-[var(--accent)] to-[var(--accent-hover)] text-white text-[8px] font-black uppercase pl-2 pr-3.5 py-0.5 shadow-sm corner-ribbon flex items-center relative overflow-hidden">
                            {discount}% OFF
                          </div>
                       </div>
                    </div>
                  )}

                  {/* RIBBON (TOP RIGHT) */}
                  <div className={`absolute top-0 right-2.5 w-9 h-11 transition-all duration-300 ribbon-shape flex items-center justify-center pt-0.5 shadow-sm
                    ${isActive 
                        ? isOOS ? "bg-gradient-to-b from-rose-500/20 to-transparent" : "bg-gradient-to-b from-[var(--accent)]/30 to-[var(--accent)]/10" 
                        : "bg-gradient-to-b from-[var(--accent)]/[0.08] to-transparent"
                    }
                  `}>
                    <div className="relative w-6 h-6 transition-transform duration-300 group-hover:scale-105">
                        <Image
                            src={item?.itemImageId?.image || item?.image || "/logo.png"}
                            alt={`${item.itemName || "Package"} Top Up icon`}
                            fill
                            unoptimized
                            className={`object-contain transition-all duration-300 ${isOOS ? "grayscale opacity-40" : isActive ? "opacity-100 scale-105" : "opacity-40 group-hover:opacity-100"}`}
                        />
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="relative z-10 flex flex-col h-full pr-10 pt-0.5">
                    <p className={`text-[9.5px] font-black tracking-tight uppercase leading-tight mb-1 truncate ${isActive ? (isOOS ? "text-rose-400" : "text-[var(--foreground)]") : "text-[var(--muted)] group-hover:text-[var(--foreground)]"}`}>
                      {item.itemName}
                    </p>

                    <div className="flex flex-col mt-auto">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-base font-black tracking-tight leading-none ${isActive ? (isOOS ? "text-rose-400" : "text-[var(--accent)]") : "text-[var(--foreground)]"}`}>
                            ₹{item.sellingPrice}
                          </span>
                          {item.dummyPrice > item.sellingPrice && (
                            <span className="text-[8px] font-bold text-[var(--muted)]/40 line-through opacity-50">
                              ₹{item.dummyPrice}
                            </span>
                          )}
                        </div>
                    </div>
                  </div>

                  {/* ACTIVE INDICATOR */}
                  {isActive && (
                    <div className={`absolute bottom-2 right-2 ${isOOS ? "text-rose-500" : "text-[var(--accent)]"}`}>
                      <FiCheckCircle size={11} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pb-4">
            <div ref={sliderRef} className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-3 pt-2 px-1 scrollbar-hide no-scrollbar -mx-1">
              {items.map((item) => {
                const isActive = activeItem.itemSlug === item.itemSlug;
                const isOOS = item.isOutOfStock || item.itemAvailablity === false;
                return (
                  <div
                    key={item.itemSlug}
                    onClick={() => scrollToItem(item)}
                    className={`relative snap-center min-w-[130px] rounded-xl p-2.5 cursor-pointer border-2 transition-all duration-300 flex flex-col justify-between min-h-[4.25rem] overflow-hidden bg-[var(--card)]/60
                    ${isActive 
                      ? isOOS ? "border-rose-500/60 bg-rose-500/[0.06] shadow-sm scale-[1.01]" : "border-[var(--accent)] bg-[var(--accent)]/[0.08] shadow-sm scale-[1.01]" 
                      : isOOS ? "border-[var(--border)] opacity-60 hover:opacity-100" : "border-[var(--border)] opacity-80 hover:opacity-100 hover:border-[var(--accent)]/40"}
                  `}>
                     <div className={`absolute top-0 right-2.5 w-9 h-11 transition-all duration-300 ribbon-shape flex items-center justify-center pt-0.5
                        ${isActive ? (isOOS ? "bg-gradient-to-b from-rose-500/20 to-transparent" : "bg-gradient-to-b from-[var(--accent)]/30 to-transparent") : "bg-[var(--accent)]/5"}
                     `}>
                        <div className="relative w-6 h-6">
                          <Image src={item?.itemImageId?.image || item?.image || "/logo.png"} alt={`${item.itemName || "Package"} Top Up icon`} fill unoptimized className={`object-contain transition-all duration-300 ${isOOS ? "grayscale opacity-30" : isActive ? "opacity-100 scale-105" : "opacity-30"}`} />
                        </div>
                     </div>
                    <div className="relative z-10 flex flex-col h-full pr-10 pt-0.5">
                      <div className="flex items-center gap-1">
                        <p className={`text-[9.5px] font-black tracking-tight uppercase leading-tight mb-1 truncate ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                          {item.itemName}
                        </p>
                        {isOOS && (
                          <span className="text-[6.5px] font-black uppercase text-rose-500 bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/20 mb-1">
                            OOS
                          </span>
                        )}
                      </div>
                      <p className={`text-base font-black tracking-tight leading-none mt-auto ${isActive ? (isOOS ? "text-rose-400" : "text-[var(--accent)]") : "text-[var(--foreground)]"}`}>₹{item.sellingPrice}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .corner-ribbon {
          clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
          border-top-left-radius: 4px;
        }
        .ribbon-shape {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 88%, 0 100%);
        }
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 1.5s infinite linear;
        }
        .animate-in {
          animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
