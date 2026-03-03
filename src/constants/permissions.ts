import type { Role } from "@/types";

export const PERMISSIONS = {
  // Employees
  VIEW_EMPLOYEES: "employees:view",
  MANAGE_EMPLOYEES: "employees:manage",

  // Payroll
  VIEW_PAYROLL: "payroll:view",
  MANAGE_PAYROLL: "payroll:manage",

  // Leave
  VIEW_LEAVE: "leave:view",
  APPROVE_LEAVE: "leave:approve",
  MANAGE_LEAVE: "leave:manage",

  // Reports
  VIEW_REPORTS: "reports:view",

  // Settings
  MANAGE_SETTINGS: "settings:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Frontend-owned: defines what each role can do.
// Update this map — never add a permissions array to the backend User object.
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  employee: [
    PERMISSIONS.VIEW_LEAVE,
    PERMISSIONS.VIEW_PAYROLL,
  ],
  sub_admin: [
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_LEAVE,
    PERMISSIONS.APPROVE_LEAVE,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.VIEW_REPORTS,
  ],
  super_admin: [
    // Granted all — useHasPermission short-circuits for super_admin.
    // This list exists only for exhaustiveness; keep it complete.
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.VIEW_LEAVE,
    PERMISSIONS.APPROVE_LEAVE,
    PERMISSIONS.MANAGE_LEAVE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_SETTINGS,
  ],
};
