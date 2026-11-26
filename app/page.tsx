// app/page.tsx
import dynamic from "next/dynamic";
import HomeSection from "@/components/Home/Home";
import { getAppSettings } from "@/lib/settings";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/models/Banner";
import Script from "next/script";

const TelegramQRPopup = dynamic(() => import("@/components/TelegramQRPopup"));
const WhatsAppCommunityPopup = dynamic(() => import("@/components/WhatsAppQRPopup"));
const GamesPopup = dynamic(() => import("@/components/GamesPopup"));
const JoinUsPopup = dynamic(() => import("@/components/JoinUsPopup"));

export const metadata = {
  title: "Cheapest MLBB Diamond Top Up India | mlbbtopup.in",
  description:
    "Safe & instant MLBB diamond top up in India. Cheapest rates for Weekly Pass, Starlight & skins. Secure UPI/Paytm payments with 5-minute delivery. Trusted by thousands.",
  alternates: {
    canonical: "https://mlbbtopup.in",
  },
  verification: {
    google: "9-O7krLq_lN5tqYm67n0IO8Adb0XqDNpas3gX4PLvj4",
  },
};

async function getGameBanners() {
  try {
    await connectDB();
    const banners = await Banner.find({ isShow: true })
      .sort({ bannerDate: -1 })
      .lean();
    return JSON.parse(JSON.stringify(banners));
  } catch (error) {
    return [];
  }
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MLBB Topup India",
    "url": "https://mlbbtopup.in",
    "logo": "https://mlbbtopup.in/logoBB.png",
    "sameAs": [
      "https://instagram.com/mlbbtopup.in",
      "https://x.com/mlbbtopupin"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MLBB Top Up India",
    "url": "https://mlbbtopup.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://mlbbtopup.in/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Mobile Legends Diamonds",
    "image": "https://mlbbtopup.in/logoBB.png",
    "description": "Buy Mobile Legends diamonds instantly in India. Cheapest rates for Weekly Pass, Starlight, and diamond packages.",
    "brand": {
      "@type": "Brand",
      "name": "Moonton"
    },
    "offers": {
      "@type": "AggregateOffer",
      "url": "https://mlbbtopup.in",
      "priceCurrency": "INR",
      "lowPrice": "14",
      "highPrice": "8000",
      "offerCount": "20",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "12450",
      "reviewCount": "8430"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://mlbbtopup.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "MLBB Top Up",
        "item": "https://mlbbtopup.in/games"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
    {
      "@type": "Question",
      name: "How do I buy MLBB diamonds in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Visit mlbbtopup.in, select your diamond pack, enter your MLBB Player ID and Zone ID, choose UPI/PhonePe/Google Pay/Paytm, and confirm. Diamonds are delivered within 5 minutes — no Moonton login required.",
      },
    },
    {
      "@type": "Question",
      name: "Is mlbbtopup.in safe and legit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. mlbbtopup.in is a trusted MLBB diamond top-up site used by thousands of Indian players. We use secure UPI payment gateways and top up via Moonton's official API. Your account credentials are never required.",
      },
    },
    {
      "@type": "Question",
      name: "What is the cheapest way to buy MLBB diamonds in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "mlbbtopup.in offers the lowest diamond prices in India — often 10–20% cheaper than Codashop or the in-game store. The Weekly Diamond Pass starting at ₹89 is the best value for regular players.",
      },
    },
    {
      "@type": "Question",
      name: "How fast is MLBB diamond delivery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Diamond delivery is instant — typically within 1 to 5 minutes of successful payment. Our automated delivery system runs 24×7.",
      },
    },
    {
      "@type": "Question",
      name: "Which payment methods are supported for MLBB top up?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We support all major Indian payment methods: UPI (any VPA/QR), PhonePe, Google Pay, Paytm, and bank transfers. No credit card needed.",
      },
    },
    {
      "@type": "Question",
      name: "Is the MLBB Weekly Diamond Pass worth it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Weekly Diamond Pass gives 100 diamonds immediately plus 20 diamonds/day for 7 days — 240 diamonds total. At ₹89 on mlbbtopup.in, that's under ₹0.37 per diamond — the highest-value MLBB purchase for regular players.",
      },
    },
  ],
  }
];

export default async function Page() {
  const [settings, initialBanners] = await Promise.all([
    getAppSettings(),
    getGameBanners()
  ]);

  return (
    <main>
      <Script
        id="structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {settings.showTelegramPopup && <TelegramQRPopup />}
      {settings.showWhatsappPopup && <WhatsAppCommunityPopup />}
      {settings.showGamesPopup && <GamesPopup />}
      {settings.showJoinUsPopup && <JoinUsPopup />}

      <HomeSection 
        initialBanners={initialBanners}
        bannerSettings={{
          showTopNoticeBanner: settings.showTopNoticeBanner,
          showHomeEarnPromotion: settings.showHomeEarnPromotion,
          showTradeMarketplaceBanner: settings.showTradeMarketplaceBanner,
          showCustomWebBanner: settings.showCustomWebBanner,
          showGamesWebBanner: settings.showGamesWebBanner,
          showGiveawayBanner: settings.showGiveawayBanner,
          showGameBannerCarousel: settings.showGameBannerCarousel,
          showStorySlider: settings.showStorySlider,
          featuredStoryItems: settings.featuredStoryItems,
          showBattleRoyaleSection: settings.showBattleRoyaleSection,
          showFlashSale: settings.showFlashSale,
          showHomeQuickActions: settings.showHomeQuickActions,
          showEventsSection: settings.showEventsSection
        }} 
      />
    </main>
  );
}

