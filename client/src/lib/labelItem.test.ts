import { describe, expect, it } from "vitest";
import { buildLabelItemDetails, cleanLabelDescription } from "./labelItem";

describe("Product Label Item details", () => {
  it("keeps only JUL2606's production notes", () => {
    expect(cleanLabelDescription(
      "Display box 展示盒/電源線做2米長/全白光",
      "Display box 展示盒",
    )).toBe("電源線做2米長／全白光");
  });

  it("removes the legacy Item Type and For What prefix", () => {
    expect(cleanLabelDescription(
      "Display Box / LEGO 10237 / 電源線做2米長",
      "Display Box",
      "LEGO 10237",
    )).toBe("電源線做2米長");
  });

  it("does not show generic or N/A descriptions", () => {
    expect(cleanLabelDescription("Display box 展示盒")).toBe("");
    expect(cleanLabelDescription("N/A")).toBe("");
  });

  it("shows For What beside the product type", () => {
    const [detail] = buildLabelItemDetails([{ id: "item-1", fields: {
      "Item Type": "Display Box",
      "For What": "LEGO 10237",
      "Inter L": 50,
      "Inter D": 30,
      "Inter H": 20,
    } }]);

    expect(detail.itemType).toBe("Display Box｜LEGO 10237");
  });
});
