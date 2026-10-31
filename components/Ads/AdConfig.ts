"use client";

import { useState, useEffect } from "react";

export const ADSTERRA_CONFIG = {
  // Master switch for all ads. Helpful for local development or debugging.
  enableAds: true,

  // Format toggles: keep banner ads active, disable popups / social bar / popunder
  enableBanners: true,
  enableSocialBar: false,
  enablePopunder: false,
  showAdBadge: true,
  adBadgeText: "Ad",

  banner320x50Key: "183ee4e45520fb7aa8e1d934a0970c31",
  banner300x250Key: "12769ff4f11c1254fd7310aea93f838d",

  nativeBanner: {
    enabled: true,
    id: "c755433b5487dae7313fbaa97a482b40",
    src: "https://pl29207483.effectivecpmnetwork.com/c755433b5487dae7313fbaa97a482b40/invoke.js",
  },
  
  socialBar: {
    enabled: false,
    src: "https://pl29247592.effectivecpmnetwork.com/a5/bb/66/a5bb66c93c9892d321190ff4ef0081a4.js",
  },
  
  popunder: {
    enabled: false,
    src: "https://pl29813171.effectivecpmnetwork.com/22/23/95/2223956ef92dbcb14085fcaa81bc9718.js",
  },
  
  smartLink: {
    enabled: true,
    url: "https://www.effectivecpmnetwork.com/hufhc5xjdq?key=061e505a28e2947339287dabe62e6175",
  }
};

export type AdConfig = typeof ADSTERRA_CONFIG;

let cachedLiveConfig: any = null;
let activeFetchPromise: Promise<any> | null = null;

function mergeConfig(prev: AdConfig, d: any): AdConfig {
  return {
    ...prev,
    enableAds: d.enableAds !== false,
    enableBanners: d.enableBanners !== false,
    enableSocialBar: d.enableSocialBar === true,
    enablePopunder: d.enablePopunder === true,
    showAdBadge: d.showAdBadge !== false,
    adBadgeText: d.adBadgeText || prev.adBadgeText,
    banner320x50Key: d.banner320x50Key || prev.banner320x50Key,
    banner300x250Key: d.banner300x250Key || prev.banner300x250Key,
    nativeBanner: {
      ...prev.nativeBanner,
      id: d.nativeBanner?.id || prev.nativeBanner.id,
      src: d.nativeBanner?.src || prev.nativeBanner.src,
    },
    socialBar: {
      ...prev.socialBar,
      src: d.socialBar?.src || prev.socialBar.src,
    },
    popunder: {
      ...prev.popunder,
      src: d.popunder?.src || prev.popunder.src,
    },
    smartLink: {
      ...prev.smartLink,
      url: d.smartLink?.url || prev.smartLink.url,
    },
  };
}

async function getLiveAdsConfig(): Promise<any> {
  if (cachedLiveConfig) return cachedLiveConfig;
  if (activeFetchPromise) return activeFetchPromise;

  activeFetchPromise = fetch("/api/ads-config", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((json) => {
      if (json?.success && json?.data) {
        cachedLiveConfig = json.data;
        return json.data;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      activeFetchPromise = null;
    });

  return activeFetchPromise;
}

/**
 * Hook that provides real-time ad configuration from database with instant fallback to ADSTERRA_CONFIG.
 */
export function useDynamicAdConfig(): AdConfig {
  const [config, setConfig] = useState<AdConfig>(() => {
    if (cachedLiveConfig) {
      return mergeConfig(ADSTERRA_CONFIG, cachedLiveConfig);
    }
    return ADSTERRA_CONFIG;
  });

  useEffect(() => {
    let isMounted = true;
    getLiveAdsConfig().then((d) => {
      if (isMounted && d) {
        setConfig((prev: AdConfig) => mergeConfig(prev, d));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return config;
}
