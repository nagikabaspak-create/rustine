import "server-only";

import { prisma } from "@/server/db";
import {
  applyLiveHeaders,
  applyUsageBump,
  canMutate,
  defaultGuardrails,
  metaLimiter,
  rollWindows,
} from "./limits";
import type { MetaGuardrailsState, MetaMutationKind, ParsedMetaUsage } from "./types";

export const META_SETTINGS_KEY = "meta_guardrails";

export async function loadGuardrails(): Promise<MetaGuardrailsState> {
  const row = await prisma.appSetting.findUnique({ where: { key: META_SETTINGS_KEY } });
  if (!row) return rollWindows(defaultGuardrails());
  try {
    const parsed = JSON.parse(row.value) as MetaGuardrailsState;
    return rollWindows({ ...defaultGuardrails(), ...parsed });
  } catch {
    return rollWindows(defaultGuardrails());
  }
}

export async function saveGuardrails(state: MetaGuardrailsState): Promise<void> {
  const value = JSON.stringify(state);
  await prisma.appSetting.upsert({
    where: { key: META_SETTINGS_KEY },
    update: { value },
    create: { key: META_SETTINGS_KEY, value },
  });
}

export async function withMetaQueue<T>(fn: () => Promise<T>): Promise<T> {
  return metaLimiter.run(fn);
}

export class MetaGuardError extends Error {
  constructor(
    message: string,
    public code: "KILL_SWITCH" | "RATE_CAP" | "DAILY_BUDGET",
  ) {
    super(message);
    this.name = "MetaGuardError";
  }
}

export async function enforceMetaGuards(kind: MetaMutationKind): Promise<MetaGuardrailsState> {
  const state = await loadGuardrails();
  const check = canMutate(state, kind);
  if (!check.ok) throw new MetaGuardError(check.message, check.code);
  return state;
}

export async function bumpGuardrails(
  kind: MetaMutationKind,
  headers?: ParsedMetaUsage,
): Promise<MetaGuardrailsState> {
  const state = await loadGuardrails();
  const bumped = applyUsageBump(state, kind);
  const next = headers ? applyLiveHeaders({ ...bumped, dailyCalls: state.dailyCalls }, headers) : bumped;
  await saveGuardrails(next);
  return next;
}

export async function setKillSwitch(enabled: boolean): Promise<MetaGuardrailsState> {
  const state = await loadGuardrails();
  const next = { ...state, killSwitch: enabled };
  await saveGuardrails(next);
  return next;
}
