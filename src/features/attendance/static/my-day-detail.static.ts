import type { DayDetail } from "../types/attendance.types";

// TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
export const STATIC_MY_DAY_DETAIL: DayDetail = {
  date: "2026-03-31",
  totalHours: 9.25,
  dayStatus: "approved",
  hasManualSession: false,
  latenessMinutes: 0,
  overtimeHours: 1.25,
  sessions: [
    { startTime: "2026-03-31T09:00:00", endTime: "2026-03-31T12:30:00", durationHours: 3.5,  isManual: false },
    { startTime: "2026-03-31T13:15:00", endTime: "2026-03-31T18:00:00", durationHours: 4.75, isManual: false },
  ],
  projectEntries: [
    { projectName: "Project Alpha", hours: 5.0,  notes: "Worked on API integration and testing" },
    { projectName: "Project Beta",  hours: 4.25, notes: null },
  ],
};
