import { TrendingUp } from "lucide-react";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  overtimeDelta: number;
  normalOtExtra: number;
  specialOtExtra: number;
  overtimePctOfSalaryCost: number | null;
};

export function OvertimeCallout({
  overtimeDelta,
  normalOtExtra,
  specialOtExtra,
  overtimePctOfSalaryCost,
}: Props) {
  if (overtimeDelta <= 0) return null;

  const isHighImpact =
    overtimePctOfSalaryCost !== null && overtimePctOfSalaryCost > 10;

  return (
    <Card
      className={cn(
        "border-l-4 flex-1",
        /* overtime impact colors — no semantic token */
        isHighImpact
          ? "border-l-amber-400 bg-amber-50"
          : "border-l-border bg-card",
      )}
    >
      <CardContent className="pt-4 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <TrendingUp
            className={cn(
              "h-4 w-4",
              /* overtime impact icon color — no semantic token */
              isHighImpact ? "text-amber-600" : "text-muted-foreground",
            )}
          />
          <span className="text-sm font-semibold">Overtime Impact</span>
          {/* NEVER omit the Estimated badge */}
          <Badge className="text-xs bg-muted text-muted-foreground">
            Estimated
          </Badge>
        </div>

        {/* Body */}
        <div className="text-sm space-y-1">
          <p>Estimated overtime extra: {formatCurrency(overtimeDelta)}</p>
          <p>Normal overtime extra: {formatCurrency(normalOtExtra)}</p>
          <p>Special overtime extra: {formatCurrency(specialOtExtra)}</p>
          {overtimePctOfSalaryCost !== null && (
            <p
              className={cn(
                /* overtime percentage color — no semantic token */
                isHighImpact ? "text-amber-700 font-medium" : "",
              )}
            >
              Overtime accounts for {formatPercent(overtimePctOfSalaryCost)} of
              salary costs on this project.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
