"use server";

import { z } from "zod";
import { aurora, AuroraError } from "@/server/aurora/client";
import { recordMutation } from "@/server/attribution";
import { requireUser } from "@/server/auth/session";
import { revalidatePath } from "next/cache";

const topUpSchema = z.object({
  accountId: z.string().min(1),
  accountType: z.string().min(1),
  amount: z.coerce.number().min(1).max(1_000_000),
  addFee: z.coerce.boolean().optional(),
});

const clearSchema = z.object({
  accountId: z.string().min(1),
  accountType: z.string().min(1),
  amountToClear: z.coerce.number().min(1).optional(),
  additionalFee: z.coerce.number().min(0).optional(),
});

const bmShareSchema = z.object({
  accountId: z.string().min(1),
  accountType: z.string().min(1),
  businessManagerValue: z.string().min(1),
  businessManagerEmail: z.string().email().optional().or(z.literal("")),
  confirmation: z.coerce.boolean().optional(),
});

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function fail(error: unknown): ActionResult {
  if (error instanceof AuroraError) {
    const detail =
      typeof error.body === "object" && error.body
        ? JSON.stringify(error.body)
        : error.message;
    return { ok: false, message: `Aurora ${error.status}: ${detail}` };
  }
  return {
    ok: false,
    message: error instanceof Error ? error.message : "Erreur inconnue",
  };
}

export async function topUpAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = topUpSchema.parse({
      accountId: formData.get("accountId"),
      accountType: formData.get("accountType"),
      amount: formData.get("amount"),
      addFee: formData.get("addFee") === "on" || formData.get("addFee") === "true",
    });
    const result = await aurora.topUp(
      parsed.accountType,
      parsed.accountId,
      { amount: parsed.amount, add_fee: parsed.addFee },
      crypto.randomUUID(),
    );
    await recordMutation({
      actorUserId: user.id,
      type: "TOP_UP",
      auroraEntityId: parsed.accountId,
      payload: parsed,
      result,
      amountCents: result.charged_to_wallet_cents,
      currency: "USD",
      note: `Top-up ${parsed.accountType} ${parsed.amount}`,
    });
    revalidatePath("/accounts");
    revalidatePath(`/accounts/${parsed.accountId}`);
    revalidatePath("/spend");
    revalidatePath("/audit");
    revalidatePath("/wallet");
    revalidatePath("/");
    return {
      ok: true,
      message: `Top-up envoyé (${result.short_request_id ?? result.id}). Facturé ${result.charged_to_wallet_cents / 100}.`,
    };
  } catch (error) {
    return fail(error);
  }
}

export async function clearFundsAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const amountRaw = String(formData.get("amountToClear") ?? "").trim();
    const parsed = clearSchema.parse({
      accountId: formData.get("accountId"),
      accountType: formData.get("accountType"),
      amountToClear: amountRaw ? amountRaw : undefined,
      additionalFee: formData.get("additionalFee") || undefined,
    });
    const result = await aurora.clearFunds(
      parsed.accountType,
      parsed.accountId,
      {
        amount_to_clear: parsed.amountToClear,
        additional_fee: parsed.additionalFee,
      },
      crypto.randomUUID(),
    );
    const cents =
      result.total_returned_cents ??
      result.funds_cleared_cents ??
      Math.round((parsed.amountToClear ?? 0) * 100);
    await recordMutation({
      actorUserId: user.id,
      type: "CLEAR_FUNDS",
      auroraEntityId: parsed.accountId,
      payload: parsed,
      result,
      amountCents: -Math.abs(cents),
      currency: "USD",
      note: `Clear funds ${parsed.accountType}`,
    });
    revalidatePath("/accounts");
    revalidatePath(`/accounts/${parsed.accountId}`);
    revalidatePath("/spend");
    revalidatePath("/audit");
    revalidatePath("/wallet");
    return { ok: true, message: `Retrait demandé (${result.id}).` };
  } catch (error) {
    return fail(error);
  }
}

export async function bmShareAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = bmShareSchema.parse({
      accountId: formData.get("accountId"),
      accountType: formData.get("accountType"),
      businessManagerValue: formData.get("businessManagerValue"),
      businessManagerEmail: formData.get("businessManagerEmail") || "",
      confirmation: formData.get("confirmation") === "on",
    });
    const result = await aurora.bmShare(
      parsed.accountType,
      parsed.accountId,
      {
        business_manager_value: parsed.businessManagerValue,
        business_manager_email_value: parsed.businessManagerEmail || undefined,
        confirmation: parsed.confirmation,
      },
      crypto.randomUUID(),
    );
    await recordMutation({
      actorUserId: user.id,
      type: "BM_SHARE",
      auroraEntityId: parsed.accountId,
      payload: parsed,
      result,
      amountCents: 0,
      currency: "USD",
      note: `BM share ${parsed.businessManagerValue}`,
    });
    revalidatePath("/accounts");
    revalidatePath(`/accounts/${parsed.accountId}`);
    revalidatePath("/audit");
    return { ok: true, message: `Partage BM demandé (${result.status}).` };
  } catch (error) {
    return fail(error);
  }
}
