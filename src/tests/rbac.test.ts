import { describe, it, expect } from "vitest";
import { isAuthorizedStaffOrAdmin, isAdmin } from "../lib/firebase/rbac";

describe("RBAC Authorization Helpers", () => {
  it("should authorize admin and staff roles", () => {
    expect(isAuthorizedStaffOrAdmin("admin")).toBe(true);
    expect(isAuthorizedStaffOrAdmin("staff")).toBe(true);
    expect(isAuthorizedStaffOrAdmin("manager")).toBe(true);
  });

  it("should reject customer or null roles", () => {
    expect(isAuthorizedStaffOrAdmin("customer")).toBe(false);
    expect(isAuthorizedStaffOrAdmin(null)).toBe(false);
    expect(isAuthorizedStaffOrAdmin(undefined)).toBe(false);
  });

  it("should check master admin role specifically", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(isAdmin("manager")).toBe(true);
    expect(isAdmin("staff")).toBe(false);
    expect(isAdmin("customer")).toBe(false);
  });
});
