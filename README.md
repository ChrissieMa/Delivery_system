# LKS Display Box — 配送管理與印單系統

連接 Airtable 數據庫，為 LKS Display Box 提供配送標籤打印、司機送貨單、客戶收運費單等功能。每張單據有獨立連結，可直接透過 WhatsApp 發送給客人。

---

## 功能概覽

| 功能 | 說明 |
|------|------|
| 訂單列表 | 搜索、篩選（到貨/已送貨/已完成）、全選、批量操作 |
| 打印標籤 | A6 / 100mm×150mm 配送標籤 |
| 司機送貨單 | 100mm×150mm 司機專用送貨單 |
| 客戶收運費單 | A4 格式，含付款方式、條款，可直接分享連結給客人 |
| 批量打印 | 一次過打印多張收運費單 |
| 複製連結 | 每張單有獨立 URL，可直接 WhatsApp 發送給客人 |

---

## 技術棧

| 層次 | 技術 |
|------|------|
| 前端 | React 19 + TypeScript + TailwindCSS 4 |
| 後端 | Express + tRPC |
| 數據庫 | Airtable API（無需額外數據庫） |
| 路由 | Wouter |
| 建構工具 | Vite 7 + esbuild |
| 套件管理 | pnpm 10 |
| 容器化 | Docker (multi-stage build) |

---

## 環境變數清單

| 變數名 | 必填 | 說明 | 範例值 |
|--------|------|------|--------|
| `AIRTABLE_API_KEY` | **是** | Airtable Personal Access Token | `pat1ZjXX1NZuL3IlC.xxxx...` |
| `AIRTABLE_BASE_ID` | **是** | Airtable Base ID | `appYXy6deXpXMqhwu` |
| `PORT` | 否 | 伺服器端口（Railway 自動設定） | `3000` |
| `NODE_ENV` | 否 | 運行環境（預設 `production`） | `production` |

> **注意：** 本系統不需要額外的數據庫（MySQL/PostgreSQL 等），所有數據均來自 Airtable API。

---

## 指令一覽

| 用途 | 指令 |
|------|------|
| 安裝依賴 | `pnpm install` |
| 開發模式 | `pnpm run dev` |
| **Build** | `pnpm run build` |
| **Start（生產模式）** | `NODE_ENV=production node dist/index.js` |
| 類型檢查 | `pnpm run check` |
| 格式化 | `pnpm run format` |
| 測試 | `pnpm run test` |

---

## 本地開發

### 前置條件

- Node.js 22+
- pnpm 10+

### 步驟

```bash
# 1. Clone repo
git clone https://github.com/YOUR_USERNAME/lks-invoice-system.git
cd lks-invoice-system

# 2. 安裝依賴
pnpm install

# 3. 設定環境變數
cp .env.example .env.local
# 編輯 .env.local，填入你的 AIRTABLE_API_KEY 和 AIRTABLE_BASE_ID

# 4. 開發模式啟動
pnpm run dev
# 瀏覽器打開 http://localhost:3000
```

---

## Railway 部署步驟

### 第一步：準備 GitHub Repository

確保代碼已推送到 GitHub（本 repo 已準備好）。

### 第二步：建立 Railway 專案

