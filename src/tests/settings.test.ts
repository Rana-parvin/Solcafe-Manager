import { describe, it, expect } from "vitest";
import { normalizeCafeSettings } from "../lib/firestore/settings";
import { DEFAULT_CAFE_SETTINGS } from "../types/settings";

describe("Cafe Settings Normalization & Fallbacks", () => {
  it("should return default settings when input data is null or empty", () => {
    const settings = normalizeCafeSettings(null, false);
    expect(settings.general.cafeName).toBe(DEFAULT_CAFE_SETTINGS.general.cafeName);
    expect(settings.general.currency).toBe("INR");
    expect(settings.general.currencySymbol).toBe("₹");
    expect(settings.order.acceptingOrders).toBe(true);
    expect(settings.payment.enableCOD).toBe(true);
    expect(settings.isCloudSynced).toBe(false);
  });

  it("should cleanly merge partial Firestore document data with defaults", () => {
    const rawFirestoreDoc = {
      general: {
        cafeName: "SolCafe Downtown Bistro",
        contactPhone: "+1 (555) 999-8888",
      },
      order: {
        minOrderAmount: 10.5,
        acceptingOrders: false,
      },
      payment: {
        enableUPI: false,
      },
    };

    const settings = normalizeCafeSettings(rawFirestoreDoc, true);
    expect(settings.general.cafeName).toBe("SolCafe Downtown Bistro");
    expect(settings.general.contactPhone).toBe("+1 (555) 999-8888");
    // Unchanged fields fallback to default values
    expect(settings.general.contactEmail).toBe(DEFAULT_CAFE_SETTINGS.general.contactEmail);
    expect(settings.order.minOrderAmount).toBe(10.5);
    expect(settings.order.acceptingOrders).toBe(false);
    expect(settings.payment.enableUPI).toBe(false);
    expect(settings.payment.enableCOD).toBe(true);
    expect(settings.isCloudSynced).toBe(true);
  });

  it("should handle string-to-number coercions gracefully", () => {
    const rawData = {
      order: {
        minOrderAmount: "12.75",
      },
    };

    const settings = normalizeCafeSettings(rawData, true);
    expect(settings.order.minOrderAmount).toBe(12.75);
  });
});
