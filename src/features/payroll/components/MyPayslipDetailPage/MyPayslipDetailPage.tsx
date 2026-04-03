import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { PayslipHeader } from "./PayslipHeader";
import { FullTimePayslipBody } from "./FullTimePayslipBody";
import { PartTimePayslipBody } from "./PartTimePayslipBody";
import { useMyPayslipDetail } from "../../api/payroll.queries";
import type { PayslipDetail } from "../../types/payroll.types";

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function PayslipDetailSkeleton() {
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function PayslipDetailError() {
  return (
    <div className="container py-16 flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-muted-foreground">
        Could not load payslip. Please try again.
      </p>
      <Link
        to="/payslips/"
        className="text-sm text-primary hover:underline"
      >
        ← Back to My Payslips
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Body router — dispatches to FT or PT layout
// ---------------------------------------------------------------------------

function PayslipBody({ payslip }: { payslip: PayslipDetail }) {
  if (payslip.employmentType === "PART_TIME") {
    return (
      <PartTimePayslipBody
        payslip={payslip as PayslipDetail & { employmentType: "PART_TIME" }}
      />
    );
  }
  return (
    <FullTimePayslipBody
      payslip={payslip as PayslipDetail & { employmentType: "FULL_TIME" }}
    />
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface MyPayslipDetailPageProps {
  year: number;
  month: number;
}

export function MyPayslipDetailPage({ year, month }: MyPayslipDetailPageProps) {
  const { data, isLoading, isError } = useMyPayslipDetail(year, month);

  if (isLoading) return <PayslipDetailSkeleton />;
  if (isError || data == null) return <PayslipDetailError />;

  return (
    <div className="container py-6 space-y-6">
      <PayslipHeader
        year={year}
        month={month}
        status={data.status}
        employeeName={data.employeeName}
        employmentType={data.employmentType}
      />
      <PayslipBody payslip={data} />
    </div>
  );
}
