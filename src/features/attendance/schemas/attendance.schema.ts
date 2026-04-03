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

// ---------------------------------------------------------------------------
// Shared — DayStatus (without "locked")
// ---------------------------------------------------------------------------
export const dayStatusSchema = z.enum(["open", "pending", "approved", "rejected"]);

// ---------------------------------------------------------------------------
// WorkingDayRow — employee history list and admin all-days list
// ---------------------------------------------------------------------------
export const workingDayRowSchema = z.object({
  dayId: z.number(),
  date: z.string(), // YYYY-MM-DD
  totalHours: z.number(),
  dayStatus: dayStatusSchema,
  hasManualSession: z.boolean(),
  overtimeHours: z.number(),
  latenessMinutes: z.number(),
});

export const pagedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    number: z.number(),
    size: z.number(),
  });

// ---------------------------------------------------------------------------
// DayDetail — employee day detail page
// ---------------------------------------------------------------------------
export const sessionEntrySchema = z.object({
  startTime: z.string(), // ISO-8601 datetime
  endTime: z.string().nullable(),
  durationHours: z.number(),
  isManual: z.boolean(),
});

export const projectEntrySchema = z.object({
  projectName: z.string(),
  hours: z.number(),
  notes: z.string().nullable(),
});

export const dayDetailSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  totalHours: z.number(),
  dayStatus: dayStatusSchema,
  hasManualSession: z.boolean(),
  latenessMinutes: z.number(),
  overtimeHours: z.number(),
  sessions: z.array(sessionEntrySchema),
  projectEntries: z.array(projectEntrySchema),
});

// ---------------------------------------------------------------------------
// Admin — Today employee status
// ---------------------------------------------------------------------------
export const adminTodayStatusSchema = z.enum([
  "not_started",
  "active",
  "submitted",
  "pending_review",
  "approved",
]);

export const adminTodayEmployeeSchema = z.object({
  employeeId: z.number(),
  employeeName: z.string(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME"]),
  status: adminTodayStatusSchema,
  clockedInAt: z.string().nullable(),
  totalHoursToday: z.number(),
  isLateToday: z.boolean(),
});

// ---------------------------------------------------------------------------
// Admin — All Days row (extends WorkingDayRow with employee info)
// ---------------------------------------------------------------------------
export const adminWorkingDayRowSchema = workingDayRowSchema.extend({
  employeeId: z.number(),
  employeeName: z.string(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME"]),
});

// ---------------------------------------------------------------------------
// Admin — Filters
// ---------------------------------------------------------------------------
export const attendanceDayFiltersSchema = z.object({
  page: z.number(),
  size: z.number().optional(),
  employeeId: z.number().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hasManualSession: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Admin — Monthly stats
// ---------------------------------------------------------------------------
export const attendanceMonthStatsSchema = z.object({
  overtimeDaysThisMonth: z.number(),
  manualSessionsThisMonth: z.number(),
  monthlyHoursTotal: z.number(),
});
