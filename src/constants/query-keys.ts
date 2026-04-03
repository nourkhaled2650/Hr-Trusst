import type { AttendanceDayFilters } from "@/features/attendance/types/attendance.types";

export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
  employees: {
    all: ["employees"] as const,
    list: (params?: Record<string, unknown>) =>
      ["employees", "list", params] as const,
    detail: (id: string) => ["employees", id] as const,
  },
  leave: {
    all: ["leave"] as const,
    list: (params?: Record<string, unknown>) =>
      ["leave", "list", params] as const,
    detail: (id: string) => ["leave", id] as const,
  },
  payroll: {
    all: ["payroll"] as const,
    months: () => ["payroll", "months"] as const,
    monthSummary: (year: number, month: number) =>
      ["payroll", "summary", year, month] as const,
    monthDetail: (year: number, month: number) =>
      ["payroll", "detail", year, month] as const,
    adjustments: (year: number, month: number, employeeId: number) =>
      ["payroll", "adjustments", year, month, employeeId] as const,
    myPayslips: () => ["payroll", "my"] as const,
    myPayslipDetail: (year: number, month: number) =>
      ["payroll", "my", year, month] as const,
  },
  attendance: {
    // V2 keys
    sessionStatus: () => ["attendance", "session", "status"] as const,
    daySummary: (date: string) => ["attendance", "day-summary", date] as const,
    employeeWorkingDays: (employeeId: number) =>
      ["attendance", "admin", "employee", employeeId, "days"] as const,
    // Employee history + detail
    myDays: (page: number) => ["attendance", "my", "days", page] as const,
    myDayDetail: (date: string) => ["attendance", "my", "day", date] as const,
    // Admin
    adminToday: () => ["admin", "attendance", "today"] as const,
    adminDays: (filters: AttendanceDayFilters) =>
      ["admin", "attendance", "days", filters] as const,
    // Legacy — used by the attendance history page
    logs: (employeeId: number) => ["attendance", "logs", employeeId] as const,
  },
  projectHours: {
    myByDate: (date: string) =>
      ["project-hours", "my", date] as const,
    myAssignments: () => ["project-hours", "my", "assignments"] as const,
  },
  assignments: {
    all: ["assignments"] as const,
    my: ["assignments", "my"] as const,
    byEmployee: (employeeId: number) =>
      ["assignments", "employee", employeeId] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: () => ["projects", "list"] as const,
    detail: (projectId: string) => ["projects", projectId] as const,
    assignments: (projectId: string) =>
      ["projects", projectId, "assignments"] as const,
    kpis: () => ["projects", "kpis"] as const,
    costSummary: (projectId: string) =>
      ["projects", projectId, "cost-summary"] as const,
    trend: (projectId: string) => ["projects", projectId, "trend"] as const,
    manualCosts: (projectId: string) =>
      ["projects", projectId, "manual-costs"] as const,
    costCategories: () => ["projects", "cost-categories"] as const,
  },
} as const;
