import {
  collection,
  doc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/client";
import { Order, OrderStatus } from "@/types";

const ORDERS_COLLECTION = "making_orders";
const ORDERED_ITEMS_COLLECTION = "ordered items";

export function normalizeOrder(id: string, data: Record<string, any>): Order {
  let orderDate = new Date();
  if (data["ordered date"] instanceof Timestamp) {
    orderDate = data["ordered date"].toDate();
  } else if (data["date"] instanceof Timestamp) {
    orderDate = data["date"].toDate();
  } else if (data.date) {
    orderDate = new Date(data.date);
  }

  const rawTotal = data["total price"] ?? data["totalprice"] ?? data.totalPrice ?? 0;
  const totalPrice = typeof rawTotal === "number" ? rawTotal : parseFloat(String(rawTotal)) || 0;

  return {
    id,
    userId: data.userid || data.userId || "anonymous",
    itemId: data["item id"] || data.itemId || "",
    itemName: data.itemname || data.name || "SolCafe Order Item",
    image: data.image || "/images/appicon_large_size_final.png",
    size: data.size || "M",
    quantity: typeof data.quantity === "number" ? data.quantity : parseInt(data.quantity || "1", 10),
    totalPrice,
    status: (data.status as OrderStatus) || "pending",
    paymentMethod: data["payment method"] || data.paymentMethod || "Standard",
    orderDate,
  };
}

export function subscribeToOrders(callback: (orders: Order[]) => void) {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(ordersRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((docSnap) => normalizeOrder(docSnap.id, docSnap.data()));
      // Sort newest orders first
      orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      callback(orders);
    },
    (error) => {
      console.error("Error subscribing to orders stream:", error);
      callback([]);
    }
  );
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
    const orders = snapshot.docs.map((docSnap) => normalizeOrder(docSnap.id, docSnap.data()));
    return orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(orderRef, {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
}
