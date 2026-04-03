import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  dailyBurnRate: number | null;
  weeklyBurnRateRolling: number | null;
  weeklyBurnRateAverage: number | null;
  activeDays: number;
};

export function BurnRateCards({
  dailyBurnRate,
  weeklyBurnRateRolling,
  weeklyBurnRateAverage,
  activeDays,
}: Props) {
  const dayLabel = `Based on ${activeDays} active day${activeDays === 1 ? "" : "s"}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Daily Burn Rate */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Daily Burn Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">
            {dailyBurnRate !== null
              ? `${formatCurrency(dailyBurnRate)} / day`
              : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{dayLabel}</p>
        </CardContent>
      </Card>

      {/* Weekly Burn Rate */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weekly Burn Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rolling 7 days</p>
              <p className="text-lg font-semibold tabular-nums">
                {weeklyBurnRateRolling !== null
                  ? formatCurrency(weeklyBurnRateRolling)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Project average</p>
              <p className="text-lg font-semibold tabular-nums">
                {weeklyBurnRateAverage !== null
                  ? formatCurrency(weeklyBurnRateAverage)
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
