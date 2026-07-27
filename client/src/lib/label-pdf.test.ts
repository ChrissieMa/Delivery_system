import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  addLabelImage,
  createLabelsDocument,
  getLabelItemLines,
  LABEL_PAGE_HEIGHT_MM,
  LABEL_PAGE_WIDTH_MM,
} from "./label-pdf";

const LOGO_PNG = `data:image/png;base64,${readFileSync(
  new URL("../../public/lks-logo.png", import.meta.url),
).toString("base64")}`;

describe("Product Label PDF", () => {
  it("uses an exact 100mm x 150mm page for every Product Label", () => {
    const pdf = createLabelsDocument();

    for (let pageIndex = 0; pageIndex < 10; pageIndex += 1) {
      addLabelImage(pdf, LOGO_PNG, pageIndex);
    }

    expect(pdf.getNumberOfPages()).toBe(10);
    for (let pageNumber = 1; pageNumber <= 10; pageNumber += 1) {
      pdf.setPage(pageNumber);
      expect(pdf.internal.pageSize.getWidth()).toBeCloseTo(
        LABEL_PAGE_WIDTH_MM,
        4,
      );
      expect(pdf.internal.pageSize.getHeight()).toBeCloseTo(
        LABEL_PAGE_HEIGHT_MM,
        4,
      );
    }
  });

  it("keeps important production notes in the PDF content", () => {
    expect(
      getLabelItemLines({
        itemDetails: [{
          itemType: "Display Box｜LEGO 10237",
          dimensions: "50 × 30 × 20cm",
          levels: "",
          accessories: ["上下燈"],
          description: "電源線做2米長／全白光",
        }],
      }),
    ).toContain("特別注意：電源線做2米長／全白光");
  });
});

