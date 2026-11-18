"use client";

import { useState } from "react";
import { MessageCircle, ShieldCheck, Zap, ShoppingBag, CheckCircle2 } from "lucide-react";

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

  const buyMessage = `Hello MT Topup! I want to BUY MLBB Account:
• ID: ${item.id}
• Title: ${item.title}
• Price: ₹${item.price}
Please guide me with the payment & instant handover.`;

  const rentMessage = `Hello MT Topup! I want to RENT MLBB Account:
• ID: ${item.id}
• Title: ${item.title}
• Rent Rate: ₹${item.rent?.price}/${item.rent?.durationHours || 24}h
Please share the rental credentials and procedure.`;

  const currentMessage = mode === "buy" ? buyMessage : rentMessage;
  const whatsappUrl = `${baseWhatsapp}?text=${encodeURIComponent(currentMessage)}`;

  return (
    <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 sm:p-5 space-y-3.5 shadow-sm">
      {/* ── MODE SWITCHER ── */}
      {hasRent && (
        <div className="grid grid-cols-2 p-1 rounded-full bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-xs font-black uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setMode("buy")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-full transition-all cursor-pointer ${
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
            className={`flex items-center justify-center gap-1.5 py-2 rounded-full transition-all cursor-pointer ${
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

      {/* ── PRICE & GUARANTEE ── */}
      <div className="flex items-end justify-between pt-0.5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            {mode === "buy" ? "Account Purchase Price" : "Rental Rate"}
          </div>
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
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck size={12} />
            {mode === "buy" ? "Moonton Safe Rebind" : "Instant 24h Play"}
          </span>
        </div>
      </div>

      {/* ── KEY BENEFITS ── */}
      <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/60 space-y-1.5 text-xs text-[var(--foreground)]/85 font-medium">
        {mode === "buy" ? (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <span>Full ownership transfer with Moonton email change</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <span>Clean account history verified by MT Top Up</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <span>Instant credentials handover — no security deposit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <span>Play tournaments or test collector skins for 24h</span>
            </div>
          </>
        )}
      </div>

      {/* ── WHATSAPP CTA ── */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-98 shadow-md cursor-pointer ${
          mode === "buy"
            ? "bg-[var(--accent)] hover:brightness-110 text-white shadow-[var(--accent)]/25"
            : "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/25"
        }`}
      >
        <MessageCircle size={18} />
        <span>
          {mode === "buy"
            ? `Buy on WhatsApp • ₹${item.price}`
            : `Rent on WhatsApp • ₹${item.rent?.price}/24h`}
        </span>
      </a>

      <div className="text-[10px] text-center text-[var(--muted)]">
        🔒 Official MT Topup Escrow • Direct WhatsApp Handover
      </div>
    </div>
  );
}