1. 前往 [railway.app](https://railway.app) 並登入（可用 GitHub 帳號登入）
2. 點擊 **「New Project」**
3. 選擇 **「Deploy from GitHub repo」**
4. 授權 Railway 存取你的 GitHub，然後選擇 `lks-invoice-system` repo

### 第三步：設定環境變數

在 Railway 專案的 **Variables** 頁面，加入以下環境變數：

```
AIRTABLE_API_KEY=pat1ZjXX1NZuL3IlC.d2b88506a09d140b820e51c4156d248ed3f696d3e9e6b61311c7b31f8e608955
AIRTABLE_BASE_ID=appYXy6deXpXMqhwu
NODE_ENV=production
```

> **注意：** `PORT` 不需要手動設定，Railway 會自動分配。

### 第四步：確認部署設定

Railway 會自動偵測 `Dockerfile` 並使用 Docker 建構。如果沒有自動偵測，手動設定：

- **Build Command：** （使用 Dockerfile，無需額外設定）
- **Start Command：** `node dist/index.js`

### 第五步：部署

點擊 **Deploy**，Railway 會自動：
1. 拉取 GitHub 代碼
2. 使用 Dockerfile 建構映像
3. 啟動服務
4. 分配一個公開 URL（例如 `lks-invoice-system-production.up.railway.app`）

### 第六步：自定義域名（可選）

1. 在 Railway 專案的 **Settings → Networking → Custom Domain** 加入你的域名
2. Railway 會提供一個 CNAME 值
3. 在你的 DNS 設定（例如 Bluehost）中加入 CNAME 記錄：

| 類型 | 名稱 | 值 |
|------|------|-----|
| CNAME | `invoice` | `xxxx.up.railway.app` |

4. 等待 DNS 生效（通常 5-30 分鐘）
5. 之後就可以用 `invoice.你的域名.com` 存取

### 後續更新

每次推送代碼到 GitHub，Railway 會**自動重新部署**：

```bash
git add .
git commit -m "更新描述"
git push
# Railway 自動偵測並重新部署
```

---

## Docker 部署（替代方案）

如果你不使用 Railway，也可以用 Docker 部署到任何支持 Docker 的平台。

### 建構並運行

```bash
# 建構映像
docker build -t lks-invoice .

# 運行容器
docker run -d \
  -p 3000:3000 \
  -e AIRTABLE_API_KEY=your_api_key_here \
  -e AIRTABLE_BASE_ID=your_base_id_here \
  -e PORT=3000 \
  --name lks-invoice \
  --restart unless-stopped \
  lks-invoice
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  lks-invoice:
    build: .
    ports:
      - "3000:3000"
    environment:
      - AIRTABLE_API_KEY=your_api_key_here
      - AIRTABLE_BASE_ID=your_base_id_here
      - PORT=3000
      - NODE_ENV=production
    restart: unless-stopped
```

```bash
docker compose up -d
```

---

## 專案結構

```
lks-invoice-system/
├── client/                        # 前端 React 應用
│   ├── index.html                 # HTML 入口
│   ├── public/                    # 靜態資源（Logo 等）
│   └── src/
│       ├── App.tsx                # 路由設定
│       ├── pages/
│       │   ├── OrderList.tsx      # 主頁：訂單列表、篩選、全選、批量操作
│       │   ├── LabelPrint.tsx     # 打印標籤（A6）
│       │   ├── DriverDeliveryNote.tsx  # 司機送貨單
│       │   ├── CustomerInvoice.tsx     # 客戶收運費單（獨立分享連結）
│       │   └── BatchInvoice.tsx        # 批量打印收運費單
│       ├── components/            # UI 組件（shadcn/ui）
│       ├── hooks/                 # React Hooks
│       └── lib/                   # 工具函數
├── server/
│   ├── _core/                     # 核心框架（Express + tRPC）
│   ├── airtable.ts                # Airtable API 整合
│   ├── routers.ts                 # tRPC API 路由
│   ├── db.ts                      # 數據庫設定（Drizzle，未使用）
│   └── storage.ts                 # 存儲層
├── shared/
│   ├── airtable-types.ts          # Airtable 數據類型定義
│   └── types.ts                   # 共用類型
├── drizzle/                       # Drizzle ORM（scaffold 自帶，本專案未使用）
├── patches/                       # pnpm 補丁
├── Dockerfile                     # Docker 多階段建構
├── railway.json                   # Railway 部署配置
├── .env.example                   # 環境變數範例
├── .dockerignore                  # Docker 忽略文件
├── package.json                   # 依賴和腳本
├── pnpm-lock.yaml                 # 鎖定依賴版本
├── vite.config.ts                 # Vite 建構配置
└── tsconfig.json                  # TypeScript 配置
```

---

## Airtable 數據結構

### 表格關聯

```
Deliveries (配送) → Order_2026 (訂單) → Customers (客戶)
     ↓                    ↓
Order Items (訂單項目)   Customer ID (from Customer) 2
     ↓
Packages (包裹)
```

### 主要表格欄位

**Deliveries（配送 — 主表）**

| 欄位 | 說明 |
|------|------|
| Shipping No | 配送號（如 260001） |
| Order | 關聯 Order_2026 |
| Customer | 關聯 Customers |
| Order Items | 關聯 Order Items |
| Packages | 關聯 Packages |
| Delivery Status | 狀態（到貨/已送貨/已完成） |
| Delivery Date | 配送日期 |
| Total Pieces | 總件數 |
| Total Weight | 總重量 |
| Shipping Fee | 運費 |
| Delivery Address | 送貨地址 |

**Order_2026（訂單）**

| 欄位 | 說明 |
|------|------|
| Internal Order No | 訂單號（如 JAN2601） |
| Customer ID (from Customer) 2 | 客戶號碼 |

**Order Items（訂單項目）**

| 欄位 | 說明 |
|------|------|
| Item Type | 種類（如 Display Case） |
| Inner Size | 內尺寸 |
| Quantity | 數量 |
| Height | 層高 |
| Accessories | 配件（陣列格式） |

---

## 授權

MIT License
