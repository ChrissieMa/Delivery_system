// Airtable 數據類型定義

export interface AirtableOrder {
  id: string;
  fields: {
    "Shipping No": string;
    "Order"?: string[];
    "Internal Order No"?: string;
    "Delivery Date"?: string;
    "Estimated Time of Arrival"?: string;
    "Total Pieces"?: number;
    "Total Weight"?: number;
    "Driver Cost"?: number;
    "Company Profit"?: number;
    "Customer Shipping Fee"?: number;
    "Shipping Paid By"?: string;
    "Delivery Status"?: string;
    "Label Status"?: string;
    "Status"?: string;
    "Customer"?: string[];
    "Order Items"?: string[];
    "Packages"?: string[];
    "Item Ref (from Order Items)"?: string[];
    "Driver Remark"?: string;
  };
}

export interface AirtableOrderItem {
  id: string;
  fields: {
    "Item Ref": string;
    "Item Type"?: string;
    "Description"?: string;
    "Quantity"?: number;
    "Unit Price"?: number;
    "Amount"?: number;
    "Order"?: string[];
    "Inter L"?: string;
    "Inter D"?: string;
    "Inter H"?: string;
    "No. of Levels"?: number;
    "Level Heights"?: string;
    "Accessories"?: string;
  };
}

export interface AirtablePackage {
  id: string;
  fields: {
    "X": string;
    "Box No"?: number;
    "Label"?: string;
    "Box Display"?: string;
    "Delivery No"?: string[];
    "Total Pieces (from Delivery)"?: number;
    "Delivery"?: string[];
    "Note"?: string;
  };
}

export interface AirtableCustomer {
  id: string;
  fields: {
    "Customer Code": string;
    "Customer Name": string;
    "Phone"?: string;
    "Delivery Phone"?: string;
    "Address"?: string;
    "Email"?: string;
  };
}

export interface AirtableOrder2026 {
  id: string;
  fields: {
    "Internal Order No": string;
    "Customer ID (from Customer) 2"?: string[];
  };
}

// 打印用的完整訂單數據
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
    deliveryPhone?: string;
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
