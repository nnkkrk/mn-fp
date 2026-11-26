"use client";

import { useState } from "react";

interface ShareButtonProps {
  title: string;
  price: number;
  url: string;
  imageUrl?: string;
}

export default function ShareButton({
  title,
  price,
  url,
  imageUrl,
}: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (sharing) return;
    setSharing(true);

    const fullUrl =
      url.startsWith("/") && typeof window !== "undefined"
        ? `${window.location.origin}${url}`
        : url;

    const shareText = `${title}\nPrice: ₹${price}\n${fullUrl}`;

    // Try Web Share API (native sheet on Android/iOS)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        let filesToShare: File[] = [];

        if (imageUrl && navigator.canShare) {
          try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            const file = new File([blob], "mlbb-account.jpg", {
              type: blob.type || "image/jpeg",
            });
            if (navigator.canShare({ files: [file] })) {
              filesToShare = [file];
            }
          } catch {
            // If image fetch fails (CORS or offline), proceed with text & URL
          }
        }

        if (filesToShare.length > 0) {
          await navigator.share({
            title,
            text: shareText,
            files: filesToShare,
          });
          setSharing(false);
          return;
        }

        await navigator.share({
          title,
          text: shareText,
        });
        setSharing(false);
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // User dismissed the native share sheet
          setSharing(false);
          return;
        }
      }
    }

    // Direct WhatsApp fallback
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    setSharing(false);
  };

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      title="Share Account"
      aria-label="Share Account"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/40 transition-all cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-3.5 h-3.5 fill-current text-emerald-400 shrink-0"
      >
        <path d="M16.003 3.2c-7.05 0-12.8 5.75-12.8 12.8 0 2.256.587 4.453 1.707 6.395L3.2 28.8l6.57-1.723A12.71 12.71 0 0 0 16.003 28.8c7.05 0 12.8-5.75 12.8-12.8 0-7.05-5.75-12.8-12.8-12.8z" />
      </svg>
      <span>Share</span>
    </button>
  );
}
