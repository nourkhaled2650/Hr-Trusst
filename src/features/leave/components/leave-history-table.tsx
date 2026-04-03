import { CalendarDays, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import type { LeaveRequest } from "../types/leave.types";
import { LeaveTypeBadge } from "./leave-type-badge";
import { LeaveStatusBadge } from "./leave-status-badge";

// ---------------------------------------------------------------------------
// Reason cell — tooltip only for long reasons
// ---------------------------------------------------------------------------
const REASON_CLIP_THRESHOLD = 40;

function ReasonCell({ reason }: { reason: string }) {
  const textNode = (
    <span className="block truncate cursor-default text-sm text-foreground">
      {reason}
    </span>
  );

  if (reason.length <= REASON_CLIP_THRESHOLD) {
    return <TableCell className="max-w-[180px]">{textNode}</TableCell>;
  }

  return (
    <TableCell className="max-w-[180px]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{textNode}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs whitespace-normal">
            {reason}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
}

// ---------------------------------------------------------------------------
// Table header — always visible, even during loading
// ---------------------------------------------------------------------------
function LeaveTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Leave Type</TableHead>
        <TableHead className="w-32">Start Date</TableHead>
        <TableHead className="w-32">End Date</TableHead>
        <TableHead className="w-24">Duration</TableHead>
        <TableHead>Reason</TableHead>
        <TableHead className="w-32">Status</TableHead>
        <TableHead className="w-32">Submitted</TableHead>
      </TableRow>
    </TableHeader>
  );
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------
type Props = {
  requests: readonly LeaveRequest[];
  isLoading?: boolean;
  isError?: boolean;
  refetch?: () => void;
};

export function LeaveHistoryTable({
  requests,
  isLoading = false,
  isError = false,
  refetch,
}: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">Leave History</h2>
      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <AlertCircle className="h-8 w-8 text-destructive/60" />
              <p className="text-sm text-muted-foreground">
                Could not load leave history. Try refreshing the page.
              </p>
              {refetch !== undefined && (
                <Button variant="outline" size="sm" onClick={refetch}>
                  Retry
                </Button>
              )}
            </div>
          ) : requests.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No leave requests yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Submit your first request using the button above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <LeaveTableHeader />
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full rounded" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <LeaveTypeBadge leaveType={request.leaveType} />
                          </TableCell>
                          <TableCell className="w-32 text-sm text-foreground">
                            {formatDate(request.startDate)}
                          </TableCell>
                          <TableCell className="w-32 text-sm text-foreground">
                            {formatDate(request.endDate)}
                          </TableCell>
                          <TableCell className="w-24 text-sm text-foreground">
                            {request.durationDays} day
                            {request.durationDays !== 1 ? "s" : ""}
                          </TableCell>
                          <ReasonCell reason={request.reason} />
                          <TableCell className="w-32">
                            <LeaveStatusBadge status={request.status} />
                          </TableCell>
                          <TableCell className="w-32 text-sm text-foreground">
                            {formatDate(request.submittedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
