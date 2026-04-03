import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Info } from "lucide-react";
import type { Project, ProjectCostSummary } from "../../types/projects.types";
import { HealthBanner } from "./HealthBanner";
import { KeyMetricsRow } from "./KeyMetricsRow";
import { BudgetRevenueCards } from "./BudgetRevenueCards";
import { BurnRateCards } from "./BurnRateCards";
import { CostCompositionChart } from "./CostCompositionChart";
import { OvertimeCallout } from "./OvertimeCallout";
import { TimelineBar } from "./TimelineBar";

type Props = {
  costSummary: ProjectCostSummary | null | undefined;
  isLoading: boolean;
  isError: boolean;
  project: Project;
  onSwitchToSettings: () => void;
};

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
      <Skeleton className="h-56 w-full rounded-lg" />
    </div>
  );
}

function OverviewError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Failed to load project health data.</span>
        <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function OverviewEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Info className="h-10 w-10 mb-3 text-muted-foreground opacity-40" />
      <p className="text-sm font-medium text-muted-foreground">
        Project health data is not yet available.
      </p>
      <p className="text-xs text-muted-foreground mt-1 opacity-70">
        The cost tracking backend is under development.
      </p>
    </div>
  );
}

export function OverviewTab({
  costSummary,
  isLoading,
  isError,
  project,
  onSwitchToSettings,
}: Props) {
  if (isLoading) return <OverviewSkeleton />;
  if (isError)
    return <OverviewError onRetry={() => window.location.reload()} />;
  if (!costSummary) return <OverviewEmpty />;

  const {
    healthStatus,
    marginPct,
    totalCost,
    budget,
    budgetUtilizationPct,
    grossMargin,
    actualRevenue,
    budgetVariance,
    projectedFinalCost,
    projectedVariance,
    revenueTarget,
    totalSalaryCost,
    totalManualCost,
    dailyBurnRate,
    weeklyBurnRateRolling,
    weeklyBurnRateAverage,
    activeDays,
    overtimeDelta,
    normalOtExtra,
    specialOtExtra,
    overtimePctOfSalaryCost,
  } = costSummary;

  return (
    <div>
      {/* A. Health Banner */}
      <HealthBanner status={healthStatus} marginPct={marginPct} />

      {/* B. Key Metrics Row */}
      <div className="mt-6">
        <KeyMetricsRow
          totalCost={totalCost}
          budget={budget}
          budgetUtilizationPct={budgetUtilizationPct}
          healthStatus={healthStatus}
          grossMargin={grossMargin}
          actualRevenue={actualRevenue}
          onSwitchToSettings={onSwitchToSettings}
        />
      </div>

      {/* C. Budget + Revenue Cards (conditional) */}
      <div className="mt-6">
        <BudgetRevenueCards
          budget={budget}
          totalCost={totalCost}
          budgetVariance={budgetVariance}
          projectedFinalCost={projectedFinalCost}
          projectedVariance={projectedVariance}
          revenueTarget={revenueTarget}
          actualRevenue={actualRevenue}
          grossMargin={grossMargin}
          marginPct={marginPct}
          projectStatus={project.status}
          onSwitchToSettings={onSwitchToSettings}
        />
      </div>

      {/* D. Burn Rate Cards */}
      <div className="mt-6">
        <BurnRateCards
          dailyBurnRate={dailyBurnRate}
          weeklyBurnRateRolling={weeklyBurnRateRolling}
          weeklyBurnRateAverage={weeklyBurnRateAverage}
          activeDays={activeDays}
        />
      </div>
      <div className="flex justify-between gap-6 mt-6">
        {/* E. Cost Composition Chart (conditional on totalCost > 0) */}
        {totalCost > 0 && (
          <CostCompositionChart
            totalSalaryCost={totalSalaryCost}
            totalManualCost={totalManualCost}
            totalCost={totalCost}
          />
        )}

        {/* F. Overtime Callout (conditional on overtimeDelta > 0) */}
        {overtimeDelta > 0 && (
          <OvertimeCallout
            overtimeDelta={overtimeDelta}
            normalOtExtra={normalOtExtra}
            specialOtExtra={specialOtExtra}
            overtimePctOfSalaryCost={overtimePctOfSalaryCost}
          />
        )}
      </div>

      {/* G. Timeline Bar (conditional on project.startDate) */}
      {project.startDate && (
        <div className="mt-6">
          <TimelineBar
            startDate={project.startDate}
            endDate={project.endDate}
            projectStatus={project.status}
          />
        </div>
      )}
    </div>
  );
}
