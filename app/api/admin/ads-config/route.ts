import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import AdsConfig from "@/models/AdsConfig";
import { DEFAULT_ADS_CONFIG } from "@/lib/adsConfig";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

function checkAdminAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: API_MESSAGES.AUTH.UNAUTHORIZED, status: HTTP_STATUS.UNAUTHORIZED };
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (!["admin", "owner"].includes(decoded.userType)) {
      return { error: "Forbidden: Admin or Owner access required", status: HTTP_STATUS.FORBIDDEN };
    }

    return { decoded };
  } catch {
    return { error: API_MESSAGES.AUTH.INVALID_TOKEN, status: HTTP_STATUS.UNAUTHORIZED };
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const auth = checkAdminAuth(req);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    let config = await AdsConfig.findOne({}).lean() as any;

    if (!config) {
      config = await AdsConfig.create({
        adsterraLink: DEFAULT_ADS_CONFIG.ADSTERRA_LINK,
        defaultRewardCoins: DEFAULT_ADS_CONFIG.REWARD_COINS,
        defaultCooldownMinutes: Math.round(DEFAULT_ADS_CONFIG.COOLDOWN_MS / 60000),
        enabled: DEFAULT_ADS_CONFIG.ENABLED,
        enableBanners: DEFAULT_ADS_CONFIG.ENABLE_BANNERS,
        enableSocialBar: DEFAULT_ADS_CONFIG.ENABLE_SOCIAL_BAR,
        enablePopunder: DEFAULT_ADS_CONFIG.ENABLE_POPUNDER,
        showAdBadge: DEFAULT_ADS_CONFIG.SHOW_AD_BADGE,
        adBadgeText: DEFAULT_ADS_CONFIG.AD_BADGE_TEXT,
        nativeBannerId: DEFAULT_ADS_CONFIG.NATIVE_BANNER_ID,
        nativeBannerSrc: DEFAULT_ADS_CONFIG.NATIVE_BANNER_SRC,
        socialBarSrc: DEFAULT_ADS_CONFIG.SOCIAL_BAR_SRC,
        popunderSrc: DEFAULT_ADS_CONFIG.POPUNDER_SRC,
        banner320x50Key: DEFAULT_ADS_CONFIG.BANNER_320x50_KEY,
        banner300x250Key: DEFAULT_ADS_CONFIG.BANNER_300x250_KEY,
        channels: DEFAULT_ADS_CONFIG.WATCH_EARN_CHANNELS,
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("[api/admin/ads-config] GET Error:", error);
    return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const auth = checkAdminAuth(req);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    let config = await AdsConfig.findOne({});

    if (!config) {
      config = new AdsConfig({
        adsterraLink: DEFAULT_ADS_CONFIG.ADSTERRA_LINK,
        defaultRewardCoins: DEFAULT_ADS_CONFIG.REWARD_COINS,
        defaultCooldownMinutes: Math.round(DEFAULT_ADS_CONFIG.COOLDOWN_MS / 60000),
        enabled: DEFAULT_ADS_CONFIG.ENABLED,
        enableBanners: DEFAULT_ADS_CONFIG.ENABLE_BANNERS,
        enableSocialBar: DEFAULT_ADS_CONFIG.ENABLE_SOCIAL_BAR,
        enablePopunder: DEFAULT_ADS_CONFIG.ENABLE_POPUNDER,
        showAdBadge: DEFAULT_ADS_CONFIG.SHOW_AD_BADGE,
        adBadgeText: DEFAULT_ADS_CONFIG.AD_BADGE_TEXT,
        nativeBannerId: DEFAULT_ADS_CONFIG.NATIVE_BANNER_ID,
        nativeBannerSrc: DEFAULT_ADS_CONFIG.NATIVE_BANNER_SRC,
        socialBarSrc: DEFAULT_ADS_CONFIG.SOCIAL_BAR_SRC,
        popunderSrc: DEFAULT_ADS_CONFIG.POPUNDER_SRC,
        banner320x50Key: DEFAULT_ADS_CONFIG.BANNER_320x50_KEY,
        banner300x250Key: DEFAULT_ADS_CONFIG.BANNER_300x250_KEY,
        channels: DEFAULT_ADS_CONFIG.WATCH_EARN_CHANNELS,
      });
    }

    if (typeof body.adsterraLink === "string") {
      config.adsterraLink = body.adsterraLink.trim();
    }

    if (typeof body.enabled === "boolean") {
      config.enabled = body.enabled;
    }

    // Format toggles
    if (typeof body.enableBanners === "boolean") {
      config.enableBanners = body.enableBanners;
    }

    if (typeof body.enableSocialBar === "boolean") {
      config.enableSocialBar = body.enableSocialBar;
    }

    if (typeof body.enablePopunder === "boolean") {
      config.enablePopunder = body.enablePopunder;
    }

    if (typeof body.showAdBadge === "boolean") {
      config.showAdBadge = body.showAdBadge;
    }

    if (typeof body.adBadgeText === "string") {
      config.adBadgeText = body.adBadgeText.trim();
    }

    // Adsterra keys & scripts
    if (typeof body.nativeBannerId === "string") {
      config.nativeBannerId = body.nativeBannerId.trim();
    }

    if (typeof body.nativeBannerSrc === "string") {
      config.nativeBannerSrc = body.nativeBannerSrc.trim();
    }

    if (typeof body.socialBarSrc === "string") {
      config.socialBarSrc = body.socialBarSrc.trim();
    }

    if (typeof body.popunderSrc === "string") {
      config.popunderSrc = body.popunderSrc.trim();
    }

    if (typeof body.banner320x50Key === "string") {
      config.banner320x50Key = body.banner320x50Key.trim();
    }

    if (typeof body.banner300x250Key === "string") {
      config.banner300x250Key = body.banner300x250Key.trim();
    }

    if (typeof body.defaultRewardCoins === "number" && body.defaultRewardCoins >= 0) {
      config.defaultRewardCoins = body.defaultRewardCoins;
    }

    if (typeof body.defaultCooldownMinutes === "number" && body.defaultCooldownMinutes >= 1) {
      config.defaultCooldownMinutes = body.defaultCooldownMinutes;
    }

    if (Array.isArray(body.channels)) {
      config.channels = body.channels.map((ch: any, idx: number) => {
        const cooldownMinutes = typeof ch.cooldownMinutes === "number" && ch.cooldownMinutes > 0 
          ? ch.cooldownMinutes 
          : Math.max(1, Math.round((ch.cooldownMs || 1500000) / 60000));

        return {
          id: (ch.id || `watch_${idx + 1}`).trim(),
          title: (ch.title || `Channel ${idx + 1}`).trim(),
          link: (ch.link || "").trim(),
          reward: typeof ch.reward === "number" && ch.reward >= 0 ? ch.reward : 1,
          cooldownMs: cooldownMinutes * 60 * 1000,
          enabled: ch.enabled !== false,
        };
      });
    }

    await config.save();

    return NextResponse.json({
      success: true,
      message: "Ads & Monetization settings updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("[api/admin/ads-config] PATCH Error:", error);
    return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
