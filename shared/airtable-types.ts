// Airtable 數據類型定義。欄位名稱以現時 LKS Airtable 為準。

export interface AirtableOrder {
  id: string;
  fields: {
    "Shipping No": string;
    "Order"?: string[];
    "Internal Order No"?: string;
    "Order Items"?: string[];
    "Item Ref (from Order Items)"?: string[];
    "Customer"?: string[];
    "Status"?: string;
    "Delivery Date"?: string;
    "Estimated Time of Arrival"?: string;
    "Total Pieces"?: number;
    "Total Weight"?: number;
    "Driver Cost"?: number;
    "Company Profit"?: number;
    "Customer Shipping Fee"?: number;
    "Actual Delivery Revenue HKD"?: number;
    "Shipping Paid By"?: string;
    "Delivery Status"?: string;
    "Driver Remark"?: string;
    "Packages"?: string[];
    "Label Status"?: string;
    "Print"?: string;
  };
}

export interface AirtableOrderItem {
  id: string;
  fields: {
    "Item No"?: string;
    "Item Ref": string;
    "Order"?: string[];
    "Internal Order No (from Order)"?: string[];
    "Item Type"?: string;
    "For What"?: string;
    "Inter L"?: string | number;
    "Inter D"?: string | number;
    "Inter H"?: string | number;
    "Outer L"?: string | number;
    "Outer D"?: string | number;
    "Outer H"?: string | number;
    "No. of Levels"?: number;
    "Level Heights"?: string;
    "Accessories"?: string | string[];
    "Description"?: string;
    "QTY"?: number;
    "Product Amount"?: number | string;
    "Supplier Cost HKD"?: number;
    "Total Item Cost HKD"?: number;
    "Notes"?: string;
    "Deliveries"?: string[];
    "China Shipments"?: string[];
    "Weight KG"?: number;
  };
}

export interface AirtablePackage {
  id: string;
  fields: {
    "X"?: string;
    "Delivery"?: string[];
    "Total Pieces (from Delivery)"?: number | number[];
    "Box No"?: number;
    "Active"?: number;
    "Label"?: string;
    "Delivery No"?: string | string[];
    "Box Display"?: string;
    "Note"?: string;
  };
}

export interface AirtableCustomer {
  id: string;
  fields: {
    "Customer Display"?: string;
    "Customer ID": string;
    "Customer Name": string;
    "Phone"?: string;
    "Email"?: string;
    "Address"?: string;
    "Notes"?: string;
    "How did you know us?"?: string;
  };
}

export interface AirtableOrder2026 {
  id: string;
  fields: {
    "Internal 1 Order No"?: string;
    "Internal Order No"?: string;
    "Invoice Number"?: string;
    "Customer"?: string[];
    "Customer ID (from Customer)"?: string[];
    "Order Items"?: string[];
    "Deliveries"?: string[];
    "Product Amount"?: number | string;
    "Discount"?: number;
    "Final Amount"?: number | string;
    "Status"?: string;
  };
}

// 打印用的完整訂單數據。
export interface PrintOrder {
  orderNo: string;
  deliveryNo: string;
  deliveryDate?: string;
  estimatedArrival?: string;
  totalPieces: number;
  totalWeight: number;
  shippingFee: number;
  shippingPaidBy?: string;
  deliveryStatus?: string;
  customer: {
    code: string;
    name: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    itemRef: string;
    description?: string;
    quantity: number;
    weight?: number;
  }>;
  packages: Array<{
    boxNo: number;
    totalBoxes: number;
    label: string;
  }>;
}
