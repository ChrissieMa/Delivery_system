import { describe, expect, it } from "vitest";
import {
  chinaFreightPackages,
  chinaFreightWeight,
  totalPackagesForItems,
} from "./pendingDelivery";

describe("pending Delivery China freight defaults", () => {
  it("uses the Item total weight and piece count entered for China freight", () => {
    const item = {
      id: "item-a",
      fields: {
        "China Freight Weight Input KG": 31.4,
        "China Freight Piece Count": 3,
      },
    };

    expect(chinaFreightWeight(item)).toBe(31.4);
    expect(chinaFreightPackages(item)).toBe(3);
  });

  it("adds exactly one Package when the Item has any light accessory", () => {
    const litItem = { id: "lit", fields: { Accessories: ["背景", "上下燈"] } };
    const plainItem = { id: "plain", fields: { Accessories: ["背景"] } };

    expect(totalPackagesForItems([litItem], { lit: "3" })).toBe(4);
    expect(totalPackagesForItems([plainItem], { plain: "3" })).toBe(3);
  });

  it("leaves missing China freight values available for legacy fallback", () => {
    const item = { id: "legacy", fields: {} };

    expect(chinaFreightWeight(item)).toBeUndefined();
    expect(chinaFreightPackages(item)).toBeUndefined();
  });
});
