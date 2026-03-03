export const ROUTES = {
  // Auth
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",

  // Employee
  EMPLOYEE_HOME: "/",
  EMPLOYEE_LEAVE: "/leave",
  EMPLOYEE_PAYSLIPS: "/payslips",
  EMPLOYEE_PROFILE: "/profile",

  // Admin
  ADMIN_DASHBOARD: "/admin",
  ADMIN_EMPLOYEES: "/admin/employees",
  ADMIN_PAYROLL: "/admin/payroll",
  ADMIN_LEAVE: "/admin/leave",
  ADMIN_SETTINGS: "/admin/settings",
} as const;
