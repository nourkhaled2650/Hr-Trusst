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
} as const;
