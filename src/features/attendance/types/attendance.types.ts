import type { z } from "zod";
import type {
  attendanceLogSchema,
  attendanceLogListSchema,
  sessionStatusResponseSchema,
  daySummaryResponseSchema,
  clockInSchema,
  manualClockInSchema,
  reentrySchema,
  adminWorkingDaySchema,
  workingDayRowSchema,
  dayDetailSchema,
  sessionEntrySchema,
  projectEntrySchema,
  adminTodayStatusSchema,
  adminTodayEmployeeSchema,
  adminWorkingDayRowSchema,
  attendanceDayFiltersSchema,
  attendanceMonthStatsSchema,
} from "../schemas/attendance.schema";

// ---------------------------------------------------------------------------
// All types derived from Zod schemas — never written manually
// ---------------------------------------------------------------------------

// Legacy types (used by history page)
export type AttendanceLog = z.infer<typeof attendanceLogSchema>;
export type AttendanceLogList = z.infer<typeof attendanceLogListSchema>;

export type SessionStatusResponse = z.infer<typeof sessionStatusResponseSchema>;
export type DaySummaryResponse = z.infer<typeof daySummaryResponseSchema>;
export type ClockInFormValues = z.infer<typeof clockInSchema>;
export type ManualClockInFormValues = z.infer<typeof manualClockInSchema>;
export type ReentryFormValues = z.infer<typeof reentrySchema>;
export type AdminWorkingDay = z.infer<typeof adminWorkingDaySchema>;

// E1 dayStatus values
export type DayStatus = "open" | "pending" | "approved" | "rejected";

// E4 dayStatus values
export type E4DayStatus = "open" | "locked";

// ---------------------------------------------------------------------------
// New types for history, detail, and admin hub pages
// ---------------------------------------------------------------------------

export type WorkingDayRow = z.infer<typeof workingDayRowSchema>;

export type SessionEntry = z.infer<typeof sessionEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type DayDetail = z.infer<typeof dayDetailSchema>;

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type AdminTodayStatus = z.infer<typeof adminTodayStatusSchema>;
export type AdminTodayEmployee = z.infer<typeof adminTodayEmployeeSchema>;
export type AdminWorkingDayRow = z.infer<typeof adminWorkingDayRowSchema>;
export type AttendanceDayFilters = z.infer<typeof attendanceDayFiltersSchema>;
export type AttendanceMonthStats = z.infer<typeof attendanceMonthStatsSchema>;
