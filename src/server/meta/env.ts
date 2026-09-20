export const META_USER_AGENT = "Rustine/1.0 (internal panel; Meta Graph client)";

export function isMetaMockMode(): boolean {
  const page = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  const user = process.env.META_ACCESS_TOKEN?.trim();
  return !page && !user;
}

export function metaGraphVersion(): string {
  return process.env.META_GRAPH_VERSION?.trim() || "v21.0";
}

export function metaGraphBase(): string {
  return `https://graph.facebook.com/${metaGraphVersion()}`;
}

export function metaPageId(): string {
  return process.env.META_PAGE_ID?.trim() || "";
}

export function metaAdAccountId(): string {
  const raw = process.env.META_AD_ACCOUNT_ID?.trim() || "";
  if (!raw) return "";
  return raw.startsWith("act_") ? raw : `act_${raw}`;
}

export function metaTokenFor(kind: "page" | "ads"): string {
  const page = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  const user = process.env.META_ACCESS_TOKEN?.trim();
  if (kind === "page") return page || user || "";
  return user || page || "";
}
