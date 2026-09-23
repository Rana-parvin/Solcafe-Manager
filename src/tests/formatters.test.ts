import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, capitalize } from "../lib/utils/formatters";

describe("Formatters Utility", () => {
  it("should format currency correctly", () => {
    expect(formatCurrency(4.99)).toBe("$4.99");
    expect(formatCurrency("12.50")).toBe("$12.50");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should capitalize strings", () => {
    expect(capitalize("coffee")).toBe("Coffee");
    expect(capitalize("pastry")).toBe("Pastry");
    expect(capitalize("")).toBe("");
  });

  it("should format date gracefully", () => {
    const d = new Date("2026-08-16T12:00:00Z");
    const formatted = formatDate(d);
    expect(formatted).not.toBe("N/A");
  });
});
