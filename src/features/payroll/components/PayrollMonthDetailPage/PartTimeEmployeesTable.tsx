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
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { formatEGP } from "../../utils/payroll.utils";
import { useApprovePayroll } from "../../api/payroll.queries";
import { PayrollStatusBadge } from "./PayrollStatusBadge";
import type { PayrollEmployeeRow } from "../../types/payroll.types";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function PartTimeTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-48" />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 2 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
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

interface PtRowProps {
  row: PayrollEmployeeRow;
  year: number;
  month: number;
  isPaid: boolean;
}

function PtRow({ row, year, month, isPaid }: PtRowProps) {
  const queryClient = useQueryClient();
  const approveMutation = useApprovePayroll();
  const [optimisticApproved, setOptimisticApproved] = useState(false);

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

  return (
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
      {/* Part-time: basicSalary field reused as hours worked per spec */}
      <TableCell className="text-muted-foreground">—</TableCell>
      {/* Rate — not available from current row shape */}
      <TableCell className="text-muted-foreground">—</TableCell>
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
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

interface PartTimeEmployeesTableProps {
  rows: PayrollEmployeeRow[];
  year: number;
  month: number;
  isPaid: boolean;
}

export function PartTimeEmployeesTable({
  rows,
  year,
  month,
  isPaid,
}: PartTimeEmployeesTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Part-Time Employees ({rows.length})
      </p>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Hours Worked</TableHead>
              <TableHead>Rate (EGP/hr)</TableHead>
              <TableHead>Net Payable</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <PtRow
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
