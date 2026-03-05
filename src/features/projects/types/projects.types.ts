import type { ProjectId } from "@/types";
import type {
  createProjectSchema,
  updateProjectSchema,
  assignEmployeeSchema,
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
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Form value types — derived from Zod schemas
// ---------------------------------------------------------------------------

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
export type AssignEmployeeFormValues = z.infer<typeof assignEmployeeSchema>;
