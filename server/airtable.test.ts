import { describe, expect, it } from "vitest";
import { getAllOrders, getOrderById } from "./airtable";

describe("Airtable Integration", () => {
  it("should fetch all orders from Airtable", async () => {
    const orders = await getAllOrders();
    
    expect(orders).toBeDefined();
    expect(Array.isArray(orders)).toBe(true);
    
    if (orders.length > 0) {
      const firstOrder = orders[0];
      expect(firstOrder).toHaveProperty("id");
      expect(firstOrder).toHaveProperty("fields");
      expect(firstOrder.fields).toHaveProperty("Shipping No");
    }
  });

  it("should fetch a single order by ID", async () => {
    const orders = await getAllOrders();
    
    if (orders.length > 0) {
      const orderId = orders[0].id;
      const order = await getOrderById(orderId);
      
      expect(order).toBeDefined();
      expect(order?.id).toBe(orderId);
      expect(order?.fields).toHaveProperty("Shipping No");
    }
  });

  it("should return null for invalid order ID", async () => {
    const order = await getOrderById("invalid-id-12345");
    expect(order).toBeNull();
  });
});
