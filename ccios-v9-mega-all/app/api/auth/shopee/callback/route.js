import { NextResponse } from "next/server";
import { exchangeCodeForToken } from "../../../../../lib/shopee";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const shopId = searchParams.get("shop_id");

  if (!code || !shopId) {
    return NextResponse.json({ error: "Missing code or shop_id from Shopee redirect" }, { status: 400 });
  }

  const result = await exchangeCodeForToken(code, shopId);
  if (!result.access_token) {
    return NextResponse.json({ error: "Failed to get access token", details: result }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    shop_id: shopId,
    message: "Shopee shop authorized. Token stored in memory for this server instance — remember this is not persistent across cold starts (see lib/shopee.js).",
  });
}
