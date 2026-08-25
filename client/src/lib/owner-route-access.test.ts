import { describe, expect, it } from "vitest";
import { OWNER_PROTECTED_PATH_PREFIXES } from "@shared/owner-route-access";

describe("Delivery route access boundary", () => {
  it("keeps internal, print and driver routes owner-protected", () => {
    expect(OWNER_PROTECTED_PATH_PREFIXES).toEqual(expect.arrayContaining([
      "/pending",
      "/label",
      "/labels",
      "/driver-note",
      "/driver-notes",
      "/shipping",
      "/invoice",
      "/batch-invoice",
    ]));
  });

  it("never applies owner Basic Auth to either customer Delivery Note route", () => {
    expect(OWNER_PROTECTED_PATH_PREFIXES).not.toContain("/i");
    expect(OWNER_PROTECTED_PATH_PREFIXES).not.toContain("/customer-invoice");
  });
});
