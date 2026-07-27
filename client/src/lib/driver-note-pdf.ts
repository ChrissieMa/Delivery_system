import { jsPDF } from "jspdf";

export const DRIVER_NOTE_PAGE_WIDTH_MM = 100;
export const DRIVER_NOTE_PAGE_HEIGHT_MM = 150;

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1200;
const SCALE = CANVAS_WIDTH / 100;
const FONT_FAMILY =
  'Arial, "PingFang HK", "PingFang TC", "Microsoft JhengHei", sans-serif';

type DriverNoteData = {
  order?: { fields?: Record<string, unknown> };
  customer?: { fields?: Record<string, unknown> };
};

export type DriverNoteField = {
  label: string;
  value: string;
  wide?: boolean;
  heightMm?: number;
};

const textValue = (value: unknown, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

export const getDriverNoteFields = (data: DriverNoteData): DriverNoteField[] => {
  const order = data.order?.fields || {};
  const customer = data.customer?.fields || {};

  return [
    { label: "配送號", value: textValue(order["Shipping No"]) },
    { label: "訂單號", value: textValue(order["Internal Order No"]) },
    { label: "客戶號碼", value: textValue(customer["Customer ID"]) },
    { label: "客戶名稱", value: textValue(customer["Customer Name"]) },
    { label: "聯絡電話", value: textValue(customer.Phone), wide: true },
    {
      label: "送貨地址",
      value: textValue(customer.Address),
      wide: true,
      heightMm: 18,
    },
    { label: "總件數", value: textValue(order["Total Pieces"], "0") },
    {
      label: "總重量",
      value: `${textValue(order["Total Weight"], "0")} KG`,
    },
    {
      label: "備註",
      value: textValue(order["Driver Remark"], "N/A"),
      wide: true,
      heightMm: 24,
    },
  ];
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

  const imageFormat = imageData.startsWith("data:image/png") ? "PNG" : "JPEG";
  pdf.addImage(
    imageData,
    imageFormat,
    0,
    0,
    DRIVER_NOTE_PAGE_WIDTH_MM,
    DRIVER_NOTE_PAGE_HEIGHT_MM,
    undefined,
    "FAST"
  );
};

let logoPromise: Promise<HTMLImageElement | null> | undefined;

const loadLogo = () => {
  if (logoPromise) return logoPromise;

  logoPromise = new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    // A missing logo must never stop the customer's labels from being made.
    image.onerror = () => resolve(null);
    image.src = "/lks-logo.png";

    if (image.complete) {
      resolve(image.naturalWidth > 0 ? image : null);
    }
  });

  return logoPromise;
};

const setCanvasFont = (
  context: CanvasRenderingContext2D,
  sizePx: number,
  weight = 700
) => {
  context.font = `${weight} ${sizePx}px ${FONT_FAMILY}`;
};

const wrapText = (
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number
) => {
  const lines: string[] = [];

  value.split(/\r?\n/).forEach((paragraph) => {
    if (!paragraph) {
      lines.push("");
      return;
    }

    let line = "";
    Array.from(paragraph).forEach((character) => {
      const candidate = `${line}${character}`;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = character;
      } else {
        line = candidate;
      }
    });

    if (line) lines.push(line);
  });

  return lines;
};

const drawFittedText = (
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  initialSize: number
) => {
  let fontSize = initialSize;
  let lines: string[] = [];
  let lineHeight = fontSize * 1.3;

  while (fontSize >= 20) {
    setCanvasFont(context, fontSize, 800);
    lineHeight = fontSize * 1.3;
    lines = wrapText(context, value, maxWidth);
    if (lines.length * lineHeight <= maxHeight) break;
    fontSize -= 2;
  }

  context.fillStyle = "#111111";
  context.textBaseline = "top";
  lines
    .slice(0, Math.max(1, Math.floor(maxHeight / lineHeight)))
    .forEach((line, lineIndex) => {
      context.fillText(line, x, y + lineIndex * lineHeight, maxWidth);
    });
};

