import { apiClient } from "@/lib/axios";
import type { Project, Assignment } from "../types/projects.types";
import type { CreateProjectFormValues, AssignEmployeeFormValues } from "../types/projects.types";

// ---------------------------------------------------------------------------
// Request payload types
// ---------------------------------------------------------------------------

type CreateProjectPayload = {
  projectName: string;
  projectCode: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
};

type UpdateProjectPayload = {
  projectName: string;
  projectCode: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
};

type AssignEmployeePayload = {
  projectId: number;
  employeeId: number;
  roleInProject?: string;
  allocationPercentage?: number;
  assignedDate?: string;
  endDate?: string;
};

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
    const payload: CreateProjectPayload = {
      projectName: values.projectName,
      projectCode: values.projectCode,
      status: values.status ?? "ACTIVE",
    };

    if (values.description) payload.description = values.description;
    if (values.startDate) payload.startDate = values.startDate;
    else payload.startDate = null;
    if (values.endDate) payload.endDate = values.endDate;
    else payload.endDate = null;

    const { data } = await apiClient.post<Project>("/api/projects", payload, {
      _toast: false,
    });
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to create project");
    }
    return data.data;
  },

  updateProject: async (
    projectId: number,
    payload: UpdateProjectPayload,
  ): Promise<Project> => {
    const { data } = await apiClient.put<Project>(
      `/api/projects/${projectId}`,
      payload,
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

  assignEmployee: async (
    values: AssignEmployeeFormValues,
    projectId: number,
  ): Promise<Assignment> => {
    const payload: AssignEmployeePayload = {
      projectId,
      employeeId: values.employeeId,
    };

    if (values.roleInProject) payload.roleInProject = values.roleInProject;
    if (values.allocationPercentage !== undefined)
      payload.allocationPercentage = values.allocationPercentage;
    if (values.assignedDate) payload.assignedDate = values.assignedDate;
    if (values.endDate) payload.endDate = values.endDate;

    const { data } = await apiClient.post<Assignment>(
      "/api/admin/projects/assignments",
      payload,
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to assign employee");
    }
    return data.data;
  },
} as const;
