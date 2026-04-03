import type { ManualCostEntry, ManualCostFormValues } from "../types/projects.types";
import { STATIC_MANUAL_COSTS } from "../static/manual-costs.static";

// PLACEHOLDER: all functions use static data or stub behavior until real endpoints are implemented
export const manualCostsApi = {
  // TODO: replace with real API call to GET /api/admin/projects/{projectId}/manual-costs
  fetchManualCosts: async (_projectId: string): Promise<ManualCostEntry[]> => {
    return Promise.resolve(STATIC_MANUAL_COSTS);
  },

  // TODO: replace stub with real API call to POST /api/admin/projects/{projectId}/manual-costs
  addManualCost: async (
    _projectId: string,
    _values: ManualCostFormValues,
  ): Promise<ManualCostEntry> => {
    // const body = { categoryId: values.categoryId, description: values.description, amount: values.amount, costDate: values.costDate };
    // const { data } = await apiClient.post<ManualCostEntry>(`/api/admin/projects/${projectId}/manual-costs`, body, { _toast: false });
    // if (data.status !== "success" || data.data === null) throw new Error(data.message ?? "Failed to add manual cost");
    // return data.data;
    throw new Error("addManualCost: backend endpoint not yet implemented");
  },

  // TODO: replace stub with real API call to PUT /api/admin/projects/{projectId}/manual-costs/{costId}
  editManualCost: async (
    _projectId: string,
    _costId: number,
    _values: ManualCostFormValues,
  ): Promise<ManualCostEntry> => {
    // const body = { categoryId: values.categoryId, description: values.description, amount: values.amount, costDate: values.costDate };
    // const { data } = await apiClient.put<ManualCostEntry>(`/api/admin/projects/${projectId}/manual-costs/${costId}`, body, { _toast: false });
    // if (data.status !== "success" || data.data === null) throw new Error(data.message ?? "Failed to edit manual cost");
    // return data.data;
    throw new Error("editManualCost: backend endpoint not yet implemented");
  },

  // TODO: replace stub with real API call to DELETE /api/admin/projects/{projectId}/manual-costs/{costId}
  deleteManualCost: async (
    _projectId: string,
    _costId: number,
  ): Promise<void> => {
    // const { data } = await apiClient.delete<null>(`/api/admin/projects/${projectId}/manual-costs/${costId}`, { _toast: false });
    // if (data.status !== "success") throw new Error(data.message ?? "Failed to delete manual cost");
    throw new Error("deleteManualCost: backend endpoint not yet implemented");
  },
} as const;
