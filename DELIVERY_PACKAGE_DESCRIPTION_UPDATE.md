# LKS Delivery System — Package Detail Description Update

## What changes

- Single and batch Product Label printing continue to share `DeliveryLabelCard`.
- The framed `Package Detail` area now reads `Order Items → Description` live from Airtable.
- Legacy Description values formatted as `Item Type / For What / Quote Description` are cleaned for label display so only the Quote Description is shown.
- When Description exists, the label displays `特別注意：{Description}` under accessories.
- Empty Description does not add a blank row.
- The density calculation now includes Description length and automatically reduces text size for multi-Item or long-detail labels.
- Label paper remains fixed at 10 × 15 cm; Shipping No, Order No, package count, customer phone and address remain unchanged.

## Verification after Railway deployment

1. Choose an Order Item whose Description contains a distinctive test phrase.
2. Open both `Print Product Label` and batch label print.
3. Confirm the same phrase appears inside Package Detail on both versions.
4. Confirm a record with blank Description has no `特別注意` line.
5. Confirm long text remains inside the Package Detail frame before printing.
