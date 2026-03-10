import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { projectHoursApi } from "./project-hours.api";
import type { BulkSubmitRequest } from "../types/project-hours.types";

// ---------------------------------------------------------------------------
// GET /api/project-hours/my/assignments
// staleTime: 60s — assignments change infrequently within a session
// ---------------------------------------------------------------------------
export function useMyAssignmentsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.projectHours.myAssignments(),
    queryFn: () => projectHoursApi.getMyAssignments(),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// E10 — GET /api/project-hours/my?date=YYYY-MM-DD
// Only enabled when the day is locked (Mode B on the log page)
// ---------------------------------------------------------------------------
export function useSubmittedDayLogQuery(date: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.projectHours.myByDate(date),
    queryFn: () => projectHoursApi.getSubmittedDayLog(date),
    enabled,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// E5 — POST /api/project-hours/submit
// On success: invalidates the day summary (E4) so the page transitions to Mode B
// ---------------------------------------------------------------------------
export function useSubmitDailyLogsMutation(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: BulkSubmitRequest) => projectHoursApi.submitDailyLogs(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.attendance.daySummary(date),
      });
    },
  });
}
