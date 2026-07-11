# LKS Delivery System — Phase 1 Complete Update

## Included

- Owner-protected Delivery System and `/pending` page.
- Pending page lists paid Order_2026 records without a linked Delivery.
- One action creates a Delivery and links its Order Items.
- Total Pieces automatically creates Package 1/N, 2/N, 3/N, etc.
- Driver fee rule: first 5 kg HK$100, then HK$10 per additional kg; no LKS markup.
- Customer Delivery Note shows delivery information, total pieces and total weight only. Prices and all payment methods are removed.
- Driver Note shows total pieces and total weight.
- Single and batch labels show Item No, item type/use, dimensions, levels and accessories.
- Print actions update `Print Requested`, `Printed At` and `Print Count` in Deliveries.
- Completed delivery status is standardized as `全部完成`.
- Delivery cost stays linked to the source Order, so its finance month follows `Order Month & Year`, not Delivery Date.

## Required Railway variables

Keep the existing Airtable variables and add:

- `ADMIN_USERNAME` — recommended `lks`
- `ADMIN_PASSWORD` — choose a private strong password

The internal system stays locked when `ADMIN_PASSWORD` is missing. The customer share route `/i/:shippingNo` remains public.

## Verification after Railway deployment

1. Open the Delivery System root and sign in with the owner username/password.
2. Open `待處理送貨`.
3. Confirm paid Orders without Delivery appear, including the correct JUL-style Order No and Item refs.
4. For one genuine ready-to-deliver Order, enter total weight, total pieces and dates, then create Delivery.
5. Confirm Airtable creates exactly one Delivery and the correct number of Packages.
6. Print one label and confirm Item details display and Print Count increases.
7. Open the customer Delivery Note and confirm it contains no price, delivery fee or payment method.

Do not create a fake Delivery for testing against production Airtable; use the next genuine ready Order.
