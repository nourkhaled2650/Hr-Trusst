import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayrollAdjustments, useDeleteAdjustment } from "../../api/payroll.queries";
import { formatEGP } from "../../utils/payroll.utils";
import type { PayrollAdjustment } from "../../types/payroll.types";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function AdjustmentListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single card
// ---------------------------------------------------------------------------

interface AdjustmentCardProps {
  adj: PayrollAdjustment;
  year: number;
  month: number;
  employeeId: number;
  isReadOnly: boolean;
}

function AdjustmentCard({ adj, year, month, employeeId, isReadOnly }: AdjustmentCardProps) {
  const deleteMutation = useDeleteAdjustment();

  const isDeduction = adj.type === "DEDUCTION";
  const amountDisplay = isDeduction
    ? `(${formatEGP(adj.amount)})`
    : `+${formatEGP(adj.amount)}`;

  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={isDeduction ? "destructive" : "success"}>
            {adj.type}
          </Badge>
          <span className="font-medium text-sm text-foreground">{adj.label}</span>
          <span
            className={`ml-auto text-sm font-medium tabular-nums ${
              isDeduction ? "text-destructive" : "text-success"
            }`}
          >
            {amountDisplay}
          </span>
        </div>
        {adj.note && (
          <p className="text-xs text-muted-foreground italic">{adj.note}</p>
        )}
      </div>
      {!isReadOnly && (
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive hover:text-destructive shrink-0"
          disabled={deleteMutation.isPending}
          onClick={() =>
            deleteMutation.mutate({ year, month, employeeId, adjustmentId: adj.adjustmentId })
          }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Net impact line
// ---------------------------------------------------------------------------

interface NetImpactProps {
  adjustments: PayrollAdjustment[];
}

function NetImpact({ adjustments }: NetImpactProps) {
  const net = adjustments.reduce(
    (sum, a) => sum + (a.type === "ADDITION" ? a.amount : -a.amount),
    0,
  );

  const colorClass =
    net > 0 ? "text-success" : net < 0 ? "text-destructive" : "text-muted-foreground";
  const label =
    net >= 0 ? `+${formatEGP(net)}` : `(${formatEGP(Math.abs(net))})`;

  return (
    <p className={`text-sm font-medium ${colorClass}`}>
      Net impact: {label}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface AdjustmentListProps {
  year: number;
  month: number;
  employeeId: number;
  isReadOnly: boolean;
}

export function AdjustmentList({ year, month, employeeId, isReadOnly }: AdjustmentListProps) {
  const { data, isLoading } = usePayrollAdjustments(year, month, employeeId);

  if (isLoading) return <AdjustmentListSkeleton />;

  const adjustments = data ?? [];

  if (adjustments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No adjustments yet. Add one below.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {adjustments.map((adj, idx) => (
        <div key={adj.adjustmentId}>
          {idx > 0 && <Separator />}
          <AdjustmentCard
            adj={adj}
            year={year}
            month={month}
            employeeId={employeeId}
            isReadOnly={isReadOnly}
          />
        </div>
      ))}
      <Separator className="mt-1" />
      <div className="pt-2">
        <NetImpact adjustments={adjustments} />
      </div>
    </div>
  );
}
