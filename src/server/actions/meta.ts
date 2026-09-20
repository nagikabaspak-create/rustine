"use server";

import { z } from "zod";
import { meta, MetaError } from "@/server/meta/client";
import { bumpGuardrails, enforceMetaGuards, MetaGuardError, setKillSwitch } from "@/server/meta/queue";
import { recordMutation } from "@/server/attribution";
import { requireUser } from "@/server/auth/session";
import { revalidatePath } from "next/cache";

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function fail(error: unknown): ActionResult {
  if (error instanceof MetaGuardError) {
    return { ok: false, message: error.message };
  }
  if (error instanceof MetaError) {
    return { ok: false, message: error.message };
  }
  return {
    ok: false,
    message: error instanceof Error ? error.message : "Erreur inconnue",
  };
}

function revalidateMeta() {
  revalidatePath("/meta/inbox");
  revalidatePath("/meta/ads");
  revalidatePath("/meta/guardrails");
  revalidatePath("/audit");
}

const replySchema = z.object({
  commentId: z.string().min(1),
  message: z.string().trim().min(1).max(2000),
});

const commentSchema = z.object({
  commentId: z.string().min(1),
});

const adSchema = z.object({
  adId: z.string().min(1),
  status: z.enum(["ACTIVE", "PAUSED"]),
});

export async function replyCommentAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = replySchema.parse({
      commentId: formData.get("commentId"),
      message: formData.get("message"),
    });
    await enforceMetaGuards("reply");
    const result = await meta.replyToComment(parsed.commentId, parsed.message);
    await bumpGuardrails("reply");
    await recordMutation({
      actorUserId: user.id,
      type: "META_COMMENT_REPLY",
      auroraEntityId: parsed.commentId,
      payload: parsed,
      result,
    });
    revalidateMeta();
    return { ok: true, message: "Réponse publiée (simulation ou Graph)." };
  } catch (error) {
    return fail(error);
  }
}

export async function hideCommentAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = commentSchema.parse({ commentId: formData.get("commentId") });
    await enforceMetaGuards("hide");
    const result = await meta.hideComment(parsed.commentId, true);
    await bumpGuardrails("hide");
    await recordMutation({
      actorUserId: user.id,
      type: "META_COMMENT_HIDE",
      auroraEntityId: parsed.commentId,
      payload: parsed,
      result,
    });
    revalidateMeta();
    return { ok: true, message: "Commentaire masqué." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCommentAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = commentSchema.parse({ commentId: formData.get("commentId") });
    await enforceMetaGuards("delete");
    const result = await meta.deleteComment(parsed.commentId);
    await bumpGuardrails("delete");
    await recordMutation({
      actorUserId: user.id,
      type: "META_COMMENT_DELETE",
      auroraEntityId: parsed.commentId,
      payload: parsed,
      result,
    });
    revalidateMeta();
    return { ok: true, message: "Commentaire supprimé." };
  } catch (error) {
    return fail(error);
  }
}

export async function setAdStatusAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = adSchema.parse({
      adId: formData.get("adId"),
      status: formData.get("status"),
    });
    await enforceMetaGuards("ads");
    const result = await meta.setAdStatus(parsed.adId, parsed.status);
    await bumpGuardrails("ads");
    await recordMutation({
      actorUserId: user.id,
      type: parsed.status === "PAUSED" ? "META_AD_PAUSE" : "META_AD_RESUME",
      auroraEntityId: parsed.adId,
      payload: parsed,
      result,
    });
    revalidateMeta();
    return {
      ok: true,
      message: parsed.status === "PAUSED" ? "Publicité mise en pause." : "Publicité reprise.",
    };
  } catch (error) {
    return fail(error);
  }
}

export async function toggleKillSwitchAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const enabled = formData.get("enabled") === "true";
    const state = await setKillSwitch(enabled);
    await recordMutation({
      actorUserId: user.id,
      type: "META_KILL_SWITCH",
      payload: { enabled },
      result: { killSwitch: state.killSwitch },
    });
    revalidateMeta();
    return {
      ok: true,
      message: enabled
        ? "Coupe-circuit activé — plus aucune écriture Meta."
        : "Coupe-circuit désactivé — écritures autorisées (sous plafonds).",
    };
  } catch (error) {
    return fail(error);
  }
}
