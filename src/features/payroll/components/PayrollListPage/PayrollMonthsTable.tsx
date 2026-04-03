import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEGP, formatMonthYear } from "../../utils/payroll.utils";
import { useTriggerPayroll } from "../../api/payroll.queries";
import type { PayrollMonth, PayrollStatus } from "../../types/payroll.types";

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const STATUS_VARIANT: Record<
  PayrollStatus,
  "secondary" | "warning" | "default" | "success"
> = {
  PENDING: "secondary",
  DRAFT: "warning",
  APPROVED: "default",
  PAID: "success",
};

function StatusBadge({ status }: { status: PayrollStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}

// ---------------------------------------------------------------------------
// Skeleton rows
// ---------------------------------------------------------------------------

export function PayrollMonthsTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead>Employees</TableHead>
            <TableHead>Net Payroll</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-10" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
      <FileText className="h-10 w-10" />
      <p className="text-sm">No payroll runs yet</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trigger confirm dialog
// ---------------------------------------------------------------------------

interface TriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  month: number;
  onConfirm: () => void;
  isPending: boolean;
}

function TriggerConfirmDialog({
  open,
  onOpenChange,
  year,
  month,
  onConfirm,
  isPending,
}: TriggerDialogProps) {
  const label = formatMonthYear(year, month);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Trigger Payroll Run</AlertDialogTitle>
          <AlertDialogDescription>
            This will generate payslip data for all active employees for{" "}
            {label}. You can review and adjust each employee before approving.
            Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? "Triggering…" : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------------------------------------------------------------------------
// Main table
// ---------------------------------------------------------------------------

interface PayrollMonthsTableProps {
  months: PayrollMonth[];
  isLoading: boolean;
}

export function PayrollMonthsTable({
  months,
  isLoading,
}: PayrollMonthsTableProps) {
  const router = useRouter();
  const triggerMutation = useTriggerPayroll();

  const [triggerTarget, setTriggerTarget] = useState<{
    year: number;
    month: number;
  } | null>(null);

  if (isLoading) return <PayrollMonthsTableSkeleton />;

  const sorted = [...months].sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month,
  );

  const handleTriggerConfirm = () => {
    if (!triggerTarget) return;
    triggerMutation.mutate(triggerTarget, {
      onSuccess: () => {
        toast.success("Payroll run triggered successfully.");
        setTriggerTarget(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to trigger payroll.");
        setTriggerTarget(null);
      },
    });
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Net Payroll</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => (
                <TableRow key={`${row.year}-${row.month}`}>
                  <TableCell className="font-medium">
                    {formatMonthYear(row.year, row.month)}
                  </TableCell>
                  <TableCell>{row.employeeCount ?? "—"}</TableCell>
                  <TableCell>
                    {row.totalNetPayroll != null
                      ? formatEGP(row.totalNetPayroll)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {row.status === "PENDING" ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          setTriggerTarget({ year: row.year, month: row.month })
                        }
                      >
                        Trigger Now
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void router.navigate({
                            to: "/admin/payroll/$year/$month",
                            params: {
                              year: String(row.year),
                              month: String(row.month),
                            },
                          })
                        }
                      >
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {triggerTarget && (
        <TriggerConfirmDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setTriggerTarget(null);
          }}
          year={triggerTarget.year}
          month={triggerTarget.month}
          onConfirm={handleTriggerConfirm}
          isPending={triggerMutation.isPending}
        />
      )}
    </>
  );
}
