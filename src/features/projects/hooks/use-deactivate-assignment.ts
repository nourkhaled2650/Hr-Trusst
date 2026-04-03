import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { projectsApi } from "../api/projects.api";
import { PROJECT_ASSIGNMENTS_QUERY_KEY } from "./use-project-assignments";

export function useDeactivateAssignment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: number) =>
      projectsApi.deactivateAssignment(assignmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.assignments(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: PROJECT_ASSIGNMENTS_QUERY_KEY(Number(projectId)),
      });
    },
  });
}
