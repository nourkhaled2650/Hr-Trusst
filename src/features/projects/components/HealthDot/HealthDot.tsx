import type { HealthStatus } from "../../types/projects.types";
import { cn } from "@/lib/utils";

type Props = { status: HealthStatus | null | undefined };

// Health dot colors — no semantic token exists for these health status colors
const DOT_CLASSES: Record<HealthStatus, string> = {
  ON_TRACK:             "bg-green-500",
  AT_RISK:              "bg-amber-500",
  OVER_BUDGET:          "bg-red-500",
  NO_BUDGET:            "bg-neutral-400", // exception: neutral-400 for "no data" state
  COMPLETED_PROFITABLE: "",
  COMPLETED_AT_LOSS:    "",
  COMPLETED_NEUTRAL:    "",
};

export function HealthDot({ status }: Props) {
  if (!status) return null;
  const dotClass = DOT_CLASSES[status];
  if (!dotClass) return null; // completed projects — no dot
  return (
    <span
      className={cn("h-2 w-2 rounded-full shrink-0 inline-block", dotClass)}
      aria-hidden="true"
    />
  );
}
