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

/* ================= GET: Single Trade ID by _id or id or slug ================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const authCheck = requireAdminOrOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { id } = await params;
    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id }
      : { $or: [{ id: id }, { slug: id }] };

    const item = await TradeId.findOne(query);

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Trade ID not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error("GET /api/admin/trade-ids/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

/* ================= PATCH / PUT: Update Trade ID details, Stock, or Rent ================= */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const authCheck = requireAdminOrOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id }
      : { $or: [{ id: id }, { slug: id }] };

    const existing = await TradeId.findOne(query);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Trade ID not found" },
        { status: 404 }
      );
    }

    // Check if updating unique fields like slug or ID
    if (body.slug && body.slug.toLowerCase() !== existing.slug) {
      const duplicateSlug = await TradeId.findOne({
        slug: body.slug.toLowerCase(),
        _id: { $ne: existing._id },
      });
      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, message: "Another account already uses this slug" },
          { status: 409 }
        );
      }
      existing.slug = body.slug.toLowerCase().trim();
    }

    if (body.id && body.id !== existing.id) {
      const duplicateId = await TradeId.findOne({
        id: body.id.trim(),
        _id: { $ne: existing._id },
      });
      if (duplicateId) {
        return NextResponse.json(
          { success: false, message: "Another account already uses this ID code" },
          { status: 409 }
        );
      }
      existing.id = body.id.trim();
    }

    // Update stockStatus
    if (body.stockStatus !== undefined) {
      existing.stockStatus = body.stockStatus;
      existing.availability = {
        ...existing.availability,
        status: body.stockStatus === "in_stock" ? "available" : "unavailable",
      };
    }

    // Update rent object
    if (body.rent !== undefined) {
      const currentRent = existing.rent || {};
      const newRent = body.rent;

      const updatedRent = {
        available: newRent.available !== undefined ? Boolean(newRent.available) : currentRent.available,
        price: newRent.price !== undefined ? Number(newRent.price) : currentRent.price,
        durationHours: newRent.durationHours !== undefined ? Number(newRent.durationHours) : currentRent.durationHours || 24,
        isRented: newRent.isRented !== undefined ? Boolean(newRent.isRented) : currentRent.isRented,
        rentedAt: newRent.rentedAt !== undefined
          ? (newRent.rentedAt ? new Date(newRent.rentedAt) : null)
          : (newRent.isRented && !currentRent.isRented ? new Date() : currentRent.rentedAt),
        availableAgainAt: newRent.availableAgainAt !== undefined
          ? (newRent.availableAgainAt ? new Date(newRent.availableAgainAt) : null)
          : currentRent.availableAgainAt,
        renterContact: newRent.renterContact !== undefined ? newRent.renterContact : currentRent.renterContact,
        renterNotes: newRent.renterNotes !== undefined ? newRent.renterNotes : currentRent.renterNotes,
        conditions: Array.isArray(newRent.conditions) ? newRent.conditions : currentRent.conditions,
      };

      // If isRented is explicitly set to false, clear availableAgainAt (or keep if user supplied)
      if (newRent.isRented === false && newRent.availableAgainAt === undefined) {
        updatedRent.availableAgainAt = null;
        updatedRent.rentedAt = null;
      }

      existing.rent = updatedRent;
    }

    // Update Basic Info
    if (body.title !== undefined) existing.title = body.title.trim();
    if (body.price !== undefined) existing.price = Number(body.price);
    if (body.currency !== undefined) existing.currency = body.currency;
    if (body.details !== undefined) existing.details = body.details;

    // Update Rank
    if (body.rank !== undefined) {
      existing.rank = {
        current: body.rank.current ?? existing.rank?.current ?? "Mythic",
        highest: body.rank.highest ?? existing.rank?.highest ?? "Mythic Glory",
        stars: body.rank.stars !== undefined ? Number(body.rank.stars) : existing.rank?.stars ?? 0,
      };
    }

    // Update Account
    if (body.account !== undefined) {
      existing.account = {
        game: body.account.game ?? existing.account?.game ?? "Mobile Legends: Bang Bang",
        server: body.account.server ?? existing.account?.server ?? "India",
        accountAgeYears: body.account.accountAgeYears !== undefined ? Number(body.account.accountAgeYears) : existing.account?.accountAgeYears ?? 1,
        loginType: body.account.loginType ?? existing.account?.loginType ?? "Moonton",
        rebindable: body.account.rebindable !== undefined ? Boolean(body.account.rebindable) : existing.account?.rebindable ?? true,
      };
    }

    // Update Game & GameName
    if (body.game !== undefined) {
      existing.game = ["mlbb", "coc", "bgmi", "freefire", "valorant", "other"].includes(body.game)
        ? body.game
        : existing.game || "mlbb";
    }
    if (body.gameName !== undefined) {
      existing.gameName = body.gameName.trim();
    }

    // Update Specs (Bullet Points)
    if (body.specs !== undefined || body.bulletPoints !== undefined) {
      const input = body.specs !== undefined ? body.specs : body.bulletPoints;
      let bulletList: string[] = [];
      if (typeof input === "string") {
        bulletList = input
          .split("\n")
          .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
          .filter(Boolean);
      } else if (Array.isArray(input)) {
        bulletList = input
          .map((item) => {
            if (typeof item === "string") return item.replace(/^[•\-\*]\s*/, "").trim();
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
      existing.specs = bulletList;
      existing.bulletPoints = bulletList;
    }

    // Update Heroes & Skins
    if (body.heroes !== undefined) {
      existing.heroes = {
        total: Number(body.heroes.total ?? body.heroes) || 0,
      };
    }
    if (body.skins !== undefined) {
      existing.skins = {
        total: Number(body.skins.total ?? body.skins) || 0,
      };
    }

    // Update Collection
    if (body.collection !== undefined) {
      existing.collection = {
        tier: body.collection.tier ?? existing.collection?.tier ?? "",
        points: body.collection.points !== undefined ? Number(body.collection.points) : existing.collection?.points ?? 0,
      };
    }

    // Update Tags
    if (body.tags !== undefined) {
      existing.tags = Array.isArray(body.tags)
        ? body.tags.map((t: string) => t.trim()).filter(Boolean)
        : existing.tags;
    }

    // Update Media
    if (body.media !== undefined) {
      const images = Array.isArray(body.media.images) && body.media.images.length > 0
        ? body.media.images.filter(Boolean)
        : existing.media?.images || ["/logo.png"];
      existing.media = {
        images,
        fallbackImage: images[0] || "/logo.png",
      };
    }

    // Update Dealer
    if (body.dealer !== undefined) {
      existing.dealer = {
        owner: body.dealer.owner ?? existing.dealer?.owner ?? "TK",
        contact: {
          whatsapp: body.dealer.contact?.whatsapp ?? existing.dealer?.contact?.whatsapp ?? "",
          telegram: body.dealer.contact?.telegram ?? existing.dealer?.contact?.telegram ?? "",
          instagram: body.dealer.contact?.instagram ?? existing.dealer?.contact?.instagram ?? "",
        },
      };
    }

    // Update Meta
    if (body.meta !== undefined) {
      existing.meta = {
        ...existing.meta,
        ...body.meta,
      };
    }

    await existing.save();

    return NextResponse.json({
      success: true,
      message: "Trade ID updated successfully",
      data: existing,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/trade-ids/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update trade ID" },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;

/* ================= DELETE: Remove Trade ID ================= */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const authCheck = requireAdminOrOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { id } = await params;
    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id }
      : { $or: [{ id: id }, { slug: id }] };

    const deleted = await TradeId.findOneAndDelete(query);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Trade ID not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Account "${deleted.title}" (${deleted.id}) deleted successfully`,
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/trade-ids/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete trade ID" },
      { status: 500 }
    );
  }
}
