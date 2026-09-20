import { NextResponse } from "next/server";
import { isMockMode } from "@/server/aurora/client";
import { isMetaMockMode } from "@/server/meta/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    product: "Rustine",
    mock: isMockMode(),
    metaMock: isMetaMockMode(),
  });
}
