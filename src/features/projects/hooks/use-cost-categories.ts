import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { costCategoriesApi } from "../api/cost-categories.api";

export function useCostCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.projects.costCategories(),
    queryFn: () => costCategoriesApi.fetchCostCategories(),
    staleTime: 300_000,
  });
}
