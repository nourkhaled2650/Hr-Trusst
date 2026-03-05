import { useQuery } from "@tanstack/react-query";
import { configApi } from "../api/config.api";

export const LATEST_CONFIG_QUERY_KEY = ["payroll-settings", "latest"] as const;

export function useLatestConfig() {
  return useQuery({
    queryKey: LATEST_CONFIG_QUERY_KEY,
    queryFn: configApi.fetchLatest,
    staleTime: 5 * 60 * 1000,
  });
}
