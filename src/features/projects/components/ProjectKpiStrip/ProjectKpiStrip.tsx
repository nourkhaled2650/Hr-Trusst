import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyCompact } from "@/lib/utils";
import { useProjectKpis } from "../../hooks/use-project-kpis";
// TODO: remove static data once GET /api/admin/projects/kpis is live

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ChipProps = {
  label: string;
  value: ReactNode;
};

function Chip({ label, value }: ChipProps) {
  return (
    <Card className="p-3">
      <p className="text-xs text-muted-foreground font-medium leading-none mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold text-foreground tabular-nums">
        {value}
      </p>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProjectKpiStrip() {
  const { data: kpis, isLoading, isError } = useProjectKpis();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  // KPI failure should not disrupt the table — show dash placeholders silently
  if (isError || !kpis) {
    return (
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        <Chip label="Active Projects" value="—" />
        <Chip label="Budget Allocated" value="—" />
        <Chip label="Total Cost" value="—" />
        <Chip label="Budget Remaining" value="—" />
        <Chip label="At Risk" value="—" />
        <Chip label="Over Budget" value="—" />
        <Chip label="Revenue" value="—" />
        <Chip label="Gross Margin" value="—" />
      </div>
    );
  }

  // Budget Remaining color — no semantic token for positive/negative financial values
  const remainingClass =
    kpis.budgetRemaining == null
      ? undefined
      : kpis.budgetRemaining >= 0
        ? "text-green-600" // exception: no semantic token for positive budget indicator
        : "text-red-600";  // exception: no semantic token for negative budget indicator

  // Gross Margin color — no semantic token for positive/negative margin values
  const marginClass =
    kpis.overallGrossMargin == null
      ? undefined
      : kpis.overallGrossMargin >= 0
        ? "text-green-600" // exception: no semantic token for positive margin indicator
        : "text-red-600";  // exception: no semantic token for negative margin indicator

  const nullDisplay = (
    <span className="text-muted-foreground">N/A</span>
  );

  const remainingValue =
    kpis.budgetRemaining == null ? nullDisplay : (
      <span className={remainingClass}>
        {formatCurrencyCompact(kpis.budgetRemaining)}
      </span>
    );

  const marginValue =
    kpis.overallGrossMargin == null ? nullDisplay : (
      <span className={marginClass}>
        {formatCurrencyCompact(kpis.overallGrossMargin)}
      </span>
    );

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      <Chip
        label="Active Projects"
        value={kpis.activeProjects}
      />
      <Chip
        label="Budget Allocated"
        value={
          kpis.totalBudgetAllocated == null
            ? nullDisplay
            : formatCurrencyCompact(kpis.totalBudgetAllocated)
        }
      />
      <Chip
        label="Total Cost"
        value={formatCurrencyCompact(kpis.totalCostIncurred)}
      />
      <Chip
        label="Budget Remaining"
        value={remainingValue}
      />
      <Chip
        label="At Risk"
        value={
          kpis.projectsAtRisk > 0 ? (
            // exception: no semantic token for "at risk" warning color
            <span className="text-amber-600">{kpis.projectsAtRisk}</span>
          ) : (
            kpis.projectsAtRisk
          )
        }
      />
      <Chip
        label="Over Budget"
        value={
          kpis.projectsOverBudget > 0 ? (
            // exception: no semantic token for "over budget" danger color
            <span className="text-red-600">{kpis.projectsOverBudget}</span>
          ) : (
            kpis.projectsOverBudget
          )
        }
      />
      <Chip
        label="Revenue"
        value={
          kpis.totalRevenueRecognized == null
            ? nullDisplay
            : formatCurrencyCompact(kpis.totalRevenueRecognized)
        }
      />
      <Chip
        label="Gross Margin"
        value={marginValue}
      />
    </div>
  );
}
