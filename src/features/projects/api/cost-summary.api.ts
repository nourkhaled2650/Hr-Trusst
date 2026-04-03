import type { ProjectCostSummary } from "../types/projects.types";
import { STATIC_COST_SUMMARY } from "../static/cost-summary.static";

// PLACEHOLDER: all functions return static data until real endpoints are implemented
export const costSummaryApi = {
  // TODO: replace with real API call to GET /api/admin/projects/{projectId}/cost-summary
  fetchCostSummary: async (_projectId: string): Promise<ProjectCostSummary> => {
    return Promise.resolve(STATIC_COST_SUMMARY);
  },
} as const;
