import { z } from "zod";

// ---------------------------------------------------------------------------
// Assignment response — GET /api/project-hours/my/assignments
// ---------------------------------------------------------------------------
export const projectAssignmentSchema = z.object({
  assignmentId: z.number(),
  projectId: z.number(),
  projectName: z.string(),
  employeeId: z.number(),
  employeeName: z.string(),
  roleInProject: z.string().nullable(),
  allocationPercentage: z.number().nullable(),
  assignedDate: z.string().nullable(),
  active: z.boolean(), // NOTE: backend serializes boolean `isActive` field as `active` (Lombok/Jackson strips `is` prefix)
});

export const projectAssignmentListSchema = z.array(projectAssignmentSchema);

// ---------------------------------------------------------------------------
// E5 — POST /api/project-hours/submit (BulkProjectHourSubmitRequest)
// NOTE (DEV-b096ab1-001): backend uses assignmentId, NOT project_id
// ---------------------------------------------------------------------------
export const projectHourEntrySchema = z.object({
  assignmentId: z.number().positive(),
  hours: z.number().positive(),
  notes: z.string().optional(),
});

export const bulkSubmitRequestSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  entries: z.array(projectHourEntrySchema).min(1),
});

// ---------------------------------------------------------------------------
// E10 — GET /api/project-hours/my?date=YYYY-MM-DD (ProjectHourLogSummaryDTO)
// ---------------------------------------------------------------------------
export const projectHourLogSummaryEntrySchema = z.object({
  projectId: z.number(),
  projectName: z.string(),
  hours: z.number(),
  notes: z.string().nullable(),
});

export const projectHourLogSummarySchema = z.object({
  date: z.string(),
  totalHours: z.number(),
  entries: z.array(projectHourLogSummaryEntrySchema),
});
