import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FlashSaleConfig from "@/models/FlashSaleConfig";
import PricingConfig from "@/models/PricingConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const DEFAULT_FLASH_SALE_ITEMS = [
  {
    id: "fs_1",
    name: "Weekly Pass",
    game: "MLBB",
    image: "/game-assets/weeklypass.webp",
    price: "₹149",
    originalPrice: "₹170",
    slug: "mobile-legends114?type=weekly-pass",
    badge: "Hot",
    enabled: true,
  },
  {
    id: "fs_2",
    name: "Blessing Welkin",
    game: "Genshin",
    image: "/game-assets/genshin.webp",
    price: "₹405",
    originalPrice: "₹450",
    slug: "genshin-impact265",
    badge: "Sale",
    enabled: true,
  },
  {
    id: "fs_3",
    name: "Starlight Card",
    game: "MLBB",
    image: "/game-assets/starkight.webp",
    price: "₹240",
    originalPrice: "₹299",
    slug: "starlight-card-manual",
    badge: "New",
    enabled: true,
  },
  {
    id: "fs_4",
    name: "Weekly Bundle",
    game: "MLBB",
    image: "/game-assets/weekly-monthly-bundle.webp",
    price: "₹84",
    originalPrice: "₹100",
    slug: "weeklymonthly-bundle646",
    badge: "Value",
    enabled: true,
  },
  {
    id: "fs_5",
    name: "Weekly Card plus",
    game: "HOK",
    image: "/game-assets/hok.webp",
    price: "₹385",
    originalPrice: "₹450",
    slug: "honor-of-kings57",
    badge: "Best",
    enabled: true,
  },
];

export async function GET() {
  try {
    await connectDB();

    let config = await FlashSaleConfig.findOne({}).lean() as any;

    if (!config) {
      const defaultEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      config = await FlashSaleConfig.create({
        title: "Flash Sale",
        enabled: true,
        endTime: defaultEndTime,
        items: DEFAULT_FLASH_SALE_ITEMS,
      });
    }

    const activeItems = (config.items || [])
      .filter((item: any) => item.enabled !== false)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        game: item.game,
        image: item.image,
        price: item.price,
        originalPrice: item.originalPrice,
        slug: item.slug,
        badge: item.badge || "Hot",
      }));

    return NextResponse.json({
      success: true,
      data: {
        title: config.title || "Flash Sale",
        enabled: config.enabled !== false,
        endTime: config.endTime || new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        items: activeItems,
      },
    });
  } catch (error) {
    console.error("[api/flash-sale] GET Error:", error);
    return NextResponse.json({
      success: true,
      data: {
        title: "Flash Sale",
        enabled: true,
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        items: DEFAULT_FLASH_SALE_ITEMS,
      },
    });
  }
}
