import type { Project } from "../types/projects.types";
import type { UpdateProjectFormValues } from "../types/projects.types";

// ---------------------------------------------------------------------------
// Map API Project to update form default values
// ---------------------------------------------------------------------------

export function mapProjectToFormValues(
  project: Project,
): UpdateProjectFormValues {
  return {
    projectName: project.projectName,
    projectCode: project.projectCode,
    description: project.description ?? "",
    startDate: project.startDate ?? "",
    endDate: project.endDate ?? "",
    status: project.status,
  };
}

// ---------------------------------------------------------------------------
// Build create/update API payload — strip empty strings
// ---------------------------------------------------------------------------

export type ProjectPayload = {
  projectName: string;
  projectCode: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
};

export function buildProjectPayload(
  values: UpdateProjectFormValues,
): ProjectPayload {
  const payload: ProjectPayload = {
    projectName: values.projectName,
    projectCode: values.projectCode,
    status: values.status,
    startDate: values.startDate || null,
    endDate: values.endDate || null,
  };

  if (values.description) {
    payload.description = values.description;
  }

  return payload;
}
