import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";
import { PROJECTS_QUERY_KEY } from "./use-projects";
import { buildProjectPayload } from "../utils/projects.utils";
import type { UpdateProjectFormValues } from "../types/projects.types";

type UpdateProjectArgs = {
  projectId: number;
  values: UpdateProjectFormValues;
};

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, values }: UpdateProjectArgs) => {
      const payload = buildProjectPayload(values);
      return projectsApi.updateProject(projectId, payload);
    },
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: ["projects", String(projectId)],
      });
    },
  });
}
