// ---------------------------------------------------------------------------
// Project Hours feature — public API (V2)
// ---------------------------------------------------------------------------

export { projectHoursApi } from "./api/project-hours.api";
export {
  useMyAssignmentsQuery,
  useSubmittedDayLogQuery,
  useSubmitDailyLogsMutation,
} from "./api/project-hours.queries";

export type {
  ProjectAssignment,
  ProjectAssignmentList,
  ProjectHourEntry,
  BulkSubmitRequest,
  ProjectHourLogSummary,
  ProjectHourLogSummaryEntry,
} from "./types/project-hours.types";
