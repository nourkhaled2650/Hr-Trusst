import { CheckCircle2, AlertTriangle, XCircle, Info, TrendingDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { HealthStatus } from "../../types/projects.types";

type Props = {
  status: HealthStatus;
  marginPct: number | null;
};

type VariantConfig = {
  className: string;
  Icon: React.ElementType;
  message: (marginPct: number | null) => string;
};

const HEALTH_CONFIGS: Record<HealthStatus, VariantConfig> = {
  ON_TRACK: {
    /* health status colors — no semantic token */
    className: "border-green-200 bg-green-50 text-green-800",
    Icon: CheckCircle2,
    message: () => "This project is on track.",
  },
  AT_RISK: {
    /* health status colors — no semantic token */
    className: "border-amber-200 bg-amber-50 text-amber-800",
    Icon: AlertTriangle,
    message: () => "This project is approaching its budget limit.",
  },
  OVER_BUDGET: {
    /* health status colors — no semantic token */
    className: "border-red-200 bg-red-50 text-red-800",
    Icon: XCircle,
    message: () => "This project has exceeded its budget.",
  },
  NO_BUDGET: {
    /* health status colors — no semantic token */
    className: "border-border bg-muted text-muted-foreground",
    Icon: Info,
    message: () =>
      "No budget has been set. Set a budget in Settings to enable health tracking.",
  },
  COMPLETED_PROFITABLE: {
    /* health status colors — no semantic token */
    className: "border-green-200 bg-green-50 text-green-800",
    Icon: CheckCircle2,
    message: (pct) => `Project completed. Margin: +${pct ?? 0}%`,
  },
  COMPLETED_AT_LOSS: {
    /* health status colors — no semantic token */
    className: "border-red-200 bg-red-50 text-red-800",
    Icon: TrendingDown,
    message: (pct) =>
      `Project completed at a loss. Margin: −${Math.abs(pct ?? 0)}%`,
  },
  COMPLETED_NEUTRAL: {
    /* health status colors — no semantic token */
    className: "border-border bg-muted text-muted-foreground",
    Icon: CheckCircle2,
    message: () => "Project completed. No revenue data available.",
  },
};

export function HealthBanner({ status, marginPct }: Props) {
  const config = HEALTH_CONFIGS[status];
  const { Icon, className, message } = config;

  return (
    <Alert className={className}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="text-current">
        {message(marginPct)}
      </AlertDescription>
    </Alert>
  );
}
