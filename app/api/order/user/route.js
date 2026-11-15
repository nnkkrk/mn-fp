import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

export async function POST(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { success: false, message: API_MESSAGES.AUTH.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return Response.json(
        { success: false, message: API_MESSAGES.AUTH.INVALID_TOKEN },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    /* ================= USER ================= */
    const user = await User.findById(decoded.userId).lean();

    if (!user || !user.email) {
      return Response.json(
        { success: false, message: "User email not found" },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    /* ================= BODY PARAMS ================= */
    const body = await req.json().catch(() => ({}));

    const page = Math.max(1, Number(body.page) || 1);
    const limit = Math.max(1, Number(body.limit) || 10);
    const search = body.search?.trim();
    const status = body.status?.trim();
    const sortBy = body.sortBy?.trim() || "newest"; // "newest", "oldest", "price_high", "price_low"
    const dateRange = body.dateRange?.trim(); // "all", "today", "7days", "30days"
    const paymentMethod = body.paymentMethod?.trim(); // "all", "upi", "wallet", etc.

    const skip = (page - 1) * limit;

    /* ================= EMAIL-ONLY FILTER ================= */
    const userFilter = { email: user.email };

    /* ================= STATUS, SEARCH, DATE & PAYMENT FILTER ================= */
    let andConditions = [userFilter];

    if (status && status !== "all") {
      andConditions.push({ status: { $regex: new RegExp(`^${status}$`, "i") } });
    }

    if (paymentMethod && paymentMethod !== "all") {
      andConditions.push({ paymentMethod: { $regex: new RegExp(`^${paymentMethod}$`, "i") } });
    }

    if (dateRange && dateRange !== "all") {
      const now = new Date();
      if (dateRange === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        andConditions.push({ createdAt: { $gte: startOfDay } });
      } else if (dateRange === "7days") {
        const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        andConditions.push({ createdAt: { $gte: past7Days } });
      } else if (dateRange === "30days") {
        const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        andConditions.push({ createdAt: { $gte: past30Days } });
      }
    }

    if (search) {
      andConditions.push({
        $or: [
          { orderId: { $regex: search, $options: "i" } },
          { gameSlug: { $regex: search, $options: "i" } },
          { itemName: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      });
    }

    const finalFilter = andConditions.length > 1 ? { $and: andConditions } : userFilter;

    /* ================= SORT CONFIG ================= */
    let sortConfig = { createdAt: -1 };
    if (sortBy === "oldest") sortConfig = { createdAt: 1 };
    else if (sortBy === "price_high") sortConfig = { price: -1, createdAt: -1 };
    else if (sortBy === "price_low") sortConfig = { price: 1, createdAt: -1 };

    /* ================= FETCH ORDERS ================= */
    const orders = await Order.find(finalFilter)
      .select("-gatewayResponse -externalResponse")
      .sort(sortConfig)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Order.countDocuments(finalFilter);

    return Response.json(
      {
        success: true,
        orders,
        page,
        limit,
        count: orders.length,
        totalCount,
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return Response.json(
      { success: false, message: API_MESSAGES.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
