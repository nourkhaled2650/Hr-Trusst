import { Minus, Hourglass, CheckCircle2 } from "lucide-react";
import type { AdminTodayStatus } from "../../types/attendance.types";

type Props = {
  status: AdminTodayStatus;
};

export function AttendanceTodayStatusChip({ status }: Props) {
  const base = "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium";

  if (status === "not_started") {
    return (
      <span className={`${base} bg-muted text-muted-foreground`}>
        <Minus className="h-3.5 w-3.5" />
        Not Started
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className={`${base} bg-green-50 text-green-700 border border-green-200`}>
        {/* active-pulse — no semantic token for live-indicator green */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        Active
      </span>
    );
  }

  if (status === "submitted" || status === "pending_review") {
    return (
      <span className={`${base} bg-warning/10 text-warning-foreground border border-warning/30`}>
        <Hourglass className="h-3.5 w-3.5" />
        Pending Review
      </span>
    );
  }

  // approved
  return (
    <span className={`${base} bg-success/10 text-success border border-success/30`}>
      <CheckCircle2 className="h-3.5 w-3.5" />
      Approved
    </span>
  );
}
