import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { manualCostsApi } from "../api/manual-costs.api";
import type { ManualCostFormValues } from "../types/projects.types";

export function useAddManualCost(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ManualCostFormValues) =>
      manualCostsApi.addManualCost(projectId, values),
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
