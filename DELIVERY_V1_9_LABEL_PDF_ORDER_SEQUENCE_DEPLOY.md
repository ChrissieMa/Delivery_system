# Delivery System v1.9

## Product Label PDF

- Batch Product Labels no longer rely on mobile `window.print()`.
- Mobile creates a real 100mm × 150mm PDF.
- One Product Label equals one PDF page.
- The ready PDF can be shared or downloaded.
- Desktop browser print remains available as a desktop-only fallback.
- Single Product Label and batch Product Labels use the same fixed-size PDF flow.

## Shipping No sequence

- Existing Airtable records were corrected:
  - 260021 = JUN2602
  - 260022 = JUN2603
  - 260023 = JUL2601
  - 260024 = JUL2602
  - 260025 = JUL2603
  - 260026 = JUL2604
- Pending Delivery records now sort by actual LKS order chronology:
  year → month → order sequence.
- Month abbreviations are no longer sorted alphabetically, which previously
  placed JUL before JUN.

## Deployment

Replace the complete Delivery System repository with this package and deploy
normally. No new Airtable fields or Railway variables are required.

