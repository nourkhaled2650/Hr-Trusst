import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatEGP, formatMonthYear } from "../../utils/payroll.utils";
import { useMarkPayrollPaid } from "../../api/payroll.queries";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import type { PayrollEmployeeRow } from "../../types/payroll.types";

interface MonthSummaryBarProps {
  year: number;
  month: number;
  totalNet: number;
  employeeCount: number;
  employees: PayrollEmployeeRow[];
}

export function MonthSummaryBar({
  year,
  month,
  totalNet,
  employeeCount,
  employees,
}: MonthSummaryBarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const markPaidMutation = useMarkPayrollPaid();

  const approvedCount = employees.filter((e) => e.status === "APPROVED").length;
  const draftCount = employees.filter((e) => e.status === "DRAFT").length;
  const allApproved =
    employees.length > 0 && employees.every((e) => e.status === "APPROVED");

  const handleConfirmMarkPaid = () => {
    markPaidMutation.mutate(
      { year, month },
      {
        onSettled: () => {
          void queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.payroll.monthDetail(year, month),
          });
          setDialogOpen(false);
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-foreground font-medium">
            {formatEGP(totalNet)} total net &middot; {employeeCount} employees
          </span>
          {!allApproved && employees.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {approvedCount} APPROVED &middot; {draftCount} DRAFT
            </span>
          )}
          {allApproved && (
            <span className="text-sm text-success">
              All approved — ready to mark as paid
            </span>
          )}
        </div>
        {allApproved && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            Mark Month as Paid
          </Button>
        )}
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Mark {formatMonthYear(year, month)} as paid?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will lock all payslips and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={markPaidMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmMarkPaid}
              disabled={markPaidMutation.isPending}
            >
              {markPaidMutation.isPending ? "Marking…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
