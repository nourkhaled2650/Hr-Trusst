// ---------------------------------------------------------------------------
// Attendance feature — public API (V2)
// Nothing inside this feature is imported directly from outside.
// All cross-feature access goes through this file.
// ---------------------------------------------------------------------------

// Components — V2
export { SessionWidget } from "./components/SessionWidget";
export { StartSessionDialog } from "./components/StartSessionDialog";
export { EndSessionDialog } from "./components/EndSessionDialog";
export { RejectedDayReentryDialog } from "./components/RejectedDayReentryDialog";
export { EmployeeWorkingDaysTable } from "./components/EmployeeWorkingDaysTable";

// Components — Legacy (history page)
export { AttendanceTodayCard, AttendanceHistoryList } from "./components/AttendanceHistory";

// Queries & mutations
export {
  useSessionStatusQuery,
  useDaySummaryQuery,
  useEmployeeWorkingDaysQuery,
  useClockInMutation,
  useClockOutMutation,
  useReentryMutation,
  useApproveDayMutation,
  useRejectDayMutation,
  // Legacy — used by attendance history page
  useAttendanceLogsQuery,
} from "./api/attendance.queries";

// API
export { attendanceApi } from "./api/attendance.api";

// Types
export type {
  // V2 types
  SessionStatusResponse,
  DaySummaryResponse,
  AdminWorkingDay,
  DayStatus,
  E4DayStatus,
  // Legacy (history page)
  AttendanceLog,
  AttendanceLogList,
} from "./types/attendance.types";

// Utils
export {
  getTodayString,
  formatHoursDisplay,
  formatElapsedTime,
  formatElapsedTimeCompact,
  formatTimeDisplay,
  formatHoursAsTime,
  timeInputToDecimalHours,
  decimalHoursToTimeInput,
  // Legacy (history page)
  filterLogsByDate,
  sumClosedDurationHours,
} from "./utils/attendance.utils";
