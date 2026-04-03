import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { projectsApi } from "../api/projects.api";

export function useProjectKpis() {
  return useQuery({
    queryKey: QUERY_KEYS.projects.kpis(),
    queryFn: () => projectsApi.fetchProjectKpis(),
    staleTime: 60_000,
  });
}
