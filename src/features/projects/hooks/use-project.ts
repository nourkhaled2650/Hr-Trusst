import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";
import type { Project } from "../types/projects.types";

export function useProject(projectId: string) {
  return useQuery<Project>({
    queryKey: ["projects", projectId],
    queryFn: () => projectsApi.fetchProject(projectId),
  });
}
