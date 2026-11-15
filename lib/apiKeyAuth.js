import crypto from "crypto";
import { connectDB } from "./mongodb";
import ApiKey from "@/models/ApiKey";
import User from "@/models/User";
import { ensureDailyReset } from "./apiKeyUtils";
import { API_MESSAGES } from "@/lib/apiConfig";

export async function validateApiKey(req) {
    try {
        await connectDB();
        const apiKey = req.headers.get("x-api-key") || req.nextUrl?.searchParams?.get("api_key");

        if (!apiKey) {
            return { success: false, message: API_MESSAGES.AUTH.API_KEY_MISSING };
        }

        const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
        const keyDoc = await ApiKey.findOne({ keyHash, status: "active" });

        if (!keyDoc) {
            return { success: false, message: API_MESSAGES.AUTH.INVALID_API_KEY };
        }

        const user = await User.findById(keyDoc.userId);
        if (!user) {
            return { success: false, message: API_MESSAGES.USER.NOT_FOUND };
        }

        const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        // 1. IP Whitelisting
        if (keyDoc.allowedIps && keyDoc.allowedIps.length > 0) {
            if (!keyDoc.allowedIps.includes(clientIp)) {
                return { success: false, message: API_MESSAGES.AUTH.IP_DENIED };
            }
        }

        // 3. Update last-used metadata (fire-and-forget, non-blocking)
        ApiKey.findByIdAndUpdate(keyDoc._id, {
            lastUsed: new Date(),
            lastUsedIp: clientIp,
        }).exec();

        return {
            success: true,
            user: {
                id: user._id,
                userId: user.userId,
                userType: user.userType,
                wallet: user.wallet,
                name: user.name,
            },
            key: {
                id: keyDoc._id,
                name: keyDoc.name,
            }
        };
    } catch (error) {
        console.error("API Key Validation error:", error);
        return { success: false, message: API_MESSAGES.AUTH.IDENTIFICATION_FAILURE };
    }
}
