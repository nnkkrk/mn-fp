import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ApiKey from "@/models/ApiKey";
import { validateApiKey } from "@/lib/apiKeyAuth";
import { ensureDailyReset } from "@/lib/apiKeyUtils";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

export async function GET(req) {
    try {
        const auth = await validateApiKey(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, message: auth.message }, { status: HTTP_STATUS.UNAUTHORIZED });
        }

        await connectDB();
        const user = await User.findById(auth.user.id);

        // API Spend Limit Calculation
        const keyDocRaw = await ApiKey.findById(auth.key.id);
        const keyDoc = await ensureDailyReset(keyDocRaw);
        const usedToday = keyDoc?.usedToday || 0;
        const dailyLimit = keyDoc?.dailyLimit || 0;

        return NextResponse.json({
            success: true,
            wallet: user.wallet,
            userType: user.userType,
            name: user.name,
            userId: user.userId,
            usage: {
                usedToday,
                dailyLimit,
                remaining: Math.max(0, dailyLimit - usedToday),
                isLimitReached: usedToday >= dailyLimit
            }
        });

    } catch (error) {
        console.error("Balance API Error:", error);
        return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
