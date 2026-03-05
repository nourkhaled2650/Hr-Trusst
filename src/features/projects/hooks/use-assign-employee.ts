import { useMutation } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";
import type { AssignEmployeeFormValues } from "../types/projects.types";

type AssignEmployeeArgs = {
  values: AssignEmployeeFormValues;
  projectId: number;
};

export function useAssignEmployee() {
  return useMutation({
    mutationFn: ({ values, projectId }: AssignEmployeeArgs) =>
      projectsApi.assignEmployee(values, projectId),
  });
}
