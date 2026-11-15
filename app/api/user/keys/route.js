import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ApiKey from "@/models/ApiKey";
import { ensureDailyReset } from "@/lib/apiKeyUtils";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

// Helper to get user from token
async function getUser(req) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findById(decoded.userId);
    } catch (err) {
        return null;
    }
}

export async function GET(req) {
    try {
        await connectDB();
        const user = await getUser(req);

        if (!user) {
            return NextResponse.json({ success: false, message: API_MESSAGES.AUTH.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
        }

        const keys = await ApiKey.find({ userId: user._id }).sort({ createdAt: -1 });

        // ⚡ Ensure each key's daily limit is reset if it's a new day
        const processedKeys = await Promise.all(keys.map(key => ensureDailyReset(key)));

        return NextResponse.json({ success: true, keys: processedKeys });
    } catch (error) {
        console.error("GET Keys Error:", error);
        return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const user = await getUser(req);

        if (!user || (user.userType !== "member" && user.userType !== "owner")) {
            return NextResponse.json({ success: false, message: API_MESSAGES.AUTH.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
        }

        // 🛡️ Limit to 2 keys per user
        const existingKeysCount = await ApiKey.countDocuments({ userId: user._id, status: "active" });
        if (existingKeysCount >= 2) {
            return NextResponse.json({
                success: false,
                message: API_MESSAGES.USER.MAX_KEYS_REACHED
            }, { status: HTTP_STATUS.BAD_REQUEST });
        }

        const { name, allowedIps } = await req.json();
        if (!name) {
            return NextResponse.json({ success: false, message: "Name is required" }, { status: HTTP_STATUS.BAD_REQUEST });
        }

        // Validate allowedIps if provided
        let ipList = [];
        if (allowedIps && Array.isArray(allowedIps)) {
            ipList = allowedIps.filter(ip => typeof ip === 'string' && ip.trim() !== '');
        }

        // Generate a secure API key
        const rawKey = crypto.randomBytes(32).toString("hex");
        const prefix = "TK_"; // TK prefix
        const fullKey = `${prefix}${rawKey}`;

        // Hash the key for secure storage
        const keyHash = crypto.createHash("sha256").update(fullKey).digest("hex");
        const lastFour = fullKey.slice(-4);

        const newKeyDoc = await ApiKey.create({
            userId: user._id,
            name,
            keyHash,
            lastFour,
            allowedIps: ipList
        });

        // Return the full raw key only once
        return NextResponse.json({
            success: true,
            key: {
                ...newKeyDoc.toObject(),
                rawKey: fullKey // 👈 Only sent once here
            }
        });
    } catch (error) {
        console.error("POST Key Error:", error);
        return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
