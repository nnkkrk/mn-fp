import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TradeId from "@/models/TradeId";
import jwt from "jsonwebtoken";

/* ================= AUTH HELPER ================= */
const requireAdminOrOwner = (req: NextRequest) => {
  const auth = req.headers.get("authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    return { error: "Unauthorized: Missing token", status: 401 };
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    if (!["owner", "admin"].includes(decoded.userType)) {
      return { error: "Forbidden: Owner or Admin access required", status: 403 };
    }

    return { decoded };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

function generateSlug(text: string, id: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const idSuffix = id.toLowerCase().replace(/[^\w-]/g, "");
  return base ? `${base}-${idSuffix}` : `id-${idSuffix}`;
}

function normalizeBulletSpecs(specsInput: any): string[] {
  if (!specsInput) return [];
  if (typeof specsInput === "string") {
    return specsInput
      .split("\n")
      .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);
  }
  if (Array.isArray(specsInput)) {
    return specsInput
      .map((item) => {
        if (typeof item === "string") {
          return item.replace(/^[•\-\*]\s*/, "").trim();
        }
        if (item && typeof item === "object") {
          const l = item.label || "";
          const v = item.value || "";
          const s = item.subtext ? ` (${item.subtext})` : "";
          if (l && v) return `${l}: ${v}${s}`;
          return v || l;
        }
        return "";
      })
      .filter(Boolean);
  }
  return [];
}

/* ================= GET: Fetch All Trade IDs (Admin) ================= */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authCheck = requireAdminOrOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const stockStatus = searchParams.get("stockStatus")?.trim();
    const game = searchParams.get("game")?.trim();
    const rentOnly = searchParams.get("rentOnly") === "true";

    const query: any = {};

    if (stockStatus && stockStatus !== "all") {
      query.stockStatus = stockStatus;
    }

    if (game && game !== "all") {
      query.game = game;
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

    const items = await TradeId.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error: any) {
    console.error("GET /api/admin/trade-ids error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch trade IDs" },
      { status: 500 }
    );
  }
}

/* ================= POST: Create Trade ID (Admin) ================= */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authCheck = requireAdminOrOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await req.json();

    const {
      id,
      title,
      price,
      slug: customSlug,
      stockStatus = "in_stock",
      currency = "INR",
      game = "mlbb",
      gameName,
      specs = [],
      rent = {},
      rank = {},
      account = {},
      heroes = {},
      skins = {},
      collection = {},
      tags = [],
      details = "",
      dealer = {},
      media = {},
      meta = {},
    } = body;

    if (!id || !title || price === undefined) {
      return NextResponse.json(
        { success: false, message: "ID code, title, and price are required." },
        { status: 400 }
      );
    }

    const finalSlug = (customSlug?.trim() || generateSlug(title, id)).toLowerCase();

    // Check duplicate ID or slug
    const existing = await TradeId.findOne({
      $or: [{ id: id.trim() }, { slug: finalSlug }],
    });

    if (existing) {
      const matchField = existing.id.toLowerCase() === id.trim().toLowerCase() ? "ID code" : "Slug";
      return NextResponse.json(
        { success: false, message: `An account with this ${matchField} already exists (${existing.id}).` },
        { status: 409 }
      );
    }

    const images = Array.isArray(media?.images) && media.images.length > 0
      ? media.images.filter(Boolean)
      : ["/logo.png"];

    const defaultGameNames: Record<string, string> = {
      mlbb: "Mobile Legends: Bang Bang",
      coc: "Clash of Clans",
      bgmi: "Battlegrounds Mobile India (BGMI)",
      freefire: "Free Fire",
      valorant: "Valorant",
      other: "Custom Game",
    };

    const finalGameName = gameName?.trim() || account.game?.trim() || defaultGameNames[game] || "Gaming Account";

    const bulletList = normalizeBulletSpecs(specs.length > 0 ? specs : body.bulletPoints);

    const newTradeId = await TradeId.create({
      id: id.trim(),
      slug: finalSlug,
      title: title.trim(),
      price: Number(price) || 0,
      currency,
      stockStatus,
      game: ["mlbb", "coc", "bgmi", "freefire", "valorant", "other"].includes(game) ? game : "mlbb",
      gameName: finalGameName,
      specs: bulletList,
      bulletPoints: bulletList,
      rent: {
        available: Boolean(rent.available),
        price: Number(rent.price) || 0,
        durationHours: Number(rent.durationHours) || 24,
        isRented: Boolean(rent.isRented),
        rentedAt: rent.rentedAt ? new Date(rent.rentedAt) : (rent.isRented ? new Date() : null),
        availableAgainAt: rent.availableAgainAt ? new Date(rent.availableAgainAt) : null,
        renterContact: rent.renterContact || "",
        renterNotes: rent.renterNotes || "",
        conditions: Array.isArray(rent.conditions) && rent.conditions.length > 0
          ? rent.conditions
          : [
              "No email / Moonton rebind",
              "Login only, no changes allowed",
              "Auto logout after rental period",
            ],
      },
      rank: {
        current: rank.current || "Mythic",
        highest: rank.highest || "Mythic Glory",
        stars: Number(rank.stars) || 0,
      },
      account: {
        game: account.game || "Mobile Legends: Bang Bang",
        server: account.server || "India",
        accountAgeYears: Number(account.accountAgeYears) || 1,
        loginType: account.loginType || "Moonton",
        rebindable: account.rebindable !== false,
      },
      heroes: {
        total: Number(heroes.total ?? heroes) || 0,
      },
      skins: {
        total: Number(skins.total ?? skins) || 0,
      },
      collection: {
        tier: collection.tier || "",
        points: Number(collection.points) || 0,
      },
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
      details: details || "",
      availability: {
        status: stockStatus === "in_stock" ? "available" : "unavailable",
        holdAllowed: true,
      },
      dealer: {
        owner: dealer.owner || "TK",
        contact: {
          whatsapp: dealer.contact?.whatsapp || process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "",
          telegram: dealer.contact?.telegram || "",
          instagram: dealer.contact?.instagram || "",
        },
      },
      media: {
        images,
        fallbackImage: images[0] || "/logo.png",
      },
      meta: {
        verifiedByAdmin: meta.verifiedByAdmin !== false,
        views: 0,
        shares: 0,
        featured: Boolean(meta.featured),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trade ID created successfully",
      data: newTradeId,
    });
  } catch (error: any) {
    console.error("POST /api/admin/trade-ids error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create trade ID" },
      { status: 500 }
    );
  }
}
