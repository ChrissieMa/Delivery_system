import { jsPDF } from "jspdf";

export const LABEL_PAGE_WIDTH_MM = 100;
export const LABEL_PAGE_HEIGHT_MM = 150;

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1200;
const SCALE = CANVAS_WIDTH / LABEL_PAGE_WIDTH_MM;
const FONT_FAMILY =
  'Arial, "PingFang HK", "PingFang TC", "Microsoft JhengHei", sans-serif';

export type LabelItemDetail = {
  key?: string;
  itemType?: string;
  dimensions?: string;
  levels?: string;
  accessories?: string[];
  description?: string;
};

export type DeliveryLabelData = {
  key?: string;
  shippingNo?: string;
  orderNo?: string;
  customerNo?: string;
  phone?: string;
  address?: string;
  boxNo?: string | number;
  totalBoxes?: string | number;
  note?: string;
  itemDetails?: LabelItemDetail[];
};

const textValue = (value: unknown, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const setFont = (
  context: CanvasRenderingContext2D,
  sizePx: number,
  weight = 700,
) => {
  context.font = `${weight} ${sizePx}px ${FONT_FAMILY}`;
};

const wrapText = (
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
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

const fittedLines = (
  context: CanvasRenderingContext2D,
  values: string[],
  maxWidth: number,
  maxHeight: number,
  initialSize: number,
  minimumSize = 18,
) => {
  let fontSize = initialSize;
  let lines: string[] = [];
  let lineHeight = fontSize * 1.25;

  while (fontSize >= minimumSize) {
    setFont(context, fontSize, 800);
    lineHeight = fontSize * 1.25;
    lines = values.flatMap((value) => wrapText(context, value, maxWidth));
    if (lines.length * lineHeight <= maxHeight) break;
    fontSize -= 2;
  }

  return { fontSize, lineHeight, lines };
};

export const getLabelItemLines = (label: DeliveryLabelData): string[] => {
  const details = label.itemDetails || [];
  if (!details.length) return ["Package"];

  return details.flatMap((item, index) => {
    const accessories = item.accessories?.filter(Boolean).join("、") || "無";
    const dimensions = [
      `內尺寸　${textValue(item.dimensions, "-")}`,
      item.levels ? `｜${item.levels}` : "",
    ].join("");
    const lines = [
      textValue(item.itemType, "Package"),
      dimensions,
      `配件：${accessories}`,
    ];
    if (item.description) lines.push(`特別注意：${item.description}`);
    if (index < details.length - 1) lines.push("────────");
    return lines;
  });
};

export const createLabelsDocument = () =>
  new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [LABEL_PAGE_WIDTH_MM, LABEL_PAGE_HEIGHT_MM],
    compress: true,
  });

export const addLabelImage = (
  pdf: jsPDF,
  imageData: string,
  pageIndex: number,
) => {
  if (pageIndex > 0) {
    pdf.addPage([LABEL_PAGE_WIDTH_MM, LABEL_PAGE_HEIGHT_MM], "portrait");
  }

  const imageFormat = imageData.startsWith("data:image/png") ? "PNG" : "JPEG";
  pdf.addImage(
    imageData,
    imageFormat,
    0,
    0,
    LABEL_PAGE_WIDTH_MM,
    LABEL_PAGE_HEIGHT_MM,
    undefined,
    "FAST",
  );
};

let logoPromise: Promise<HTMLImageElement | null> | undefined;

const loadLogo = () => {
  if (logoPromise) return logoPromise;

  logoPromise = new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = "/lks-logo.png";
    if (image.complete) resolve(image.naturalWidth > 0 ? image : null);
  });

  return logoPromise;
};

const drawReferenceRow = (
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  y: number,
) => {
  const left = 12 * SCALE;
  setFont(context, 27, 800);
  context.fillStyle = "#111111";
  context.textBaseline = "top";
  context.fillText(label, left, y);
  context.fillText(value, 48 * SCALE, y);
};

const drawContactRow = (
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  y: number,
  fontSize = 23,
) => {
  const left = 11 * SCALE;
  setFont(context, fontSize, 800);
  context.fillStyle = "#111111";
  context.textBaseline = "top";
  context.fillText(label, left, y);
  const maxWidth = 48 * SCALE;
  const { lines, lineHeight } = fittedLines(
    context,
    [value],
    maxWidth,
    10 * SCALE,
    fontSize,
    17,
  );
  lines.slice(0, 2).forEach((line, index) => {
    context.fillText(line, 42 * SCALE, y + index * lineHeight, maxWidth);
  });
};

