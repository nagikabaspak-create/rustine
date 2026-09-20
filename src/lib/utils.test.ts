import { describe, expect, it } from "vitest";
import { formatCents } from "./utils";

describe("formatCents", () => {
  it("formats USD cents", () => {
    expect(formatCents(83200, "USD")).toContain("832");
  });
});
