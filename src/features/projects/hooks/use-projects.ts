import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";
import type { Project } from "../types/projects.types";

export const PROJECTS_QUERY_KEY = ["projects"] as const;

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: projectsApi.fetchProjects,
  });
}
