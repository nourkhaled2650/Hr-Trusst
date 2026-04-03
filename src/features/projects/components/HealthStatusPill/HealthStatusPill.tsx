import type { HealthStatus } from "../../types/projects.types";
import { cn } from "@/lib/utils";

type Props = { status: HealthStatus };

// Health status pill — raw color classes used because no semantic token maps to health states
const PILL_CONFIG: Record<HealthStatus, { dot: string; label: string; text: string }> = {
  ON_TRACK:             { dot: "bg-green-500",   label: "On Track",    text: "text-green-700"          },
  AT_RISK:              { dot: "bg-amber-500",   label: "At Risk",     text: "text-amber-700"          },
  OVER_BUDGET:          { dot: "bg-red-500",     label: "Over Budget", text: "text-red-700"            },
  NO_BUDGET:            { dot: "bg-neutral-400", label: "No Budget",   text: "text-muted-foreground"   },
  COMPLETED_PROFITABLE: { dot: "bg-green-500",   label: "Profitable",  text: "text-green-700"          },
  COMPLETED_AT_LOSS:    { dot: "bg-red-500",     label: "At Loss",     text: "text-red-700"            },
  COMPLETED_NEUTRAL:    { dot: "bg-neutral-400", label: "Completed",   text: "text-muted-foreground"   },
};

export function HealthStatusPill({ status }: Props) {
  const { dot, label, text } = PILL_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", text)}>
      <span className={cn("h-2 w-2 rounded-full shrink-0", dot)} aria-hidden="true" />
      {label}
    </span>
  );
}
