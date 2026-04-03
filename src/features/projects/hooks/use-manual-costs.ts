import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { manualCostsApi } from "../api/manual-costs.api";

export function useManualCosts(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.manualCosts(projectId),
    queryFn: () => manualCostsApi.fetchManualCosts(projectId),
    staleTime: 30_000,
  });
}
