import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { createSession } from "@/server/auth/session";
import { verifyPassword } from "@/server/auth/password";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.trim().toLowerCase() },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ ok: false, error: "Identifiants incorrects" }, { status: 401 });
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true, name: user.name, email: user.email });
}
