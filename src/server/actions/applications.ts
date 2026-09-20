"use server";

import { z } from "zod";
import { aurora, AuroraError } from "@/server/aurora/client";
import { recordMutation } from "@/server/attribution";
import { requireUser } from "@/server/auth/session";
import { revalidatePath } from "next/cache";

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function fail(error: unknown): ActionResult {
  if (error instanceof AuroraError) {
    return { ok: false, message: `Aurora ${error.status}: ${error.message}` };
  }
  return {
    ok: false,
    message: error instanceof Error ? error.message : "Erreur inconnue",
  };
}

const createSchema = z.object({
  type: z.string().min(1),
  timezone: z.string().min(1),
  currency: z.enum(["USD", "EUR", "GBP"]),
  names: z.string().min(1),
  advertisingLinks: z.string().min(1),
  accountType: z.string().optional(),
  businessManagerIds: z.string().optional(),
  pageLinks: z.string().optional(),
  requestId: z.string().optional(),
  specificLinksAcknowledgement: z.coerce.boolean().optional(),
  invitedLinks: z.coerce.boolean().optional(),
});

export async function beginMetaAction(): Promise<
  ActionResult & { requestId?: string | null }
> {
  try {
    const user = await requireUser();
    const result = await aurora.beginApplication("META");
    await recordMutation({
      actorUserId: user.id,
      type: "APPLICATION_BEGIN",
      payload: { type: "META" },
      result,
    });
    return {
      ok: true,
      message: result.session_required
        ? "Session META allouée."
        : "Begin non requis pour cette plateforme.",
      requestId: result.request_id,
    };
  } catch (error) {
    return fail(error);
  }
}

export async function createApplicationAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = createSchema.parse({
      type: formData.get("type"),
      timezone: formData.get("timezone"),
      currency: formData.get("currency"),
      names: formData.get("names"),
      advertisingLinks: formData.get("advertisingLinks"),
      accountType: formData.get("accountType") || "Standard",
      businessManagerIds: formData.get("businessManagerIds") || "",
      pageLinks: formData.get("pageLinks") || "",
      requestId: formData.get("requestId") || "",
      specificLinksAcknowledgement: formData.get("specificLinksAcknowledgement") === "on",
      invitedLinks: formData.get("invitedLinks") === "on",
    });

    const names = parsed.names.split(",").map((s) => s.trim()).filter(Boolean);
    const links = parsed.advertisingLinks
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const bmIds = (parsed.businessManagerIds ?? "")
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const pageLinks: Record<string, string> = {};
    for (const line of (parsed.pageLinks ?? "").split("\n")) {
      const [id, url] = line.split("=").map((s) => s.trim());
      if (id && url) pageLinks[id] = url;
    }

    let requestId = parsed.requestId;
    if (parsed.type === "META" && !requestId) {
      const begin = await aurora.beginApplication("META");
      requestId = begin.request_id ?? crypto.randomUUID();
    }

    const data: Record<string, unknown> = {
      type: parsed.type,
      timezone: parsed.timezone,
      currency: parsed.currency,
      names,
      advertising_links: links,
    };

    if (parsed.type === "META") {
      data.account_type = parsed.accountType;
      data.business_manager_ids = bmIds;
      data.page_links = pageLinks;
      data.specific_links_acknowledgement = parsed.specificLinksAcknowledgement ?? true;
      data.invited_links = parsed.invitedLinks ?? false;
      data.request_id = requestId;
    }

    const result = await aurora.createApplication(
      parsed.type,
      data,
      crypto.randomUUID(),
    );
    await recordMutation({
      actorUserId: user.id,
      type: "APPLICATION_CREATE",
      auroraEntityId: result.id,
      payload: data,
      result,
      amountCents: result.total_top_up_cents ?? 0,
      currency: result.currency ?? parsed.currency,
      note: `Application ${parsed.type} ${result.request_id ?? result.id}`,
    });
    revalidatePath("/applications");
    revalidatePath("/audit");
    revalidatePath("/spend");
    return { ok: true, message: `Demande créée (${result.request_id ?? result.id}).` };
  } catch (error) {
    return fail(error);
  }
}

export async function sendApplicationMessageAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const id = String(formData.get("applicationId") ?? "");
    const type = String(formData.get("type") ?? "");
    const content = String(formData.get("content") ?? "").trim();
    if (!id || !type || !content) {
      return { ok: false, message: "Message vide." };
    }
    const result = await aurora.createApplicationMessage(
      type,
      id,
      content,
      crypto.randomUUID(),
    );
    await recordMutation({
      actorUserId: user.id,
      type: "APPLICATION_MESSAGE",
      auroraEntityId: id,
      payload: { content },
      result,
    });
    revalidatePath(`/applications/${id}`);
    revalidatePath("/audit");
    return { ok: true, message: "Message envoyé." };
  } catch (error) {
    return fail(error);
  }
}
