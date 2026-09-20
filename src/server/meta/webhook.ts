export function metaWebhookChallenge(
  searchParams: URLSearchParams,
  expectedToken?: string,
): { ok: true; challenge: string } | { ok: false; status: number; message: string } {
  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const token = searchParams.get("hub.verify_token");
  if (mode !== "subscribe" || !challenge) {
    return { ok: false, status: 400, message: "hub.mode=subscribe et hub.challenge requis" };
  }
  if (expectedToken && token !== expectedToken) {
    return { ok: false, status: 403, message: "hub.verify_token invalide" };
  }
  return { ok: true, challenge };
}
