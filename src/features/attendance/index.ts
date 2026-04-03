// ---------------------------------------------------------------------------
// Attendance feature — public API (V2)
// Nothing inside this feature is imported directly from outside.
// All cross-feature access goes through this file.
// ---------------------------------------------------------------------------

// Components — V2 session widget
export { SessionWidget } from "./components/SessionWidget";
export { StartSessionDialog } from "./components/StartSessionDialog";
export { EndSessionDialog } from "./components/EndSessionDialog";
export { RejectedDayReentryDialog } from "./components/RejectedDayReentryDialog";
export { EmployeeWorkingDaysTable } from "./components/EmployeeWorkingDaysTable";

// Components — Legacy (history page)
export { AttendanceTodayCard, AttendanceHistoryList } from "./components/AttendanceHistory";

// Components — New pages
export { DayStatusBadge } from "./components/DayStatusBadge";
export { DayFlagChips } from "./components/DayFlagChips";
export { SessionsCard } from "./components/SessionsCard";
export { ProjectHoursCard } from "./components/ProjectHoursCard";
export { AttendanceTodayStatusChip } from "./components/AttendanceTodayStatusChip";
export { AdminStatsStrip } from "./components/AdminStatsStrip";
export { AdminTodayTab } from "./components/AdminTodayTab";
export { AdminAllDaysTab } from "./components/AdminAllDaysTab";
export { AdminPendingTab } from "./components/AdminPendingTab";

// Queries & mutations — V2
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

// Queries — new pages
export { useMyDaysQuery, useMyDayDetailQuery } from "./api/my-days.queries";
export {
  useAdminTodayQuery,
  useAdminDaysQuery,
  useAdminMonthStatsQuery,
} from "./api/admin-attendance.queries";

// API
export { attendanceApi } from "./api/attendance.api";
export { myDaysApi } from "./api/my-days.api";
export { adminAttendanceApi } from "./api/admin-attendance.api";

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
  // New page types
  WorkingDayRow,
  DayDetail,
  SessionEntry,
  ProjectEntry,
  PagedResponse,
  AdminTodayStatus,
  AdminTodayEmployee,
  AdminWorkingDayRow,
  AttendanceDayFilters,
  AttendanceMonthStats,
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
