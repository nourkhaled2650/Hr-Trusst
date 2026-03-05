import { useQuery } from "@tanstack/react-query";
import { configApi } from "../api/config.api";

export const ALL_CONFIGS_QUERY_KEY = ["payroll-settings", "all"] as const;

export function useAllConfigs() {
  return useQuery({
    queryKey: ALL_CONFIGS_QUERY_KEY,
    queryFn: configApi.fetchAll,
    staleTime: 5 * 60 * 1000,
  });
}
