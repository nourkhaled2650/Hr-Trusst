import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectStatus } from "../../types/projects.types";

type Props = {
  budget: number | null;
  totalCost: number;
  budgetVariance: number | null;
  projectedFinalCost: number | null;
  projectedVariance: number | null;
  revenueTarget: number | null;
  actualRevenue: number | null;
  grossMargin: number | null;
  marginPct: number | null;
  projectStatus: ProjectStatus;
  onSwitchToSettings: () => void;
};

function BudgetRow({ label, value, colored = false, italic = false }: {
  label: string;
  value: string | null;
  colored?: boolean;
  italic?: boolean;
}) {
  const numVal = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, "")) : null;
  const isPositive = numVal !== null && numVal >= 0;

  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
      <span className={cn("text-muted-foreground", italic && "italic")}>{label}</span>
      <span
        className={cn(
          "font-medium tabular-nums",
          italic && "italic",
          colored && value !== "—" && (
            /* positive/negative value colors — no semantic token */
            isPositive ? "text-green-700" : "text-red-600"
          ),
        )}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

export function BudgetRevenueCards({
  budget,
  totalCost,
  budgetVariance,
  projectedFinalCost,
  projectedVariance,
  revenueTarget,
  actualRevenue,
  grossMargin,
  marginPct,
  projectStatus,
  onSwitchToSettings,
}: Props) {
  const show = budget !== null || revenueTarget !== null || actualRevenue !== null;
  if (!show) return null;

  const showProjected = projectStatus === "ACTIVE" && projectedFinalCost !== null;

  const handleAddRevenue = () => {
    onSwitchToSettings();
    setTimeout(() => {
      document.getElementById("actualRevenue")?.focus();
    }, 100);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Budget Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Budget Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetRow label="Budget target"   value={budget !== null ? formatCurrency(budget) : "—"} />
          <BudgetRow label="Cost to date"    value={formatCurrency(totalCost)} />
          <BudgetRow
            label="Variance"
            value={budgetVariance !== null ? formatCurrency(budgetVariance) : "—"}
            colored
          />
          {showProjected && (
            <>
              <BudgetRow
                label="Projected final cost"
                value={projectedFinalCost !== null ? formatCurrency(projectedFinalCost) : "—"}
                italic
              />
              <BudgetRow
                label="Projected variance"
                value={projectedVariance !== null ? formatCurrency(projectedVariance) : "—"}
                colored
                italic
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetRow
            label="Revenue target"
            value={revenueTarget !== null ? formatCurrency(revenueTarget) : "—"}
          />
          <div className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
            <span className="text-muted-foreground">Actual revenue</span>
            {actualRevenue !== null ? (
              <span className="font-medium tabular-nums">{formatCurrency(actualRevenue)}</span>
            ) : (
              <span className="text-muted-foreground italic">Not yet recorded</span>
            )}
          </div>
          <BudgetRow
            label="Gross margin"
            value={grossMargin !== null ? formatCurrency(grossMargin) : "—"}
            colored
          />
          <BudgetRow
            label="Margin %"
            value={marginPct !== null ? formatPercent(marginPct) : "—"}
          />
          {actualRevenue === null && (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={handleAddRevenue}>
                Add Revenue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
