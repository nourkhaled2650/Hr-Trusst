import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { myDaysApi } from "./my-days.api";

// ---------------------------------------------------------------------------
// Employee — My Days (history list, paginated)
// TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
// ---------------------------------------------------------------------------
export function useMyDaysQuery(page: number) {
  return useQuery({
    queryKey: QUERY_KEYS.attendance.myDays(page),
    queryFn: () => myDaysApi.getMyDays(page),
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Employee — Day Detail
// TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
// ---------------------------------------------------------------------------
export function useMyDayDetailQuery(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.attendance.myDayDetail(date),
    queryFn: () => myDaysApi.getMyDayDetail(date),
    staleTime: 30_000,
  });
}
