import { afterEach, describe, expect, it, vi } from "vitest";
import { isMetaMockMode, metaGraphBase, metaGraphVersion, META_USER_AGENT } from "./env";
import { MetaError, metaGraphFetch } from "./graph";
import {
  describeGraphCode,
  isDeadTokenCode,
  isRetryableGraphCode,
  parseMetaUsageHeaders,
} from "./headers";
import {
  applyUsageBump,
  canMutate,
  createLimiter,
  defaultGuardrails,
  MAX_CONCURRENCY,
  rollWindows,
} from "./limits";
import {
  listMockComments,
  mockHide,
  mockReply,
  mockSetAdStatus,
  mockSuggestedReply,
  resetMetaMocks,
} from "./mocks";
import { metaWebhookChallenge } from "./webhook";

describe("isMetaMockMode", () => {
  const prevPage = process.env.META_PAGE_ACCESS_TOKEN;
  const prevUser = process.env.META_ACCESS_TOKEN;

  afterEach(() => {
    if (prevPage === undefined) delete process.env.META_PAGE_ACCESS_TOKEN;
    else process.env.META_PAGE_ACCESS_TOKEN = prevPage;
    if (prevUser === undefined) delete process.env.META_ACCESS_TOKEN;
    else process.env.META_ACCESS_TOKEN = prevUser;
  });

  it("is mock when both tokens are empty", () => {
    delete process.env.META_PAGE_ACCESS_TOKEN;
    delete process.env.META_ACCESS_TOKEN;
    expect(isMetaMockMode()).toBe(true);
  });

  it("is live when META_ACCESS_TOKEN is set", () => {
    delete process.env.META_PAGE_ACCESS_TOKEN;
    process.env.META_ACCESS_TOKEN = "EAA_test";
    expect(isMetaMockMode()).toBe(false);
  });

  it("is live when only META_PAGE_ACCESS_TOKEN is set", () => {
    process.env.META_PAGE_ACCESS_TOKEN = "EAA_page";
    delete process.env.META_ACCESS_TOKEN;
    expect(isMetaMockMode()).toBe(false);
  });
});

describe("graph version", () => {
  it("defaults to v21.0", () => {
    const prev = process.env.META_GRAPH_VERSION;
    delete process.env.META_GRAPH_VERSION;
    expect(metaGraphVersion()).toBe("v21.0");
    expect(metaGraphBase()).toBe("https://graph.facebook.com/v21.0");
    if (prev !== undefined) process.env.META_GRAPH_VERSION = prev;
  });
});

describe("rate-limit headers", () => {
  it("parses business, ad-account and insights throttle headers", () => {
    const headers = new Headers({
      "X-Business-Use-Case-Usage": JSON.stringify({
        "123": [
          {
            type: "ads_management",
            call_count: 22,
            total_cputime: 15,
            total_time: 12,
            estimated_time_to_regain_access: 0,
          },
        ],
      }),
      "X-Ad-Account-Usage": JSON.stringify({ acc_id_util_pct: 9 }),
      "X-FB-Ads-Insights-Throttle": JSON.stringify({
        app_id_util_pct: 11,
        acc_id_util_pct: 22,
      }),
    });
    const parsed = parseMetaUsageHeaders(headers);
    expect(parsed.appPct).toBe(22);
    expect(parsed.accountPct).toBe(9);
    expect(parsed.insightsAppPct).toBe(11);
    expect(parsed.insightsAccountPct).toBe(22);
  });
});

describe("retryable Graph codes", () => {
  it("retries 4 / 17 / 613 / 80004, not 190", () => {
    expect(isRetryableGraphCode(4)).toBe(true);
    expect(isRetryableGraphCode(17)).toBe(true);
    expect(isRetryableGraphCode(613)).toBe(true);
    expect(isRetryableGraphCode(80004)).toBe(true);
    expect(isRetryableGraphCode(80000)).toBe(true);
    expect(isRetryableGraphCode(190)).toBe(false);
    expect(isDeadTokenCode(190)).toBe(true);
    expect(isDeadTokenCode(17)).toBe(false);
  });

  it("explains rate limit vs dead token in French", () => {
    expect(describeGraphCode(17)).toMatch(/pas mort/i);
    expect(describeGraphCode(190)).toMatch(/190/);
    expect(describeGraphCode(80004)).toMatch(/80004/);
  });
});

