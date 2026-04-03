import { Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "../../utils/payroll.utils";
import type { PayslipDetail } from "../../types/payroll.types";

interface PayslipHeaderProps {
  year: number;
  month: number;
  status: PayslipDetail["status"];
  employeeName: string;
  employmentType: PayslipDetail["employmentType"];
}

function StatusBadge({ status }: { status: PayslipDetail["status"] }) {
  if (status === "PAID") {
    return (
      <Badge className="bg-success text-success-foreground border-success-border">
        PAID
      </Badge>
    );
  }
  // APPROVED — default (violet/primary)
  return <Badge>APPROVED</Badge>;
}

export function PayslipHeader({
  year,
  month,
  status,
  employeeName,
  employmentType,
}: PayslipHeaderProps) {
  const typeLabel = employmentType === "FULL_TIME" ? "Full-time" : "Part-time";

  return (
    <div className="space-y-3">
      {/* Back link */}
      <Link
        to="/payslips/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        My Payslips
      </Link>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">
              {formatMonthYear(year, month)} Payslip
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {employeeName} · {typeLabel}
          </p>
        </div>

        {/* Download button — calls window.print() until PDF endpoint is ready */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="shrink-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
