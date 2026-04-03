import type { ProjectKpis } from "../types/projects.types";

// PLACEHOLDER: static data used until GET /api/admin/projects/kpis is implemented
export const STATIC_PROJECT_KPIS: ProjectKpis = {
  activeProjects:         4,
  totalBudgetAllocated:   185000,
  totalCostIncurred:      62400,
  budgetRemaining:        122600,
  projectsAtRisk:         1,
  projectsOverBudget:     0,
  totalRevenueRecognized: 40000,
  overallGrossMargin:     -22400,
};
