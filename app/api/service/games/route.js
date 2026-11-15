import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKeyAuth";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

export async function GET(req) {
    try {
        const auth = await validateApiKey(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, message: auth.message }, { status: HTTP_STATUS.UNAUTHORIZED });
        }

        // Fetching games directly from the external source as requested
        const response = await fetch("https://game-off-ten.vercel.app/api/v1/game", {
            method: "GET",
            headers: {
                "x-api-key": process.env.API_SECRET_KEY,
            },
            cache: "no-store",
        });

        const data = await response.json();

        if (!data.success) {
            return NextResponse.json({ success: false, message: "Failed to fetch source games" }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
        }

        // Normalize and send the games list
        const internalGames = data.data.games.map((g) => ({
            name: g.gameName,
            slug: g.gameSlug,
            publisher: g.gameFrom,
            available: g.gameAvailablity
        }));

        // Include manual games supported by mlbbtopup.in orders
        internalGames.push(
            { name: "Starlight Card", slug: "starlight-card-manual", publisher: "Moonton", available: true },
            { name: "BGMI", slug: "bgmi-manual", publisher: "Krafton", available: true }
        );

        return NextResponse.json({
            success: true,
            games: internalGames
        });

    } catch (error) {
        console.error("Service Games API Error:", error);
        return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
