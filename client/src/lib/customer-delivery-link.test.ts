import { describe, expect, it } from "vitest";
import { getCustomerDeliveryPath } from "./customer-delivery-link";

describe("customer Delivery Note links", () => {
  it("always uses the public customer route", () => {
    expect(getCustomerDeliveryPath("260123")).toBe("/i/260123");
  });

  it("encodes the delivery token as one path segment", () => {
    expect(getCustomerDeliveryPath("safe value/1")).toBe("/i/safe%20value%2F1");
  });

  it("does not fall back to an internal Airtable record ID", () => {
    expect(getCustomerDeliveryPath("  ")).toBeNull();
    expect(getCustomerDeliveryPath(undefined)).toBeNull();
  });
});
