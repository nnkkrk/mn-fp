import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import UsdtDeposit from "@/models/UsdtDeposit";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

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

        const { depositId, txHash } = await req.json();

        if (!depositId || !txHash) {
            return NextResponse.json({ success: false, message: API_MESSAGES.WALLET.DEPOSIT_TX_REQUIRED }, { status: HTTP_STATUS.BAD_REQUEST });
        }

        // Basic tx hash format check
        const cleanHash = txHash.trim();
        if (cleanHash.length < 40) {
            return NextResponse.json({ success: false, message: API_MESSAGES.WALLET.INVALID_HASH }, { status: HTTP_STATUS.BAD_REQUEST });
        }

        const deposit = await UsdtDeposit.findOne({ depositId });
        if (!deposit) {
            return NextResponse.json({ success: false, message: API_MESSAGES.WALLET.DEPOSIT_NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND });
        }

        const now = new Date();
        const expiresAt = new Date(deposit.expiresAt);

        if (deposit.status === "waiting" && now > expiresAt) {
            deposit.status = "expired";
            await deposit.save();
        }

        if (deposit.status === "confirmed") {
            return NextResponse.json({ success: true, message: API_MESSAGES.WALLET.DEPOSIT_CONFIRMED });
        }

        if (deposit.status === "failed" || deposit.status === "expired") {
            return NextResponse.json({ success: false, message: `Deposit is ${deposit.status}. Please create a new deposit.` });
        }

        // Check for duplicate txHash
        const existing = await UsdtDeposit.findOne({ txHash: cleanHash, _id: { $ne: deposit._id } });
        if (existing) {
            return NextResponse.json({ success: false, message: API_MESSAGES.WALLET.HASH_ALREADY_SUBMITTED }, { status: HTTP_STATUS.BAD_REQUEST });
        }

        // Update deposit with tx hash
        deposit.txHash = cleanHash;
        deposit.status = "submitted";
        await deposit.save();

        return NextResponse.json({
            success: true,
            message: "Transaction hash submitted. Your deposit will be verified and credited within 10-30 minutes.",
            depositId: deposit.depositId,
            status: "submitted",
        });

    } catch (err) {
        console.error("USDT submit-hash error:", err);
        return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
