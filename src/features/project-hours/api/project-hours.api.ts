import { apiClient } from "@/lib/axios";
import type { ProjectAssignment, BulkSubmitRequest, ProjectHourLogSummary } from "../types/project-hours.types";

// ---------------------------------------------------------------------------
// Project Hours API
// All calls go through apiClient from lib/axios.ts
// ---------------------------------------------------------------------------

export const projectHoursApi = {
  // GET /api/project-hours/my/assignments
  // Returns active project assignments for the authenticated employee (from JWT)
  getMyAssignments: async (): Promise<ProjectAssignment[]> => {
    const { data } = await apiClient.get<ProjectAssignment[]>(
      "/api/project-hours/my/assignments",
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to fetch assignments.");
    }
    return data.data;
  },

  // E5 — POST /api/project-hours/submit (BulkProjectHourSubmitRequest)
  // NOTE (DEV-b096ab1-001): entries use assignmentId, NOT project_id
  // The backend validates that sum of hours == attendance totalWorkingHours
  submitDailyLogs: async (request: BulkSubmitRequest): Promise<void> => {
    const { data } = await apiClient.post<null>("/api/project-hours/submit", request);
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to submit project hours.");
    }
  },

  // E10 — GET /api/project-hours/my?date=YYYY-MM-DD
  // Returns submitted project hour entries for a locked day
  getSubmittedDayLog: async (date: string): Promise<ProjectHourLogSummary> => {
    const { data } = await apiClient.get<ProjectHourLogSummary>(
      `/api/project-hours/my?date=${date}`,
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to fetch submitted hours.");
    }
    return data.data;
  },
} as const;
