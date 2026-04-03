import { cn, computePctElapsed, formatDate } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { ProjectStatus } from "../../types/projects.types";

type Props = {
  startDate: string;
  endDate: string | null;
  projectStatus: ProjectStatus;
};

export function TimelineBar({ startDate, endDate, projectStatus }: Props) {
  const today = new Date();
  const pctElapsed = computePctElapsed(startDate, endDate, today);

  const isPastEnd =
    endDate !== null && today > new Date(endDate + "T00:00:00");

  const daysSinceStart = Math.floor(
    (today.getTime() - new Date(startDate + "T00:00:00").getTime()) /
      (1000 * 60 * 60 * 24),
  );

  // Case 2: no end date — just text
  if (!endDate) {
    return (
      <div className="text-sm text-muted-foreground">
        Started {formatDate(startDate)} · {daysSinceStart} days running
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Dates row */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(startDate)}</span>
        <span>{formatDate(endDate)}</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            /* overdue state color — no semantic token */
            isPastEnd && projectStatus === "ACTIVE"
              ? "bg-amber-400"
              : "bg-primary",
          )}
          style={{ width: `${Math.min(pctElapsed, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{pctElapsed.toFixed(0)}% elapsed</span>
      </div>

      {/* Overdue warning */}
      {isPastEnd && projectStatus === "ACTIVE" && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 mt-2">
          {/* health status colors — no semantic token */}
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-current">
            This project has passed its end date ({formatDate(endDate)}) but is
            still marked as Active.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
