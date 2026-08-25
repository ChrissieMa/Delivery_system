import { describe, expect, it } from "vitest";
import { isCustomerDeliveryToken } from "@shared/customer-delivery-access";

describe("public customer Delivery lookup", () => {
  it("accepts a customer delivery token", () => {
    expect(isCustomerDeliveryToken("260123")).toBe(true);
    expect(isCustomerDeliveryToken("DELIVERY_260123-A")).toBe(true);
  });

  it("rejects internal Airtable record IDs", () => {
    expect(isCustomerDeliveryToken("recInternalRecordId")).toBe(false);
  });

  it("rejects empty, path-like and oversized input", () => {
    expect(isCustomerDeliveryToken("  ")).toBe(false);
    expect(isCustomerDeliveryToken("260123/other")).toBe(false);
    expect(isCustomerDeliveryToken("x".repeat(65))).toBe(false);
  });
});
