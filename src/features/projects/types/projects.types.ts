import type { ProjectId } from "@/types";
import type {
  createProjectSchema,
  updateProjectSchema,
  assignEmployeeSchema,
  manualCostSchema,
  costCategorySchema,
} from "../schemas/projects.schema";
import type { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Project status enum
// ---------------------------------------------------------------------------

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";

// ---------------------------------------------------------------------------
// Raw API shapes — mirror the backend response exactly
// ---------------------------------------------------------------------------

export interface Project {
  projectId: ProjectId;
  projectName: string;
  projectCode: string;
  description: string | null;
  startDate: string | null; // ISO date YYYY-MM-DD
  endDate: string | null; // ISO date YYYY-MM-DD
  status: ProjectStatus;
  budget:        number | null;
  revenueTarget: number | null;
  actualRevenue: number | null;
}

export interface Assignment {
  assignmentId: number;
  projectId: number;
  projectName: string;
  employeeId: number;
  employeeName: string;
  roleInProject: string | null;
  allocationPercentage: number | null;
  assignedDate: string | null; // ISO date YYYY-MM-DD
  // Serialized as "active" not "isActive" — Lombok strips "is" prefix (DEV-NEW-028)
  active: boolean;
}

// ---------------------------------------------------------------------------
// Form value types — derived from Zod schemas
// ---------------------------------------------------------------------------

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
export type AssignEmployeeFormValues = z.infer<typeof assignEmployeeSchema>;
export type ManualCostFormValues = z.infer<typeof manualCostSchema>;
export type CreateCostCategoryFormValues = z.infer<typeof costCategorySchema>;

// ---------------------------------------------------------------------------
// Project health & cost types
// ---------------------------------------------------------------------------

export type HealthStatus =
  | "ON_TRACK"
  | "AT_RISK"
  | "OVER_BUDGET"
  | "NO_BUDGET"
  | "COMPLETED_PROFITABLE"
  | "COMPLETED_AT_LOSS"
  | "COMPLETED_NEUTRAL";
export type CostStatus   = "ESTIMATED" | "CONFIRMED";

/** KPI aggregates returned by GET /api/admin/projects/kpis */
export interface ProjectKpis {
  activeProjects:         number;
  totalBudgetAllocated:   number;
  totalCostIncurred:      number;
  budgetRemaining:        number;
  projectsAtRisk:         number;
  projectsOverBudget:     number;
  totalRevenueRecognized: number;
  overallGrossMargin:     number;
}

/** Per-employee breakdown inside a cost summary */
export interface EmployeeCostEntry {
  employeeId:       number;
  employeeName:     string;
  employmentType:   "FULL_TIME" | "PART_TIME";
  totalHours:       number;
  regularHours:     number;
  overtimeHours:    number;
  salaryCost:       number;
  costStatus:       CostStatus;
}

/** Full cost summary for a single project */
export interface ProjectCostSummary {
  projectId:               number;
  healthStatus:            HealthStatus;
  budget:                  number | null;
  totalCost:               number;
  totalSalaryCost:         number;
  totalManualCost:         number;
  budgetUtilizationPct:    number | null;
  budgetVariance:          number | null;
  projectedFinalCost:      number | null;
  projectedVariance:       number | null;
  revenueTarget:           number | null;
  actualRevenue:           number | null;
  grossMargin:             number | null;
  marginPct:               number | null;
  dailyBurnRate:           number;
  weeklyBurnRateRolling:   number;
  weeklyBurnRateAverage:   number;
  activeDays:              number;
  overtimeDelta:           number;
  normalOtExtra:           number;
  specialOtExtra:          number;
  overtimePctOfSalaryCost: number;
  employeeCosts:           EmployeeCostEntry[];
}

/** One week of cost trend data (raw — before enrichment) */
export interface TrendWeek {
  weekStart:       string; // ISO date YYYY-MM-DD (Monday)
  salaryCost:      number;
  manualCost:      number;
  totalCost:       number;
  hours:           number;
  /** Added by enrichTrendWeeks() in utils.ts */
  weekLabel:       string;
  /** Added by enrichTrendWeeks() — running total */
  cumulativeCost:  number;
}

/** A manually entered cost item (non-salary expense) */
export interface ManualCostEntry {
  costId:      number;
  projectId:   number;
  categoryId:  number;
  description: string;
  amount:      number;
  costDate:    string; // ISO date YYYY-MM-DD
  createdAt:   string; // ISO datetime
}

/** A cost category (e.g. Travel, Software License) */
export interface CostCategory {
  categoryId:   number;
  categoryName: string;
  active:       boolean;
}
