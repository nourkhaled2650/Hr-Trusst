import { z } from "zod";

// ---------------------------------------------------------------------------
// Legacy — AttendanceLog (used by the history page, GET /api/attendance/logs/{id})
// ---------------------------------------------------------------------------
export const attendanceLogSchema = z.object({
  logId: z.number(),
  attendanceId: z.number(),
  checkInTime: z.string(),
  checkOutTime: z.string().nullable(),
  durationHours: z.number().nullable(),
  logType: z.string().nullable(),
  notes: z.string().nullable(),
  isManual: z.boolean(),
  adminApproved: z.boolean(),
  isModified: z.boolean(),
  isDeleted: z.boolean(),
});

export const attendanceLogListSchema = z.array(attendanceLogSchema);

// ---------------------------------------------------------------------------
// E1 — GET /api/attendance/session/status
// ---------------------------------------------------------------------------
export const sessionStatusResponseSchema = z.object({
  startTime: z.string().nullable(), // ISO-8601 datetime or null when no active session
  dayStatus: z.enum(["open", "pending", "approved", "rejected"]),
});

// ---------------------------------------------------------------------------
// E4 — GET /api/attendance/day-summary?date=YYYY-MM-DD
// Note: backend returns dayStatus "locked" when no attendance record exists (DEV-b096ab1-004)
// Frontend must handle: if totalHours === 0 && dayStatus === "locked" → treat as no record
// ---------------------------------------------------------------------------
export const daySummaryResponseSchema = z.object({
  totalHours: z.number(),
  dayStatus: z.enum(["open", "locked"]),
});

// ---------------------------------------------------------------------------
// E2 — POST /api/attendance/clock-in
// ---------------------------------------------------------------------------
export const clockInSchema = z.object({
  manualTime: z.string().optional(), // ISO-8601 local datetime, omit for "now"
});

export const manualClockInSchema = z.object({
  manualTime: z.string().min(1, "Time is required"),
});

// ---------------------------------------------------------------------------
// E3 — POST /api/attendance/clock-out
// ---------------------------------------------------------------------------
export const clockOutSchema = z.object({
  manualTime: z.string().optional(),
});

// ---------------------------------------------------------------------------
// E6 — POST /api/attendance/reentry
// ---------------------------------------------------------------------------
export const reentrySchema = z.object({
  date: z.string().min(1, "Date is required"), // YYYY-MM-DD
  startTime: z.string().min(1, "Start time is required"), // ISO-8601 local datetime
  endTime: z.string().min(1, "End time is required"), // ISO-8601 local datetime
});

// ---------------------------------------------------------------------------
// E7 — GET /api/attendance/admin/employee/{employeeId}/days
// AdminWorkingDaySummaryDTO
// ---------------------------------------------------------------------------
export const adminWorkingDaySchema = z.object({
  dayId: z.number(),
  date: z.string(), // YYYY-MM-DD
  totalHours: z.number(),
  dayStatus: z.enum(["open", "pending", "approved", "rejected", "locked"]),
  hasManualSession: z.boolean(),
});
