"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle2, ShieldCheck, Clock, Zap, ShoppingBag } from "lucide-react";

interface Props {
  item: {
    id: string;
    title: string;
    price: number;
    dealer?: {
      contact?: {
        whatsapp?: string;
      };
    };
    rent?: {
      available: boolean;
      price: number;
      durationHours?: number;
      conditions?: string[];
    };
  };
}

export default function IdPurchaseBox({ item }: Props) {
  const hasRent = Boolean(item.rent?.available);
  const [mode, setMode] = useState<"buy" | "rent">("buy");

  const baseWhatsapp =
    item.dealer?.contact?.whatsapp?.split("?")[0] || "https://wa.me/918118090547";

  const buyMessage = `Hello MT Topup! I want to BUY this MLBB Account:
• ID: ${item.id}
• Title: ${item.title}
• Price: ₹${item.price}
Please guide me with the payment & instant handover.`;

  const rentMessage = `Hello MT Topup! I want to RENT this MLBB Account:
• ID: ${item.id}
• Title: ${item.title}
• Rent Rate: ₹${item.rent?.price} / ${item.rent?.durationHours || 24}h
Please share the rental credentials and procedure.`;

  const currentMessage = mode === "buy" ? buyMessage : rentMessage;
  const whatsappUrl = `${baseWhatsapp}?text=${encodeURIComponent(currentMessage)}`;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[var(--card)] to-[var(--accent)]/5 border border-[var(--border)] space-y-4 shadow-sm">
      {/* ── MODE SWITCHER (BUY vs RENT) ── */}
      {hasRent && (
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-xs font-black uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setMode("buy")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
              mode === "buy"
                ? "bg-[var(--accent)] text-white shadow-xs"
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
                ? "bg-emerald-500 text-black shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Zap size={14} />
            <span>Rent Account</span>
          </button>
        </div>
      )}

      {/* ── PRICING HEADER ── */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
            {mode === "buy" ? "Full Ownership Price" : "Rental Rate"}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className={`text-2xl sm:text-3xl font-black leading-none ${
                mode === "buy" ? "text-[var(--accent)]" : "text-emerald-500"
              }`}
            >
              ₹{mode === "buy" ? item.price : item.rent?.price}
            </span>
            {mode === "rent" && (
              <span className="text-xs font-bold text-[var(--muted)]">
                / {item.rent?.durationHours || 24} hours
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck size={11} /> Instant Handover
          </span>
        </div>
      </div>

      {/* ── MODE SPECIFIC TERMS / BENEFITS ── */}
      {mode === "buy" ? (
        <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/70 space-y-1.5 text-xs text-[var(--foreground)]/80 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>100% Full ownership with Moonton email rebind</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>Verified clean history — zero bans, zero strikes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>Dedicated agent support until transfer completes</span>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5 text-xs text-emerald-300 font-medium">
          <div className="flex items-center gap-1 font-bold text-emerald-400">
            <Clock size={12} /> Rental Conditions:
          </div>
          <ul className="list-disc ml-4 space-y-0.5 text-[11px]">
            {item.rent?.conditions && item.rent.conditions.length > 0 ? (
              item.rent.conditions.map((c, i) => <li key={i}>{c}</li>)
            ) : (
              <>
                <li>Quick 24h play session, zero security deposits required</li>
                <li>No email or password modifications permitted</li>
                <li>Auto-expires after rental duration</li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* ── WHATSAPP CTA ACTION ── */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer ${
          mode === "buy"
            ? "bg-[var(--accent)] hover:brightness-110 text-white shadow-[var(--accent)]/20"
            : "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20"
        }`}
      >
        <MessageCircle size={18} />
        <span>
          {mode === "buy" ? `Buy Now for ₹${item.price}` : `Rent for ₹${item.rent?.price}/24h`}
        </span>
      </a>

      <p className="text-[10px] text-center text-[var(--muted)]">
        Official MT Safe Trade • WhatsApp Handover Guaranteed
      </p>
    </div>
  );
}
