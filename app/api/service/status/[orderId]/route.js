import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { validateApiKey } from "@/lib/apiKeyAuth";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

export async function GET(req, { params }) {
    try {
        const auth = await validateApiKey(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, message: auth.message }, { status: HTTP_STATUS.UNAUTHORIZED });
        }

        const { orderId } = await params;

        await connectDB();

        // Find order and ensure it belongs to the authenticated user
        const order = await Order.findOne({
            orderId: orderId,
            userId: auth.user.userId
        });

        if (!order) {
            return NextResponse.json({ success: false, message: API_MESSAGES.ORDER.ORDER_ACCESS_DENIED }, { status: HTTP_STATUS.NOT_FOUND });
        }

        return NextResponse.json({
            success: true,
            order: {
                orderId: order.orderId,
                gameSlug: order.gameSlug,
                itemName: order.itemName,
                price: order.price,
                status: order.status,
                topupStatus: order.topupStatus,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error("Status API Error:", error);
        return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
