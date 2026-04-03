import { Badge } from "@/components/ui/badge";
import type { LeaveTypeName } from "../types/leave.types";

// ---------------------------------------------------------------------------
// LeaveTypeBadge — renders a styled Badge for a leave type name
// ---------------------------------------------------------------------------

type Props = {
  leaveType: LeaveTypeName;
};

const LEAVE_TYPE_CLASSES: Record<LeaveTypeName, string> = {
  "Annual Leave": "border-primary text-primary",
  "Sick Leave": "border-warning text-warning-foreground bg-warning/10",
  "Unpaid Leave": "border-border text-muted-foreground",
};

export function LeaveTypeBadge({ leaveType }: Props) {
  return (
    <Badge variant="outline" className={LEAVE_TYPE_CLASSES[leaveType]}>
      {leaveType}
    </Badge>
  );
}
