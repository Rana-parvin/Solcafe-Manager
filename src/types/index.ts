export * from "./settings";

export type UserRole = "admin" | "staff" | "customer";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: UserRole;
  createdAt?: string | Date;
}

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: string | number;
  image: string;
  category: string;
  sizes: string[];
  isAvailable?: boolean;
  availableQuantity?: number;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  image: string;
  size: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  orderDate: Date;
}

export interface OrderedItem {
  id?: string;
  orderId: string;
  itemId: string;
  size: string;
  quantity: number;
  totalPrice: string;
  orderDate: Date;
  userId: string;
  itemName: string;
  image: string;
  paymentMethod: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  itemId: string;
  paymentMethod: string;
  amount: number;
  status: string;
  timestamp: Date;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export const FLUTTER_MENU_CATEGORIES = [
  "coffee",
  "non coffee",
  "cake",
  "pastry",
  "other items",
] as const;

export type CategoryType = (typeof FLUTTER_MENU_CATEGORIES)[number];
