import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LeaveStatus } from "../types/leave.types";

// ---------------------------------------------------------------------------
// LeaveStatusBadge — renders a styled Badge + icon for a leave status
// ---------------------------------------------------------------------------

type Props = {
  status: LeaveStatus;
};

type StatusConfig = {
  label: string;
  classes: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const STATUS_CONFIG: Record<LeaveStatus, StatusConfig> = {
  PENDING: {
    label: "Pending",
    classes: "bg-warning text-warning-foreground",
    Icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    classes: "bg-success text-success-foreground",
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    classes:
      "bg-destructive/10 text-destructive border border-destructive/20",
    Icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "bg-muted text-muted-foreground border border-border",
    Icon: Ban,
  },
};

export function LeaveStatusBadge({ status }: Props) {
  const { label, classes, Icon } = STATUS_CONFIG[status];
  return (
    <Badge className={classes}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
