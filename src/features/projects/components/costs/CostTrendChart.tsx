import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyCompact, enrichTrendWeeks } from "@/lib/utils";
import { useProjectTrend } from "../../hooks/use-project-trend";
import { CostTrendTooltip } from "./CostTrendTooltip";
import type { Project } from "../../types/projects.types";

type Props = {
  projectId: string;
  project: Project;
};

export function CostTrendChart({ projectId, project }: Props) {
  const { data: rawWeeks, isLoading } = useProjectTrend(projectId);

  const weeks = rawWeeks ? enrichTrendWeeks(rawWeeks) : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Cost Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-md" />
        ) : weeks.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            No trend data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={256}>
            <ComposedChart data={weeks} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                tickFormatter={formatCurrencyCompact}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={formatCurrencyCompact}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CostTrendTooltip />} />
              <Legend iconType="circle" iconSize={8} />

              {/* Chart fill colors — no semantic token */}
              <Bar stackId="cost" dataKey="salaryCost" name="Salary" fill="#7c3aed" yAxisId="left" />
              <Bar stackId="cost" dataKey="manualCost" name="Manual" fill="#f59e0b" yAxisId="left" radius={[3, 3, 0, 0]} />
              {/* Chart line color — no semantic token */}
              <Line
                dataKey="cumulativeCost"
                name="Cumulative"
                stroke="#525252"
                strokeWidth={2}
                dot={false}
                yAxisId="right"
              />

              {/* Budget reference line — no semantic token */}
              {project.budget !== null && (
                <ReferenceLine
                  y={project.budget}
                  yAxisId="right"
                  stroke="#f87171"
                  strokeDasharray="6 3"
                  label={{ value: "Budget", fill: "#f87171", fontSize: 11 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
