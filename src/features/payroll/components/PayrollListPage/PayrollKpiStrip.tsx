import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatEGP } from "../../utils/payroll.utils";
import type { PayrollMonthSummary, PayrollStatus } from "../../types/payroll.types";

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
// Single KPI card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: string;
}

function KpiCard({ label, value }: KpiCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton strip
// ---------------------------------------------------------------------------

export function PayrollKpiStripSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main strip
// ---------------------------------------------------------------------------

interface PayrollKpiStripProps {
  summary: PayrollMonthSummary | undefined;
  isLoading: boolean;
}

export function PayrollKpiStrip({ summary, isLoading }: PayrollKpiStripProps) {
  if (isLoading) return <PayrollKpiStripSkeleton />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KpiCard
        label="Total Net Payroll"
        value={summary?.totalNetPayroll != null ? formatEGP(summary.totalNetPayroll) : "—"}
      />
      <KpiCard
        label="Total Gross Payroll"
        value={summary?.totalGrossPayroll != null ? formatEGP(summary.totalGrossPayroll) : "—"}
      />
      <KpiCard
        label="Total Paid"
        value={summary?.totalPaid != null ? formatEGP(summary.totalPaid) : "—"}
      />
      <KpiCard
        label="Employees on Payroll"
        value={summary?.employeeCount != null ? String(summary.employeeCount) : "0"}
      />
      <KpiCard
        label="Average Net Salary"
        value={summary?.averageNetSalary != null ? formatEGP(summary.averageNetSalary) : "—"}
      />
      <KpiCard
        label="Total Normal OT Pay"
        value={summary?.totalNormalOtPay != null ? formatEGP(summary.totalNormalOtPay) : "EGP 0"}
      />
      <KpiCard
        label="Total Special OT Pay"
        value={summary?.totalSpecialOtPay != null ? formatEGP(summary.totalSpecialOtPay) : "EGP 0"}
      />
      <div className="rounded-lg border bg-card p-4 flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">Month Status</p>
        <div className="flex items-center h-7">
          {summary?.status != null ? (
            <StatusBadge status={summary.status} />
          ) : (
            <span className="text-lg font-semibold text-foreground">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
