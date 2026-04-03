import type { CostCategory, CreateCostCategoryFormValues } from "../types/projects.types";
import { STATIC_COST_CATEGORIES } from "../static/manual-costs.static";

// PLACEHOLDER: returns static data filtered to active categories until GET /api/admin/projects/cost-categories is implemented
export const costCategoriesApi = {
  // TODO: replace with real API call to GET /api/admin/projects/cost-categories
  fetchCostCategories: async (): Promise<CostCategory[]> => {
    return Promise.resolve(STATIC_COST_CATEGORIES.filter((c) => c.active));
  },

  // TODO: replace stub with real API call to POST /api/admin/cost-categories
  createCostCategory: async (_values: CreateCostCategoryFormValues): Promise<CostCategory> => {
    throw new Error("createCostCategory: backend endpoint not yet implemented");
  },
} as const;
