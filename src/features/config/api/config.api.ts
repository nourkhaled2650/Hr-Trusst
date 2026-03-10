import { isAxiosError } from "axios";
import { apiClient } from "@/lib/axios";
import type { PayrollSettings, PayrollSettingsRequest } from "../types/config.types";

const BASE = "/api/payroll-settings";

export const configApi = {
  /**
   * GET /api/payroll-settings/latest
   * Returns null when no active config exists (404) — does not throw.
   * All other errors propagate so TanStack Query populates `error`.
   */
  fetchLatest: async (): Promise<PayrollSettings | null> => {
    try {
      const { data } = await apiClient.get<PayrollSettings>(`${BASE}/latest`);
      return data.data ?? null;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * GET /api/payroll-settings/all
   * Returns the full history of all settings records.
   */
  fetchAll: async (): Promise<PayrollSettings[]> => {
    const { data } = await apiClient.get<PayrollSettings[]>(`${BASE}/all`);
    return data.data ?? [];
  },

  /**
   * POST /api/payroll-settings/create
   * Creates the first configuration record.
   */
  create: async (payload: PayrollSettingsRequest): Promise<PayrollSettings> => {
    const { data } = await apiClient.post<PayrollSettings>(
      `${BASE}/create`,
      payload,
    );
    if (data.data === null) {
      throw new Error(data.message || "Failed to create configuration");
    }
    return data.data;
  },

  /**
   * PUT /api/payroll-settings/update/{id}
   * Full-replace update — all fields must be sent.
   */
  update: async (
    id: number,
    payload: PayrollSettingsRequest,
  ): Promise<PayrollSettings> => {
    const { data } = await apiClient.put<PayrollSettings>(
      `${BASE}/update/${id}`,
      payload,
    );
    if (data.data === null) {
      throw new Error(data.message || "Failed to update configuration");
    }
    return data.data;
  },
} as const;
