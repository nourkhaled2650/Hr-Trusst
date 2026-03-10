import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LeaveBalance } from "../types/leave.types";

// ---------------------------------------------------------------------------
// Derive progress bar indicator color from usage ratio
// < 0.5  → success (plenty remaining)
// < 0.8  → warning (getting low)
// >= 0.8 → destructive (almost exhausted)
// ---------------------------------------------------------------------------
function getIndicatorClass(used: number, total: number): string {
  const ratio = total === 0 ? 1 : used / total;
  if (ratio >= 0.8) return "bg-destructive";
  if (ratio >= 0.5) return "bg-warning";
  return "bg-success";
}

type Props = {
  balance: LeaveBalance;
};

export function LeaveBalanceCard({ balance }: Props) {
  const { type, total, used } = balance;
  const remaining = total - used;
  const usagePercent = total === 0 ? 100 : (used / total) * 100;
  const indicatorClass = getIndicatorClass(used, total);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {type}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-foreground">{remaining}</span>
          <span className="text-sm text-muted-foreground">of {total} days</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {used} day{used !== 1 ? "s" : ""} used
        </p>
        <Progress
          value={usagePercent}
          className="mt-3 h-1.5"
          indicatorClassName={indicatorClass}
        />
      </CardContent>
    </Card>
  );
}
