// Phase 1 — Admin list page
export { PayrollListPage } from "./components/PayrollListPage";

// Phase 2 — Admin month detail page
export { PayrollMonthDetailPage } from "./components/PayrollMonthDetailPage";

// Phase 4 — Employee payslips page
export { MyPayslipsPage } from "./components/MyPayslipsPage";

// Phase 5 — Employee payslip detail page
export { MyPayslipDetailPage } from "./components/MyPayslipDetailPage";

// API
export { payrollApi } from "./api/payroll.api";

// Hooks (Phase 1)
export { usePayrollMonths, usePayrollMonthSummary, useTriggerPayroll } from "./api/payroll.queries";

// Hooks (Phase 2)
export { usePayrollMonthDetail, useApprovePayroll, useMarkPayrollPaid } from "./api/payroll.queries";

// Hooks (Phase 3)
export { usePayrollAdjustments, useCreateAdjustment, useDeleteAdjustment } from "./api/payroll.queries";

// Hooks (Phase 4)
export { useMyPayslips, useMyPayslipDetail } from "./api/payroll.queries";

// Utils
export { formatEGP, formatMonthYear } from "./utils/payroll.utils";

// Types (Phase 1)
export type {
  PayrollStatus,
  PayrollMonth,
  PayrollMonthSummary,
} from "./types/payroll.types";

// Types (Phase 2)
export type {
  PayrollEmployeeRow,
  PayrollMonthDetail,
} from "./types/payroll.types";

// Types (Phase 3)
export type {
  AdjustmentType,
  PayrollAdjustment,
  AdjustmentFormValues,
} from "./types/payroll.types";

// Types (Phase 4)
export type {
  PayslipSummary,
  PayslipDetail,
  PayslipAdjustmentLine,
} from "./types/payroll.types";
