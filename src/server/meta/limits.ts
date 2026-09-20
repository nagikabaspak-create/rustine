import type { MetaGuardrailsState, MetaMutationKind, ParsedMetaUsage } from "./types";

export const DEFAULT_DAILY_BUDGET = 480;

const DEFAULTS: Omit<MetaGuardrailsState, "dayKey" | "hourKey"> = {
  killSwitch: false,
  appPct: 18,
  accountPct: 11,
  insightsPct: 4,
  dailyCalls: 37,
  dailyBudget: DEFAULT_DAILY_BUDGET,
  repliesThisHour: 0,
  hidesThisHour: 0,
  deletesThisHour: 0,
  adsMutationsThisHour: 0,
  maxRepliesPerHour: 20,
  maxHidesPerHour: 30,
  maxDeletesPerHour: 10,
  maxAdsMutationsPerHour: 20,
};

export function utcDayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function utcHourKey(now = new Date()): string {
  return now.toISOString().slice(0, 13);
}

export function defaultGuardrails(now = new Date()): MetaGuardrailsState {
  return {
    ...DEFAULTS,
    dayKey: utcDayKey(now),
    hourKey: utcHourKey(now),
  };
}

export function rollWindows(
  state: MetaGuardrailsState,
  now = new Date(),
): MetaGuardrailsState {
  const dayKey = utcDayKey(now);
  const hourKey = utcHourKey(now);
  const next = { ...state };
  if (state.dayKey !== dayKey) {
    next.dayKey = dayKey;
    next.dailyCalls = 0;
  }
  if (state.hourKey !== hourKey) {
    next.hourKey = hourKey;
    next.repliesThisHour = 0;
    next.hidesThisHour = 0;
    next.deletesThisHour = 0;
    next.adsMutationsThisHour = 0;
  }
  return next;
}

export function canMutate(
  state: MetaGuardrailsState,
  kind: MetaMutationKind,
): { ok: true } | { ok: false; code: "KILL_SWITCH" | "RATE_CAP" | "DAILY_BUDGET"; message: string } {
  if (state.killSwitch) {
    return {
      ok: false,
      code: "KILL_SWITCH",
      message:
        "Coupe-circuit Meta activé. Aucune écriture (réponse, masquage, suppression, pause pub). Le token n’est pas concerné — réactivez dans Garde-fous.",
    };
  }
  if (state.dailyCalls >= state.dailyBudget) {
    return {
      ok: false,
      code: "DAILY_BUDGET",
      message: `Budget d’appels journalier atteint (${state.dailyBudget}). Ce n’est pas un token mort — attendez demain ou augmentez le plafond.`,
    };
  }
  const checks: Record<MetaMutationKind, { used: number; max: number; label: string }> = {
    reply: {
      used: state.repliesThisHour,
      max: state.maxRepliesPerHour,
      label: "réponses",
    },
    hide: {
      used: state.hidesThisHour,
      max: state.maxHidesPerHour,
      label: "masquages",
    },
    delete: {
      used: state.deletesThisHour,
      max: state.maxDeletesPerHour,
      label: "suppressions",
    },
    ads: {
      used: state.adsMutationsThisHour,
      max: state.maxAdsMutationsPerHour,
      label: "mutations pubs",
    },
  };
  const { used, max, label } = checks[kind];
  if (used >= max) {
    return {
      ok: false,
      code: "RATE_CAP",
      message: `Plafond horaire atteint (${max} ${label} / h). Erreurs 17 / 613 / 80004 chez Meta veulent dire la même chose : ralentir. Le token est toujours valide.`,
    };
  }
  return { ok: true };
}

export function applyUsageBump(
  state: MetaGuardrailsState,
  kind: MetaMutationKind,
): MetaGuardrailsState {
  const next = { ...state, dailyCalls: state.dailyCalls + 1 };
  const bump = (pct: number, delta: number) =>
    Math.min(95, Math.round((pct + delta) * 10) / 10);
  next.appPct = bump(state.appPct, 0.6);
  next.accountPct = bump(state.accountPct, 1.1);
  next.insightsPct = bump(state.insightsPct, 0.2);
  if (kind === "reply") next.repliesThisHour += 1;
  if (kind === "hide") next.hidesThisHour += 1;
  if (kind === "delete") next.deletesThisHour += 1;
  if (kind === "ads") next.adsMutationsThisHour += 1;
  return next;
}

export function applyLiveHeaders(
  state: MetaGuardrailsState,
  parsed: ParsedMetaUsage,
): MetaGuardrailsState {
  return {
    ...state,
    dailyCalls: state.dailyCalls + 1,
    appPct: parsed.appPct ?? state.appPct,
    accountPct: parsed.accountPct ?? state.accountPct,
    insightsPct: parsed.insightsAccountPct ?? parsed.insightsAppPct ?? state.insightsPct,
    lastHeaders: parsed.raw,
  };
}

export const MAX_CONCURRENCY = 2;

export function createLimiter(maxConcurrency = MAX_CONCURRENCY) {
  let active = 0;
  const waiters: (() => void)[] = [];

  function acquire(): Promise<void> {
    if (active < maxConcurrency) {
      active += 1;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      waiters.push(() => {
        active += 1;
        resolve();
      });
    });
  }

  function release() {
    active = Math.max(0, active - 1);
    const next = waiters.shift();
    if (next) next();
  }

  return {
    async run<T>(fn: () => Promise<T>): Promise<T> {
      await acquire();
      try {
        return await fn();
      } finally {
        release();
      }
    },
    get active() {
      return active;
    },
  };
}

export const metaLimiter = createLimiter();
