import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import UsdtDeposit from "@/models/UsdtDeposit";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

export async function GET(req: Request) {
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

        const url = new URL(req.url);
        const depositId = url.searchParams.get("depositId");

        if (!depositId) {
            return NextResponse.json({ success: false, message: API_MESSAGES.WALLET.DEPOSIT_ID_REQUIRED }, { status: HTTP_STATUS.BAD_REQUEST });
        }

        const deposit = await UsdtDeposit.findOne({ depositId });
        if (!deposit) {
            return NextResponse.json({ success: false, message: API_MESSAGES.WALLET.DEPOSIT_NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND });
        }

        // Verify ownership
        if (deposit.userId !== decoded.userId && deposit.userObjectId?.toString() !== decoded.userId) {
            return NextResponse.json({ success: false, message: API_MESSAGES.FORBIDDEN }, { status: HTTP_STATUS.FORBIDDEN });
        }

        const now = new Date();
        const expiresAt = new Date(deposit.expiresAt);

        if (deposit.status === "waiting" && now > expiresAt) {
            deposit.status = "expired";
            await deposit.save();
        }

        return NextResponse.json({
            success: true,
            deposit: {
                depositId: deposit.depositId,
                usdtAmount: deposit.usdtAmount,
                coinsToCredit: deposit.coinsToCredit,
                network: deposit.network,
                depositAddress: deposit.depositAddress,
                txHash: deposit.txHash,
                status: deposit.status,
                expiresAt: deposit.expiresAt,
                createdAt: deposit.createdAt,
            },
        });

    } catch (err) {
        console.error("USDT status error:", err);
        return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
