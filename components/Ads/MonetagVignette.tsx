"use client";

import Script from "next/script";

export default function MonetagVignette() {
  return (
    <Script
      id="monetag-vignette"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(s){s.dataset.zone='12247417',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
      }}
    />
  );
}
