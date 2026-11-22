import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy, Sell & Rent Verified Game IDs - MLBB ID Marketplace | mlbbtopup.in",
  description: "Browse verified Mobile Legends (MLBB) and game accounts for sale and rent. High collector level, rare skins, global titles, and 100% verified ownership on mlbbtopup.in.",
  keywords: [
    "buy mlbb account india",
    "mlbb id for sale",
    "rent mlbb account",
    "cheap mlbb account buy",
    "verified game id marketplace",
    "mlbb mythic account buy",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/marketplace",
  },
  openGraph: {
    title: "Buy, Sell & Rent Verified Game IDs | mlbbtopup.in",
    description: "Browse verified MLBB and gaming accounts for sale and rent.",
    url: "https://mlbbtopup.in/marketplace",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [{ url: "https://mlbbtopup.in/logoBB.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy, Sell & Rent Verified Game IDs",
    description: "Browse verified MLBB and gaming accounts for sale and rent.",
    images: ["https://mlbbtopup.in/logoBB.png"],
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
