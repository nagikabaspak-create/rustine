"use server";

import { z } from "zod";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { recordMutation } from "@/server/attribution";
import { revalidatePath } from "next/cache";

const mappingSchema = z.object({
  userId: z.string().min(1),
  auroraUserId: z.string().trim().optional(),
});

export async function updateAuroraMappingAction(formData: FormData) {
  const actor = await requireUser();
  const parsed = mappingSchema.parse({
    userId: formData.get("userId"),
    auroraUserId: formData.get("auroraUserId") ?? "",
  });

  if (actor.role !== "ADMIN" && actor.id !== parsed.userId) {
    return { ok: false as const, message: "Action non autorisée." };
  }

  const value = parsed.auroraUserId?.trim() || null;
  await prisma.user.update({
    where: { id: parsed.userId },
    data: { auroraUserId: value },
  });
  await recordMutation({
    actorUserId: actor.id,
    type: "SETTINGS_UPDATE",
    auroraEntityId: parsed.userId,
    payload: { auroraUserId: value },
    result: { ok: true },
  });
  revalidatePath("/settings");
  revalidatePath("/wallet");
  return { ok: true as const, message: "Mapping Aurora enregistré." };
}
