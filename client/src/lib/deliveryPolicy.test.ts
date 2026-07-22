import { describe, expect, it } from "vitest";
import { isCompanyPaidShippingOrder, parseLksOrderNo } from "@shared/delivery-policy";

describe("Delivery policy from JUN2602", () => {
  it("parses the LKS month/year/order sequence format", () => {
    expect(parseLksOrderNo("JUL2606")).toEqual({ year: 2026, month: 7, sequence: 6 });
  });

  it("starts company-paid shipping at JUN2602", () => {
    expect(isCompanyPaidShippingOrder("JUN2601")).toBe(false);
    expect(isCompanyPaidShippingOrder("JUN2602")).toBe(true);
    expect(isCompanyPaidShippingOrder("JUL2601")).toBe(true);
  });

  it("does not guess when an Order No is missing or malformed", () => {
    expect(isCompanyPaidShippingOrder("")).toBe(false);
    expect(isCompanyPaidShippingOrder("260021")).toBe(false);
  });
});
