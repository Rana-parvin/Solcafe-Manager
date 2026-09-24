export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

export const STORE_CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "INR", symbol: "₹", label: "INR (₹) - Indian Rupee" },
  { code: "USD", symbol: "$", label: "USD ($) - US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR (€) - Euro" },
  { code: "GBP", symbol: "£", label: "GBP (£) - British Pound" },
  { code: "JPY", symbol: "¥", label: "JPY (¥) - Japanese Yen" },
  { code: "AUD", symbol: "A$", label: "AUD (A$) - Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "CAD (C$) - Canadian Dollar" },
];

export interface GeneralSettings {
  cafeName: string;
  logoUrl: string;
  brandingBannerUrl?: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  openingHours: string;
  closingHours: string;
  currency?: string;
  currencySymbol?: string;
}

export interface OrderSettings {
  acceptingOrders: boolean;
  minOrderAmount: number;
  estimatedPrepTime: string;
  allowCustomerCancellation: boolean;
  cancellationWindowMinutes: number;
  autoCompleteOrders: boolean;
}

export interface PaymentSettings {
  enableCOD: boolean;
  enableUPI: boolean;
  enableCardPayments: boolean;
  currency?: string;
  currencySymbol: string;
}

export interface NotificationSettings {
  newOrderSound: boolean;
  statusChangeAlerts: boolean;
  staffAlerts: boolean;
  desktopNotifications: boolean;
}

export type ThemePreference = "dark-default" | "amber-warm" | "high-contrast";
export type DensityMode = "standard" | "compact" | "comfortable";

export interface AppearanceSettings {
  theme: ThemePreference;
  sidebarDensity: DensityMode;
  tableDensity: DensityMode;
  autoRefreshInterval: number; // in seconds, 0 for off
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  requireAdminConfirmation: boolean;
  allowStaffProfileEdits: boolean;
}

export interface CafeSettings {
  general: GeneralSettings;
  order: OrderSettings;
  payment: PaymentSettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  security: SecuritySettings;
  updatedAt?: string;
  updatedBy?: string;
  isCloudSynced?: boolean;
}

export const DEFAULT_CAFE_SETTINGS: CafeSettings = {
  general: {
    cafeName: "SolCafe Main Branch",
    logoUrl: "/images/appicon_large_size_final.png",
    brandingBannerUrl: "/images/appicon_large_size_final.png",
    contactPhone: "+1 (555) 234-5678",
    contactEmail: "contact@solcafe.com",
    address: "123 Coffee Lane, Suite A, Brew City, BC 90210",
    openingHours: "07:00 AM",
    closingHours: "10:00 PM",
    currency: "INR",
    currencySymbol: "₹",
  },
  order: {
    acceptingOrders: true,
    minOrderAmount: 5.0,
    estimatedPrepTime: "15-20 min",
    allowCustomerCancellation: true,
    cancellationWindowMinutes: 5,
    autoCompleteOrders: false,
  },
  payment: {
    enableCOD: true,
    enableUPI: true,
    enableCardPayments: true,
    currency: "INR",
    currencySymbol: "₹",
  },
  notifications: {
    newOrderSound: true,
    statusChangeAlerts: true,
    staffAlerts: true,
    desktopNotifications: false,
  },
  appearance: {
    theme: "dark-default",
    sidebarDensity: "standard",
    tableDensity: "comfortable",
    autoRefreshInterval: 30,
  },
  security: {
    sessionTimeoutMinutes: 30,
    requireAdminConfirmation: true,
    allowStaffProfileEdits: false,
  },
  isCloudSynced: false,
};
