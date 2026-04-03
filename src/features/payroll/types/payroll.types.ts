import type { z } from "zod/v4";
import type { adjustmentSchema, triggerPayrollSchema } from "../schemas/payroll.schema";

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type PayrollStatus = "PENDING" | "DRAFT" | "APPROVED" | "PAID";

// ---------------------------------------------------------------------------
// Payroll month summary (GET /api/admin/payroll/months)
// One row in the months table.
// ---------------------------------------------------------------------------

export interface PayrollMonth {
  year: number;
  month: number; // 1–12
  status: PayrollStatus;
  employeeCount: number | null;
  totalNetPayroll: number | null;
  totalGrossPayroll: number | null;
}

// ---------------------------------------------------------------------------
// KPI summary for a selected month (GET /api/admin/payroll/summary?year=&month=)
// ---------------------------------------------------------------------------

export interface PayrollMonthSummary {
  year: number;
  month: number;
  status: PayrollStatus;
  totalNetPayroll: number | null;
  totalGrossPayroll: number | null;
  totalPaid: number | null;
  employeeCount: number | null;
  averageNetSalary: number | null;
  totalNormalOtPay: number | null;
  totalSpecialOtPay: number | null;
}

// ---------------------------------------------------------------------------
// Payroll detail — employee-level rows (GET /api/admin/payroll/detail?year=&month=)
// Used in Phase 2.
// ---------------------------------------------------------------------------

export interface PayrollEmployeeRow {
  employeeId: number;
  employeeName: string;
  employmentType: "FULL_TIME" | "PART_TIME";
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  normalOtPay: number;
  specialOtPay: number;
  totalDeductions: number;
  totalBonuses: number;
  status: PayrollStatus;
}

export interface PayrollMonthDetail {
  year: number;
  month: number;
  status: PayrollStatus;
  totalNet: number;
  employeeCount: number;
  employees: PayrollEmployeeRow[];
}

// ---------------------------------------------------------------------------
// Adjustment (Phase 3)
// ---------------------------------------------------------------------------

export type AdjustmentType = "DEDUCTION" | "ADDITION";

export interface PayrollAdjustment {
  adjustmentId: number;
  employeeId: number;
  employeeName: string;
  year: number;
  month: number;
  type: AdjustmentType;
  label: string;
  amount: number;
  note: string | null;
}

// ---------------------------------------------------------------------------
// Employee payslip (Phase 4 — employee-facing)
// ---------------------------------------------------------------------------

export interface PayslipSummary {
  year: number;
  month: number;
  netSalary: number;
  grossSalary: number;
  status: PayrollStatus;
}

export interface PayslipDetail {
  year: number;
  month: number;
  status: "APPROVED" | "PAID";
  employeeName: string;
  employmentType: "FULL_TIME" | "PART_TIME";

  // Full-time (null for part-time)
  basicSalary: number | null;
  normalOvertimeHours: number | null;
  normalOvertimeAmount: number | null;
  specialOvertimeHours: number | null;
  specialOvertimeAmount: number | null;
  totalEarnings: number | null;
  latenessDeductionHours: number | null;
  latenessDeductionAmount: number | null;
  leaveDeductionDays: number | null;
  leaveDeductionAmount: number | null;
  totalDeductions: number | null;
  adjustments: PayslipAdjustmentLine[];
  netAdjustments: number | null;

  // Part-time (null for full-time)
  hoursWorked: number | null;
  hourlyRate: number | null;

  // Always present
  netPayable: number;
}

export interface PayslipAdjustmentLine {
  id: number;
  type: AdjustmentType;
  label: string;
  amount: number;
  note: string | null;
}

// ---------------------------------------------------------------------------
// Form value types — derived from Zod schemas
// ---------------------------------------------------------------------------

export type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;
export type TriggerPayrollFormValues = z.infer<typeof triggerPayrollSchema>;
