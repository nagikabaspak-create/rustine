import { NextRequest, NextResponse } from "next/server";
import { metaWebhookChallenge } from "@/server/meta/webhook";

export async function GET(request: NextRequest) {
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN?.trim();
  const result = metaWebhookChallenge(request.nextUrl.searchParams, expected || undefined);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
  return new NextResponse(result.challenge, {
    status: 200,
    headers: { "content-type": "text/plain" },
  });
}

export async function POST(request: NextRequest) {
  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    payload = await request.text();
  }
  console.info("[meta webhook]", JSON.stringify(payload).slice(0, 4000));
  return NextResponse.json({ received: true });
}
