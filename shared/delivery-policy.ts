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

export const COMPANY_PAID_SHIPPING_TEXT =
  "由公司支付運費｜客戶無須支付費用，只需留意司機致電送貨日期，謝謝。";

type ParsedOrderNo = {
  year: number;
  month: number;
  sequence: number;
};

export function parseLksOrderNo(value: unknown): ParsedOrderNo | null {
  const match = String(value || "")
    .trim()
    .toUpperCase()
    .match(/^([A-Z]{3})(\d{2})(\d{2,})$/);
  if (!match || !MONTH_INDEX[match[1]]) return null;

  return {
    year: 2000 + Number(match[2]),
    month: MONTH_INDEX[match[1]],
    sequence: Number(match[3]),
  };
}

export function isCompanyPaidShippingOrder(orderNo: unknown): boolean {
  const parsed = parseLksOrderNo(orderNo);
  if (!parsed) return false;

  if (parsed.year !== 2026) return parsed.year > 2026;
  if (parsed.month !== 6) return parsed.month > 6;
  return parsed.sequence >= 2;
}
