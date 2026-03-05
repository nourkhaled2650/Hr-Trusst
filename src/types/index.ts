// ---------------------------------------------------------------------------
// Branded ID types — prevent accidental cross-entity ID confusion
// ---------------------------------------------------------------------------
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type EmployeeId = Brand<number, "EmployeeId">;
export type ProjectId = Brand<number, "ProjectId">;
export type SessionId = Brand<string, "SessionId">;
export type LeaveId = Brand<number, "LeaveId">;

// ---------------------------------------------------------------------------
// Roles — kept as a plain union and a const-object pattern for exhaustiveness
// ---------------------------------------------------------------------------
export const UserRole = {
  EMPLOYEE: "EMPLOYEE",
  SUB_ADMIN: "SUB_ADMIN",
  SUPER_ADMIN: "ADMIN",
} as const;

export type Role = (typeof UserRole)[keyof typeof UserRole];

// ---------------------------------------------------------------------------
// User types — split to match what the backend actually returns
// ---------------------------------------------------------------------------

/**
 * Matches the backend `GET /api/auth/session` response exactly.
 * Backend commit f509656 added role to the session response.
 */
export interface SessionUser {
  userId: number;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string; // ISO-8601
  role: Role;
}

/**
 * App-level user — extends SessionUser.
 * roles is inherited from SessionUser (returned directly by /api/auth/session).
 * This is what the auth store holds.
 */

/**
 * Legacy alias kept temporarily so that `_admin.tsx` and `_employee.tsx`
 * route guards compile without immediate breakage. Remove once those
 * layouts are updated to reference AppUser directly.
 *
 * @deprecated Use AppUser instead.
 */
// export type User = SessionUser;

// ---------------------------------------------------------------------------
// API envelope — matches backend shape exactly
// ---------------------------------------------------------------------------
export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T | null;
}

// ---------------------------------------------------------------------------
// Auth endpoint payloads
// ---------------------------------------------------------------------------
export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// Permission key — derived from the permissions constants at the type level.
// Importing directly from constants avoids a circular dependency because
// constants/permissions.ts imports Role from here, not PermissionKey.
// PermissionKey is re-exported from constants/permissions.ts as Permission.
// Declare a minimal alias here for use inside stores without importing constants.
// ---------------------------------------------------------------------------
export type PermissionKey = string;
