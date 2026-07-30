import { NextResponse } from "next/server";

export async function POST(request) {
  const { message } = await request.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ reply: "Send a non-empty 'message' field." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      reply:
        "NOVA is set up but no ANTHROPIC_API_KEY is configured yet. Add ANTHROPIC_API_KEY in your Vercel project's Environment Variables (Settings → Environment Variables), redeploy, and NOVA will start answering for real.",
    });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `You are NOVA, an e-commerce operations assistant for a fashion retail management dashboard (brands include RAV Design, Nicole Collection, Hush Puppies, Obermain, John Langford, Beverly Hills Polo Club, across Shopee and Lazada). Answer concisely and practically.\n\nUser question: ${message}`,
          },
        ],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return NextResponse.json({ reply: `NOVA's AI call failed (${r.status}): ${errText.slice(0, 200)}` }, { status: 200 });
    }

    const j = await r.json();
    const text = j.content?.find((b) => b.type === "text")?.text || "No response text returned.";
    return NextResponse.json({ reply: text });
  } catch (e) {
    return NextResponse.json({ reply: `NOVA hit an error: ${e.message}` }, { status: 200 });
  }
}
