import type { PagedResponse, WorkingDayRow } from "../types/attendance.types";

// TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
export const STATIC_MY_DAYS: PagedResponse<WorkingDayRow> = {
  content: [
    { dayId: 101, date: "2026-03-31", totalHours: 9.25, dayStatus: "approved",  hasManualSession: false, overtimeHours: 1.25, latenessMinutes: 0  },
    { dayId: 100, date: "2026-03-30", totalHours: 8.0,  dayStatus: "pending",   hasManualSession: true,  overtimeHours: 0,    latenessMinutes: 0  },
    { dayId: 99,  date: "2026-03-27", totalHours: 7.5,  dayStatus: "approved",  hasManualSession: false, overtimeHours: 0,    latenessMinutes: 12 },
    { dayId: 98,  date: "2026-03-26", totalHours: 0,    dayStatus: "rejected",  hasManualSession: true,  overtimeHours: 0,    latenessMinutes: 0  },
    { dayId: 97,  date: "2026-03-25", totalHours: 8.0,  dayStatus: "approved",  hasManualSession: false, overtimeHours: 0,    latenessMinutes: 0  },
  ],
  totalElements: 5,
  totalPages: 1,
  number: 0,
  size: 20,
};