const drawLabelCanvas = async (label: DeliveryLabelData) => {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("This browser cannot make a PDF canvas.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const left = 6 * SCALE;
  const right = CANVAS_WIDTH - left;

  const logo = await loadLogo();
  if (logo) {
    const maxWidth = 23 * SCALE;
    const maxHeight = 14 * SCALE;
    const ratio = Math.min(
      maxWidth / logo.naturalWidth,
      maxHeight / logo.naturalHeight,
    );
    const width = logo.naturalWidth * ratio;
    const height = logo.naturalHeight * ratio;
    context.drawImage(
      logo,
      left,
      5.5 * SCALE + (maxHeight - height) / 2,
      width,
      height,
    );
  }

  context.textAlign = "right";
  setFont(context, 36, 900);
  context.fillStyle = "#111111";
  context.textBaseline = "top";
  context.fillText("LKS DISPLAY BOX", right, 6.5 * SCALE);
  setFont(context, 25, 800);
  context.fillText("Package Detail", right, 12.5 * SCALE);
  context.textAlign = "left";

  context.strokeStyle = "#555555";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(left, 20 * SCALE);
  context.lineTo(right, 20 * SCALE);
  context.stroke();

  drawReferenceRow(
    context,
    "Shipping No.",
    textValue(label.shippingNo),
    23 * SCALE,
  );
  drawReferenceRow(
    context,
    "Order No.",
    textValue(label.orderNo),
    28 * SCALE,
  );

  context.textAlign = "center";
  setFont(context, 148, 900);
  context.fillStyle = "#111111";
  context.textBaseline = "middle";
  context.fillText(
    `${textValue(label.boxNo, "1")}/${textValue(label.totalBoxes, "1")}`,
    CANVAS_WIDTH / 2,
    52 * SCALE,
    88 * SCALE,
  );
  setFont(context, 24, 700);
  context.textBaseline = "top";
  context.fillText(
    `Total Pieces：${textValue(label.totalBoxes, "1")}`,
    CANVAS_WIDTH / 2,
    66 * SCALE,
  );

  const itemBoxX = left;
  const itemBoxY = 72 * SCALE;
  const itemBoxWidth = right - left;
  const itemBoxHeight = 35 * SCALE;
  context.strokeStyle = "#222222";
  context.lineWidth = 5;
  context.strokeRect(itemBoxX, itemBoxY, itemBoxWidth, itemBoxHeight);

  const itemLines = getLabelItemLines(label);
  const fitted = fittedLines(
    context,
    itemLines,
    itemBoxWidth - 6 * SCALE,
    itemBoxHeight - 4 * SCALE,
    26,
    15,
  );
  context.fillStyle = "#111111";
  context.textAlign = "center";
  context.textBaseline = "top";
  fitted.lines.forEach((line, index) => {
    if (line.startsWith("特別注意：")) context.fillStyle = "#9a3412";
    else context.fillStyle = "#111111";
    context.fillText(
      line,
      CANVAS_WIDTH / 2,
      itemBoxY + 2 * SCALE + index * fitted.lineHeight,
      itemBoxWidth - 6 * SCALE,
    );
  });

  let contactStartMm = 110;
  if (label.note) {
    const noteY = 108.5 * SCALE;
    context.fillStyle = "#fff7ed";
    context.strokeStyle = "#e46141";
    context.lineWidth = 3;
    context.fillRect(left, noteY, itemBoxWidth, 8 * SCALE);
    context.strokeRect(left, noteY, itemBoxWidth, 8 * SCALE);
    setFont(context, 18, 800);
    context.fillStyle = "#c2410c";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText(
      `Package Note：${label.note}`,
      left + 2 * SCALE,
      noteY + 1.5 * SCALE,
      itemBoxWidth - 4 * SCALE,
    );
    contactStartMm = 118;
  }

  context.textAlign = "left";
  drawContactRow(
    context,
    "Customer No.",
    textValue(label.customerNo),
    contactStartMm * SCALE,
  );
  drawContactRow(
    context,
    "Phone No.",
    textValue(label.phone),
    (contactStartMm + 5.5) * SCALE,
  );
  drawContactRow(
    context,
    "Address",
    textValue(label.address),
    (contactStartMm + 11) * SCALE,
    21,
  );

  context.strokeStyle = "#555555";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(left, 143 * SCALE);
  context.lineTo(right, 143 * SCALE);
  context.stroke();
  context.textAlign = "center";
  setFont(context, 22, 700);
  context.fillStyle = "#111111";
  context.textBaseline = "top";
  context.fillText(
    `Total Pieces：${textValue(label.totalBoxes, "1")}`,
    CANVAS_WIDTH / 2,
    145 * SCALE,
  );

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
 * Build a real 100mm x 150mm PDF with exactly one Product Label per page.
 * Each label is drawn directly on canvas so iPhone Safari never has to run
 * window.print() or parse Tailwind styles.
 */
export const createLabelsPdf = async (labels: DeliveryLabelData[]) => {
  if (!labels.length) throw new Error("No Product Labels were found to export.");

  await document.fonts?.ready.catch(() => undefined);

  const pdf = createLabelsDocument();
  pdf.setProperties({
    title: "LKS Product Labels",
    subject: "100mm x 150mm Product Labels",
    creator: "LKS Delivery System",
  });

  for (let pageIndex = 0; pageIndex < labels.length; pageIndex += 1) {
    const canvas = await drawLabelCanvas(labels[pageIndex]);
    addLabelImage(pdf, canvas.toDataURL("image/jpeg", 0.92), pageIndex);
    canvas.width = 1;
    canvas.height = 1;
    await yieldToBrowser();
  }

  return pdf.output("blob");
};
