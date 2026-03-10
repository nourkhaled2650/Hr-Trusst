import type { z } from "zod";
import type {
  projectAssignmentSchema,
  projectAssignmentListSchema,
  projectHourEntrySchema,
  bulkSubmitRequestSchema,
  projectHourLogSummarySchema,
  projectHourLogSummaryEntrySchema,
} from "../schemas/project-hours.schema";

// ---------------------------------------------------------------------------
// All types derived from Zod schemas — never written manually
// ---------------------------------------------------------------------------

export type ProjectAssignment = z.infer<typeof projectAssignmentSchema>;
export type ProjectAssignmentList = z.infer<typeof projectAssignmentListSchema>;
export type ProjectHourEntry = z.infer<typeof projectHourEntrySchema>;
export type BulkSubmitRequest = z.infer<typeof bulkSubmitRequestSchema>;
export type ProjectHourLogSummary = z.infer<typeof projectHourLogSummarySchema>;
export type ProjectHourLogSummaryEntry = z.infer<typeof projectHourLogSummaryEntrySchema>;
