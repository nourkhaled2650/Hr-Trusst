import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { HealthStatus } from "../../types/projects.types";

type Props = {
  totalCost: number;
  budget: number | null;
  budgetUtilizationPct: number | null;
  healthStatus: HealthStatus;
  grossMargin: number | null;
  actualRevenue: number | null;
  onSwitchToSettings: () => void;
};

function SettingsLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-primary underline cursor-pointer"
    >
      Set in Settings →
    </button>
  );
}

function progressColorClass(status: HealthStatus): string {
  /* health status colors — no semantic token */
  if (status === "ON_TRACK") return "[&>div]:bg-green-500";
  if (status === "AT_RISK")  return "[&>div]:bg-amber-500";
  if (status === "OVER_BUDGET") return "[&>div]:bg-red-500";
  return "";
}

export function KeyMetricsRow({
  totalCost,
  budget,
  budgetUtilizationPct,
  healthStatus,
  grossMargin,
  actualRevenue,
  onSwitchToSettings,
}: Props) {
  const isGrossMarginPositive = grossMargin !== null && grossMargin >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Card 1 — Total Cost */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(totalCost)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Salary + Manual</p>
        </CardContent>
      </Card>

      {/* Card 2 — Budget */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budget !== null ? (
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(budget)}
            </p>
          ) : (
            <>
              <span className="text-muted-foreground text-base font-medium">
                No budget set
              </span>
              <div className="mt-1">
                <SettingsLink onClick={onSwitchToSettings} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Card 3 — Budget Used % */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Budget Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">
            {budgetUtilizationPct !== null ? formatPercent(budgetUtilizationPct) : "N/A"}
          </p>
          {budgetUtilizationPct !== null && (
            <Progress
              value={budgetUtilizationPct}
              className={cn("h-2 mt-2", progressColorClass(healthStatus))}
            />
          )}
        </CardContent>
      </Card>

      {/* Card 4 — Gross Margin */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Gross Margin
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grossMargin !== null ? (
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                /* positive/negative value colors — no semantic token */
                isGrossMarginPositive ? "text-green-700" : "text-red-600",
              )}
            >
              {formatCurrency(grossMargin)}
            </p>
          ) : (
            <>
              <span className="text-muted-foreground text-sm">
                {actualRevenue === null ? "Revenue not yet set" : "—"}
              </span>
              {actualRevenue === null && (
                <div className="mt-1">
                  <SettingsLink onClick={onSwitchToSettings} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
