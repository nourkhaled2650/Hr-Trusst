import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { costCategoriesApi } from "../api/cost-categories.api";
import type { CreateCostCategoryFormValues } from "../types/projects.types";

export function useAddCostCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateCostCategoryFormValues) =>
      costCategoriesApi.createCostCategory(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.costCategories() });
    },
  });
}
