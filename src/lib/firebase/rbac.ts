import { UserRole } from "@/types";

export function isAuthorizedStaffOrAdmin(role: UserRole | string | null | undefined): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return normalized === "admin" || normalized === "staff" || normalized === "manager";
}

export function isAdmin(role: UserRole | string | null | undefined): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return normalized === "admin" || normalized === "manager";
}
