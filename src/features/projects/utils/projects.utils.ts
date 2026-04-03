import type { Project } from "../types/projects.types";
import type { UpdateProjectFormValues } from "../types/projects.types";

// ---------------------------------------------------------------------------
// Map API Project to update form default values
// ---------------------------------------------------------------------------

export function mapProjectToFormValues(
  project: Project,
): UpdateProjectFormValues {
  return {
    projectName:  project.projectName,
    projectCode:  project.projectCode,
    description:  project.description ?? "",
    startDate:    project.startDate ?? "",
    endDate:      project.endDate ?? "",
    status:       project.status,
    budget:       project.budget ?? null,
    revenueTarget: project.revenueTarget ?? null,
    actualRevenue: project.actualRevenue ?? null,
  };
}

// ---------------------------------------------------------------------------
// Build create/update API payload — strip empty strings
// ---------------------------------------------------------------------------

export function buildProjectPayload(values: UpdateProjectFormValues) {
  return {
    projectName:   values.projectName,
    projectCode:   values.projectCode,
    status:        values.status,
    startDate:     values.startDate || null,
    endDate:       values.endDate || null,
    description:   values.description || undefined,
    budget:        values.budget ?? null,
    revenueTarget: values.revenueTarget ?? null,
    actualRevenue: values.actualRevenue ?? null,
  };
}
