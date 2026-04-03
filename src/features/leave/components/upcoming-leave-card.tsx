import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { LeaveRequest } from "../types/leave.types";
import { LeaveTypeBadge } from "./leave-type-badge";

// ---------------------------------------------------------------------------
// UpcomingLeaveCard — displays a single upcoming approved leave request
// ---------------------------------------------------------------------------

type Props = {
  request: LeaveRequest;
};

export function UpcomingLeaveCard({ request }: Props) {
  const { leaveType, startDate, endDate, durationDays } = request;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <LeaveTypeBadge leaveType={leaveType} />
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        </div>

        <p className="text-sm font-medium text-foreground">
          {formatDate(startDate)}
          {startDate !== endDate && (
            <>
              {" "}
              <span className="text-muted-foreground">→</span>{" "}
              {formatDate(endDate)}
            </>
          )}
        </p>

        <p className="text-xs text-muted-foreground mt-1">
          {durationDays} day{durationDays === 1 ? "" : "s"}
        </p>
      </CardContent>
    </Card>
  );
}
