export function getCustomerDeliveryPath(shippingNo: unknown): string | null {
  const normalized = String(shippingNo ?? "").trim();
  if (!normalized) return null;

  return `/i/${encodeURIComponent(normalized)}`;
}
