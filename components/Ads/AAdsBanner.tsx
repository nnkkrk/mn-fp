"use client";

interface AAdsBannerProps {
  className?: string;
  badgePosition?: "left" | "right";
  badgeLabel?: string;
}

export default function AAdsBanner({ 
  className = "",
  badgePosition = "right",
  badgeLabel = "AD"
}: AAdsBannerProps) {
  const justifyClass = badgePosition === "left" ? "justify-start" : "justify-end";

  return (
    <div className={`w-full flex justify-center py-2 ${className}`}>
      <div 
        className="relative border border-[var(--border)] rounded-xl bg-[var(--foreground)]/[0.02] shadow-xs flex flex-col items-center p-2"
        style={{ width: "100%", maxWidth: "340px" }}
      >
        {/* Corner Ad Mention Badge - In-flow above iframe so no overlap error */}
        <div className={`w-full flex ${justifyClass} mb-1.5`}>
          <div className="px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-80 animate-pulse"></span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--muted)]">
              {badgeLabel}
            </span>
          </div>
        </div>

        {/* Ad Iframe Container */}
        <div className="w-full rounded-lg overflow-hidden flex items-center justify-center">
          <iframe
            data-aa="2461867"
            src="https://acceptable.a-ads.com/2461867/?size=Adaptive"
            style={{
              border: 0,
              padding: 0,
              width: "100%",
              maxWidth: "320px",
              height: "52px",
              minHeight: "50px",
              overflow: "hidden",
              display: "block",
              margin: "auto",
            }}
            title="Advertisement"
            scrolling="no"
          />
        </div>
      </div>
    </div>
  );
}
