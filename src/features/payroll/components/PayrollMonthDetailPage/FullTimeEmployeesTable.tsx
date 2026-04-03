import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { formatEGP, formatMonthYear } from "../../utils/payroll.utils";
import { useApprovePayroll } from "../../api/payroll.queries";
import { PayrollStatusBadge } from "./PayrollStatusBadge";
import { AdjustmentSheet } from "./AdjustmentSheet";
import type { PayrollEmployeeRow } from "../../types/payroll.types";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function FullTimeTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-48" />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 9 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 9 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

interface FtRowProps {
  row: PayrollEmployeeRow;
  year: number;
  month: number;
  isPaid: boolean;
}

function FtRow({ row, year, month, isPaid }: FtRowProps) {
  const queryClient = useQueryClient();
  const approveMutation = useApprovePayroll();
  const [optimisticApproved, setOptimisticApproved] = useState(false);
  const [adjOpen, setAdjOpen] = useState(false);

  const isApproved = optimisticApproved || row.status === "APPROVED";

  const handleApprove = () => {
    setOptimisticApproved(true);
    approveMutation.mutate(
      { year, month },
      {
        onSettled: () => {
          void queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.payroll.monthDetail(year, month),
          });
        },
        onError: () => {
          setOptimisticApproved(false);
        },
      },
    );
  };

  const deductionsCell =
    row.totalDeductions > 0 ? (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-destructive cursor-default">
              ({formatEGP(row.totalDeductions)})
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Lateness: EGP — · Leave: EGP —</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  const adjNet = row.totalBonuses;
  const adjCell =
    adjNet !== 0 ? (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={
                adjNet > 0
                  ? "text-success cursor-default"
                  : "text-destructive cursor-default"
              }
            >
              {adjNet > 0
                ? `+${formatEGP(adjNet)}`
                : `(${formatEGP(Math.abs(adjNet))})`}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Adjustments: {formatEGP(adjNet)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  return (
    <>
      <TableRow>
        <TableCell>
          <a
            href={`/admin/employees/${row.employeeId}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            {row.employeeName}
          </a>
        </TableCell>
        <TableCell
          className={row.grossSalary === 0 ? "text-muted-foreground" : ""}
        >
          {formatEGP(row.grossSalary)}
        </TableCell>
        <TableCell>
          {row.normalOtPay > 0 ? (
            formatEGP(row.normalOtPay)
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          {row.specialOtPay > 0 ? (
            formatEGP(row.specialOtPay)
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>{deductionsCell}</TableCell>
        <TableCell>{adjCell}</TableCell>
        <TableCell className="font-medium">{formatEGP(row.netSalary)}</TableCell>
        <TableCell>
          <PayrollStatusBadge status={isApproved ? "APPROVED" : row.status} />
        </TableCell>
        <TableCell>
          {!isPaid && (
            <div className="flex items-center gap-2">
              {!isApproved && row.status !== "PAID" ? (
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  Approve
                </Button>
              ) : isApproved ? (
                <span className="text-sm text-success">Approved ✓</span>
              ) : null}
              {row.status !== "PAID" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAdjOpen(true)}
                >
                  + Adjustment
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
      <AdjustmentSheet
        open={adjOpen}
        onOpenChange={setAdjOpen}
        year={year}
        month={month}
        employeeId={row.employeeId}
        employeeName={row.employeeName}
        monthYear={formatMonthYear(year, month)}
        isReadOnly={isPaid}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

interface FullTimeEmployeesTableProps {
  rows: PayrollEmployeeRow[];
  year: number;
  month: number;
  isPaid: boolean;
}

export function FullTimeEmployeesTable({
  rows,
  year,
  month,
  isPaid,
}: FullTimeEmployeesTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Full-Time Employees ({rows.length})
      </p>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Normal OT</TableHead>
              <TableHead>Special OT</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Adj</TableHead>
              <TableHead>Net Payable</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <FtRow
                key={row.employeeId}
                row={row}
                year={year}
                month={month}
                isPaid={isPaid}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
