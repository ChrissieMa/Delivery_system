# Delivery System v1.7 — Fixed 100×150mm Batch PDF

This is a cumulative update built on the deployed Delivery System v1.6.

## Problem fixed

On iPhone, browser printing could ignore the CSS paper size and convert a batch
of Driver Notes into A4-style PDF pages. Two Driver Notes could appear on one
PDF page, and a note could be split when imported into the label-printer app.

## Current behaviour

- The mobile batch Driver Note screen now uses `分享 100×150 PDF`.
- The system creates a real PDF with a 100mm × 150mm MediaBox and CropBox.
- Every Driver Note is exactly one PDF page.
- The iOS share sheet is opened when file sharing is supported.
- If direct sharing is unavailable, the same fixed-size PDF is downloaded.
- Exporting the batch still records `Print Requested`, `Printed At`, and
  `Print Count` through the existing `recordPrint` flow.
- `Delivery Status` is not changed by printing or PDF export.
- The original browser print action remains available on desktop as
  `電腦列印`.

## Data and configuration

- No new Airtable fields.
- No new Railway variables.
- No database migration.

## Verification

- TypeScript check passed.
- Production build passed.
- Existing Delivery v1.6 client tests passed.
- A five-page generated PDF was verified page by page:
  `283.465 × 425.197 pt`, equivalent to `100 × 150mm`.

Deploy by replacing the Delivery System repository with the complete v1.7
package.
