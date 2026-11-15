import { NextResponse } from "next/server";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

export async function POST(req) {
  try {
    const { pin } = await req.json();
    const expectedPin = process.env.ADMIN_PIN ;

    if (!pin || String(pin).trim() !== String(expectedPin).trim()) {
      return NextResponse.json(
        { success: false, message: API_MESSAGES.AUTH.WRONG_PIN },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    return NextResponse.json({
      success: true,
      message: API_MESSAGES.AUTH.PIN_VERIFIED,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: API_MESSAGES.SOMETHING_WENT_WRONG },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
