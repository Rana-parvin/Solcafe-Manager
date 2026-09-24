import { doc, getDoc, setDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../firebase/client";
import { CafeSettings, DEFAULT_CAFE_SETTINGS } from "@/types";

const SETTINGS_COLLECTION = "settings";
const CAFE_CONFIG_DOC = "cafe_config";
const LOCAL_STORAGE_KEY = "solcafe_manager_settings";

/**
 * Normalizes dynamic document data into a strict CafeSettings object with fallbacks.
 */
export function normalizeCafeSettings(
  data: Record<string, any> | null | undefined,
  isCloudSynced: boolean = false
): CafeSettings {
  if (!data) {
    return { ...DEFAULT_CAFE_SETTINGS, isCloudSynced };
  }

  const effectiveCurrency =
    data.general?.currency || data.payment?.currency || data.currency || DEFAULT_CAFE_SETTINGS.general.currency || "INR";
  const effectiveCurrencySymbol =
    data.general?.currencySymbol || data.payment?.currencySymbol || data.currencySymbol || DEFAULT_CAFE_SETTINGS.general.currencySymbol || "₹";

  return {
    general: {
      cafeName: data.general?.cafeName || DEFAULT_CAFE_SETTINGS.general.cafeName,
      logoUrl: data.general?.logoUrl || DEFAULT_CAFE_SETTINGS.general.logoUrl,
      brandingBannerUrl: data.general?.brandingBannerUrl || DEFAULT_CAFE_SETTINGS.general.brandingBannerUrl,
      contactPhone: data.general?.contactPhone || DEFAULT_CAFE_SETTINGS.general.contactPhone,
      contactEmail: data.general?.contactEmail || DEFAULT_CAFE_SETTINGS.general.contactEmail,
      address: data.general?.address || DEFAULT_CAFE_SETTINGS.general.address,
      openingHours: data.general?.openingHours || DEFAULT_CAFE_SETTINGS.general.openingHours,
      closingHours: data.general?.closingHours || DEFAULT_CAFE_SETTINGS.general.closingHours,
      currency: effectiveCurrency,
      currencySymbol: effectiveCurrencySymbol,
    },
    order: {
      acceptingOrders:
        typeof data.order?.acceptingOrders === "boolean"
          ? data.order.acceptingOrders
          : DEFAULT_CAFE_SETTINGS.order.acceptingOrders,
      minOrderAmount:
        typeof data.order?.minOrderAmount === "number"
          ? data.order.minOrderAmount
          : parseFloat(data.order?.minOrderAmount || String(DEFAULT_CAFE_SETTINGS.order.minOrderAmount)),
      estimatedPrepTime: data.order?.estimatedPrepTime || DEFAULT_CAFE_SETTINGS.order.estimatedPrepTime,
      allowCustomerCancellation:
        typeof data.order?.allowCustomerCancellation === "boolean"
          ? data.order.allowCustomerCancellation
          : DEFAULT_CAFE_SETTINGS.order.allowCustomerCancellation,
      cancellationWindowMinutes:
        typeof data.order?.cancellationWindowMinutes === "number"
          ? data.order.cancellationWindowMinutes
          : DEFAULT_CAFE_SETTINGS.order.cancellationWindowMinutes,
      autoCompleteOrders:
        typeof data.order?.autoCompleteOrders === "boolean"
          ? data.order.autoCompleteOrders
          : DEFAULT_CAFE_SETTINGS.order.autoCompleteOrders,
    },
    payment: {
      enableCOD:
        typeof data.payment?.enableCOD === "boolean"
          ? data.payment.enableCOD
          : DEFAULT_CAFE_SETTINGS.payment.enableCOD,
      enableUPI:
        typeof data.payment?.enableUPI === "boolean"
          ? data.payment.enableUPI
          : DEFAULT_CAFE_SETTINGS.payment.enableUPI,
      enableCardPayments:
        typeof data.payment?.enableCardPayments === "boolean"
          ? data.payment.enableCardPayments
          : DEFAULT_CAFE_SETTINGS.payment.enableCardPayments,
      currency: effectiveCurrency,
      currencySymbol: effectiveCurrencySymbol,
    },
    notifications: {
      newOrderSound:
        typeof data.notifications?.newOrderSound === "boolean"
          ? data.notifications.newOrderSound
          : DEFAULT_CAFE_SETTINGS.notifications.newOrderSound,
      statusChangeAlerts:
        typeof data.notifications?.statusChangeAlerts === "boolean"
          ? data.notifications.statusChangeAlerts
          : DEFAULT_CAFE_SETTINGS.notifications.statusChangeAlerts,
      staffAlerts:
        typeof data.notifications?.staffAlerts === "boolean"
          ? data.notifications.staffAlerts
          : DEFAULT_CAFE_SETTINGS.notifications.staffAlerts,
      desktopNotifications:
        typeof data.notifications?.desktopNotifications === "boolean"
          ? data.notifications.desktopNotifications
          : DEFAULT_CAFE_SETTINGS.notifications.desktopNotifications,
    },
    appearance: {
      theme: data.appearance?.theme || DEFAULT_CAFE_SETTINGS.appearance.theme,
      sidebarDensity: data.appearance?.sidebarDensity || DEFAULT_CAFE_SETTINGS.appearance.sidebarDensity,
      tableDensity: data.appearance?.tableDensity || DEFAULT_CAFE_SETTINGS.appearance.tableDensity,
      autoRefreshInterval:
        typeof data.appearance?.autoRefreshInterval === "number"
          ? data.appearance.autoRefreshInterval
          : DEFAULT_CAFE_SETTINGS.appearance.autoRefreshInterval,
    },
    security: {
      sessionTimeoutMinutes:
        typeof data.security?.sessionTimeoutMinutes === "number"
          ? data.security.sessionTimeoutMinutes
          : DEFAULT_CAFE_SETTINGS.security.sessionTimeoutMinutes,
      requireAdminConfirmation:
        typeof data.security?.requireAdminConfirmation === "boolean"
          ? data.security.requireAdminConfirmation
          : DEFAULT_CAFE_SETTINGS.security.requireAdminConfirmation,
      allowStaffProfileEdits:
        typeof data.security?.allowStaffProfileEdits === "boolean"
          ? data.security.allowStaffProfileEdits
          : DEFAULT_CAFE_SETTINGS.security.allowStaffProfileEdits,
    },
    updatedAt: data.updatedAt || undefined,
    updatedBy: data.updatedBy || undefined,
    isCloudSynced,
  };
}

/**
 * Gets cached settings from localStorage safely.
 */
export function getLocalSettingsCache(): CafeSettings {
  if (typeof window === "undefined") return { ...DEFAULT_CAFE_SETTINGS, isCloudSynced: false };
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CAFE_SETTINGS, isCloudSynced: false };
    const parsed = JSON.parse(raw);
    return normalizeCafeSettings(parsed, false);
  } catch (e) {
    return { ...DEFAULT_CAFE_SETTINGS, isCloudSynced: false };
  }
}

