import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Blocklist from "@/models/Blocklist";
import User from "@/models/User";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

// Helper to authenticate admin
async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const decoded: any = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET!
    );
    
    await connectDB();
    const user = await User.findOne({ _id: decoded.userId }).lean();
    
    if (!user || ![ "owner"].includes(user.userType)) {
      if (user) {
        // Auto blocklist for unauthorized admin access attempt
        const { autoBlocklist } = await import("@/lib/autoBlocklist");
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        await autoBlocklist("ip", ip, "Unauthorized Admin API Access");
        await autoBlocklist("email", user.email, "Unauthorized Admin API Access");
      }
      return null;
    }
    return { ...decoded, adminUserId: user.userId };
  } catch (err) {
    return null;
  }
}

// GET: List all blocklisted items
export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: API_MESSAGES.FORBIDDEN }, { status: HTTP_STATUS.FORBIDDEN });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    await connectDB();
    
    const query = type ? { type } : {};
    const items = await Blocklist.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error("[admin/blocklist GET] Error:", error);
    return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

// POST: Add a new item to the blocklist
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: API_MESSAGES.FORBIDDEN }, { status: HTTP_STATUS.FORBIDDEN });
    }

    const body = await req.json();
    const { type, value, reason } = body;

    if (!type || !value) {
      return NextResponse.json({ success: false, message: API_MESSAGES.BLOCKLIST.TYPE_VALUE_REQUIRED }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    if (!["ip", "email", "gameId"].includes(type)) {
      return NextResponse.json({ success: false, message: API_MESSAGES.BLOCKLIST.INVALID_TYPE }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    await connectDB();

    // Check if it already exists
    const existing = await Blocklist.findOne({ type, value: value.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ success: false, message: API_MESSAGES.BLOCKLIST.ALREADY_EXISTS }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const newItem = await Blocklist.create({
      type,
      value: type === "gameId" ? value.trim() : value.toLowerCase().trim(),
      reason: reason || "",
      addedBy: admin.adminUserId,
    });

    return NextResponse.json({ success: true, message: API_MESSAGES.BLOCKLIST.ADDED, data: newItem });
  } catch (error: any) {
    console.error("[admin/blocklist POST] Error:", error);
    return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

// DELETE: Remove an item from the blocklist
export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: API_MESSAGES.FORBIDDEN }, { status: HTTP_STATUS.FORBIDDEN });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: API_MESSAGES.BLOCKLIST.ID_REQUIRED }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    await connectDB();
    
    const deleted = await Blocklist.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: API_MESSAGES.BLOCKLIST.ITEM_NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND });
    }

    return NextResponse.json({ success: true, message: API_MESSAGES.BLOCKLIST.REMOVED });
  } catch (error: any) {
    console.error("[admin/blocklist DELETE] Error:", error);
    return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
