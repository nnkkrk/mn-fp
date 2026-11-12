"use client";

interface AAdsBannerProps {
  className?: string;
  badgePosition?: "left" | "right";
  badgeLabel?: string;
}

export default function AAdsBanner({ 
  className = "",
  badgePosition = "right",
  badgeLabel = "Ad"
}: AAdsBannerProps) {
  const justifyClass = badgePosition === "left" ? "justify-start" : "justify-end";

  return (
    <div className={`w-full flex flex-col items-center py-1 ${className}`}>
      <div className="w-full max-w-[324px] flex flex-col">
        {/* Small subtle "Ad" mention on top outside the card */}
        <div className={`w-full flex items-center ${justifyClass} mb-1 px-1 gap-1`}>
          <span className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-70"></span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted)]/70 select-none">
            {badgeLabel}
          </span>
        </div>

        {/* Slim, snug banner frame without bulky padding */}
        <div className="w-full rounded-lg overflow-hidden border border-[var(--border)]/60 bg-[var(--foreground)]/[0.02] flex items-center justify-center shadow-xs">
          <iframe
            data-aa="2461867"
            src="https://acceptable.a-ads.com/2461867/?size=Adaptive"
            style={{
              border: 0,
              padding: 0,
              width: "100%",
              maxWidth: "320px",
              height: "50px",
              minHeight: "50px",
              overflow: "hidden",
              display: "block",
              margin: "0 auto",
            }}
            title="Advertisement"
            scrolling="no"
          />
        </div>
      </div>
    </div>
  );
}
