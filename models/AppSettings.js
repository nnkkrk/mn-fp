import mongoose from "mongoose";

const AppSettingsSchema = new mongoose.Schema(
    {
        maintenanceMode: {
            type: Boolean,
            default: false,
        },
        ordersDisabled: {
            type: Boolean,
            default: false,
        },
        topupProvider: {
            type: String,
            enum: ["1game", "bluebuff"],
            default: "1game",
        },
        showTopNoticeBanner: { type: Boolean, default: false },
        showHomeEarnPromotion: { type: Boolean, default: false },
        showTradeMarketplaceBanner: { type: Boolean, default: false },
        showCustomWebBanner: { type: Boolean, default: false },
        showGamesWebBanner: { type: Boolean, default: false },
        showGiveawayBanner: { type: Boolean, default: true },
        showTelegramPopup: { type: Boolean, default: false },
        showWhatsappPopup: { type: Boolean, default: false },
        showGamesPopup: { type: Boolean, default: false },
        showJoinUsPopup: { type: Boolean, default: false },
        showGameBannerCarousel: { type: Boolean, default: true },
        showStorySlider: { type: Boolean, default: true },
        showBattleRoyaleSection: { type: Boolean, default: true },
        showFlashSale: { type: Boolean, default: true },
        showHomeQuickActions: { type: Boolean, default: true },
        showEventsSection: { type: Boolean, default: true },
        showBottomNav: { type: Boolean, default: true },
        showPwaInstallBanner: { type: Boolean, default: true },
        showPlayStoreBanner: { type: Boolean, default: true },
        playStoreUrl: { 
            type: String, 
            default: "https://play.google.com/store/apps/details?id=in.bluebuff.games" 
        },
        playStoreAppName: { 
            type: String, 
            default: "Bluebuff Games" 
        },
        playStoreAppSubtext: { 
            type: String, 
            default: "Google Play App" 
        },
        featuredStoryItems: [
            {
                gameSlug: { type: String, required: true },
                gameName: { type: String, default: "" },
                itemSlug: { type: String, required: true },
                itemName: { type: String, required: true },
                sellingPrice: { type: Number, default: 0 },
                dummyPrice: { type: Number, default: 0 },
                image: { type: String, default: "" },
            },
        ],
        // We can add more settings here in the future
    },
    { timestamps: true }
);

// We only want one settings document
if (mongoose.models.AppSettings) {
    delete mongoose.models.AppSettings;
}

export default mongoose.model("AppSettings", AppSettingsSchema);
