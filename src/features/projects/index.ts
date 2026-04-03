// API
export { projectsApi } from "./api/projects.api";
export { costSummaryApi } from "./api/cost-summary.api";
export { trendApi } from "./api/trend.api";
export { manualCostsApi } from "./api/manual-costs.api";
export { costCategoriesApi } from "./api/cost-categories.api";

// Hooks
export { useProjects, PROJECTS_QUERY_KEY } from "./hooks/use-projects";
export { useProject } from "./hooks/use-project";
export { useCreateProject } from "./hooks/use-create-project";
export { useUpdateProject } from "./hooks/use-update-project";
export { useCloseProject } from "./hooks/use-close-project";
export { useAssignEmployee } from "./hooks/use-assign-employee";
export { useProjectAssignments, PROJECT_ASSIGNMENTS_QUERY_KEY } from "./hooks/use-project-assignments";
export { useProjectKpis } from "./hooks/use-project-kpis";
export { useCostSummary } from "./hooks/use-cost-summary";
export { useProjectTrend } from "./hooks/use-project-trend";
export { useManualCosts } from "./hooks/use-manual-costs";
export { useAddManualCost } from "./hooks/use-add-manual-cost";
export { useEditManualCost } from "./hooks/use-edit-manual-cost";
export { useDeleteManualCost } from "./hooks/use-delete-manual-cost";
export { useCostCategories } from "./hooks/use-cost-categories";
export { useDeactivateAssignment } from "./hooks/use-deactivate-assignment";

// Components
export { ProjectTable } from "./components/project-table";
export { ProjectStatusBadge } from "./components/project-status-badge";
export { ProjectKpiStrip } from "./components/ProjectKpiStrip";
export { HealthDot } from "./components/HealthDot";
export { HealthStatusPill } from "./components/HealthStatusPill";
export { ProjectHeroCard } from "./components/ProjectHeroCard";
export { CreateProjectDialog } from "./components/create-project-dialog";
export { ProjectDetailPage } from "./components/ProjectDetailPage";
export { ProjectInfoForm } from "./components/project-info-form";
export { AssignedEmployeesPanel } from "./components/assigned-employees-panel";
export { AssignEmployeeDialog } from "./components/assign-employee-dialog";
export { ProjectSettingsTab } from "./components/settings";
export { OverviewTab } from "./components/overview";
export { CostsTab, ManualCostDialog } from "./components/costs";

// Schemas
export {
  createProjectSchema,
  updateProjectSchema,
  assignEmployeeSchema,
  manualCostSchema,
} from "./schemas/projects.schema";

// Types
export type {
  Project,
  Assignment,
  ProjectStatus,
  CreateProjectFormValues,
  UpdateProjectFormValues,
  AssignEmployeeFormValues,
  ManualCostFormValues,
  HealthStatus,
  CostStatus,
  ProjectKpis,
  EmployeeCostEntry,
  ProjectCostSummary,
  TrendWeek,
  ManualCostEntry,
  CostCategory,
} from "./types/projects.types";

// Utils
export { mapProjectToFormValues, buildProjectPayload } from "./utils/projects.utils";
