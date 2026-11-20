"use client";

interface AAdsBannerProps {
  className?: string;
  adId?: string | number;
  height?: string | number;
  showBadge?: boolean;
  badgePosition?: "left" | "right";
  badgeLabel?: string;
  style?: React.CSSProperties;
  iframeStyle?: React.CSSProperties;
}

export default function AAdsBanner({ 
  className = "",
  adId = "2461867",
  height = "50px",
  showBadge = false,
  badgePosition = "right",
  badgeLabel = "Ad",
  style,
  iframeStyle,
}: AAdsBannerProps) {
  const currentAdId = String(adId);
  const justifyClass = badgePosition === "left" ? "justify-start" : "justify-end";
  const formattedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div className={`w-full flex flex-col items-center justify-center my-1.5 px-2 ${className}`}>
      {/* Small subtle "Ad" mention (hidden by default) */}
      {showBadge && (
        <div className="w-full max-w-[340px] flex flex-col mb-1">
          <div className={`w-full flex items-center ${justifyClass} px-1 gap-1`}>
            <span className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-70"></span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted)]/70 select-none">
              {badgeLabel}
            </span>
          </div>
        </div>
      )}

      {/* A-Ads Frame Container */}
      <div 
        id="frame"
        style={{ 
          width: "100%", 
          margin: "auto", 
          position: "relative",
          ...style 
        }}
        className="flex items-center justify-center"
      >
        <iframe
          data-aa={currentAdId}
          src={`https://acceptable.a-ads.com/${currentAdId}/?size=Adaptive`}
          style={{
            border: 0,
            padding: 0,
            width: "70%",
            minWidth: "280px",
            maxWidth: "100%",
            height: formattedHeight,
            maxHeight: formattedHeight,
            minHeight: "45px",
            overflow: "hidden",
            display: "block",
            margin: "auto",
            ...iframeStyle,
          }}
          title="Advertisement"
          scrolling="no"
        />
      </div>
    </div>
  );
}
