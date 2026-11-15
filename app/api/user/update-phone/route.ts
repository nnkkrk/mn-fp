import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: API_MESSAGES.AUTH.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      return NextResponse.json({ success: false, message: API_MESSAGES.AUTH.INVALID_TOKEN }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, message: API_MESSAGES.USER.PHONE_REQUIRED }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    await connectDB();
    
    const user = await User.findOneAndUpdate(
      { userId: decoded.userId },
      { phone },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: API_MESSAGES.USER.NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND });
    }

    return NextResponse.json({
      success: true,
      message: API_MESSAGES.USER.PHONE_UPDATED,
      phone: user.phone
    });
  } catch (error: any) {
    console.error("Update Phone Error:", error);
    return NextResponse.json({ success: false, message: API_MESSAGES.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
