# Delivery System v1.8 — iPhone 100×150 PDF Fix

## 修正

- 移除批量 PDF 對 `html2canvas` 網頁截圖嘅依賴。
- Driver Note 直接由訂單資料畫成 800×1200 canvas，再加入真正 100×150mm PDF。
- 避免 iPhone Safari 解析 Tailwind `oklch()` 顏色時令 PDF「製作失敗」。
- 每完成一頁即釋放 canvas 記憶體，減少多張標籤時 Safari 記憶體不足。
- Logo 載入失敗時仍會繼續製作 PDF，唔會令全批中止。

## 手機分享後備

- 首次按「分享 100×150 PDF」會製作 PDF 並嘗試開啟分享表。
- 如果 iOS 因製作時間令分享權限過期，PDF 會保留喺畫面：
  - 再按「分享 PDF」即可用新一次點擊開啟分享表。
  - 或按「下載 PDF」直接保存。
- 取消分享唔會顯示成製作失敗。

## 保留

- PDF 每頁 100mm × 150mm。
- 一張 Driver Note 一頁。
- v1.6 公司支付運費、到貨狀態、Description 清理等累積功能。
- 分享／下載 PDF 後繼續記錄已列印；不改 Delivery Status。
- 不需要新增 Railway Variables 或 Airtable 欄位。
