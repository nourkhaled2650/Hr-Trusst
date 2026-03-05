import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";
import { PROJECTS_QUERY_KEY } from "./use-projects";

export function useCloseProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => projectsApi.closeProject(projectId),
    onSuccess: (_data, projectId) => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: ["projects", String(projectId)],
      });
    },
  });
}
