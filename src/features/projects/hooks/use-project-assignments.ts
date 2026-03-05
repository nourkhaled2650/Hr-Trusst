import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";

export const PROJECT_ASSIGNMENTS_QUERY_KEY = (projectId: number) =>
  ["project-assignments", projectId] as const;

export function useProjectAssignments(projectId: number) {
  return useQuery({
    queryKey: PROJECT_ASSIGNMENTS_QUERY_KEY(projectId),
    queryFn: () => projectsApi.fetchAssignmentsByProject(projectId),
  });
}