describe("live Graph client", () => {
  const prevPage = process.env.META_PAGE_ACCESS_TOKEN;
  const prevUser = process.env.META_ACCESS_TOKEN;

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    if (prevPage === undefined) delete process.env.META_PAGE_ACCESS_TOKEN;
    else process.env.META_PAGE_ACCESS_TOKEN = prevPage;
    if (prevUser === undefined) delete process.env.META_ACCESS_TOKEN;
    else process.env.META_ACCESS_TOKEN = prevUser;
  });

  it("calls graph.facebook.com with User-Agent when a token is set", async () => {
    delete process.env.META_PAGE_ACCESS_TOKEN;
    process.env.META_ACCESS_TOKEN = "EAA_live";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ data: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await metaGraphFetch("/me", { tokenKind: "ads" });
    expect(result.data).toEqual({ data: [] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("https://graph.facebook.com/v21.0/me");
    expect(url).toContain("access_token=EAA_live");
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe(META_USER_AGENT);
  });

  it("retries error 17 then succeeds", async () => {
    process.env.META_ACCESS_TOKEN = "EAA_live";
    delete process.env.META_PAGE_ACCESS_TOKEN;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers(),
        text: async () =>
          JSON.stringify({ error: { message: "user limit", code: 17, type: "OAuthException" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: async () => JSON.stringify({ id: "ok" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await metaGraphFetch("/act_1/ads", { tokenKind: "ads" });
    expect(result.data).toEqual({ id: "ok" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry error 190 (dead token)", async () => {
    process.env.META_ACCESS_TOKEN = "EAA_dead";
    delete process.env.META_PAGE_ACCESS_TOKEN;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers(),
      text: async () =>
        JSON.stringify({ error: { message: "Invalid OAuth access token", code: 190 } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(metaGraphFetch("/me")).rejects.toBeInstanceOf(MetaError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("mocks inbox / ads", () => {
  afterEach(() => {
    resetMetaMocks();
  });

  it("lists tagged comments", () => {
    const comments = listMockComments();
    expect(comments.length).toBeGreaterThan(0);
    expect(comments.some((c) => c.tags.includes("spam"))).toBe(true);
    expect(comments.some((c) => c.tags.includes("lead"))).toBe(true);
    expect(comments.some((c) => c.tags.includes("question"))).toBe(true);
  });

  it("reply / hide mutate mock state", () => {
    const first = listMockComments()[0];
    mockReply(first.id, "Merci, on vérifie.");
    mockHide(first.id, true);
    const updated = listMockComments().find((c) => c.id === first.id);
    expect(updated?.hidden).toBe(true);
    expect(updated?.replies[0]?.message).toBe("Merci, on vérifie.");
  });

  it("pause ad in mock", () => {
    const result = mockSetAdStatus("ad_spring_carousel", "PAUSED");
    expect(result.status).toBe("PAUSED");
  });

  it("never auto-sends the AI suggestion", () => {
    const comment = listMockComments().find((c) => c.tags.includes("spam"))!;
    const suggestion = mockSuggestedReply(comment);
    expect(suggestion.text.length).toBeGreaterThan(10);
    expect(suggestion.comment_id).toBe(comment.id);
  });
});

describe("guardrails", () => {
  it("blocks kill switch and hourly caps without treating it as a dead token", () => {
    const killed = { ...defaultGuardrails(), killSwitch: true };
    const killedCheck = canMutate(killed, "reply");
    expect(killedCheck.ok).toBe(false);
    if (!killedCheck.ok) {
      expect(killedCheck.code).toBe("KILL_SWITCH");
      expect(killedCheck.message).not.toMatch(/token mort/i);
    }

    const capped = { ...defaultGuardrails(), repliesThisHour: 20, maxRepliesPerHour: 20 };
    const capCheck = canMutate(capped, "reply");
    expect(capCheck.ok).toBe(false);
    if (!capCheck.ok) {
      expect(capCheck.code).toBe("RATE_CAP");
      expect(capCheck.message).toMatch(/token est toujours valide/i);
    }
  });

  it("bumps usage meters on mock actions", () => {
    const before = defaultGuardrails();
    const after = applyUsageBump(before, "hide");
    expect(after.hidesThisHour).toBe(1);
    expect(after.appPct).toBeGreaterThan(before.appPct);
    expect(after.accountPct).toBeGreaterThan(before.accountPct);
    expect(after.dailyCalls).toBe(before.dailyCalls + 1);
  });

  it("resets hourly counters on a new hour", () => {
    const state = {
      ...defaultGuardrails(new Date("2026-09-20T10:00:00.000Z")),
      hourKey: "2026-09-20T09",
      repliesThisHour: 8,
    };
    const rolled = rollWindows(state, new Date("2026-09-20T10:05:00.000Z"));
    expect(rolled.repliesThisHour).toBe(0);
    expect(rolled.hourKey).toBe("2026-09-20T10");
  });

  it("limits concurrency to 1–2", async () => {
    expect(MAX_CONCURRENCY).toBe(2);
    const limiter = createLimiter(1);
    const order: number[] = [];
    await Promise.all([
      limiter.run(async () => {
        order.push(1);
        await new Promise((r) => setTimeout(r, 20));
        order.push(2);
      }),
      limiter.run(async () => {
        order.push(3);
      }),
    ]);
    expect(order).toEqual([1, 2, 3]);
  });
});

describe("webhook challenge", () => {
  it("echoes hub.challenge on subscribe", () => {
    const params = new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.challenge": "42",
      "hub.verify_token": "secret",
    });
    expect(metaWebhookChallenge(params, "secret")).toEqual({ ok: true, challenge: "42" });
    expect(metaWebhookChallenge(params, "wrong").ok).toBe(false);
  });
});
