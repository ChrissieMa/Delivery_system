# LKS Delivery System — v1.6 Complete Update

## v1.6 公司付運費、到貨狀態、Label 特別注意整理

- 由 `JUN2602` 起，新建立的 Delivery 自動填寫 `Shipping Paid By`：`由公司支付運費｜客戶無須支付費用，只需留意司機致電送貨日期，謝謝。`
- 新建立的 Delivery 自動將 `Delivery Status` 設成 `到貨`。
- Print 只更新 `Print Requested`、`Printed At`、`Print Count`；不會改動 `Delivery Status`。
- Label 將 `For What` 放在產品種類旁，例如 `Display Box｜LEGO 10237`。
- Label 的 `Description` 自動移除 `Display box 展示盒`、`Display Box`、`N/A`、重複 Item Type 及 For What，只保留製作／送貨需要留意的內容。
- JUL2606 類似內容會顯示為：`特別注意：電源線做2米長／全白光`。
- 現有 Delivery `260021–260026`（JUL2601–JUL2604、JUN2602–JUN2603）已於 2026-07-22 補回公司付款及到貨狀態。

## v1.5 大陸運費資料自動帶入待處理送貨

- `此 Item 重量 KG` 直接讀取 `Order Items.China Freight Weight Input KG`。
- `主件 Packages` 直接讀取 `Order Items.China Freight Piece Count`。
- Item 配件只要包含 `燈`，總 Packages 自動額外加 1，不論燈類數量都只加一件。
- 有大陸運費資料時，重量及主件件數為唯讀，無需重複輸入。
- 舊 Order Item 如果沒有上述新欄位數值，才顯示手動輸入 fallback。
- 建立 Delivery 時，後端再次以大陸運費欄位為準，避免前端舊數值覆蓋正式資料。

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
- Owner login now creates a secure same-site cookie so internal create/print API calls do not lose authorization and return 403.
- Home filters are `未列印 / 已列印 / 全部`; unprinted and newest Deliveries appear first without manual Airtable status entry.
- Pending Delivery separates every Order Item and automatically reads its China freight total weight.
- Base Package count automatically reads the China freight piece count; legacy Items without that value remain adjustable. Any accessory containing `燈` automatically adds one extra Package for that Item.
- Package Notes can be entered before creation and appear prominently on the label.
- Single and batch Labels share one fixed 105 × 148 mm component.
- Single and batch Driver Notes share one fixed 100 × 150 mm component.
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
4. For one genuine ready-to-deliver Order, confirm Item weight and base Packages were brought in from China freight input, enter the dates, then create Delivery.
5. Confirm Airtable creates exactly one Delivery and the correct number of Packages.
6. Print one label and confirm Item details display and Print Count increases.
7. Open the customer Delivery Note and confirm it contains no price, delivery fee or payment method.
8. For a multi-Item Order, confirm each Item shows its linked China freight total weight and the Delivery total is their sum.
9. For any Item with a light accessory, confirm the page shows automatic `+1 Package`.
10. Enter a Package Note such as `燈件，請先開此箱` and confirm it appears on that Package label.
11. Create a genuine Order from `JUN2602` onward and confirm `Shipping Paid By` is company-paid and `Delivery Status` is `到貨`.
12. Print the Label and confirm only Print fields change; `Delivery Status` remains `到貨`.
13. Confirm a JUL2606-style Description displays only `特別注意：電源線做2米長／全白光`.

## If Airtable still reports 403

The page now shows a specific message when Railway's `AIRTABLE_API_KEY` lacks write access. Edit that Airtable personal access token and ensure it has `data.records:read` and `data.records:write` access to the LKS Orders & Delivery base, then update the Railway variable and redeploy.

Do not create a fake Delivery for testing against production Airtable; use the next genuine ready Order.
