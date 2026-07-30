export type UserRole = "superadmin" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  createdAt: string;
};

export function normalizeUserRole(value: unknown): UserRole {
  if (value === "admin" || value === "superadmin") return value;
  // Legacy profiles were all written as superadmin.
  return "superadmin";
}
