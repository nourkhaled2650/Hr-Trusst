export const ROUTES = {
  // Auth
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",

  // Employee
  EMPLOYEE_HOME: "/",
  EMPLOYEE_LEAVE: "/leave",
  EMPLOYEE_PAYSLIPS: "/payslips",
  EMPLOYEE_PROFILE: "/profile",

  // Employee
  EMPLOYEE_ATTENDANCE: "/attendance",
  EMPLOYEE_ATTENDANCE_LOG: "/attendance/log",
  EMPLOYEE_PROJECTS: "/projects",

  // Admin
  ADMIN_DASHBOARD: "/admin",
  ADMIN_EMPLOYEES: "/admin/employees",
  ADMIN_ATTENDANCE: "/admin/attendance",
  ADMIN_LEAVE: "/admin/leave",
  ADMIN_PROJECTS: "/admin/projects",
  ADMIN_PAYROLL: "/admin/payroll",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_PERMISSIONS: "/admin/permissions",
} as const;
