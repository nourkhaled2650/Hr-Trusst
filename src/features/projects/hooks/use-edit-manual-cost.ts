import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { manualCostsApi } from "../api/manual-costs.api";
import type { ManualCostFormValues } from "../types/projects.types";

type EditManualCostArgs = {
  costId: number;
  values: ManualCostFormValues;
};

export function useEditManualCost(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ costId, values }: EditManualCostArgs) =>
      manualCostsApi.editManualCost(projectId, costId, values),
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
