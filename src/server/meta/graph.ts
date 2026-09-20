import {
  describeGraphCode,
  graphErrorCode,
  isDeadTokenCode,
  isRetryableGraphCode,
  parseMetaUsageHeaders,
} from "./headers";
import {
  isMetaMockMode,
  META_USER_AGENT,
  metaGraphBase,
  metaTokenFor,
} from "./env";
import type { MetaFetchOptions } from "./types";

const DEFAULT_TIMEOUT_MS = 20_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MetaError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "MetaError";
  }
}

function formBody(body: MetaFetchOptions["body"]): string {
  const params = new URLSearchParams();
  if (!body) return params.toString();
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export async function metaGraphFetch<T>(
  path: string,
  options: MetaFetchOptions = {},
): Promise<{ data: T; usage: ReturnType<typeof parseMetaUsageHeaders> }> {
  if (isMetaMockMode()) {
    throw new MetaError("metaGraphFetch called in mock mode", 500);
  }

  const method = (options.method ?? "GET").toUpperCase();
  const tokenKind = options.tokenKind ?? "page";
  const token = metaTokenFor(tokenKind);
  if (!token) {
    throw new MetaError("Aucun token Meta (META_ACCESS_TOKEN / META_PAGE_ACCESS_TOKEN)", 401);
  }

  const url = new URL(
    path.startsWith("http") ? path : `${metaGraphBase()}${path.startsWith("/") ? path : `/${path}`}`,
  );
  url.searchParams.set("access_token", token);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = 4;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        "User-Agent": META_USER_AGENT,
      };
      let body: string | undefined;
      if (options.body !== undefined && method !== "GET") {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        body = formBody(options.body);
      }

      const res = await fetch(url.toString(), {
        method,
        headers,
        body,
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

      const usage = parseMetaUsageHeaders(res.headers);
      const code = graphErrorCode(parsed, res.status);

      if (!res.ok || (parsed && typeof parsed === "object" && parsed !== null && "error" in parsed)) {
        if (isDeadTokenCode(code)) {
          throw new MetaError(describeGraphCode(190), res.status, 190, parsed);
        }
        if (isRetryableGraphCode(code, res.status) && attempt < maxAttempts) {
          const retryAfter = Number(res.headers.get("retry-after"));
          const backoff = Number.isFinite(retryAfter)
            ? retryAfter * 1000
            : 400 * 2 ** (attempt - 1);
          await sleep(backoff);
          continue;
        }
        throw new MetaError(
          describeGraphCode(code) || `Meta ${method} ${path} failed (${res.status})`,
          res.status,
          code,
          parsed,
        );
      }

      return { data: parsed as T, usage };
    } catch (error) {
      lastError = error;
      if (error instanceof MetaError) throw error;
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
    : new MetaError("Meta Graph request failed", 500, undefined, lastError);
}
