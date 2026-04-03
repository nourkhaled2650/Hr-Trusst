import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import type { AdminLeaveRequest, AdminLeaveType, AdminLeaveStatus } from "../types/admin-leave.types";
import type { LeaveStatus, LeaveTypeName } from "../types/leave.types";
import { LeaveTypeBadge } from "./leave-type-badge";
import { LeaveStatusBadge } from "./leave-status-badge";

// ---------------------------------------------------------------------------
// Local mapping: AdminLeaveType → LeaveTypeName (display string)
// ---------------------------------------------------------------------------
const LEAVE_TYPE_DISPLAY: Record<AdminLeaveType, LeaveTypeName> = {
  PAID: "Annual Leave",
  SICK: "Sick Leave",
  UNPAID: "Unpaid Leave",
};

// ---------------------------------------------------------------------------
// Reason cell — tooltip for long or null reason
// ---------------------------------------------------------------------------
function ReasonCell({ reason }: { reason: string | null }) {
  if (!reason) {
    return (
      <TableCell className="max-w-[160px]">
        <span className="text-muted-foreground">—</span>
      </TableCell>
    );
  }

  if (reason.length > 40) {
    return (
      <TableCell className="max-w-[160px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block truncate cursor-default text-sm text-foreground">
                {reason}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs whitespace-normal">
              {reason}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    );
  }

  return (
    <TableCell className="max-w-[160px]">
      <span className="text-sm text-foreground">{reason}</span>
    </TableCell>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
type Props = {
  requests: AdminLeaveRequest[];
};

// ---------------------------------------------------------------------------
// Exported component
// AdminLeaveStatus and LeaveStatus share the same string union values —
// safe to cast for the badge component.
// ---------------------------------------------------------------------------
export function AdminLeaveHistoryTable({ requests }: Props) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead className="w-32">Start</TableHead>
            <TableHead className="w-32">End</TableHead>
            <TableHead className="w-24">Duration</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-32">Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.leaveRequestId}>
              <TableCell className="font-medium text-foreground">
                {request.employeeName}
              </TableCell>
              <TableCell>
                <LeaveTypeBadge leaveType={LEAVE_TYPE_DISPLAY[request.leaveType]} />
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {formatDate(request.startDate)}
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {formatDate(request.endDate)}
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {request.totalDays} day{request.totalDays === 1 ? "" : "s"}
              </TableCell>
              <ReasonCell reason={request.reason} />
              <TableCell>
                <LeaveStatusBadge status={request.status as AdminLeaveStatus as LeaveStatus} />
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {formatDate(request.createdAt.split("T")[0])}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
