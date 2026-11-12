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
  const badgePositionClass = badgePosition === "left" ? "left-2.5" : "right-2.5";

  return (
    <div className={`w-full flex justify-center pt-2 pb-0.5 ${className}`}>
      <div 
        className="relative border border-[var(--border)] rounded-lg bg-[var(--foreground)]/[0.02] shadow-xs flex items-center justify-center p-1"
        style={{ width: "100%", maxWidth: "320px" }}
      >
        {/* Overlapping Corner Ad Mention Badge */}
        <div 
          className={`absolute -top-2 ${badgePositionClass} z-20 px-2 py-0.5 rounded-full bg-[var(--background)]/90 backdrop-blur-sm border border-[var(--border)] shadow-xs flex items-center gap-1.5 pointer-events-none select-none`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-80 animate-pulse"></span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--muted)]">
            {badgeLabel}
          </span>
        </div>

        {/* Ad Iframe Container */}
        <div className="w-full rounded-md overflow-hidden flex items-center justify-center">
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
