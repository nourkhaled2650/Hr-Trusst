import { Link } from "@tanstack/react-router";
import { FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPayslips } from "../../api/payroll.queries";
import { formatEGP, formatMonthYear } from "../../utils/payroll.utils";
import type { PayslipSummary } from "../../types/payroll.types";

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function PayslipStatusBadge({ status }: { status: PayslipSummary["status"] }) {
  if (status === "PAID") {
    return (
      <Badge className="bg-success text-success-foreground border-success-border">
        Paid
      </Badge>
    );
  }
  // APPROVED — default (violet/primary)
  return <Badge>Approved</Badge>;
}

// ---------------------------------------------------------------------------
// Loading skeleton rows
// ---------------------------------------------------------------------------

function PayslipSkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-4 border-b border-border last:border-0"
        >
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function PayslipsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <FileText className="h-12 w-12 text-muted-foreground/40" />
      <p className="text-sm font-medium text-foreground">No payslips yet</p>
      <p className="text-xs text-muted-foreground">
        Your payslips will appear here once approved.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Payslip card row
// ---------------------------------------------------------------------------

function PayslipCardRow({ payslip }: { payslip: PayslipSummary }) {
  return (
    <Link
      to="/payslips/$year/$month"
      params={{
        year: String(payslip.year),
        month: String(payslip.month),
      }}
      className="flex items-center justify-between px-4 py-4 border-b border-border last:border-0 hover:bg-accent cursor-pointer"
    >
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-foreground">
          {formatMonthYear(payslip.year, payslip.month)}
        </p>
        <p className="text-xs text-muted-foreground">
          Net Payable: {formatEGP(payslip.netSalary)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <PayslipStatusBadge status={payslip.status} />
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function MyPayslipsPage() {
  const { data, isLoading } = useMyPayslips();

  // Filter to only APPROVED/PAID — backend should never return DRAFT, but guard anyway
  const payslips = (data ?? []).filter(
    (p) => p.status === "APPROVED" || p.status === "PAID",
  );

  return (
    <div className="container py-6 space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">My Payslips</h1>
      </div>

      {/* Card list */}
      <div className="rounded-lg border border-border overflow-hidden">
        {isLoading && <PayslipSkeletonRows />}

        {!isLoading && payslips.length === 0 && <PayslipsEmptyState />}

        {!isLoading &&
          payslips.map((p) => (
            <PayslipCardRow key={`${p.year}-${p.month}`} payslip={p} />
          ))}
      </div>
    </div>
  );
}
