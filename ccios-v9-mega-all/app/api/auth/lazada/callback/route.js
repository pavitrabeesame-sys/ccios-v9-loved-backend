import { NextResponse } from "next/server";
import { exchangeCodeForToken } from "../../../../../lib/lazada";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code from Lazada redirect" }, { status: 400 });
  }

  const result = await exchangeCodeForToken(code);
  if (!result.access_token) {
    return NextResponse.json({ error: "Failed to get access token", details: result }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Lazada seller account authorized. Token stored in memory for this server instance — remember this is not persistent across cold starts (see lib/lazada.js).",
  });
}
