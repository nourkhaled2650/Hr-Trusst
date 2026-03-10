import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmployeeWorkingDaysQuery,
  useApproveDayMutation,
  useRejectDayMutation,
} from "../../api/attendance.queries";
import { formatHoursDisplay } from "../../utils/attendance.utils";
import type { AdminWorkingDay } from "../../types/attendance.types";

type Props = {
  employeeId: number;
};

function StatusBadge({ day }: { day: AdminWorkingDay }) {
  if (day.dayStatus === "pending") {
    return (
      <Badge className="flex items-center gap-1 bg-warning text-warning-foreground border-warning/20">
        <Clock className="h-3 w-3" />
        Pending
        {day.hasManualSession && (
          <span className="ml-1 text-xs opacity-80">(manual)</span>
        )}
      </Badge>
    );
  }
  if (day.dayStatus === "approved") {
    return (
      <Badge className="flex items-center gap-1 bg-success text-success-foreground border-success/20">
        <CheckCircle2 className="h-3 w-3" />
        Approved
      </Badge>
    );
  }
  if (day.dayStatus === "rejected") {
    return (
      <Badge className="flex items-center gap-1 bg-destructive/10 text-destructive border border-destructive/20">
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>
    );
  }
  return <Badge variant="secondary">{day.dayStatus}</Badge>;
}

function DayRow({
  day,
  employeeId,
}: {
  day: AdminWorkingDay;
  employeeId: number;
}) {
  const { mutate: approve, isPending: approving } = useApproveDayMutation(employeeId);
  const { mutate: reject, isPending: rejecting } = useRejectDayMutation(employeeId);
  const isBusy = approving || rejecting;

  const dateLabel = (() => {
    try { return format(parseISO(day.date), "EEE, MMM d, yyyy"); } catch { return day.date; }
  })();

  return (
    <TableRow>
      <TableCell className="font-medium">{dateLabel}</TableCell>
      <TableCell>{formatHoursDisplay(day.totalHours)}</TableCell>
      <TableCell>
        <StatusBadge day={day} />
      </TableCell>
      <TableCell className="text-right">
        {day.dayStatus === "pending" && (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-success text-success hover:bg-success/10"
              onClick={() => approve(day.dayId)}
              disabled={isBusy}
            >
              {approving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              <span className="ml-1.5">Approve</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => reject(day.dayId)}
              disabled={isBusy}
            >
              {rejecting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              <span className="ml-1.5">Reject</span>
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

export function EmployeeWorkingDaysTable({ employeeId }: Props) {
  const { data: days, isPending, isError, refetch } = useEmployeeWorkingDaysQuery(employeeId);

  if (isPending) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Could not load working days.</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void refetch()}
          className="ml-auto"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!days || days.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No working days recorded yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Total Hours</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {days.map((day) => (
          <DayRow key={day.dayId} day={day} employeeId={employeeId} />
        ))}
      </TableBody>
    </Table>
  );
}