/**
 * Writes settings to localStorage cache.
 */
export function saveLocalSettingsCache(settings: CafeSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Failed to write settings to localStorage cache", e);
  }
}

/**
 * Fetches cafe settings from Firestore with localStorage fallback.
 */
export async function fetchCafeSettings(): Promise<CafeSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CAFE_CONFIG_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const normalized = normalizeCafeSettings(snap.data(), true);
      saveLocalSettingsCache(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn("Firestore settings fetch failed, using local cache fallback:", err);
  }
  return getLocalSettingsCache();
}

/**
 * Subscribes to real-time updates for settings/cafe_config with localStorage fallback.
 */
export function subscribeToCafeSettings(callback: (settings: CafeSettings) => void) {
  const docRef = doc(db, SETTINGS_COLLECTION, CAFE_CONFIG_DOC);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const settings = normalizeCafeSettings(snap.data(), true);
        saveLocalSettingsCache(settings);
        callback(settings);
      } else {
        // Doc doesn't exist yet on Firestore
        const cached = getLocalSettingsCache();
        callback(cached);
      }
    },
    (error) => {
      console.warn("Error subscribing to settings stream, serving local cache:", error);
      const cached = getLocalSettingsCache();
      callback(cached);
    }
  );
}

/**
 * Persists cafe settings to Firestore document settings/cafe_config and updates local cache.
 */
export async function updateCafeSettings(
  updatedFields: Partial<CafeSettings>,
  updatedByEmail?: string
): Promise<{ success: boolean; isCloudSynced: boolean }> {
  let isCloudSynced = false;
  const current = getLocalSettingsCache();

  const merged: CafeSettings = {
    ...current,
    ...updatedFields,
    general: { ...current.general, ...(updatedFields.general || {}) },
    order: { ...current.order, ...(updatedFields.order || {}) },
    payment: { ...current.payment, ...(updatedFields.payment || {}) },
    notifications: { ...current.notifications, ...(updatedFields.notifications || {}) },
    appearance: { ...current.appearance, ...(updatedFields.appearance || {}) },
    security: { ...current.security, ...(updatedFields.security || {}) },
    updatedAt: new Date().toISOString(),
    updatedBy: updatedByEmail || current.updatedBy || "Manager",
  };

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CAFE_CONFIG_DOC);
    await setDoc(
      docRef,
      {
        general: merged.general,
        order: merged.order,
        payment: merged.payment,
        notifications: merged.notifications,
        appearance: merged.appearance,
        security: merged.security,
        updatedAt: merged.updatedAt,
        updatedBy: merged.updatedBy,
      },
      { merge: true }
    );
    isCloudSynced = true;
  } catch (err) {
    console.warn("Could not save settings to Firestore cloud document, cached locally:", err);
    isCloudSynced = false;
  }

  merged.isCloudSynced = isCloudSynced;
  saveLocalSettingsCache(merged);

  return { success: true, isCloudSynced };
}

/**
 * Resets settings to default values both in Firestore and localStorage.
 */
export async function resetCafeSettings(): Promise<{ success: boolean; isCloudSynced: boolean }> {
  return updateCafeSettings(DEFAULT_CAFE_SETTINGS, "Reset Action");
}
