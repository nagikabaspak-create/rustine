import "server-only";

import {
  MOCK_ACCOUNTS,
  MOCK_APPLICATIONS,
  MOCK_PLATFORM_CONFIG,
  MOCK_WHOAMI,
  mockBegin,
  mockBmShare,
  mockBulkBmShare,
  mockClearFunds,
  mockCreateApplication,
  mockMessage,
  mockTopUp,
  paginateTransactions,
} from "./mocks";
import { unwrapEnvelope, sleep } from "./envelope";
import type {
  AdAccount,
  AdAccountApplication,
  ApplicationMessage,
  AuroraFetchOptions,
  BeginApplication,
  BmShareCreated,
  BulkBmShareCreated,
  ClearFundsCreated,
  PlatformConfig,
  TopUpCreated,
  TransactionListQuery,
  WalletTransaction,
  WalletTransactionsPage,
  Whoami,
} from "./types";

const DEFAULT_BASE = "https://vantage-api.agency-aurora.com";
const DEFAULT_TIMEOUT_MS = 20_000;

export function isMockMode(): boolean {
  return !process.env.AURORA_API_KEY?.trim();
}

export function auroraBaseUrl(): string {
  return (process.env.AURORA_BASE_URL?.trim() || DEFAULT_BASE).replace(/\/$/, "");
}

