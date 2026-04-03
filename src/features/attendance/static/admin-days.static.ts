import type { AdminWorkingDayRow, AttendanceMonthStats, PagedResponse } from "../types/attendance.types";

// TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
export const STATIC_ADMIN_DAYS: PagedResponse<AdminWorkingDayRow> = {
  content: [
    { dayId: 200, date: "2026-03-31", employeeId: 1, employeeName: "Sara Mitchell",  employmentType: "FULL_TIME", totalHours: 9.0,  dayStatus: "pending",  hasManualSession: true,  overtimeHours: 1.0, latenessMinutes: 0  },
    { dayId: 201, date: "2026-03-31", employeeId: 2, employeeName: "James Oduya",    employmentType: "FULL_TIME", totalHours: 8.0,  dayStatus: "approved", hasManualSession: false, overtimeHours: 0,   latenessMinutes: 0  },
    { dayId: 202, date: "2026-03-31", employeeId: 3, employeeName: "Lena Kovac",     employmentType: "PART_TIME", totalHours: 4.0,  dayStatus: "approved", hasManualSession: false, overtimeHours: 0,   latenessMinutes: 0  },
    { dayId: 203, date: "2026-03-30", employeeId: 1, employeeName: "Sara Mitchell",  employmentType: "FULL_TIME", totalHours: 7.5,  dayStatus: "approved", hasManualSession: false, overtimeHours: 0,   latenessMinutes: 15 },
    { dayId: 204, date: "2026-03-30", employeeId: 5, employeeName: "Priya Nair",     employmentType: "FULL_TIME", totalHours: 8.5,  dayStatus: "pending",  hasManualSession: true,  overtimeHours: 0.5, latenessMinutes: 0  },
  ],
  totalElements: 5,
  totalPages: 1,
  number: 0,
  size: 20,
};

export const STATIC_ATTENDANCE_MONTH_STATS: AttendanceMonthStats = {
  overtimeDaysThisMonth: 12,
  manualSessionsThisMonth: 9,
  monthlyHoursTotal: 1840,
};
