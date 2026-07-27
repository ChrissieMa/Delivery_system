import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  addDriverNoteImage,
  createDriverNotesDocument,
  DRIVER_NOTE_PAGE_HEIGHT_MM,
  DRIVER_NOTE_PAGE_WIDTH_MM,
  getDriverNoteFields,
} from "./driver-note-pdf";

const LOGO_PNG = `data:image/png;base64,${readFileSync(
  new URL("../../public/lks-logo.png", import.meta.url)
).toString("base64")}`;

describe("Driver Note PDF", () => {
  it("uses an exact 100mm x 150mm page for every Driver Note", () => {
    const pdf = createDriverNotesDocument();

    for (let pageIndex = 0; pageIndex < 5; pageIndex += 1) {
      addDriverNoteImage(pdf, LOGO_PNG, pageIndex);
    }

    expect(pdf.getNumberOfPages()).toBe(5);

    for (let pageNumber = 1; pageNumber <= 5; pageNumber += 1) {
      pdf.setPage(pageNumber);
      expect(pdf.internal.pageSize.getWidth()).toBeCloseTo(
        DRIVER_NOTE_PAGE_WIDTH_MM,
        4
      );
      expect(pdf.internal.pageSize.getHeight()).toBeCloseTo(
        DRIVER_NOTE_PAGE_HEIGHT_MM,
        4
      );
    }
  });

  it("maps the Airtable order and customer fields without using the DOM", () => {
    const fields = getDriverNoteFields({
      order: {
        fields: {
          "Shipping No": "260026",
          "Internal Order No": "JUL2606",
          "Total Pieces": 2,
          "Total Weight": 8.5,
          "Driver Remark": "電源線做2米長／全白光",
        },
      },
      customer: {
        fields: {
          "Customer ID": "C001",
          "Customer Name": "測試客戶",
          Phone: "91234567",
          Address: "香港測試地址",
        },
      },
    });

    expect(fields.map((field) => field.value)).toEqual([
      "260026",
      "JUL2606",
      "C001",
      "測試客戶",
      "91234567",
      "香港測試地址",
      "2",
      "8.5 KG",
      "電源線做2米長／全白光",
    ]);
  });
});
