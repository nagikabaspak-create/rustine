import type { GraphErrorBody, ParsedMetaUsage } from "./types";

function parseJsonHeader(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function firstRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object"
      ? (first as Record<string, unknown>)
      : null;
  }
  const values = Object.values(value as Record<string, unknown>);
  const first = values[0];
  if (Array.isArray(first)) {
    const row = first[0];
    return row && typeof row === "object" ? (row as Record<string, unknown>) : null;
  }
  if (first && typeof first === "object") return first as Record<string, unknown>;
  return value as Record<string, unknown>;
}

function num(record: Record<string, unknown> | null, key: string): number | null {
  if (!record) return null;
  const raw = record[key];
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Parse Graph rate-limit headers. Percentages are 0–100 when present. */
export function parseMetaUsageHeaders(headers: Headers): ParsedMetaUsage {
  const businessUseCase = parseJsonHeader(
    headers.get("x-business-use-case-usage") ?? headers.get("X-Business-Use-Case-Usage"),
  );
  const adAccountUsage = parseJsonHeader(
    headers.get("x-ad-account-usage") ?? headers.get("X-Ad-Account-Usage"),
  );
  const insightsThrottle = parseJsonHeader(
    headers.get("x-fb-ads-insights-throttle") ??
      headers.get("X-FB-Ads-Insights-Throttle"),
  );

  const buc = firstRecord(businessUseCase);
  const acc =
    adAccountUsage && typeof adAccountUsage === "object"
      ? (adAccountUsage as Record<string, unknown>)
      : null;
  const thr =
    insightsThrottle && typeof insightsThrottle === "object"
      ? (insightsThrottle as Record<string, unknown>)
      : null;

  return {
    appPct: num(buc, "call_count") ?? num(buc, "total_cputime") ?? num(buc, "total_time"),
    accountPct: num(acc, "acc_id_util_pct"),
    insightsAppPct: num(thr, "app_id_util_pct"),
    insightsAccountPct: num(thr, "acc_id_util_pct"),
    raw: { businessUseCase, adAccountUsage, insightsThrottle },
  };
}

export function graphErrorCode(body: unknown, httpStatus: number): number {
  const code = (body as GraphErrorBody | undefined)?.error?.code;
  if (typeof code === "number") return code;
  return httpStatus;
}

/**
 * Rate-limit / throttle codes — wait and retry.
 * 4 = app limit, 17 = user limit, 613 = rate limit, 8000x = ads insights/account throttle.
 * 190 is an invalid/expired token and must NOT be retried.
 */
export function isRetryableGraphCode(code: number, httpStatus?: number): boolean {
  if (code === 190) return false;
  if (httpStatus === 429) return true;
  if (code === 4 || code === 17 || code === 613) return true;
  if (code >= 80000 && code < 80100) return true;
  return false;
}

export function isDeadTokenCode(code: number): boolean {
  return code === 190;
}

export function describeGraphCode(code: number): string {
  if (code === 190) {
    return "Token invalide ou révoqué (erreur 190). Ce n’est pas un rate limit.";
  }
  if (code === 4) return "Limite d’app atteinte (erreur 4). Le token est toujours valide.";
  if (code === 17) return "Limite utilisateur atteinte (erreur 17). Le token n’est pas mort.";
  if (code === 613) return "Rate limit API (erreur 613). Attendre / réduire le débit.";
  if (code >= 80000 && code < 80100) {
    return `Throttle ads/insights (erreur ${code}). Souvent 80004 — compte saturé, pas un token mort.`;
  }
  return `Erreur Graph ${code}.`;
}
