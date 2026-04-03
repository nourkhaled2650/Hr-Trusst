import type { AdminTodayEmployee } from "../types/attendance.types";

// TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
export const STATIC_ADMIN_TODAY: AdminTodayEmployee[] = [
  { employeeId: 1, employeeName: "Sara Mitchell",  employmentType: "FULL_TIME",  status: "active",         clockedInAt: "2026-04-02T09:22:00", totalHoursToday: 2.5,  isLateToday: true  },
  { employeeId: 2, employeeName: "James Oduya",    employmentType: "FULL_TIME",  status: "approved",       clockedInAt: "2026-04-02T09:00:00", totalHoursToday: 8.0,  isLateToday: false },
  { employeeId: 3, employeeName: "Lena Kovac",     employmentType: "PART_TIME",  status: "pending_review", clockedInAt: "2026-04-02T10:00:00", totalHoursToday: 4.0,  isLateToday: false },
  { employeeId: 4, employeeName: "Mark Osei",      employmentType: "FULL_TIME",  status: "not_started",    clockedInAt: null,                  totalHoursToday: 0,    isLateToday: false },
  { employeeId: 5, employeeName: "Priya Nair",     employmentType: "FULL_TIME",  status: "active",         clockedInAt: "2026-04-02T08:48:00", totalHoursToday: 2.75, isLateToday: false },
  { employeeId: 6, employeeName: "Khalid Youssef", employmentType: "FULL_TIME",  status: "not_started",    clockedInAt: null,                  totalHoursToday: 0,    isLateToday: false },
  { employeeId: 7, employeeName: "Mona Ibrahim",   employmentType: "FULL_TIME",  status: "active",         clockedInAt: "2026-04-02T09:35:00", totalHoursToday: 1.5,  isLateToday: true  },
];
