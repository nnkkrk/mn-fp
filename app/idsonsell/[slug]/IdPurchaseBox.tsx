"use client";

import { useState } from "react";
import { MessageCircle, ShieldCheck, Zap, ShoppingBag, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  item: {
    id: string;
    slug?: string;
    title: string;
    price: number;
    stockStatus?: string;
    dealer?: {
      contact?: {
        whatsapp?: string;
      };
    };
    rent?: {
      available: boolean;
      price: number;
      durationHours?: number;
      isRented?: boolean;
      availableAgainAt?: string | Date;
      conditions?: string[];
    };
  };
  url?: string;
}

function getRemainingRentTime(availableAgainAt?: string | Date) {
  if (!availableAgainAt) return null;
  const target = new Date(availableAgainAt).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return { expired: true, text: "Due now" };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return { expired: false, text: `${days}d ${hours % 24}h` };
  }
  return { expired: false, text: `${hours}h ${minutes}m` };
}

export default function IdPurchaseBox({ item, url }: Props) {
  const hasRent = Boolean(item.rent?.available);
  const [mode, setMode] = useState<"buy" | "rent">("buy");

  const isUnstocked = item.stockStatus === "unstocked";
  const isCurrentlyRented = Boolean(item.rent?.isRented);
  const remainingTime = isCurrentlyRented ? getRemainingRentTime(item.rent?.availableAgainAt) : null;

  const baseWhatsapp =
    item.dealer?.contact?.whatsapp?.split("?")[0] || "https://wa.me/918118090547";

  const productUrl =
    url || (typeof window !== "undefined" ? window.location.href : `https://mlbbtopup.in/idsonsell/${item.slug || item.id}`);

  // Format messages
  const buyMessage = isUnstocked
    ? `Hi, I am interested in this account (currently marked unstocked / out of stock):

${item.title} (ID: ${item.id})
Price: ₹${item.price}
${productUrl}

Please let me know if it can be restocked or if similar accounts are available.`
    : `I want to buy

${item.title} (ID: ${item.id})
Price: ₹${item.price}
${productUrl}`;

  const returnDateStr = item.rent?.availableAgainAt
    ? new Date(item.rent.availableAgainAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  const rentMessage = isCurrentlyRented
    ? `Hi, I want to PRE-BOOK rental for when it becomes available again:

${item.title} (ID: ${item.id})
Rate: ₹${item.rent?.price || item.price}/${item.rent?.durationHours || 24}h
Currently Rented Until: ${returnDateStr || "soon"} (Available again in ~${remainingTime?.text || "a few hours"})
${productUrl}`
    : `I want to rent

${item.title} (ID: ${item.id})
Price: ₹${item.rent?.price || item.price}/${item.rent?.durationHours || 24}h
${productUrl}`;

  const currentMessage = mode === "buy" ? buyMessage : rentMessage;
  const whatsappUrl = `${baseWhatsapp}?text=${encodeURIComponent(currentMessage)}`;

  return (
    <>
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3.5 sm:p-4 space-y-3 shadow-sm">
        {/* ── UNSTOCKED NOTICE BANNER ── */}
        {isUnstocked && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2 text-xs">
            <XCircle size={15} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-black uppercase tracking-wider text-[11px]">Currently Unstocked / Out of Stock</div>
              <div className="text-[10px] text-red-300/80 mt-0.5">
                This account is temporarily unstocked. You can still message support to enquire about restock or reserve.
              </div>
            </div>
          </div>
        )}

        {/* ── SLEEK SEGMENTED BUY / RENT TOGGLE ── */}
        {hasRent && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-xs font-black uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setMode("buy")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                mode === "buy"
                  ? "bg-[var(--accent)] text-white shadow-sm font-black"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <ShoppingBag size={14} />
              <span>Buy Account</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("rent")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                mode === "rent"
                  ? "bg-amber-400 text-black shadow-sm font-black"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Zap size={14} />
              <span>Rent {item.rent?.durationHours || 24}h</span>
            </button>
          </div>
        )}

        {/* ── RENT IN-USE / COUNTDOWN ALERT (WHEN RENT MODE SELECTED) ── */}
        {mode === "rent" && isCurrentlyRented && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
              <Clock size={14} className="animate-spin text-amber-400" />
              <span>Currently On Rent</span>
            </div>
            <div className="text-xs text-[var(--foreground)]">
              This account is currently in use. It will be available for rent again in{" "}
              <strong className="text-amber-400 font-black">{remainingTime?.text || "a few hours"}</strong>.
            </div>
            {returnDateStr && (
              <div className="text-[10px] text-[var(--muted)]">
                Expected Available Time:{" "}
                <span className="font-bold text-[var(--foreground)]">{returnDateStr}</span>
              </div>
            )}
            <div className="text-[10px] text-amber-300 font-bold pt-1 border-t border-amber-500/20">
              💡 You can pre-book this account on WhatsApp so it is reserved for you next!
            </div>
          </div>
        )}

        {/* ── PRICE & VERIFIED ESCROW ── */}
        <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
              {mode === "buy" ? "Account Price" : "Rental Rate"}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  mode === "buy" ? "text-[var(--accent)]" : "text-amber-500 dark:text-amber-400"
                }`}
              >
                ₹{mode === "buy" ? item.price.toLocaleString("en-IN") : item.rent?.price}
              </span>
              {mode === "rent" && (
                <span className="text-[11px] font-bold text-[var(--muted)]">
                  / {item.rent?.durationHours || 24}h
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck size={12} />
              <span>{mode === "buy" ? "Moonton Safe Rebind" : "Instant Play"}</span>
            </span>
            <span className="text-[8.5px] font-medium text-[var(--muted)]">
              Blue Buff Escrow Protected
            </span>
          </div>
        </div>

        {/* ── KEY BENEFITS CHECKLIST ── */}
        <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-1.5 text-xs text-[var(--foreground)]/90">
          {mode === "buy" ? (
            <>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">Full Moonton email transfer with direct credentials handover</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">Clean account history verified by MT Top Up escrow</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">Instant login credentials handover — zero security deposit</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Play scrims, test rare skins, or rank push for {item.rent?.durationHours || 24}h
                </span>
              </div>
            </>
          )}
        </div>

        {/* ── WHATSAPP CTA BUTTON ── */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-lg transition-all cursor-pointer group active:scale-[0.98] ${
            mode === "rent" && isCurrentlyRented
              ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-105 shadow-amber-950/40"
              : isUnstocked
              ? "bg-gradient-to-r from-slate-600 to-slate-700 hover:brightness-105 shadow-black/40"
              : "bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-105 shadow-emerald-950/40"
          }`}
        >
          <MessageCircle size={18} className="shrink-0 transition-transform group-hover:scale-110" />
          <span>
            {mode === "buy"
              ? isUnstocked
                ? "Enquire on WhatsApp (Unstocked)"
                : `Buy on WhatsApp • ₹${item.price.toLocaleString("en-IN")}`
              : isCurrentlyRented
              ? `Pre-Book Rent • Avail in ${remainingTime?.text || "soon"}`
              : `Rent on WhatsApp • ₹${item.rent?.price}/${item.rent?.durationHours || 24}h`}
          </span>
        </a>
      </div>

      {/* ── MOBILE STICKY FLOATING ACTION BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-[var(--card)]/95 dark:bg-black/95 backdrop-blur-xl border-t border-[var(--border)] shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3 pl-12 sm:pl-2 pr-1">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
              {mode === "buy" ? "Account Price" : `${item.rent?.durationHours || 24}h Rent`}
            </div>
            <div className="text-lg font-black text-[var(--foreground)] leading-tight">
              ₹{mode === "buy" ? item.price.toLocaleString("en-IN") : item.rent?.price}
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 max-w-[240px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer ${
              mode === "rent" && isCurrentlyRented
                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                : isUnstocked
                ? "bg-gradient-to-r from-slate-600 to-slate-700"
                : "bg-gradient-to-r from-[#25D366] to-[#128C7E]"
            }`}
          >
            <MessageCircle size={16} />
            <span>
              {mode === "buy"
                ? isUnstocked
                  ? "Enquire Restock"
                  : "Buy on WhatsApp"
                : isCurrentlyRented
                ? `Pre-Book (${remainingTime?.text || "Rented"})`
                : "Rent on WhatsApp"}
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
