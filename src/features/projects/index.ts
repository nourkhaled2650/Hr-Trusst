// API
export { projectsApi } from "./api/projects.api";

// Hooks
export { useProjects, PROJECTS_QUERY_KEY } from "./hooks/use-projects";
export { useProject } from "./hooks/use-project";
export { useCreateProject } from "./hooks/use-create-project";
export { useUpdateProject } from "./hooks/use-update-project";
export { useCloseProject } from "./hooks/use-close-project";
export { useAssignEmployee } from "./hooks/use-assign-employee";
export { useProjectAssignments, PROJECT_ASSIGNMENTS_QUERY_KEY } from "./hooks/use-project-assignments";

// Components
export { ProjectTable } from "./components/project-table";
export { ProjectStatusBadge } from "./components/project-status-badge";
export { CreateProjectDialog } from "./components/create-project-dialog";
export { ProjectDetailPage } from "./components/project-detail-page";
export { ProjectInfoForm } from "./components/project-info-form";
export { AssignedEmployeesPanel } from "./components/assigned-employees-panel";
export { AssignEmployeeDialog } from "./components/assign-employee-dialog";

// Schemas
export {
  createProjectSchema,
  updateProjectSchema,
  assignEmployeeSchema,
} from "./schemas/projects.schema";

// Types
export type {
  Project,
  Assignment,
  ProjectStatus,
  CreateProjectFormValues,
  UpdateProjectFormValues,
  AssignEmployeeFormValues,
} from "./types/projects.types";

// Utils
export { mapProjectToFormValues } from "./utils/projects.utils";
