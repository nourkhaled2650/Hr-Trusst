import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { AttendanceDayFilters } from "../types/attendance.types";
import { adminAttendanceApi } from "./admin-attendance.api";

// ---------------------------------------------------------------------------
// Admin — Today snapshot
// TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
// ---------------------------------------------------------------------------
export function useAdminTodayQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.attendance.adminToday(),
    queryFn: () => adminAttendanceApi.getAdminToday(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Admin — All Days (paginated, filtered)
// TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
// ---------------------------------------------------------------------------
export function useAdminDaysQuery(filters: AttendanceDayFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.attendance.adminDays(filters),
    queryFn: () => adminAttendanceApi.getAdminDays(filters),
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Admin — Monthly stats
// TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
// ---------------------------------------------------------------------------
export function useAdminMonthStatsQuery() {
  return useQuery({
    queryKey: ["admin", "attendance", "month-stats"] as const,
    queryFn: () => adminAttendanceApi.getMonthStats(),
    staleTime: 300_000,
  });
}
