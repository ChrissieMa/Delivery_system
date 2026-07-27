import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  addDriverNoteImage,
  createDriverNotesDocument,
  DRIVER_NOTE_PAGE_HEIGHT_MM,
  DRIVER_NOTE_PAGE_WIDTH_MM,
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
});
