import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/client";
import { MenuItem } from "@/types";

const COLLECTION_NAME = "items";

export function normalizeMenuItem(id: string, data: Record<string, any>): MenuItem {
  const rawQty = data.availableQuantity ?? data.quantity ?? data.stock;
  const availableQuantity =
    typeof rawQty === "number"
      ? Math.max(0, Math.floor(rawQty))
      : rawQty !== undefined
      ? Math.max(0, parseInt(String(rawQty), 10) || 0)
      : 10;
  const isAvailable =
    availableQuantity > 0 && (data.isAvailable !== undefined ? Boolean(data.isAvailable) : true);

  return {
    id,
    title: data.title || data.name || "Untitled Coffee Item",
    description: data.description || data.details || "",
    price: data.price !== undefined ? data.price : "0.00",
    image: data.image || data.imagePath || "/images/appicon_large_size_final.png",
    category: data.category || "coffee",
    sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ["S", "M", "L"],
    isAvailable,
    availableQuantity,
  };
}

export function subscribeToProducts(
  callback: (products: MenuItem[]) => void,
  categoryFilter?: string
) {
  const itemsRef = collection(db, COLLECTION_NAME);
  let q = query(itemsRef);

  if (categoryFilter && categoryFilter !== "All") {
    q = query(itemsRef, where("category", "==", categoryFilter));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) =>
        normalizeMenuItem(docSnap.id, docSnap.data())
      );
      callback(items);
    },
    (error) => {
      console.error("Error subscribing to items stream:", error);
      callback([]);
    }
  );
}

export async function fetchProducts(): Promise<MenuItem[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map((docSnap) => normalizeMenuItem(docSnap.id, docSnap.data()));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function createProduct(product: Omit<MenuItem, "id">): Promise<string> {
  const qty = Math.max(0, Math.floor(product.availableQuantity ?? 0));
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    title: product.title,
    name: product.title,
    description: product.description,
    details: product.description,
    price: typeof product.price === "number" ? product.price.toFixed(2) : String(product.price),
    image: product.image,
    category: product.category,
    sizes: product.sizes || ["S", "M", "L"],
    availableQuantity: qty,
    quantity: qty,
    stock: qty,
    isAvailable: qty > 0 && (product.isAvailable ?? true),
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateProduct(id: string, updates: Partial<MenuItem>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const payload: Record<string, any> = {};

  if (updates.title !== undefined) {
    payload.title = updates.title;
    payload.name = updates.title;
  }
  if (updates.description !== undefined) {
    payload.description = updates.description;
    payload.details = updates.description;
  }
  if (updates.price !== undefined) {
    payload.price = typeof updates.price === "number" ? updates.price.toFixed(2) : String(updates.price);
  }
  if (updates.image !== undefined) {
    payload.image = updates.image;
    payload.imagePath = updates.image;
  }
  if (updates.category !== undefined) {
    payload.category = updates.category;
  }
  if (updates.sizes !== undefined) {
    payload.sizes = updates.sizes;
  }
  if (updates.availableQuantity !== undefined) {
    const qty = Math.max(0, Math.floor(updates.availableQuantity));
    payload.availableQuantity = qty;
    payload.quantity = qty;
    payload.stock = qty;
    if (qty === 0) {
      payload.isAvailable = false;
    } else if (updates.isAvailable === undefined) {
      payload.isAvailable = true;
    }
  }
  if (updates.isAvailable !== undefined) {
    payload.isAvailable = updates.isAvailable;
    if (!updates.isAvailable) {
      payload.availableQuantity = 0;
      payload.quantity = 0;
      payload.stock = 0;
    }
  }

  await updateDoc(docRef, payload);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export async function toggleProductAvailability(
  id: string,
  currentStatus: boolean,
  currentQty?: number
): Promise<void> {
  const nextStatus = !currentStatus;
  const updates: Partial<MenuItem> = { isAvailable: nextStatus };
  if (nextStatus && (!currentQty || currentQty === 0)) {
    updates.availableQuantity = 10;
  } else if (!nextStatus) {
    updates.availableQuantity = 0;
  }
  await updateProduct(id, updates);
}
