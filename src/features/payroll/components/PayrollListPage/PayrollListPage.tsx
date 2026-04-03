import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayrollMonths, usePayrollMonthSummary } from "../../api/payroll.queries";
import { formatMonthYear, prevMonth, nextMonth } from "../../utils/payroll.utils";
import { PayrollKpiStrip } from "./PayrollKpiStrip";
import { PayrollMonthsTable } from "./PayrollMonthsTable";

// ---------------------------------------------------------------------------
// Month selector — controls KPI strip only
// ---------------------------------------------------------------------------

interface MonthSelectorProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

function MonthSelector({ year, month, onPrev, onNext }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={onPrev} aria-label="Previous month">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium text-foreground min-w-[112px] text-center">
        {formatMonthYear(year, month)}
      </span>
      <Button variant="ghost" size="icon" onClick={onNext} aria-label="Next month">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function PayrollListPage() {
  const today = new Date();
  const [kpiYear, setKpiYear] = useState(today.getFullYear());
  const [kpiMonth, setKpiMonth] = useState(today.getMonth() + 1);

  const { data: months = [], isLoading: monthsLoading } = usePayrollMonths();

  const {
    data: summary,
    isLoading: summaryLoading,
  } = usePayrollMonthSummary(kpiYear, kpiMonth);

  const handlePrev = () => {
    const p = prevMonth(kpiYear, kpiMonth);
    setKpiYear(p.year);
    setKpiMonth(p.month);
  };

  const handleNext = () => {
    const n = nextMonth(kpiYear, kpiMonth);
    setKpiYear(n.year);
    setKpiMonth(n.month);
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Payroll</h1>
      </div>

      {/* Month selector + KPI strip */}
      <div className="space-y-3">
        <MonthSelector
          year={kpiYear}
          month={kpiMonth}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <PayrollKpiStrip summary={summary} isLoading={summaryLoading} />
      </div>

      {/* Months table */}
      <PayrollMonthsTable months={months} isLoading={monthsLoading} />
    </div>
  );
}
