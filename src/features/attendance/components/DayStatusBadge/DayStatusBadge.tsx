import { Clock3, Hourglass, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DayStatus } from "../../types/attendance.types";

type Props = {
  status: DayStatus;
  size?: "sm" | "default";
};

const STATUS_CONFIG = {
  open: {
    label: "In Progress",
    Icon: Clock3,
    className:
      "bg-blue-50 text-blue-700 border border-blue-200" /* info-blue — no semantic token */,
  },
  pending: {
    label: "Pending",
    Icon: Hourglass,
    className:
      "bg-warning/10 text-warning-foreground border border-warning/30",
  },
  approved: {
    label: "Approved",
    Icon: CheckCircle2,
    className: "bg-success/10 text-success border border-success/30",
  },
  rejected: {
    label: "Rejected",
    Icon: XCircle,
    className: "bg-destructive/10 text-destructive border border-destructive/20",
  },
} as const satisfies Record<DayStatus, { label: string; Icon: React.ComponentType<{ className?: string }>; className: string }>;

export function DayStatusBadge({ status, size = "default" }: Props) {
  const { label, Icon, className } = STATUS_CONFIG[status];
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", className)}>
      <Icon className={iconSize} />
      {label}
    </Badge>
  );
}
