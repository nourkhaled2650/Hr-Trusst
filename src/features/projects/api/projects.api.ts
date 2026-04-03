import { apiClient } from "@/lib/axios";
import type { Project, Assignment, ProjectKpis } from "../types/projects.types";
import type {
  CreateProjectFormValues,
  UpdateProjectFormValues,
  AssignEmployeeFormValues,
} from "../types/projects.types";
import { buildProjectPayload } from "../utils/projects.utils";
import { STATIC_PROJECT_KPIS } from "../static/project-kpis.static";

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export const projectsApi = {
  fetchProjects: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>("/api/projects", {
      _toast: false,
    });
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to fetch projects");
    }
    return data.data;
  },

  fetchProject: async (projectId: string): Promise<Project> => {
    const { data } = await apiClient.get<Project>(
      `/api/projects/${projectId}`,
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Project not found");
    }
    return data.data;
  },

  createProject: async (values: CreateProjectFormValues): Promise<Project> => {
    const body = {
      projectName: values.projectName,
      projectCode: values.projectCode,
      status: values.status ?? "ACTIVE",
      description: values.description || undefined,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
    };

    const { data } = await apiClient.post<Project>("/api/projects", body, {
      _toast: false,
    });
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to create project");
    }
    return data.data;
  },

  updateProject: async (
    projectId: number,
    values: UpdateProjectFormValues,
  ): Promise<Project> => {
    const { data } = await apiClient.put<Project>(
      `/api/projects/${projectId}`,
      buildProjectPayload(values),
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to update project");
    }
    return data.data;
  },

  closeProject: async (projectId: number): Promise<Project> => {
    const { data } = await apiClient.put<Project>(
      `/api/projects/close/${projectId}`,
      undefined,
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to close project");
    }
    return data.data;
  },

  deleteProject: async (projectId: number): Promise<void> => {
    const { data } = await apiClient.delete<null>(
      `/api/projects/${projectId}`,
      { _toast: false },
    );
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to delete project");
    }
  },

  fetchAssignmentsByProject: async (projectId: number): Promise<Assignment[]> => {
    const { data } = await apiClient.get<Assignment[]>(
      `/api/admin/projects/assignments/project/${projectId}`,
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to fetch assignments");
    }
    return data.data;
  },

  assignEmployee: async (
    values: AssignEmployeeFormValues,
    projectId: number,
  ): Promise<Assignment> => {
    const body = {
      projectId,
      employeeId: values.employeeId,
      roleInProject: values.roleInProject || undefined,
    };

    const { data } = await apiClient.post<Assignment>(
      "/api/admin/projects/assignments",
      body,
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to assign employee");
    }
    return data.data;
  },

  // PLACEHOLDER: returns static data until GET /api/admin/projects/kpis is implemented
  fetchProjectKpis: async (): Promise<ProjectKpis> => {
    // TODO: replace with real API call:
    // const { data } = await apiClient.get<ProjectKpis>("/api/admin/projects/kpis", { _toast: false });
    // if (data.status !== "success" || data.data === null) throw new Error(data.message ?? "Failed to fetch project KPIs");
    // return data.data;
    return Promise.resolve(STATIC_PROJECT_KPIS);
  },

  deactivateAssignment: async (assignmentId: number): Promise<void> => {
    const { data } = await apiClient.delete<null>(
      `/api/admin/projects/assignments/${assignmentId}`,
      { _toast: false },
    );
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to deactivate assignment");
    }
  },
} as const;
