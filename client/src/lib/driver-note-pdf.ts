import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const DRIVER_NOTE_PAGE_WIDTH_MM = 100;
export const DRIVER_NOTE_PAGE_HEIGHT_MM = 150;

const waitForImage = async (image: HTMLImageElement) => {
  if (!image.complete) {
    await new Promise<void>((resolve) => {
      const finish = () => resolve();
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
    });
  }

  if (typeof image.decode === "function") {
    await image.decode().catch(() => undefined);
  }
};

const waitForPageAssets = async (pages: HTMLElement[]) => {
  await document.fonts?.ready.catch(() => undefined);

  const images = pages.flatMap((page) =>
    Array.from(page.querySelectorAll<HTMLImageElement>("img"))
  );
  await Promise.all(images.map(waitForImage));
};

export const createDriverNotesDocument = () =>
  new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [DRIVER_NOTE_PAGE_WIDTH_MM, DRIVER_NOTE_PAGE_HEIGHT_MM],
    compress: true,
  });

export const addDriverNoteImage = (
  pdf: jsPDF,
  imageData: string,
  pageIndex: number
) => {
  if (pageIndex > 0) {
    pdf.addPage(
      [DRIVER_NOTE_PAGE_WIDTH_MM, DRIVER_NOTE_PAGE_HEIGHT_MM],
      "portrait"
    );
  }

  pdf.addImage(
    imageData,
    "PNG",
    0,
    0,
    DRIVER_NOTE_PAGE_WIDTH_MM,
    DRIVER_NOTE_PAGE_HEIGHT_MM,
    undefined,
    "FAST"
  );
};

/**
 * Build a real 100mm x 150mm PDF with exactly one Driver Note per PDF page.
 * This avoids iOS turning the browser print layout into A4 pages.
 */
export const createDriverNotesPdf = async (pages: HTMLElement[]) => {
  if (pages.length === 0) {
    throw new Error("No Driver Notes were found to export.");
  }

  await waitForPageAssets(pages);

  const pdf = createDriverNotesDocument();
  pdf.setProperties({
    title: "LKS Driver Delivery Notes",
    subject: "100mm x 150mm Driver Delivery Notes",
    creator: "LKS Delivery System",
  });

  pages.forEach((page) => page.classList.add("pdf-capture"));

  try {
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      const page = pages[pageIndex];
      const canvas = await html2canvas(page, {
        backgroundColor: "#ffffff",
        logging: false,
        scale: 2.2,
        useCORS: true,
      });

      addDriverNoteImage(pdf, canvas.toDataURL("image/png"), pageIndex);

      // Keep memory usage under control when several labels are made on iPhone.
      canvas.width = 1;
      canvas.height = 1;
    }

    return pdf.output("blob");
  } finally {
    pages.forEach((page) => page.classList.remove("pdf-capture"));
  }
};
