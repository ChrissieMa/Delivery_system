const MONTH_INDEX: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

export type ParsedOrderNo = {
  year: number;
  month: number;
  sequence: number;
};

export function parseLksOrderNo(value: unknown): ParsedOrderNo | null {
  const match = String(value || "")
    .trim()
    .toUpperCase()
    .match(/^([A-Z]{3})(\d{2})(\d{2,})$/);

  if (!match) return null;

  const month = MONTH_INDEX[match[1]];
  if (!month) return null;

  return {
    year: 2000 + Number(match[2]),
    month,
    sequence: Number(match[3]),
  };
}

export function compareLksOrderNos(left: unknown, right: unknown): number {
  const a = parseLksOrderNo(left);
  const b = parseLksOrderNo(right);

  if (a && b) {
    return (
      a.year - b.year ||
      a.month - b.month ||
      a.sequence - b.sequence
    );
  }

  if (a) return -1;
  if (b) return 1;
  return String(left || "").localeCompare(String(right || ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

