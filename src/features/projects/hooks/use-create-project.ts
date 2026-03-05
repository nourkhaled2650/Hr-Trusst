import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";
import { PROJECTS_QUERY_KEY } from "./use-projects";
import type { CreateProjectFormValues } from "../types/projects.types";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateProjectFormValues) =>
      projectsApi.createProject(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}
