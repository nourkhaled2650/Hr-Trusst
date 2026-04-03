import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateShort } from "@/lib/utils";
import type { AdminLeaveRequest, AdminLeaveType } from "../types/admin-leave.types";
import type { LeaveTypeName } from "../types/leave.types";
import { LeaveTypeBadge } from "./leave-type-badge";

// ---------------------------------------------------------------------------
// Local mapping: AdminLeaveType → LeaveTypeName (display string)
// ---------------------------------------------------------------------------
const LEAVE_TYPE_DISPLAY: Record<AdminLeaveType, LeaveTypeName> = {
  PAID: "Annual Leave",
  SICK: "Sick Leave",
  UNPAID: "Unpaid Leave",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
type Props = {
  requests: AdminLeaveRequest[];
};

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------
export function AdminUpcomingApprovedTable({ requests }: Props) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead className="w-24">Duration</TableHead>
            <TableHead className="w-32">Approved On</TableHead>
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
                <span>{formatDateShort(request.startDate)}</span>
                <span className="text-muted-foreground"> → </span>
                <span>{formatDateShort(request.endDate)}</span>
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {request.totalDays} day{request.totalDays === 1 ? "" : "s"}
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {request.approvedDate
                  ? formatDate(request.approvedDate.split("T")[0])
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
