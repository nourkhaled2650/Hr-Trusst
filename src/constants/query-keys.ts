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
    list: (params?: Record<string, unknown>) =>
      ["payroll", "list", params] as const,
    detail: (id: string) => ["payroll", id] as const,
  },
  attendance: {
    // V2 keys
    sessionStatus: () => ["attendance", "session", "status"] as const,
    daySummary: (date: string) => ["attendance", "day-summary", date] as const,
    employeeWorkingDays: (employeeId: number) =>
      ["attendance", "admin", "employee", employeeId, "days"] as const,
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
} as const;
