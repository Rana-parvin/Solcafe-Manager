import { describe, it, expect } from "vitest";
import { normalizeMenuItem } from "../lib/firestore/products";
import { normalizeOrder } from "../lib/firestore/orders";
import { normalizePayment } from "../lib/firestore/payments";

describe("Firestore Data Models Compatibility", () => {
  it("should normalize Flutter menu item document and availableQuantity", () => {
    const rawDoc = {
      name: "Espresso Macchiato",
      details: "Rich espresso topped with velvety foam",
      price: "3.50",
      imagePath: "assets/images/espresso.jpg",
      category: "coffee",
      sizes: ["S", "M"],
      availableQuantity: 25,
    };

    const item = normalizeMenuItem("item-101", rawDoc);
    expect(item.id).toBe("item-101");
    expect(item.title).toBe("Espresso Macchiato");
    expect(item.description).toBe("Rich espresso topped with velvety foam");
    expect(item.price).toBe("3.50");
    expect(item.category).toBe("coffee");
    expect(item.sizes).toEqual(["S", "M"]);
    expect(item.availableQuantity).toBe(25);
    expect(item.isAvailable).toBe(true);

    const zeroStockItem = normalizeMenuItem("item-102", { ...rawDoc, availableQuantity: 0 });
    expect(zeroStockItem.availableQuantity).toBe(0);
    expect(zeroStockItem.isAvailable).toBe(false);
  });

  it("should normalize Flutter making_orders document", () => {
    const rawOrder = {
      userid: "user-123",
      "item id": "item-101",
      itemname: "Espresso Macchiato",
      size: "M",
      quantity: 2,
      "total price": "7.00",
      status: "pending",
      "payment method": "Credit Card",
    };

    const order = normalizeOrder("order-555", rawOrder);
    expect(order.id).toBe("order-555");
    expect(order.userId).toBe("user-123");
    expect(order.itemName).toBe("Espresso Macchiato");
    expect(order.totalPrice).toBe(7.0);
    expect(order.status).toBe("pending");
  });

  it("should normalize Flutter payments document", () => {
    const rawPayment = {
      "order id": "order-555",
      userid: "user-123",
      "total amount": 7.0,
      "payment method": "Credit Card",
      status: "completed",
    };

    const payment = normalizePayment("pay-999", rawPayment);
    expect(payment.id).toBe("pay-999");
    expect(payment.orderId).toBe("order-555");
    expect(payment.amount).toBe(7.0);
    expect(payment.status).toBe("completed");
  });
});
