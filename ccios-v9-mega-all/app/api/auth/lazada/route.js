import { NextResponse } from "next/server";
import { buildAuthUrl, isConfigured } from "../../../../lib/lazada";

export async function GET(request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Set LAZADA_APP_KEY and LAZADA_APP_SECRET in your environment variables first." },
      { status: 400 }
    );
  }
  const origin = new URL(request.url).origin;
  const redirectUrl = `${origin}/api/auth/lazada/callback`;
  return NextResponse.redirect(buildAuthUrl(redirectUrl));
}
