import { describe, expect, it } from "vitest";
import { compareLksOrderNos, parseLksOrderNo } from "./order-sequence";

describe("LKS order chronology", () => {
  it("parses the month, year and sequence from an LKS order number", () => {
    expect(parseLksOrderNo("JUN2602")).toEqual({
      year: 2026,
      month: 6,
      sequence: 2,
    });
  });

  it("sorts June deliveries before July deliveries", () => {
    const values = [
      "JUL2601",
      "JUN2603",
      "JUL2602",
      "JUN2602",
    ];

    expect(values.sort(compareLksOrderNos)).toEqual([
      "JUN2602",
      "JUN2603",
      "JUL2601",
      "JUL2602",
    ]);
  });

  it("sorts the order sequence numerically within the same month", () => {
    expect(["JUL2610", "JUL2602", "JUL2601"].sort(compareLksOrderNos)).toEqual([
      "JUL2601",
      "JUL2602",
      "JUL2610",
    ]);
  });
});

