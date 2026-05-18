import { describe, expect, it } from "vitest";

import { storeLabel } from "./storeLabels";

describe("storeLabel", () => {
  it("formats the name as '<city> #<id>'", () => {
    expect(storeLabel({ id: 2, city: "Woodridge" })).toEqual({
      name: "Woodridge #2",
      tone: "teal",
    });
  });

  it("assigns accent tone to odd ids and teal tone to even ids", () => {
    expect(storeLabel({ id: 1, city: "Lethbridge" }).tone).toBe("accent");
    expect(storeLabel({ id: 2, city: "Woodridge" }).tone).toBe("teal");
    expect(storeLabel({ id: 3, city: "Calgary" }).tone).toBe("accent");
    expect(storeLabel({ id: 4, city: "Brisbane" }).tone).toBe("teal");
  });

  it("falls back to 'Store #<id>' when city is missing", () => {
    expect(storeLabel({ id: 7, city: null }).name).toBe("Store #7");
    expect(storeLabel({ id: 8, city: undefined }).name).toBe("Store #8");
    expect(storeLabel({ id: 9, city: "   " }).name).toBe("Store #9");
  });

  it("trims surrounding whitespace from the city", () => {
    expect(storeLabel({ id: 1, city: "  Lethbridge  " }).name).toBe(
      "Lethbridge #1",
    );
  });

  it("prefers the store's own name when present", () => {
    expect(
      storeLabel({ id: 1, city: "Lethbridge", name: "E. Anderson" }).name,
    ).toBe("E. Anderson");
  });

  it("falls back to the city-derived label when name is blank or null", () => {
    expect(storeLabel({ id: 2, city: "Woodridge", name: null }).name).toBe(
      "Woodridge #2",
    );
    expect(storeLabel({ id: 2, city: "Woodridge", name: "   " }).name).toBe(
      "Woodridge #2",
    );
  });
});
