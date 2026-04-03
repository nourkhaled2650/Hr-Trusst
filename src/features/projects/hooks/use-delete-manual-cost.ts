import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { manualCostsApi } from "../api/manual-costs.api";

export function useDeleteManualCost(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (costId: number) =>
      manualCostsApi.deleteManualCost(projectId, costId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.manualCosts(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.costSummary(projectId),
      });
    },
  });
}
