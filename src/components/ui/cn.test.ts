import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names and drops empty values", () => {
    expect(cn("pa-btn", false, "is-active", null, undefined)).toBe(
      "pa-btn is-active",
    );
  });
});
