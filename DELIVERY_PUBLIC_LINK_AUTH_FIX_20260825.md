# Delivery customer-link authentication fix — 2026-08-25

## Scope

- The customer WhatsApp Delivery Note route remains `/i/:shippingNo` and does not use owner Basic Auth.
- Internal dashboard, pending, print, label, driver, invoice and `/customer-invoice/:recordId` routes remain owner-protected.
- The dashboard Delivery Note button and Copy action now generate only `/i/:shippingNo` URLs.
- Missing Shipping No values no longer fall back to an internal Airtable record ID.
- Public API lookup rejects internal Airtable record IDs; the internal record-ID lookup is owner-protected.

## Non-sensitive verification

- TypeScript check: passed.
- Automated tests: 22/22 passed.
- Production build: passed.
- Local route boundary test without credentials:
  - `/i/LKS-SAFE-INVALID-20260825`: HTTP 200, no Basic Auth challenge.
  - `/customer-invoice/LKS-SAFE-INVALID-20260825`: HTTP 401 with owner Basic Auth challenge.
  - `/pending`: HTTP 401 with owner Basic Auth challenge.
  - `/`: HTTP 401 with owner Basic Auth challenge.
- Production baseline before deployment:
  - public invalid `/i/` route opens without a password and renders `Order not found`.
  - internal `/pending` and `/customer-invoice/` routes return HTTP 401 without credentials.

No customer record, customer identifier, delivery token, credential or production business data was read or recorded for this verification.

## Security follow-up

Separately rotate any historical credential material that may have appeared in repository documentation and remove it from Git history. This follow-up must not reproduce credential values and does not block the customer-link fix.
