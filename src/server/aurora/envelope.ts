import type { Envelope } from "./types";

export function unwrapEnvelope<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const maybe = payload as Envelope<T> & Record<string, unknown>;
    if ("metadata" in maybe || Object.keys(maybe).length <= 2) {
      return maybe.data;
    }
    if (maybe.data !== undefined && maybe.metadata !== undefined) {
      return maybe.data;
    }
  }
  return payload as T;
}

export function isEnvelope(payload: unknown): payload is Envelope<unknown> {
  return (
    !!payload &&
    typeof payload === "object" &&
    "data" in payload &&
    "metadata" in payload
  );
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
