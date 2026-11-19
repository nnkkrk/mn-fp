import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TradeId from "@/models/TradeId";
import staticIds from "@/data/idsOnSell";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const game = searchParams.get("game")?.trim();
    const rentOnly = searchParams.get("rentOnly") === "true";
    const inStockOnly = searchParams.get("inStockOnly") === "true";

    const query: any = {};

    if (game && game !== "all") {
      query.game = game;
    }

    if (inStockOnly) {
      query.stockStatus = "in_stock";
    }

    if (rentOnly) {
      query["rent.available"] = true;
    }

    if (search) {
      query.$or = [
        { id: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { "account.server": { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let items = await TradeId.find(query).sort({ "meta.featured": -1, createdAt: -1 }).lean();

    // If database has no accounts yet and no specific query filters, provide static fallback
    if ((!items || items.length === 0) && !search && !rentOnly && !inStockOnly && staticIds && staticIds.length > 0) {
      items = staticIds.map((item: any) => ({
        ...item,
        stockStatus: item.stockStatus || (item.availability?.status === "available" ? "in_stock" : "unstocked"),
      }));
    }

    // Process rent status: check if rental period has expired
    const now = new Date();
    const processedItems = (items || []).map((item: any) => {
      let isRented = Boolean(item.rent?.isRented);
      let availableAgainAt = item.rent?.availableAgainAt ? new Date(item.rent.availableAgainAt) : null;
      let remainingSeconds = 0;

      if (isRented && availableAgainAt) {
        if (availableAgainAt.getTime() <= now.getTime()) {
          // Rent time passed!
          isRented = false;
        } else {
          remainingSeconds = Math.max(0, Math.floor((availableAgainAt.getTime() - now.getTime()) / 1000));
        }
      }

      return {
        ...item,
        rent: {
          ...item.rent,
          isRented,
          remainingSeconds,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: processedItems,
      count: processedItems.length,
    });
  } catch (error: any) {
    console.error("GET /api/trade-ids error:", error);
    // If error, safely fallback to staticIds
    return NextResponse.json({
      success: true,
      data: staticIds || [],
      count: staticIds?.length || 0,
      fallback: true,
    });
  }
}
