import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import UsdtDeposit from "@/models/UsdtDeposit";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

// Conversion rate: 1 USDT = 98 coins (wallet balance points)
const USDT_TO_COINS = 98;

export async function POST(req: Request) {
    try {
        await connectDB();

        // ============ AUTH ============
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: API_MESSAGES.AUTH.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ success: false, message: API_MESSAGES.AUTH.INVALID_TOKEN }, { status: HTTP_STATUS.UNAUTHORIZED });
        }

        // ============ GET USER ============
        let user = await User.findById(decoded.userId);
        if (!user) user = await User.findOne({ userId: decoded.userId });
        if (!user) {
            return NextResponse.json({ success: false, message: API_MESSAGES.USER.NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND });
        }

        // ============ BODY ============
        const { usdtAmount, network = "BEP20" } = await req.json();

        if (!usdtAmount || isNaN(Number(usdtAmount)) || Number(usdtAmount) <= 0) {
            return NextResponse.json({ success: false, message: API_MESSAGES.WALLET.INVALID_AMOUNT }, { status: HTTP_STATUS.BAD_REQUEST });
        }

        const numUsdt = Math.round(Number(usdtAmount) * 100) / 100; // round to 2 decimals
        if (numUsdt < 1) {
            return NextResponse.json({ success: false, message: API_MESSAGES.WALLET.MIN_DEPOSIT(1) }, { status: HTTP_STATUS.BAD_REQUEST });
        }

        if (network !== "BEP20") {
            return NextResponse.json({ success: false, message: API_MESSAGES.WALLET.INVALID_NETWORK }, { status: HTTP_STATUS.BAD_REQUEST });
        }

        // ============ WALLET ADDRESS ============
        const depositAddress = process.env.USDT_BEP20_ADDRESS!;

        if (!depositAddress) {
            return NextResponse.json({
                success: false,
                message: `USDT ${network} address not configured. Please contact support.`,
            }, { status: HTTP_STATUS.SERVICE_UNAVAILABLE });
        }

        const coinsToCredit = Math.floor(numUsdt * USDT_TO_COINS);

        // ============ CREATE DEPOSIT ============
        const depositId = `USDT${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const deposit = await UsdtDeposit.create({
            depositId,
            userId: user.userId,
            userObjectId: user._id,
            usdtAmount: numUsdt,
            coinsToCredit,
            network,
            depositAddress,
            status: "waiting",
        });

        return NextResponse.json({
            success: true,
            depositId: deposit.depositId,
            depositAddress,
            network,
            usdtAmount: numUsdt,
            coinsToCredit,
            rate: `1 USDT = ${USDT_TO_COINS} Coins`,
            expiresAt: deposit.expiresAt,
        });

    } catch (err) {
        console.error("USDT initiate error:", err);
        return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
