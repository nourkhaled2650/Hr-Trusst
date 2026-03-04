import type { EmployeeId } from "@/types";
import type {
  createEmployeeSchema,
  updateEmployeeSchema,
  configurationExceptionSchema,
} from "../schemas/employees.schema";
import type { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Raw API shapes — mirror the GET /api/employee response item exactly
// ---------------------------------------------------------------------------

export interface ConfigurationException {
  normalOvertimeRate: number | null;
  specialOvertimeRate: number | null;
  standardWorkingHours: number | null;
  lateBalanceLimit: number | null;
  leaveBalanceLimit: number | null;
  workingDayStartTime: string | null; // "HH:mm:ss" from backend
}

export interface Employee {
  employeeId: EmployeeId;
  employeeCode: string;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
  position: string | null;
  phoneNumber: string | null;
  address: string | null;
  employeeType: "FULL_TIME" | "PART_TIME" | null;
  basicSalary: number | null;
  dateOfBirth: string | null; // ISO date YYYY-MM-DD
  hireDate: string | null; // ISO date YYYY-MM-DD
  configurationException: ConfigurationException | null;
}

// ---------------------------------------------------------------------------
// Form value types — derived from Zod schemas
// ---------------------------------------------------------------------------

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;
export type ConfigurationExceptionFormValues = z.infer<
  typeof configurationExceptionSchema
>;
