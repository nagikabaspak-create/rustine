import { describe, expect, it } from "vitest";
import { isEnvelope, unwrapEnvelope } from "./envelope";
import { MOCK_WHOAMI, paginateTransactions } from "./mocks";

describe("unwrapEnvelope", () => {
  it("returns data when metadata envelope is present", () => {
    const inner = { company_id: "abc" };
    expect(
      unwrapEnvelope({
        data: inner,
        metadata: { request_id: "r1", timestamp: "t" },
      }),
    ).toEqual(inner);
  });

  it("returns the payload as-is without envelope", () => {
    expect(unwrapEnvelope(MOCK_WHOAMI)).toEqual(MOCK_WHOAMI);
  });

  it("detects envelopes", () => {
    expect(isEnvelope({ data: 1, metadata: {} })).toBe(true);
    expect(isEnvelope(MOCK_WHOAMI)).toBe(false);
  });
});

describe("mock validate / wallet", () => {
  it("whoami is DRY_RUN in mock fixtures", () => {
    expect(MOCK_WHOAMI.execution_mode).toBe("DRY_RUN");
    expect(MOCK_WHOAMI.dry_run).toBe(true);
    expect(MOCK_WHOAMI.api_key_valid).toBe(true);
  });

  it("paginates wallet transactions", () => {
    const page = paginateTransactions({ page: 1, page_size: 2, type: "outgoing" });
    expect(page.transactions.length).toBeGreaterThan(0);
    expect(page.transactions.every((t) => t.action === "removed")).toBe(true);
    expect(page.page).toBe(1);
  });
});
