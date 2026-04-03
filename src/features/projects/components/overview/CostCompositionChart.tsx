import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatPercent,
} from "@/lib/utils";

type Props = {
  totalSalaryCost: number;
  totalManualCost: number;
  totalCost: number;
};

// Chart fill colors — no semantic token for violet/amber
const COLORS = {
  salary: "#7c3aed", // violet-700, matches --primary approx
  manual: "#f59e0b", // amber-400
};

type ChartEntry = {
  name: string;
  value: number;
  color: string;
};

export function CostCompositionChart({
  totalSalaryCost,
  totalManualCost,
  totalCost,
}: Props) {
  if (totalCost <= 0) return null;

  const data: ChartEntry[] = [
    { name: "Salary", value: totalSalaryCost, color: COLORS.salary },
  ];
  if (totalManualCost > 0) {
    data.push({ name: "Manual", value: totalManualCost, color: COLORS.manual });
  }

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2 ">
        <CardTitle className="text-sm font-semibold">
          Cost Composition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Donut chart */}
          <div className="relative w-full sm:w-48 h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label — absolute positioned, pointer-events-none */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground">Total Cost</span>
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrencyCompact(totalCost)}
              </span>
            </div>
          </div>

          {/* Legend */}
          {data.length > 1 && (
            <div className="flex flex-col gap-3 justify-center">
              {data.map((entry) => {
                const pct = totalCost > 0 ? (entry.value / totalCost) * 100 : 0;
                return (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name}
                    </span>
                    <span className="text-sm font-medium tabular-nums ml-1">
                      {formatCurrencyCompact(entry.value)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({formatPercent(pct, 0)})
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
