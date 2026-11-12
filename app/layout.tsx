import type { Metadata } from "next";
import Script from "next/script";
import nextDynamic from "next/dynamic";

import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { Poppins } from "next/font/google";

import MaintenanceWrapper from "@/components/Layout/MaintenanceWrapper";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import { getAppSettings } from "@/lib/settings";

const SeasonalEffectManager = nextDynamic(() => import("@/components/Seasonal/SeasonalEffectManager"));
const PWAInstallBanner = nextDynamic(() => import("@/components/Layout/PWAInstallBanner"));
const BottomNav = nextDynamic(() => import("@/components/Layout/BottomNav"));





export const metadata: Metadata = {
  metadataBase: new URL("https://mlbbtopup.in"),
  title: {
    default: "MLBB Top Up India - Buy Cheapest Diamonds Instantly | mlbbtopup.in",
    template: "%s | MLBB Top Up India - mlbbtopup.in",
  },
  description:
    "Safe & instant MLBB diamond top up in India. Cheapest rates for Weekly Pass, Starlight & skins. Secure UPI/Paytm payments with 5-minute delivery. Trusted by thousands of Indian gamers.",
  keywords: [
    "MLBB diamond top up india",
    "buy MLBB diamonds cheap india",
    "mobile legends top up upi",
    "mlbb weekly pass buy india",
    "mlbb diamonds low price",
    "mlbb starlight card buy",
    "cheap mlbb diamonds codashop alternative",
    "instant game topup india",
    "mlbb recharge paytm",
    "bluebuff mlbb"
  ],
  authors: [{ name: "MLBB Top Up India", url: "https://mlbbtopup.in" }],
  creator: "MLBB Top Up India",
  publisher: "Blue Buff",
  applicationName: "MLBB Topup",
  category: "Gaming & Entertainment",
  alternates: {
    canonical: "https://mlbbtopup.in",
  },
  openGraph: {
    title: "MLBB Top Up India - Buy Cheapest Diamonds Instantly | mlbbtopup.in",
    description:
      "Safe & instant MLBB diamond top up in India. Cheapest rates for Weekly Pass, Starlight & skins. Secure UPI/Paytm payments with 5-minute delivery.",
    url: "https://mlbbtopup.in",
    siteName: "mlbbtopup.in",
    images: [
      {
        url: "/logoBB.png",
        width: 800,
        height: 600,
        alt: "mlbbtopup.in - MLBB Topup India",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MLBB Top Up India - Cheap & Fast Diamonds",
    description:
      "Safe & instant MLBB diamond top up in India. Cheapest rates for Weekly Pass, Starlight & skins. Secure UPI/Paytm payments with 5-minute delivery.",
    images: ["/logoBB.png"],
    creator: "@mlbbtopupin",
    site: "@mlbbtopupin",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/pwa-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "9-O7krLq_lN5tqYm67n0IO8Adb0XqDNpas3gX4PLvj4",
  },
};


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAppSettings();

  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="9-O7krLq_lN5tqYm67n0IO8Adb0XqDNpas3gX4PLvj4" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Pre-initialize theme before first paint to prevent layout reflows */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var savedTheme = localStorage.getItem('theme') || 'dark';
            if (savedTheme !== 'light' && savedTheme !== 'dark') {
              savedTheme = 'dark';
            }
            document.documentElement.setAttribute('data-theme', savedTheme);
            var savedAccent = localStorage.getItem('theme-accent');
            var savedAccentHover = localStorage.getItem('theme-accent-hover');
            var savedAccentRgb = localStorage.getItem('theme-accent-rgb');
            if (savedAccent) {
              document.documentElement.style.setProperty('--accent', savedAccent);
            }
            if (savedAccentHover) {
              document.documentElement.style.setProperty('--accent-hover', savedAccentHover);
            }
            if (savedAccentRgb) {
              document.documentElement.style.setProperty('--accent-rgb', savedAccentRgb);
            }
          } catch(e) {}
          window.__pwaPrompt = null;
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__pwaPrompt = e;
          });
        `}} />
      </head>
      <body className="bg-black text-white">
        {/* Structured Data for SEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Blue Buff",
              "url": "https://mlbbtopup.in",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://mlbbtopup.in/games?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <Script
          id="organization-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Blue Buff",
              "url": "https://mlbbtopup.in",
              "logo": "https://mlbbtopup.in/logoBB.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": `+91-${process.env.NEXT_PUBLIC_SUPPORT_PHONE}`,
                "contactType": "customer service",
                "areaServed": "IN",
                "availableLanguage": "en"
              },
              "sameAs": [
                "https://instagram.com/mlbbtopup.in",
                "https://x.com/tk_dev_"
              ]
            })
          }}
        />
        {/* Defer Analytics to Idle / First Interaction to completely eliminate Forced Reflows */}
        <Script id="google-analytics-deferred" strategy="afterInteractive">
          {`
            (function() {
              var loaded = false;
              function initGA() {
                if (loaded) return;
                loaded = true;
                ['scroll', 'touchstart', 'mousemove', 'click', 'keydown'].forEach(function(e) {
                  window.removeEventListener(e, initGA);
                });
                var script = document.createElement('script');
                script.async = true;
                script.src = 'https://www.googletagmanager.com/gtag/js?id=G-CKCKWLGJ9N';
                document.head.appendChild(script);
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', 'G-CKCKWLGJ9N', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              }
              if ('requestIdleCallback' in window) {
                window.requestIdleCallback(function() { setTimeout(initGA, 2500); });
              } else {
                setTimeout(initGA, 3000);
              }
              ['scroll', 'touchstart', 'mousemove', 'click', 'keydown'].forEach(function(e) {
                window.addEventListener(e, initGA, { passive: true, once: true });
              });
            })();
          `}
        </Script>

          <Header />

          <SeasonalEffectManager />

          <MaintenanceWrapper maintenanceMode={settings.maintenanceMode} />
          <main className="pt-14 pb-24 md:pb-0">{children}</main>




          <Footer />
          {settings.showBottomNav !== false && <BottomNav />}
          <PWAInstallBanner 
            showPwa={settings.showPwaInstallBanner}
            showPlayStore={settings.showPlayStoreBanner}
            playStoreUrl={settings.playStoreUrl}
            playStoreAppName={settings.playStoreAppName}
            playStoreAppSubtext={settings.playStoreAppSubtext}
          />
      </body>
    </html>
  );
}


