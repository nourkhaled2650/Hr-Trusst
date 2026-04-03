import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { payrollApi } from "./payroll.api";
import type { AdjustmentFormValues } from "../types/payroll.types";
// PayrollMonthDetail is returned by usePayrollMonthDetail via payrollApi.getMonthDetail

// ---------------------------------------------------------------------------
// Admin — list & summary
// ---------------------------------------------------------------------------

export function usePayrollMonths() {
  return useQuery({
    queryKey: QUERY_KEYS.payroll.months(),
    queryFn: () => payrollApi.getMonths(),
  });
}

export function usePayrollMonthSummary(year: number, month: number) {
  return useQuery({
    queryKey: QUERY_KEYS.payroll.monthSummary(year, month),
    queryFn: () => payrollApi.getMonthSummary(year, month),
  });
}

// ---------------------------------------------------------------------------
// Admin — detail (Phase 2)
// ---------------------------------------------------------------------------

export function usePayrollMonthDetail(year: number, month: number) {
  return useQuery({
    queryKey: QUERY_KEYS.payroll.monthDetail(year, month),
    queryFn: () => payrollApi.getMonthDetail(year, month),
  });
}

// ---------------------------------------------------------------------------
// Admin — trigger (Phase 1)
// ---------------------------------------------------------------------------

export function useTriggerPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      payrollApi.triggerPayroll(year, month),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payroll.all,
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Admin — approve & mark paid (Phase 2)
// ---------------------------------------------------------------------------

export function useApprovePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      payrollApi.approvePayroll(year, month),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payroll.all,
      });
    },
  });
}

export function useMarkPayrollPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      payrollApi.markPayrollPaid(year, month),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payroll.all,
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Admin — adjustments (Phase 3)
// ---------------------------------------------------------------------------

export function usePayrollAdjustments(
  year: number,
  month: number,
  employeeId: number,
) {
  return useQuery({
    queryKey: QUERY_KEYS.payroll.adjustments(year, month, employeeId),
    queryFn: () => payrollApi.getAdjustments(year, month, employeeId),
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AdjustmentFormValues & { year: number; month: number; employeeId: number }) =>
      payrollApi.createAdjustment(values),
    onSuccess: (
      _data,
      { year, month, employeeId }: AdjustmentFormValues & { year: number; month: number; employeeId: number },
    ) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payroll.adjustments(year, month, employeeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payroll.monthDetail(year, month),
      });
    },
  });
}

export function useDeleteAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      adjustmentId,
    }: {
      year: number;
      month: number;
      employeeId: number;
      adjustmentId: number;
    }) => payrollApi.deleteAdjustment(adjustmentId),
    onSettled: (
      _data,
      _error,
      { year, month, employeeId }: { year: number; month: number; employeeId: number; adjustmentId: number },
    ) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payroll.adjustments(year, month, employeeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payroll.monthDetail(year, month),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Employee — payslips (Phase 4)
// ---------------------------------------------------------------------------

export function useMyPayslips() {
  return useQuery({
    queryKey: QUERY_KEYS.payroll.myPayslips(),
    queryFn: () => payrollApi.getMyPayslips(),
  });
}

export function useMyPayslipDetail(year: number, month: number) {
  return useQuery({
    queryKey: QUERY_KEYS.payroll.myPayslipDetail(year, month),
    queryFn: () => payrollApi.getMyPayslipDetail(year, month),
  });
}
