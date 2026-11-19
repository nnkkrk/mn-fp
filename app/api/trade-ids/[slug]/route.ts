import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TradeId from "@/models/TradeId";
import staticIds from "@/data/idsOnSell";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const normalizedSlug = slug.toLowerCase().trim();
    let item: any = await TradeId.findOne({
      $or: [{ slug: normalizedSlug }, { id: slug.trim() }],
    }).lean();

    if (!item && staticIds) {
      item = staticIds.find(
        (i: any) =>
          i.slug?.toLowerCase() === normalizedSlug ||
          i.id?.toLowerCase() === normalizedSlug
      );
    }

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    // Process rent expiration
    const now = new Date();
    let isRented = Boolean(item.rent?.isRented);
    let availableAgainAt = item.rent?.availableAgainAt ? new Date(item.rent.availableAgainAt) : null;
    let remainingSeconds = 0;

    if (isRented && availableAgainAt) {
      if (availableAgainAt.getTime() <= now.getTime()) {
        isRented = false;
      } else {
        remainingSeconds = Math.max(0, Math.floor((availableAgainAt.getTime() - now.getTime()) / 1000));
      }
    }

    const processedItem = {
      ...item,
      stockStatus: item.stockStatus || (item.availability?.status === "available" ? "in_stock" : "unstocked"),
      rent: {
        ...item.rent,
        isRented,
        remainingSeconds,
      },
    };

    return NextResponse.json({
      success: true,
      data: processedItem,
    });
  } catch (error: any) {
    console.error("GET /api/trade-ids/[slug] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch account" },
      { status: 500 }
    );
  }
}