function buildUrl(path: string, query?: AuroraFetchOptions["query"]): string {
  const url = new URL(path.startsWith("http") ? path : `${auroraBaseUrl()}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export class AuroraError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "AuroraError";
  }
}

export async function auroraFetch<T>(
  path: string,
  options: AuroraFetchOptions = {},
): Promise<T> {
  if (isMockMode()) {
    return mockRouter<T>(path, options);
  }

  const method = (options.method ?? "GET").toUpperCase();
  const url = buildUrl(path, options.query);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = 4;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        "X-API-Key": process.env.AURORA_API_KEY!,
      };
      if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
      }
      if (options.idempotencyKey) {
        headers["Idempotency-Key"] = options.idempotencyKey;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        cache: "no-store",
      });

      const text = await res.text();
      let parsed: unknown = null;
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text;
        }
      }

      if (res.status === 429 && attempt < maxAttempts) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const backoff = Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : 400 * 2 ** (attempt - 1);
        await sleep(backoff);
        continue;
      }

      if (!res.ok) {
        throw new AuroraError(
          `Aurora ${method} ${path} failed (${res.status})`,
          res.status,
          parsed,
        );
      }

      return unwrapEnvelope<T>(parsed);
    } catch (error) {
      lastError = error;
      if (error instanceof AuroraError) throw error;
      if (attempt < maxAttempts) {
        await sleep(300 * 2 ** (attempt - 1));
        continue;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new AuroraError("Aurora request failed", 500, lastError);
}

function mockRouter<T>(path: string, options: AuroraFetchOptions): T {
  const method = (options.method ?? "GET").toUpperCase();
  const clean = path.split("?")[0];

  if (method === "GET" && clean === "/v1/validate") {
    return MOCK_WHOAMI as T;
  }
  if (method === "GET" && clean === "/v1/company-balance/transactions") {
    return paginateTransactions(options.query ?? {}) as T;
  }
  const txMatch = clean.match(/^\/v1\/company-balance\/transactions\/(.+)$/);
  if (method === "GET" && txMatch) {
    const found = paginateTransactions({}).transactions.find((t) => t.id === txMatch[1]);
    if (!found) throw new AuroraError("Transaction not found", 404);
    return found as T;
  }
  if (method === "GET" && clean === "/v1/ad-account/list") {
    return MOCK_ACCOUNTS as T;
  }
  const accMatch = clean.match(/^\/v1\/ad-account\/([^/]+)$/);
  if (method === "GET" && accMatch) {
    const found = MOCK_ACCOUNTS.find((a) => a.id === accMatch[1]);
    if (!found) throw new AuroraError("Ad account not found", 404);
    return found as T;
  }
  const topUpMatch = clean.match(
    /^\/v1\/ad-account\/top-up-request\/([^/]+)\/([^/]+)\/create$/,
  );
  if (method === "POST" && topUpMatch) {
    const body = (options.body ?? {}) as { amount: number; add_fee?: boolean };
    return mockTopUp(body.amount, Boolean(body.add_fee)) as T;
  }
  const clearMatch = clean.match(
    /^\/v1\/ad-account\/clear-funds\/([^/]+)\/([^/]+)\/create$/,
  );
  if (method === "POST" && clearMatch) {
    const body = (options.body ?? {}) as { amount_to_clear?: number };
    return mockClearFunds(body.amount_to_clear) as T;
  }
  const bmMatch = clean.match(
    /^\/v1\/ad-account\/bm-share-request\/([^/]+)\/([^/]+)\/create$/,
  );
  if (method === "POST" && bmMatch) {
    const body = (options.body ?? {}) as {
      business_manager_value: string;
      business_manager_email_value?: string;
    };
    return mockBmShare(
      body.business_manager_value,
      body.business_manager_email_value,
    ) as T;
  }
  if (method === "POST" && clean === "/v1/ad-account/bm-share-request/bulk/create") {
    const body = (options.body ?? {}) as {
      requests: {
        account_id: string;
        business_manager_value: string;
        business_manager_email_value?: string;
      }[];
    };
    return mockBulkBmShare(body.requests ?? []) as T;
  }
  if (method === "GET" && clean === "/v1/ad-account-application/list") {
    return MOCK_APPLICATIONS as T;
  }
  const appMatch = clean.match(/^\/v1\/ad-account-application\/details\/(.+)$/);
  if (method === "GET" && appMatch) {
    const found = MOCK_APPLICATIONS.find((a) => a.id === appMatch[1]);
    if (!found) throw new AuroraError("Application not found", 404);
    return found as T;
  }
  const cfgMatch = clean.match(/^\/v1\/ad-account-application\/platform-config\/(.+)$/);
  if (method === "GET" && cfgMatch) {
    return MOCK_PLATFORM_CONFIG as T;
  }
  const beginMatch = clean.match(/^\/v1\/ad-account-application\/([^/]+)\/begin$/);
  if (method === "POST" && beginMatch) {
    return mockBegin(beginMatch[1]) as T;
  }
  const createMatch = clean.match(/^\/v1\/ad-account-application\/([^/]+)\/create$/);
  if (method === "POST" && createMatch) {
    const body = (options.body ?? {}) as { data: Record<string, unknown> };
    return mockCreateApplication(createMatch[1], body.data ?? {}) as T;
  }
  const msgMatch = clean.match(
    /^\/v1\/ad-account-application\/([^/]+)\/([^/]+)\/messages\/create$/,
  );
  if (method === "POST" && msgMatch) {
    const body = (options.body ?? {}) as { content?: string } | string;
    const content =
      typeof body === "string" ? body : (body.content ?? JSON.stringify(body));
    return mockMessage(content) as T;
  }

  throw new AuroraError(`No mock for ${method} ${clean}`, 404);
}

export const aurora = {
  validate: () => auroraFetch<Whoami>("/v1/validate"),
  listTransactions: (query: TransactionListQuery = {}) =>
    auroraFetch<WalletTransactionsPage>("/v1/company-balance/transactions", {
      query: query as AuroraFetchOptions["query"],
    }),
  getTransaction: (id: string) =>
    auroraFetch<WalletTransaction>(`/v1/company-balance/transactions/${id}`),
  listAccounts: () => auroraFetch<AdAccount[]>("/v1/ad-account/list"),
  getAccount: (id: string) => auroraFetch<AdAccount>(`/v1/ad-account/${id}`),
  topUp: (
    type: string,
    accountId: string,
    body: { amount: number; add_fee?: boolean },
    idempotencyKey: string,
  ) =>
    auroraFetch<TopUpCreated>(
      `/v1/ad-account/top-up-request/${type}/${accountId}/create`,
      { method: "POST", body, idempotencyKey },
    ),
  clearFunds: (
    type: string,
    accountId: string,
    body: {
      amount_to_clear?: number;
      additional_fee?: number;
      already_fully_cleared_acknowledged?: boolean;
    },
    idempotencyKey: string,
  ) =>
    auroraFetch<ClearFundsCreated>(
      `/v1/ad-account/clear-funds/${type}/${accountId}/create`,
      { method: "POST", body, idempotencyKey },
    ),
  bmShare: (
    type: string,
    accountId: string,
    body: {
      business_manager_value: string;
      business_manager_email_value?: string;
      confirmation?: boolean;
    },
    idempotencyKey: string,
  ) =>
    auroraFetch<BmShareCreated>(
      `/v1/ad-account/bm-share-request/${type}/${accountId}/create`,
      { method: "POST", body, idempotencyKey },
    ),
  bmShareBulk: (
    body: {
      requests: {
        account_id: string;
        business_manager_value: string;
        business_manager_email_value?: string;
      }[];
    },
    idempotencyKey: string,
  ) =>
    auroraFetch<BulkBmShareCreated>(
      "/v1/ad-account/bm-share-request/bulk/create",
      { method: "POST", body, idempotencyKey },
    ),
  listApplications: () =>
    auroraFetch<AdAccountApplication[]>("/v1/ad-account-application/list"),
  getApplication: (id: string) =>
    auroraFetch<AdAccountApplication>(`/v1/ad-account-application/details/${id}`),
  platformConfig: (type: string) =>
    auroraFetch<PlatformConfig>(
      `/v1/ad-account-application/platform-config/${type}`,
    ),
  beginApplication: (type: string) =>
    auroraFetch<BeginApplication>(
      `/v1/ad-account-application/${type}/begin`,
      { method: "POST" },
    ),
  createApplication: (type: string, data: Record<string, unknown>, idempotencyKey: string) =>
    auroraFetch<AdAccountApplication>(
      `/v1/ad-account-application/${type}/create`,
      { method: "POST", body: { data }, idempotencyKey },
    ),
  createApplicationMessage: (
    type: string,
    id: string,
    content: string,
    idempotencyKey: string,
  ) =>
    auroraFetch<ApplicationMessage>(
      `/v1/ad-account-application/${type}/${id}/messages/create`,
      { method: "POST", body: { content }, idempotencyKey },
    ),
};
