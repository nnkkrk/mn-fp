import { connectDB } from "@/lib/mongodb";
import AppSettings from "@/models/AppSettings";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

/* ================= AUTH HELPERS ================= */
const requireOwner = (req) => {
    const auth = req.headers.get("authorization");

    if (!auth || !auth.startsWith("Bearer ")) {
        return { error: "Unauthorized", status: 401 };
    }

    try {
        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.userType !== "owner") {
            return { error: "Forbidden", status: 403 };
        }

        return { decoded };
    } catch {
        return { error: "Invalid token", status: 401 };
    }
};

/* ================= GET SETTINGS ================= */
export async function GET(req) {
    try {
        await connectDB();

        const authCheck = requireOwner(req);
        if (authCheck.error) {
            return NextResponse.json(
                { success: false, message: authCheck.error },
                { status: authCheck.status }
            );
        }

        let settings = await AppSettings.findOne({});
        if (!settings) {
            settings = await AppSettings.create({ maintenanceMode: false });
        }

        return NextResponse.json({
            success: true,
            data: settings,
        });
    } catch (err) {
        console.error("GET settings error:", err);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

/* ================= UPDATE SETTINGS ================= */
export async function PATCH(req) {
    try {
        await connectDB();

        const authCheck = requireOwner(req);
        if (authCheck.error) {
            return NextResponse.json(
                { success: false, message: authCheck.error },
                { status: authCheck.status }
            );
        }

        const body = await req.json();
        const { maintenanceMode, topupProvider, ordersDisabled } = body;

        let settings = await AppSettings.findOne({});
        if (!settings) {
            settings = new AppSettings({ maintenanceMode: false, topupProvider: "1game", ordersDisabled: false });
        }

        if (typeof maintenanceMode === "boolean") {
            settings.maintenanceMode = maintenanceMode;
        }

        if (typeof ordersDisabled === "boolean") {
            settings.ordersDisabled = ordersDisabled;
        }

        if (typeof body.showTopNoticeBanner === "boolean") settings.showTopNoticeBanner = body.showTopNoticeBanner;
        if (typeof body.showHomeEarnPromotion === "boolean") settings.showHomeEarnPromotion = body.showHomeEarnPromotion;
        if (typeof body.showTradeMarketplaceBanner === "boolean") settings.showTradeMarketplaceBanner = body.showTradeMarketplaceBanner;
        if (typeof body.showCustomWebBanner === "boolean") settings.showCustomWebBanner = body.showCustomWebBanner;
        if (typeof body.showGamesWebBanner === "boolean") settings.showGamesWebBanner = body.showGamesWebBanner;
        if (typeof body.showGiveawayBanner === "boolean") settings.showGiveawayBanner = body.showGiveawayBanner;
        if (typeof body.showTelegramPopup === "boolean") settings.showTelegramPopup = body.showTelegramPopup;
        if (typeof body.showWhatsappPopup === "boolean") settings.showWhatsappPopup = body.showWhatsappPopup;
        if (typeof body.showGamesPopup === "boolean") settings.set('showGamesPopup', body.showGamesPopup, { strict: false });
        if (typeof body.showJoinUsPopup === "boolean") settings.showJoinUsPopup = body.showJoinUsPopup;
        if (typeof body.showGameBannerCarousel === "boolean") settings.showGameBannerCarousel = body.showGameBannerCarousel;
        if (typeof body.showStorySlider === "boolean") settings.showStorySlider = body.showStorySlider;
        if (typeof body.showBattleRoyaleSection === "boolean") settings.showBattleRoyaleSection = body.showBattleRoyaleSection;
        if (typeof body.showFlashSale === "boolean") settings.showFlashSale = body.showFlashSale;
        if (typeof body.showHomeQuickActions === "boolean") settings.showHomeQuickActions = body.showHomeQuickActions;
        if (typeof body.showBottomNav === "boolean") settings.showBottomNav = body.showBottomNav;
        if (typeof body.showPwaInstallBanner === "boolean") settings.showPwaInstallBanner = body.showPwaInstallBanner;
        if (typeof body.showPlayStoreBanner === "boolean") settings.showPlayStoreBanner = body.showPlayStoreBanner;
        if (typeof body.playStoreUrl === "string") settings.playStoreUrl = body.playStoreUrl;
        if (typeof body.playStoreAppName === "string") settings.playStoreAppName = body.playStoreAppName;
        if (typeof body.playStoreAppSubtext === "string") settings.playStoreAppSubtext = body.playStoreAppSubtext;

        if (Array.isArray(body.featuredStoryItems)) {
            settings.featuredStoryItems = body.featuredStoryItems
                .filter((item) => item && item.gameSlug && item.itemSlug && item.itemName)
                .map((item) => ({
                    gameSlug: String(item.gameSlug),
                    gameName: String(item.gameName || ""),
                    itemSlug: String(item.itemSlug),
                    itemName: String(item.itemName),
                    sellingPrice: Number(item.sellingPrice) || 0,
                    dummyPrice: Number(item.dummyPrice) || 0,
                    image: String(item.image || ""),
                }));
        }

        if (topupProvider && ["1game", "bluebuff"].includes(topupProvider)) {
            settings.topupProvider = topupProvider;
        }

        await settings.save();
        revalidateTag("app-settings");
        revalidatePath("/", "layout");

        return NextResponse.json({
            success: true,
            message: "Settings updated successfully",
            data: settings,
        });
    } catch (err) {
        console.error("PATCH settings error:", err);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
