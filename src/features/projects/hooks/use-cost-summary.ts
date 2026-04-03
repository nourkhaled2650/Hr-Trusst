import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { costSummaryApi } from "../api/cost-summary.api";

export function useCostSummary(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.costSummary(projectId),
    queryFn: () => costSummaryApi.fetchCostSummary(projectId),
    staleTime: 30_000,
  });
}
