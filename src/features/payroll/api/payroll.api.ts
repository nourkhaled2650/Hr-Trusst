import type {
  PayrollMonth,
  PayrollMonthSummary,
  PayrollMonthDetail,
  PayrollAdjustment,
  PayslipSummary,
  PayslipDetail,
  AdjustmentFormValues,
} from "../types/payroll.types";

// ---------------------------------------------------------------------------
// All endpoints are stubs — backend not yet implemented.
// Each stub throws with a descriptive TODO message.
// ---------------------------------------------------------------------------

export const payrollApi = {
  // Phase 1 — Admin list page

  /** GET /api/admin/payroll/months — list of all payroll months */
  getMonths: async (): Promise<PayrollMonth[]> => {
    throw new Error(
      "TODO: GET /api/admin/payroll/months — backend endpoint not yet implemented",
    );
  },

  /** GET /api/admin/payroll/summary?year=&month= — KPI summary for selected month */
  getMonthSummary: async (
    _year: number,
    _month: number,
  ): Promise<PayrollMonthSummary> => {
    throw new Error(
      "TODO: GET /api/admin/payroll/summary?year=&month= — backend endpoint not yet implemented",
    );
  },

  /** POST /api/admin/payroll/trigger — trigger payroll run for a given month */
  triggerPayroll: async (_year: number, _month: number): Promise<void> => {
    throw new Error(
      "TODO: POST /api/admin/payroll/trigger — backend endpoint not yet implemented",
    );
  },

  // Phase 2 — Admin detail page

  /** GET /api/admin/payroll/detail?year=&month= — full month detail with per-employee rows */
  getMonthDetail: async (
    _year: number,
    _month: number,
  ): Promise<PayrollMonthDetail> => {
    throw new Error(
      "TODO: GET /api/admin/payroll/detail?year=&month= — backend endpoint not yet implemented",
    );
  },

  /** POST /api/admin/payroll/approve?year=&month= — approve a payroll run */
  approvePayroll: async (_year: number, _month: number): Promise<void> => {
    throw new Error(
      "TODO: POST /api/admin/payroll/approve?year=&month= — backend endpoint not yet implemented",
    );
  },

  /** POST /api/admin/payroll/mark-paid?year=&month= — mark payroll as paid */
  markPayrollPaid: async (_year: number, _month: number): Promise<void> => {
    throw new Error(
      "TODO: POST /api/admin/payroll/mark-paid?year=&month= — backend endpoint not yet implemented",
    );
  },

  // Phase 3 — Adjustments

  /** GET /api/admin/payroll/adjustments?year=&month=&employeeId= */
  getAdjustments: async (
    _year: number,
    _month: number,
    _employeeId: number,
  ): Promise<PayrollAdjustment[]> => {
    throw new Error(
      "TODO: GET /api/admin/payroll/adjustments?year=&month=&employeeId= — backend endpoint not yet implemented",
    );
  },

  /** POST /api/admin/payroll/adjustments — create an adjustment */
  createAdjustment: async (
    _values: AdjustmentFormValues & { year: number; month: number; employeeId: number },
  ): Promise<PayrollAdjustment> => {
    throw new Error(
      "TODO: POST /api/admin/payroll/adjustments — backend endpoint not yet implemented",
    );
  },

  /** DELETE /api/admin/payroll/adjustments/:id — delete an adjustment */
  deleteAdjustment: async (_adjustmentId: number): Promise<void> => {
    throw new Error(
      "TODO: DELETE /api/admin/payroll/adjustments/:id — backend endpoint not yet implemented",
    );
  },

  // Phase 4 — Employee payslips

  /** GET /api/payroll/my — employee's own payslip list */
  getMyPayslips: async (): Promise<PayslipSummary[]> => {
    throw new Error(
      "TODO: GET /api/payroll/my — backend endpoint not yet implemented",
    );
  },

  /** GET /api/payroll/my/:year/:month — employee's own payslip detail */
  getMyPayslipDetail: async (
    _year: number,
    _month: number,
  ): Promise<PayslipDetail> => {
    throw new Error(
      "TODO: GET /api/payroll/my/:year/:month — backend endpoint not yet implemented",
    );
  },
} as const;
