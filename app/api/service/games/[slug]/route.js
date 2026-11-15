import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKeyAuth";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

export const dynamic = 'force-dynamic';
import { calculateItemPrice } from "@/lib/pricingUtils";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req, { params }) {
    try {
        const { slug } = await params;
        const auth = await validateApiKey(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, message: auth.message }, { status: HTTP_STATUS.UNAUTHORIZED });
        }

        await connectDB();
        const user = await User.findById(auth.user.id);

        // Fetch game details from external source
        const response = await fetch(`https://game-off-ten.vercel.app/api/v1/game/${slug}`, {
            method: "GET",
            headers: {
                "x-api-key": process.env.API_SECRET_KEY,
            },
            cache: "no-store",
        });

        const data = await response.json();

        if (!data.success) {
            return NextResponse.json({ success: false, message: "Game not found" }, { status: HTTP_STATUS.NOT_FOUND });
        }

        // Apply membership pricing to each item so the API user knows what they pay
        const itemsWithPricing = await Promise.all(data.data.itemId.map(async (item) => {
            const pricing = await calculateItemPrice(slug, item.itemSlug, user.userType);
            return {
                ...item,
                sellingPrice: pricing ? pricing.price : item.sellingPrice,
                itemName: pricing ? pricing.itemName : item.itemName
            };
        }));

        return NextResponse.json({
            success: true,
            game: {
                name: data.data.gameName,
                slug: data.data.gameSlug,
                publisher: data.data.gameFrom,
                items: itemsWithPricing.map(i => ({
                    name: i.itemName,
                    slug: i.itemSlug,
                    price: i.sellingPrice,
                    available: i.itemAvailablity
                }))
            }
        });

    } catch (error) {
        console.error("Service Game Details API Error:", error);
        return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
