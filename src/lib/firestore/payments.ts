import {
  collection,
  getDocs,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/client";
import { PaymentTransaction } from "@/types";

const PAYMENTS_COLLECTION = "payments";

export function normalizePayment(id: string, data: Record<string, any>): PaymentTransaction {
  let timestamp = new Date();
  if (data["ordered date"] instanceof Timestamp) {
    timestamp = data["ordered date"].toDate();
  } else if (data.timestamp instanceof Timestamp) {
    timestamp = data.timestamp.toDate();
  } else if (data.date) {
    timestamp = new Date(data.date);
  }

  const rawAmount = data["total amount"] ?? data.amount ?? 0;
  const amount = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount)) || 0;

  return {
    id,
    orderId: data["order id"] || data.orderId || id,
    userId: data.userid || data.userId || "anonymous",
    itemId: data["item id"] || data.itemId || "",
    paymentMethod: data["payment method"] || data.paymentMethod || "Standard",
    amount,
    status: data.status || "completed",
    timestamp,
  };
}

export function subscribeToPayments(callback: (payments: PaymentTransaction[]) => void) {
  const ref = collection(db, PAYMENTS_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      const payments = snapshot.docs.map((docSnap) => normalizePayment(docSnap.id, docSnap.data()));
      payments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      callback(payments);
    },
    (error) => {
      console.error("Error subscribing to payments stream:", error);
      callback([]);
    }
  );
}

export async function fetchPayments(): Promise<PaymentTransaction[]> {
  try {
    const snapshot = await getDocs(collection(db, PAYMENTS_COLLECTION));
    const payments = snapshot.docs.map((docSnap) => normalizePayment(docSnap.id, docSnap.data()));
    return payments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [];
  }
}
