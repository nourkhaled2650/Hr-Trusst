import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";
import { PROJECT_ASSIGNMENTS_QUERY_KEY } from "./use-project-assignments";
import type { AssignEmployeeFormValues } from "../types/projects.types";

type AssignEmployeeArgs = {
  values: AssignEmployeeFormValues;
  projectId: number;
};

export function useAssignEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, projectId }: AssignEmployeeArgs) =>
      projectsApi.assignEmployee(values, projectId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_ASSIGNMENTS_QUERY_KEY(projectId),
      });
    },
  });
}
