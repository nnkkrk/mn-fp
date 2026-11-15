import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";
import { HTTP_STATUS, API_MESSAGES } from "@/lib/apiConfig";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: NextRequest) {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("utf8");
}

export async function POST(req: NextRequest) {
  try {
    /* ============ 1. SECURITY: SECRET (OPTIONAL) ============ */
    // If you configure a secret in your payment dashboard webhook URL (e.g. ?secret=xyz), enable this.
    const secret = req.nextUrl.searchParams.get("secret");
    if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: API_MESSAGES.AUTH.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    /* ============ 2. PARSE & VALIDATE INPUT ============ */
    const rawBody = await readRawBody(req);
    let json;
    try {
      json = JSON.parse(rawBody);
    } catch (err) {
      return NextResponse.json({ error: API_MESSAGES.INVALID_JSON }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const { status, order_id, txnStatus } = json;

    // 🔒 Sanitization: Ensure order_id looks safe (alphanumeric)
    if (!order_id || !/^[A-Z0-9]+$/i.test(order_id)) {
      return NextResponse.json({ error: "Invalid Order ID format" }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    await connectDB();

    /* ============ 3. SECURITY: CHECK DB FIRST (Prevent DoS) ============ */
    // Verify the transaction actually exists in our system BEFORE calling the gateway.
    // This prevents an attacker from flooding us with fake order_ids to exhaust our gateway API limits.
    const transaction = await WalletTransaction.findOne({ referenceId: order_id });

    if (!transaction) {
      // Don't leak that it doesn't exist, just return generic
      console.warn(`Webhook: Transaction not found for ${order_id}`);
      return NextResponse.json({ message: "Order processed" }, { status: HTTP_STATUS.OK });
    }

    if (transaction.status === "success") {
      return NextResponse.json({ message: "Already success" }, { status: HTTP_STATUS.OK });
    }

    /* ============ 4. ANALYZE WEBHOOK STATUS ============ */
    const isWebhookSuccess = status === "SUCCESS" || status === true || txnStatus === "COMPLETED";

    if (!isWebhookSuccess) {
      // Mark failed if it was pending
      if (transaction.status === 'pending') {
        transaction.status = 'failed';
        transaction.description = `Webhook Reported Failure: ${json.message || 'Unknown'}`;
        await transaction.save();
      }
      return NextResponse.json({ message: "Updated to failed" });
    }

    /* ============ 5. SECURITY: GATEWAY DOUBLE-CHECK ============ */
    // Now that we know we have a pending transaction, we VERIFY with the gateway.
    const formData = new URLSearchParams();
    formData.append("user_token", process.env.XTRA_USER_TOKEN!);
    formData.append("order_id", order_id);

    const checkResp = await fetch("https://xyzpay.site/api/check-order-status", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const checkData = await checkResp.json();

    // Gateway-level verification
    const gatewayStatus = checkData?.result?.txnStatus;
    const isGatewaySuccess =
      checkData?.status === true ||
      gatewayStatus === "COMPLETED" ||
      gatewayStatus === "SUCCESS";

    if (!isGatewaySuccess) {
      console.error(`Security Alert: Webhook claimed success but Gateway denied for ${order_id}`);
      return NextResponse.json({ message: "Gateway verification failed" }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    /* ============ 6. SECURITY: AMOUNT INTEGRITY ============ */
    const verifiedAmount = Number(checkData?.result?.amount || 0);
    const expectedAmount = transaction.amount;

    if (verifiedAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount from gateway" }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Flag mismatches (e.g. User tried to pay 1000 but manipulated to pay 1)
    if (verifiedAmount !== expectedAmount) {
      console.warn(`Amount Mismatch for ${order_id}. Expected: ${expectedAmount}, Paid: ${verifiedAmount}`);
      // We will credit the verifiedAmount (Actual Paid) for safety, but update the record.
    }

    /* ============ 7. ATOMIC UPDATE & CREDIT ============ */
    const updatedTxn = await WalletTransaction.findOneAndUpdate(
      { _id: transaction._id, status: { $ne: "success" } },
      {
        $set: {
          status: "success",
          amount: verifiedAmount, // 🔒 Source of Truth: Gateway
          description: "Wallet Top-up Successful (Verified)",
          updatedAt: new Date(),
          // Store original amount if different? 
          // Maybe add a note field but not schema predefined.
        }
      },
      { new: true }
    );

    if (!updatedTxn) {
      return NextResponse.json({ message: "Race condition handled" });
    }

    const user = await User.findOneAndUpdate(
      { _id: updatedTxn.userObjectId },
      { $inc: { wallet: verifiedAmount } }, // Credit verified amount
      { new: true }
    );

    if (user) {
      updatedTxn.balanceAfter = user.wallet;
      await updatedTxn.save();
    }

    return NextResponse.json(
      { message: "Securely Credited" },
      { status: HTTP_STATUS.OK }
    );

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: API_MESSAGES.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: API_MESSAGES.METHOD_NOT_ALLOWED },
    { status: HTTP_STATUS.METHOD_NOT_ALLOWED }
  );
}
