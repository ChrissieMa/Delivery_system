const CUSTOMER_DELIVERY_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const CUSTOMER_DELIVERY_RECORD_TOKEN_PATTERN = /^rec[A-Za-z0-9]{14,64}$/;

export function isCustomerDeliveryToken(value: string): boolean {
  const normalized = value.trim();
  return CUSTOMER_DELIVERY_TOKEN_PATTERN.test(normalized) && !normalized.toLowerCase().startsWith("rec");
}

export function isCustomerDeliveryRecordToken(value: string): boolean {
  return CUSTOMER_DELIVERY_RECORD_TOKEN_PATTERN.test(value.trim());
}
