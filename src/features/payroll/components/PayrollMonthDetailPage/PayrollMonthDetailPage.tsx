import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePayrollMonthDetail } from "../../api/payroll.queries";
import { formatMonthYear } from "../../utils/payroll.utils";
import { PayrollStatusBadge } from "./PayrollStatusBadge";
import { MonthSummaryBar } from "./MonthSummaryBar";
import { FullTimeEmployeesTable, FullTimeTableSkeleton } from "./FullTimeEmployeesTable";
import { PartTimeEmployeesTable, PartTimeTableSkeleton } from "./PartTimeEmployeesTable";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PayrollMonthDetailPageProps {
  year: number;
  month: number;
}

// ---------------------------------------------------------------------------
// Skeleton layout
// ---------------------------------------------------------------------------

function PageSkeleton() {
  return (
    <div className="container py-6 space-y-6">
      <FullTimeTableSkeleton />
      <PartTimeTableSkeleton />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

interface PageErrorProps {
  onRetry: () => void;
}

function PageError({ onRetry }: PageErrorProps) {
  return (
    <div className="container py-6 flex flex-col items-center gap-4 mt-16">
      <p className="text-sm text-muted-foreground">
        Failed to load payroll data.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function PayrollMonthDetailPage({
  year,
  month,
}: PayrollMonthDetailPageProps) {
  const { data, isLoading, isError, refetch } = usePayrollMonthDetail(
    year,
    month,
  );

  if (isLoading) return <PageSkeleton />;
  if (isError || !data) return <PageError onRetry={() => void refetch()} />;

  const ftRows = data.employees.filter((e) => e.employmentType === "FULL_TIME");
  const ptRows = data.employees.filter((e) => e.employmentType === "PART_TIME");
  const isPaid = data.status === "PAID";

  return (
    <div className="container py-6 space-y-6">
      {/* Back link */}
      <Link
        to="/admin/payroll"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Payroll
      </Link>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {formatMonthYear(year, month)} Payroll
        </h1>
        <PayrollStatusBadge status={data.status} />
      </div>

      {/* Locked banner */}
      {isPaid && (
        <Alert>
          <AlertDescription>
            This payroll period is locked. No further changes can be made.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary bar */}
      <MonthSummaryBar
        year={year}
        month={month}
        totalNet={data.totalNet}
        employeeCount={data.employeeCount}
        employees={data.employees}
      />

      {/* Full-time section */}
      <FullTimeEmployeesTable
        rows={ftRows}
        year={year}
        month={month}
        isPaid={isPaid}
      />

      {/* Part-time section */}
      <PartTimeEmployeesTable
        rows={ptRows}
        year={year}
        month={month}
        isPaid={isPaid}
      />
    </div>
  );
}
