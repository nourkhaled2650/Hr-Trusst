import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AttendanceLog } from "../types/attendance.types";
import { QUERY_KEYS } from "@/constants/query-keys";
import { attendanceApi } from "./attendance.api";

// ---------------------------------------------------------------------------
// E1 — Session status (server-authoritative state machine driver)
// staleTime: 0 + refetchOnWindowFocus ensures widget stays current
// ---------------------------------------------------------------------------
export function useSessionStatusQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.attendance.sessionStatus(),
    queryFn: () => attendanceApi.getSessionStatus(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

// ---------------------------------------------------------------------------
// E4 — Day summary for the project hours page
// ---------------------------------------------------------------------------
export function useDaySummaryQuery(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.attendance.daySummary(date),
    queryFn: () => attendanceApi.getDaySummary(date),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

// ---------------------------------------------------------------------------
// E7 — Admin: employee working days list
// ---------------------------------------------------------------------------
export function useEmployeeWorkingDaysQuery(employeeId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.attendance.employeeWorkingDays(employeeId),
    queryFn: () => attendanceApi.getEmployeeWorkingDays(employeeId),
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Legacy — GET /api/attendance/logs/{employeeId} (history page)
// ---------------------------------------------------------------------------
export function useAttendanceLogsQuery(employeeId: number | null): ReturnType<typeof useQuery<AttendanceLog[]>> {
  return useQuery({
    queryKey: QUERY_KEYS.attendance.logs(employeeId ?? 0),
    queryFn: () => {
      if (employeeId === null) throw new Error("employeeId is null");
      return attendanceApi.getAttendanceLogs(employeeId);
    },
    enabled: employeeId !== null,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// E2 — Clock in mutation
// ---------------------------------------------------------------------------
export function useClockInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opts?: { manualTime?: string }) => attendanceApi.clockIn(opts),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.attendance.sessionStatus(),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// E3 — Clock out mutation
// ---------------------------------------------------------------------------
export function useClockOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opts?: { manualTime?: string }) => attendanceApi.clockOut(opts),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.attendance.sessionStatus(),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// E6 — Re-entry mutation
// ---------------------------------------------------------------------------
export function useReentryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { date: string; startTime: string; endTime: string }) =>
      attendanceApi.submitReentry(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.attendance.sessionStatus(),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// E8 — Admin approve day mutation
// ---------------------------------------------------------------------------
export function useApproveDayMutation(employeeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dayId: number) => attendanceApi.approveWorkingDay(dayId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.attendance.employeeWorkingDays(employeeId),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// E9 — Admin reject day mutation
// ---------------------------------------------------------------------------
export function useRejectDayMutation(employeeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dayId: number) => attendanceApi.rejectWorkingDay(dayId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.attendance.employeeWorkingDays(employeeId),
      });
    },
  });
}
