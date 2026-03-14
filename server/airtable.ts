import axios from "axios";
import type { AirtableOrder, AirtableOrderItem, AirtablePackage, AirtableCustomer, AirtableOrder2026 } from "../shared/airtable-types";

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

// 獲取所有訂單
export async function getAllOrders(): Promise<AirtableOrder[]> {
  try {
    // 使用 sort 參數按 Shipping No 升序排序
    const response = await airtableClient.get<AirtableResponse<AirtableOrder>>(
      "/Deliveries?sort%5B0%5D%5Bfield%5D=Shipping%20No&sort%5B0%5D%5Bdirection%5D=asc"
    );
    
    // 為每個訂單獲取 Internal Order No
    const ordersWithOrderNo = await Promise.all(
      response.data.records.map(async (order) => {
        if (order.fields["Order"]?.[0]) {
          const order2026 = await getOrder2026(order.fields["Order"][0]);
          if (order2026?.fields["Internal Order No"]) {
            order.fields["Internal Order No"] = order2026.fields["Internal Order No"];
          }
        }
        return order;
      })
    );
    
    return ordersWithOrderNo;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw new Error("無法獲取訂單數據");
  }
}

// 獲取單個訂單
export async function getOrderById(recordId: string): Promise<AirtableOrder | null> {
  try {
    const response = await airtableClient.get<AirtableOrder>(`/Deliveries/${recordId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

// 獲取訂單項目
export async function getOrderItems(orderIds: string[]): Promise<AirtableOrderItem[]> {
  if (!orderIds || orderIds.length === 0) return [];
  
  try {
    // 使用 filterByFormula 查詢
    const formula = `OR(${orderIds.map(id => `RECORD_ID()='${id}'`).join(",")})`;
    const response = await airtableClient.get<AirtableResponse<AirtableOrderItem>>(
      `/Order%20Items?filterByFormula=${encodeURIComponent(formula)}`
    );
    return response.data.records;
  } catch (error) {
    console.error("Failed to fetch order items:", error);
    return [];
  }
}

// 獲取包裹信息
export async function getPackages(packageIds: string[]): Promise<AirtablePackage[]> {
  if (!packageIds || packageIds.length === 0) return [];
  
  try {
    const formula = `OR(${packageIds.map(id => `RECORD_ID()='${id}'`).join(",")})`;
    const response = await airtableClient.get<AirtableResponse<AirtablePackage>>(
      `/Packages?filterByFormula=${encodeURIComponent(formula)}`
    );
    return response.data.records;
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
}

// 獲取客戶信息
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

// 獲取 Order_2026 記錄（包含 Customer ID from Customer 2）
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

// 獲取完整訂單數據（包含關聯數據）
export async function getFullOrderData(recordId: string) {
  const order = await getOrderById(recordId);
  if (!order) return null;

  const [orderItems, packages, customer, order2026] = await Promise.all([
    order.fields["Order Items"] ? getOrderItems(order.fields["Order Items"]) : Promise.resolve([]),
    order.fields["Packages"] ? getPackages(order.fields["Packages"]) : Promise.resolve([]),
    order.fields["Customer"]?.[0] ? getCustomer(order.fields["Customer"][0]) : Promise.resolve(null),
    order.fields["Order"]?.[0] ? getOrder2026(order.fields["Order"][0]) : Promise.resolve(null),
  ]);

  // 將 Internal Order No 添加到 order.fields
  if (order2026?.fields["Internal Order No"]) {
    order.fields["Internal Order No"] = order2026.fields["Internal Order No"];
  }

  return {
    order,
    orderItems,
    packages,
    customer,
    order2026,
  };
}
