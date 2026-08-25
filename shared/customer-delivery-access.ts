const CUSTOMER_DELIVERY_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function isCustomerDeliveryToken(value: string): boolean {
  const normalized = value.trim();
  return CUSTOMER_DELIVERY_TOKEN_PATTERN.test(normalized) && !normalized.toLowerCase().startsWith("rec");
}
