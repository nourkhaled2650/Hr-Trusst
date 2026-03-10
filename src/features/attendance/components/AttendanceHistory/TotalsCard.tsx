import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { formatHoursDisplay } from "../../utils/attendance.utils";

type Props = {
  totalWorkingHours: number;
  allocatedHours: number;
  isLoading?: boolean;
};

// ---------------------------------------------------------------------------
// TotalsCard
//
// Displays the total/allocated/remaining hours summary on the Log Working Day
// page. Updates reactively as rows are added/edited/deleted.
//
// Color semantics (from design spec):
//   remaining === 0 → success (perfectly allocated)
//   remaining > 0  → warning (under-allocated)
//   remaining < 0  → destructive (over-allocated)
//
// Note: design spec uses text-green-600 and text-amber-600 which are color
// scale utilities. Per the color system rules, we use semantic tokens where
// available: text-success-foreground and text-warning-foreground. The progress
// bar background classes bg-success and bg-warning are used for the bar fill.
// ---------------------------------------------------------------------------
export function TotalsCard({ totalWorkingHours, allocatedHours, isLoading = false }: Props) {
  const remaining = totalWorkingHours - allocatedHours;
  const progressPercent =
    totalWorkingHours > 0
      ? Math.min(100, (allocatedHours / totalWorkingHours) * 100)
      : 0;

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="h-16 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Total */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total working hours
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {formatHoursDisplay(totalWorkingHours)}
            </p>
          </div>

          {/* Allocated */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Allocated
            </p>
            <p className="text-xl font-semibold tabular-nums">
              {formatHoursDisplay(allocatedHours)}
            </p>
          </div>

          {/* Remaining — color-coded */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Remaining
            </p>
            <p
              className={cn(
                "text-xl font-semibold tabular-nums",
                remaining === 0 && "text-success-foreground",
                remaining > 0 && "text-warning-foreground",
                remaining < 0 && "text-destructive",
              )}
            >
              {remaining === 0
                ? "0h 00m"
                : `${formatHoursDisplay(Math.abs(remaining))}${remaining < 0 ? " over" : ""}`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              remaining === 0 && "bg-success",
              remaining > 0 && "bg-warning",
              remaining < 0 && "bg-destructive",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
