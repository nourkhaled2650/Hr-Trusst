import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trendApi } from "../api/trend.api";

export function useProjectTrend(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.trend(projectId),
    queryFn: () => trendApi.fetchProjectTrend(projectId),
    staleTime: 30_000,
  });
}
