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
