import { formatCurrency } from "@/lib/utils";

// Recharts passes these props to custom tooltip
type TooltipProps = {
  active?: boolean;
  payload?: Array<{ name: string; value: number; dataKey: string }>;
  label?: string;
};

export function CostTrendTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const salary     = payload.find((p) => p.dataKey === "salaryCost")?.value ?? 0;
  const manual     = payload.find((p) => p.dataKey === "manualCost")?.value ?? 0;
  const cumulative = payload.find((p) => p.dataKey === "cumulativeCost")?.value ?? 0;
  const total      = salary + manual;

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-md text-sm">
      <p className="font-medium mb-2">{label ? `Week of ${label}` : "—"}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">Salary:</span>
          <span className="tabular-nums font-medium">{formatCurrency(salary)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">Manual:</span>
          <span className="tabular-nums font-medium">{formatCurrency(manual)}</span>
        </div>
        <div className="flex justify-between gap-6 border-t border-border pt-1 mt-1">
          <span className="text-muted-foreground">Total:</span>
          <span className="tabular-nums font-semibold">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">Cumulative:</span>
          <span className="tabular-nums font-medium">{formatCurrency(cumulative)}</span>
        </div>
      </div>
    </div>
  );
}
