import { connectDB } from "@/lib/mongodb";
import PricingConfig from "@/models/PricingConfig";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/* ================= AUTH HELPERS ================= */
const requireAdminOrOwner = (req) => {
  const auth = req.headers.get("authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!["owner", "admin"].includes(decoded.userType)) {
      return { error: "Forbidden: Owner or Admin access required", status: 403 };
    }

    return { decoded };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

/* =================================================
   GET → Fetch Catalog Stock Statuses
   Returns gameConfigs and overrides for stock checking
   ================================================= */
export async function GET(req) {
  try {
    await connectDB();

    const authCheck = requireAdminOrOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    // Load configs from all roles; user role is the main reference for stock
    const configs = await PricingConfig.find({}).lean();
    const userConfig = configs.find((c) => c.userType === "user") || configs[0] || {};

    const gameConfigs = userConfig.gameConfigs || [];
    const overrides = userConfig.overrides || [];

    return NextResponse.json({
      success: true,
      data: {
        gameConfigs,
        overrides,
      },
    });
  } catch (err) {
    console.error("GET catalog stock error:", err);
    return NextResponse.json(
      { success: false, message: "Server error fetching catalog stock" },
      { status: 500 }
    );
  }
}

/* =================================================
   PATCH → Update Catalog Stock Statuses
   Accepts:
   - gameConfigs: Array of { gameSlug, isOutOfStock }
   - overrides / itemConfigs: Array of { gameSlug, itemSlug, isOutOfStock }
   Updates user, member, admin, and owner records so
   storefront and all role views stay consistent.
   ================================================= */
export async function PATCH(req) {
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
    const { gameConfigs = [], overrides = [], itemConfigs = [] } = body;
    const incomingItems = itemConfigs.length > 0 ? itemConfigs : overrides;

    const targetRoles = ["user", "member", "admin", "owner"];

    for (const role of targetRoles) {
      let pricing = await PricingConfig.findOne({ userType: role });
      if (!pricing) {
        pricing = new PricingConfig({
          userType: role,
          slabs: [{ min: 0, max: 100000, percent: 0 }],
          overrides: [],
          gameConfigs: [],
        });
      }

      /* ===== 1. Merge gameConfigs ===== */
      if (Array.isArray(gameConfigs)) {
        const gameMap = new Map();
        for (const gc of pricing.gameConfigs || []) {
          if (gc.gameSlug) {
            gameMap.set(gc.gameSlug, {
              gameSlug: gc.gameSlug,
              isOutOfStock: !!gc.isOutOfStock,
            });
          }
        }

        for (const gc of gameConfigs) {
          if (gc.gameSlug) {
            gameMap.set(gc.gameSlug, {
              gameSlug: gc.gameSlug,
              isOutOfStock: !!gc.isOutOfStock,
            });
          }
        }
        pricing.gameConfigs = Array.from(gameMap.values());
      }

      /* ===== 2. Merge overrides (Items Stock Status) ===== */
      if (Array.isArray(incomingItems)) {
        const overrideMap = new Map();
        for (const o of pricing.overrides || []) {
          if (o.gameSlug && o.itemSlug) {
            overrideMap.set(`${o.gameSlug}::${o.itemSlug}`, {
              gameSlug: o.gameSlug,
              itemSlug: o.itemSlug,
              fixedPrice: typeof o.fixedPrice === "number" ? o.fixedPrice : 0,
              isEnabled: o.isEnabled ?? false,
              isOutOfStock: !!o.isOutOfStock,
            });
          }
        }

        for (const o of incomingItems) {
          if (o.gameSlug && o.itemSlug) {
            const key = `${o.gameSlug}::${o.itemSlug}`;
            const existing = overrideMap.get(key);
            overrideMap.set(key, {
              gameSlug: o.gameSlug,
              itemSlug: o.itemSlug,
              fixedPrice: typeof o.fixedPrice === "number" ? o.fixedPrice : existing?.fixedPrice ?? 0,
              isEnabled: o.isEnabled ?? existing?.isEnabled ?? false,
              isOutOfStock: !!o.isOutOfStock,
            });
          }
        }
        pricing.overrides = Array.from(overrideMap.values());
      }

      await pricing.save();
    }

    try {
      revalidatePath("/api/games");
      revalidatePath("/");
    } catch {
      // Ignore cache revalidation errors if running outside standard Next.js request context
    }

    // Return the updated user config as representative
    const updatedUserConfig = await PricingConfig.findOne({ userType: "user" }).lean();

    return NextResponse.json({
      success: true,
      message: "Catalog stock updated successfully across all roles",
      data: {
        gameConfigs: updatedUserConfig?.gameConfigs || [],
        overrides: updatedUserConfig?.overrides || [],
      },
    });
  } catch (err) {
    console.error("PATCH catalog stock error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update catalog stock" },
      { status: 500 }
    );
  }
}