const drawField = (
  context: CanvasRenderingContext2D,
  field: DriverNoteField,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  context.strokeStyle = "#334155";
  context.lineWidth = 3;
  context.strokeRect(x, y, width, height);

  const padding = 12;
  setCanvasFont(context, 18, 800);
  context.fillStyle = "#64748b";
  context.textBaseline = "top";
  context.fillText(field.label, x + padding, y + padding);

  drawFittedText(
    context,
    field.value,
    x + padding,
    y + 43,
    width - padding * 2,
    height - 52,
    field.wide ? 28 : 30
  );
};

const drawDriverNoteCanvas = async (data: DriverNoteData) => {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("This browser cannot make a PDF canvas.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const outerMargin = 3 * SCALE;
  context.strokeStyle = "#1f2937";
  context.lineWidth = 6;
  context.strokeRect(
    outerMargin,
    outerMargin,
    CANVAS_WIDTH - outerMargin * 2,
    CANVAS_HEIGHT - outerMargin * 2
  );

  const left = 8 * SCALE;
  const contentWidth = CANVAS_WIDTH - left * 2;

  setCanvasFont(context, 34, 900);
  context.fillStyle = "#e85d04";
  context.textBaseline = "top";
  context.fillText("LKS DISPLAY BOX", left, 9 * SCALE);

  setCanvasFont(context, 22, 800);
  context.fillStyle = "#111111";
  context.fillText("DRIVER DELIVERY NOTE", left, 15 * SCALE);

  const logo = await loadLogo();
  if (logo) {
    const maxWidth = 23 * SCALE;
    const maxHeight = 14 * SCALE;
    const ratio = Math.min(maxWidth / logo.naturalWidth, maxHeight / logo.naturalHeight);
    const width = logo.naturalWidth * ratio;
    const height = logo.naturalHeight * ratio;
    context.drawImage(
      logo,
      CANVAS_WIDTH - left - width,
      7 * SCALE + (maxHeight - height) / 2,
      width,
      height
    );
  }

  const headerLineY = 23 * SCALE;
  context.strokeStyle = "#1f2937";
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(left, headerLineY);
  context.lineTo(CANVAS_WIDTH - left, headerLineY);
  context.stroke();

  const gap = 1.2 * SCALE;
  const columnWidth = (contentWidth - gap) / 2;
  let y = 25 * SCALE;
  const fields = getDriverNoteFields(data);

  for (let index = 0; index < fields.length; ) {
    const field = fields[index];
    const rowHeight = (field.heightMm || 13.5) * SCALE;

    if (field.wide) {
      drawField(context, field, left, y, contentWidth, rowHeight);
      y += rowHeight + gap;
      index += 1;
      continue;
    }

    drawField(context, field, left, y, columnWidth, rowHeight);
    const rightField = fields[index + 1];
    if (rightField && !rightField.wide) {
      drawField(
        context,
        rightField,
        left + columnWidth + gap,
        y,
        columnWidth,
        rowHeight
      );
      index += 2;
    } else {
      index += 1;
    }
    y += rowHeight + gap;
  }

  return canvas;
};

const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });

/**
 * Build a real 100mm x 150mm PDF with exactly one Driver Note per PDF page.
 *
 * The label is drawn directly on a small canvas instead of taking a screenshot
 * of the webpage. This avoids html2canvas parsing Tailwind's `oklch()` colours,
 * which fails on some iPhone/Safari versions.
 */
export const createDriverNotesPdf = async (orders: DriverNoteData[]) => {
  if (orders.length === 0) {
    throw new Error("No Driver Notes were found to export.");
  }

  await document.fonts?.ready.catch(() => undefined);

  const pdf = createDriverNotesDocument();
  pdf.setProperties({
    title: "LKS Driver Delivery Notes",
    subject: "100mm x 150mm Driver Delivery Notes",
    creator: "LKS Delivery System",
  });

  for (let pageIndex = 0; pageIndex < orders.length; pageIndex += 1) {
    const canvas = await drawDriverNoteCanvas(orders[pageIndex]);
    addDriverNoteImage(
      pdf,
      canvas.toDataURL("image/jpeg", 0.92),
      pageIndex
    );

    // Release each page before drawing the next one to protect iPhone memory.
    canvas.width = 1;
    canvas.height = 1;
    await yieldToBrowser();
  }

  return pdf.output("blob");
};
