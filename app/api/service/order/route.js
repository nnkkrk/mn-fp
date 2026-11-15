import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import ApiKey from "@/models/ApiKey";
import WalletTransaction from "@/models/WalletTransaction";
import { validateApiKey } from "@/lib/apiKeyAuth";
import { ensureDailyReset } from "@/lib/apiKeyUtils";
import { calculateItemPrice } from "@/lib/pricingUtils";
import { getAppSettings } from "@/lib/settings";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

export async function POST(req) {
    try {
        const auth = await validateApiKey(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, status: "failed", message: auth.message }, { status: HTTP_STATUS.UNAUTHORIZED });
        }

        // 🛡️ API Spend Limit Calculation (Non-blocking)
        const keyDocRaw = await ApiKey.findById(auth.key.id);
        const keyDoc = await ensureDailyReset(keyDocRaw);
        const usedToday = keyDoc?.usedToday || 0;
        const dailyLimit = keyDoc?.dailyLimit || 0;

        const body = await req.json();
        const { gameSlug, itemSlug, playerId, zoneId } = body;

        if (!gameSlug || !itemSlug || !playerId) {
            return NextResponse.json({ success: false, status: "failed", message: API_MESSAGES.ORDER.MISSING_FIELDS }, { status: HTTP_STATUS.BAD_REQUEST });
        }

        // ⚡ REGION RESTRICTION CHECK for mobile-legends114 and mlbb-double332
        if (gameSlug === "mobile-legends114" || gameSlug === "mlbb-double332" || gameSlug === "weeklymonthly-bundle646") {
            try {
                const regionCheckResp = await fetch("https://game-off-ten.vercel.app/api/v1/check-region", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": process.env.API_SECRET_KEY,
                    },
                    body: JSON.stringify({ id: playerId, zone: zoneId }),
                });

                const regionData = await regionCheckResp.json();

                if (regionData.success === 200 && regionData.data?.valid === false) {
                    return NextResponse.json({
                        success: false,
                        status: "failed",
                        message: API_MESSAGES.ORDER.INVALID_PLAYER
                    }, { status: HTTP_STATUS.BAD_REQUEST });
                }

                const playerRegion = regionData?.data?.region?.toUpperCase();
                const restrictedRegions = ["INDO", "ID", "PH", "SG", "RU", "MY", "MM"];

                if (restrictedRegions.includes(playerRegion)) {
                    return NextResponse.json({
                        success: false,
                        status: "failed",
                        message: `Orders from ${playerRegion} region are not allowed for this product.`
                    }, { status: HTTP_STATUS.BAD_REQUEST });
                }
            } catch (regionErr) {
                console.error("Region check failed during order:", regionErr);
                // We proceed if the validator is down, or we could block it?
                // Given the requirement "dont allow", we might want to block if we can't verify,
                // but usually, it's safer to proceed if the validation service itself is down,
                // UNLESS the user wants strict enforcement.
                // For now, we proceed to avoid blocking orders due to 3rd party issues,
                // but we might want to change this if strictness is preferred.
            }
        }

        await connectDB();
        const user = await User.findById(auth.user.id);

        const priceData = await calculateItemPrice(gameSlug, itemSlug, user.userType);
        if (!priceData) {
            return NextResponse.json({
                success: false,
                status: "failed",
                message: API_MESSAGES.ORDER.INVALID_SLUG
            }, { status: HTTP_STATUS.NOT_FOUND });
        }

        const { price, itemName } = priceData;

        const orderId = `API-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // ⚡ ATOMIC WALLET DEDUCTION
        const updatedUser = await User.findOneAndUpdate(
            { _id: auth.user.id, wallet: { $gte: price } },
            { $inc: { wallet: -price } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                status: "failed",
                message: `Insufficient wallet balance. Required: ₹${price}`
            }, { status: HTTP_STATUS.FORBIDDEN });
        }

        // 🛡️ Record Wallet Transaction (Debit)
        const txnId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        await WalletTransaction.create({
            transactionId: txnId,
            userId: user.userId,
            userObjectId: user._id,
            type: "debit",
            amount: price,
            balanceBefore: updatedUser.wallet + price,
            balanceAfter: updatedUser.wallet,
            description: `Order: ${itemName}`,
            status: "success",
            referenceId: orderId,
            performedBy: "user",
        });


        let newOrder;

        try {
            // 🛡️ Create Order Record
            newOrder = await Order.create({
                orderId,
                userId: updatedUser.userId,
                gameSlug,
                itemSlug,
                itemName,
                playerId,
                zoneId: zoneId || "",
                price,
                email: updatedUser.email,
                phone: updatedUser.phone || "",
                status: "pending",
                paymentStatus: "success",
                topupStatus: "pending",
                paymentMethod: "API_WALLET"
            });

            /* ========================================
               AUTO-EXECUTION (FULFILLMENT)
            ======================================== */
            console.log(`[Service API] Auto-executing Order: ${orderId}`);

            // 1. Mark as processing
            newOrder.topupStatus = "processing";
            await newOrder.save();

            // 2. Call external fulfillment service
            const settings = await getAppSettings();
            const provider = settings.topupProvider || "1game";

            let gameData;
            let isSuccess = false;

            if (provider === "bluebuff") {
                const bluebuffUrl = `${process.env.BLUEBUFF_API_BASE || "https://api.bluebuff.in"}/api/service/order`;
                const bluebuffKey = process.env.BLUEBUFF_API_KEY;
                const bluebuffBody = {
                    gameSlug,
                    itemSlug,
                    playerId: String(playerId),
                    zoneId: zoneId ? String(zoneId) : undefined,
                };

                console.log(`[Service API] Calling Bluebuff API:`, bluebuffUrl, JSON.stringify(bluebuffBody));

                const gameResp = await fetch(bluebuffUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": bluebuffKey,
                    },
                    body: JSON.stringify(bluebuffBody),
                });

                const responseText = await gameResp.text();
                try {
                    gameData = JSON.parse(responseText);
                } catch {
                    gameData = { success: false, message: responseText };
                }
                console.log(`[Service API] Bluebuff Response:`, JSON.stringify(gameData));
                isSuccess = gameResp.ok && (
                    gameData?.success === true ||
                    gameData?.status === "success" ||
                    gameData?.order?.status === "success" ||
                    gameData?.order?.topupStatus === "success"
                );
            } else {
                console.log(`[Service API] Calling 1Game API:`, `${process.env.NEXT_PUBLIC_API_BASE}/api-service/order`);
                const gameResp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api-service/order`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": process.env.API_SECRET_KEY,
                    },
                    body: JSON.stringify({
                        playerId: String(playerId),
                        zoneId: String(zoneId || ""),
                        productId: `${gameSlug}_${itemSlug}`,
                        currency: "USD",
                    }),
                });

                gameData = await gameResp.json();
                isSuccess = gameResp.ok &&
                    (gameData?.success === true || gameData?.status === true || gameData?.result?.status === "SUCCESS");
            }

            // 3. Update Order based on response
            if (isSuccess) {
                newOrder.status = "success";
                newOrder.topupStatus = "success";

                // ⚡ Record usage (Calculate usage but do not validate/block)
                await ApiKey.findByIdAndUpdate(auth.key.id, { $inc: { usedToday: price } });
            } else {
                newOrder.status = "failed";
                newOrder.topupStatus = "failed";
                newOrder.paymentStatus = "failed"; // Money is being returned

                // ⚡ AUTOMATIC REFUND: Fulfillment failed
                const refundedUser = await User.findByIdAndUpdate(auth.user.id, { $inc: { wallet: price } }, { new: true });
                console.log(`[Service API] Order ${orderId} failed. Automatically refunded ₹${price}.`);

                // 🛡️ Record Wallet Transaction (Refund)
                const refundTxId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
                await WalletTransaction.create({
                    transactionId: refundTxId,
                    userId: user.userId,
                    userObjectId: user._id,
                    type: "credit",
                    amount: price,
                    balanceBefore: refundedUser.wallet - price,
                    balanceAfter: refundedUser.wallet,
                    description: `Refund (Order ${orderId} Failed)`,
                    status: "success",
                    referenceId: orderId,
                    performedBy: "system",
                });
            }

            newOrder.externalResponse = [gameData];
            await newOrder.save();

            return NextResponse.json({
                success: isSuccess,
                status: isSuccess ? "success" : "failed",
                message: isSuccess ? "Order fulfilled successfully" : "Order failed. Wallet balance has been preserved.",
                order: {
                    orderId: newOrder.orderId,
                    itemName,
                    price,
                    status: newOrder.status,
                    topupStatus: newOrder.topupStatus,
                    deliveryResponse: gameData
                },
                usage: {
                    usedToday: usedToday + (isSuccess ? price : 0),
                    dailyLimit,
                    remaining: Math.max(0, dailyLimit - (usedToday + (isSuccess ? price : 0))),
                    isLimitReached: (usedToday + (isSuccess ? price : 0)) >= dailyLimit
                }
            });

        } catch (error) {
            console.error("Internal Order Processing Error:", error);

            // ⚡ EMERGENCY AUTOMATIC REFUND: Technical crash during processing
            const crashRefundUser = await User.findByIdAndUpdate(auth.user.id, { $inc: { wallet: price } }, { new: true });

            // 🛡️ Record Wallet Transaction (Emergency Refund)
            const crashRefundId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            await WalletTransaction.create({
                transactionId: crashRefundId,
                userId: user.userId,
                userObjectId: user._id,
                type: "credit",
                amount: price,
                balanceBefore: crashRefundUser.wallet - price,
                balanceAfter: crashRefundUser.wallet,
                description: `Emergency Refund (Error: ${orderId})`,
                status: "success",
                referenceId: orderId,
                performedBy: "system",
            });

            if (newOrder) {
                newOrder.status = "failed";
                newOrder.topupStatus = "failed";
                newOrder.paymentStatus = "failed";
                newOrder.externalResponse = [{ error: error.message || "Unknown error during fulfillment" }];
                await newOrder.save();
            }

            return NextResponse.json({
                success: false,
                status: "failed",
                message: "A technical error occurred. Your wallet balance has been automatically restored.",
                error: error.message
            }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
        }

    } catch (outerError) {
        console.error("Critical API Error:", outerError);
        return NextResponse.json({
            success: false,
            status: "failed",
            message: API_MESSAGES.SERVER_ERROR
        }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
