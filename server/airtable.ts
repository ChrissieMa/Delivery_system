import axios from "axios";
import type {
  AirtableCustomer,
  AirtableOrder,
  AirtableOrder2026,
  AirtableOrderItem,
  AirtablePackage,
} from "../shared/airtable-types";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const AIRTABLE_API_URL = "https://api.airtable.com/v0";

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error("ERROR: AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set in environment variables!");
}

const airtableClient = axios.create({
  baseURL: `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}`,
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
});

interface AirtableResponse<T> {
  records: T[];
  offset?: string;
}

function escapeFormulaString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function getAllPages<T>(path: string, params: Record<string, string | number> = {}): Promise<T[]> {
  const records: T[] = [];
  let offset: string | undefined;

  do {
    const response = await airtableClient.get<AirtableResponse<T>>(path, {
      params: offset ? { ...params, offset } : params,
    });
    records.push(...response.data.records);
    offset = response.data.offset;
  } while (offset);

  return records;
}

async function findDeliveryByShippingNo(shippingNo: string): Promise<AirtableOrder | null> {
  const safeShippingNo = escapeFormulaString(shippingNo.trim());
  const records = await getAllPages<AirtableOrder>("/Deliveries", {
    filterByFormula: `{Shipping No}='${safeShippingNo}'`,
    maxRecords: 1,
  });
  return records[0] || null;
}

function getPreferredOrderNo(order2026: AirtableOrder2026 | null): string | undefined {
  return order2026?.fields["Internal 1 Order No"] || order2026?.fields["Internal Order No"];
}

async function addPreferredOrderNo(order: AirtableOrder): Promise<AirtableOrder> {
  const orderRecordId = order.fields["Order"]?.[0];
  if (!orderRecordId) return order;

  const order2026 = await getOrder2026(orderRecordId);
  const preferredOrderNo = getPreferredOrderNo(order2026);
  if (preferredOrderNo) {
    order.fields["Internal Order No"] = preferredOrderNo;
  }
  return order;
}

// 獲取所有配送記錄，並補上日常使用的 LKS 訂單號。
export async function getAllOrders(): Promise<AirtableOrder[]> {
  try {
    const orders = await getAllPages<AirtableOrder>("/Deliveries", {
      "sort[0][field]": "Shipping No",
      "sort[0][direction]": "asc",
    });

    return Promise.all(orders.map(addPreferredOrderNo));
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw new Error("無法獲取訂單數據");
  }
}

// 獲取單個配送記錄。
export async function getOrderById(recordId: string): Promise<AirtableOrder | null> {
  try {
    const response = await airtableClient.get<AirtableOrder>(`/Deliveries/${recordId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch delivery record:", error);
    return null;
  }
}

// 獲取訂單項目。
export async function getOrderItems(orderItemIds: string[]): Promise<AirtableOrderItem[]> {
  if (!orderItemIds?.length) return [];

  try {
    const formula = `OR(${orderItemIds.map(id => `RECORD_ID()='${escapeFormulaString(id)}'`).join(",")})`;
    return await getAllPages<AirtableOrderItem>("/Order Items", { filterByFormula: formula });
  } catch (error) {
    console.error("Failed to fetch order items:", error);
    return [];
  }
}

// 獲取包裹資料。
export async function getPackages(packageIds: string[]): Promise<AirtablePackage[]> {
  if (!packageIds?.length) return [];

  try {
    const formula = `OR(${packageIds.map(id => `RECORD_ID()='${escapeFormulaString(id)}'`).join(",")})`;
    return await getAllPages<AirtablePackage>("/Packages", { filterByFormula: formula });
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
}

// 獲取客戶資料。
export async function getCustomer(customerId: string): Promise<AirtableCustomer | null> {
  if (!customerId) return null;

  try {
    const response = await airtableClient.get<AirtableCustomer>(`/Customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return null;
  }
}

// 獲取 Order_2026 記錄。
export async function getOrder2026(orderId: string): Promise<AirtableOrder2026 | null> {
  if (!orderId) return null;

  try {
    const response = await airtableClient.get<AirtableOrder2026>(`/Order_2026/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Order_2026:", error);
    return null;
  }
}

// 獲取完整配送資料。input 可以係 Airtable record ID，亦可以係 Shipping No。
export async function getFullOrderData(input: string) {
  const cleanedInput = input.trim();
  if (!cleanedInput) return null;

  let order: AirtableOrder | null;
  if (cleanedInput.startsWith("rec")) {
    order = await getOrderById(cleanedInput);
  } else {
    order = await findDeliveryByShippingNo(cleanedInput);
  }

  if (!order) return null;

  const order2026 = order.fields["Order"]?.[0]
    ? await getOrder2026(order.fields["Order"][0])
    : null;

  const customerRecordId = order.fields["Customer"]?.[0] || order2026?.fields["Customer"]?.[0];

  const [orderItems, packages, customer] = await Promise.all([
    order.fields["Order Items"] ? getOrderItems(order.fields["Order Items"]) : Promise.resolve([]),
    order.fields["Packages"] ? getPackages(order.fields["Packages"]) : Promise.resolve([]),
    customerRecordId ? getCustomer(customerRecordId) : Promise.resolve(null),
  ]);

  const preferredOrderNo = getPreferredOrderNo(order2026);
  if (preferredOrderNo) {
    order.fields["Internal Order No"] = preferredOrderNo;
  }

  return {
    order,
    orderItems,
    packages,
    customer,
    order2026,
  };
}
