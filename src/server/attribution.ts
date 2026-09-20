import "server-only";

import { prisma } from "@/server/db";

export type ActionType =
  | "TOP_UP"
  | "CLEAR_FUNDS"
  | "BM_SHARE"
  | "BM_SHARE_BULK"
  | "APPLICATION_BEGIN"
  | "APPLICATION_CREATE"
  | "APPLICATION_MESSAGE"
  | "SETTINGS_UPDATE"
  | "META_COMMENT_REPLY"
  | "META_COMMENT_HIDE"
  | "META_COMMENT_DELETE"
  | "META_AD_PAUSE"
  | "META_AD_RESUME"
  | "META_KILL_SWITCH";

export async function recordMutation(input: {
  actorUserId: string;
  type: ActionType;
  auroraEntityId?: string | null;
  payload: unknown;
  result: unknown;
  amountCents?: number;
  currency?: string;
  note?: string;
  auroraTransactionId?: string | null;
}) {
  const log = await prisma.actionLog.create({
    data: {
      actorUserId: input.actorUserId,
      type: input.type,
      auroraEntityId: input.auroraEntityId ?? null,
      payloadJson: JSON.stringify(input.payload ?? {}),
      resultJson: JSON.stringify(input.result ?? {}),
    },
  });

  if (input.amountCents !== undefined) {
    await prisma.spendAttribution.create({
      data: {
        actorUserId: input.actorUserId,
        auroraTransactionId: input.auroraTransactionId ?? null,
        actionLogId: log.id,
        amountCents: input.amountCents,
        currency: input.currency ?? "USD",
        note: input.note ?? null,
      },
    });
  }

  return log;
}

export async function syncCachedAccounts(
  accounts: {
    id: string;
    type: string;
    status: string;
    name?: string;
    currency: string;
    provider?: string;
    hidden: boolean;
    balance?: { usd_cents: number; eur_cents: number; gbp_cents: number };
  }[],
) {
  for (const account of accounts) {
    await prisma.cachedAdAccount.upsert({
      where: { id: account.id },
      create: {
        id: account.id,
        type: account.type,
        status: account.status,
        name: account.name ?? null,
        currency: account.currency,
        provider: account.provider ?? null,
        hidden: account.hidden,
        usdCents: account.balance?.usd_cents ?? 0,
        eurCents: account.balance?.eur_cents ?? 0,
        gbpCents: account.balance?.gbp_cents ?? 0,
        payloadJson: JSON.stringify(account),
      },
      update: {
        type: account.type,
        status: account.status,
        name: account.name ?? null,
        currency: account.currency,
        provider: account.provider ?? null,
        hidden: account.hidden,
        usdCents: account.balance?.usd_cents ?? 0,
        eurCents: account.balance?.eur_cents ?? 0,
        gbpCents: account.balance?.gbp_cents ?? 0,
        payloadJson: JSON.stringify(account),
      },
    });
  }
}
