import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
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
// Approve dialog
// ---------------------------------------------------------------------------
function ApproveDialog({
  target,
  onConfirm,
  onCancel,
}: {
  target: AdminLeaveRequest | null;
  onConfirm: (id: number) => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Leave Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve this request? The employee's leave balance will be updated on approval.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button
            className="bg-success text-success-foreground hover:bg-success/90"
            onClick={() => {
              if (target) onConfirm(target.leaveRequestId);
            }}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Reject dialog
// ---------------------------------------------------------------------------
function RejectDialog({
  target,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
}: {
  target: AdminLeaveRequest | null;
  reason: string;
  onReasonChange: (value: string) => void;
  onConfirm: (id: number, reason: string) => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Leave Request</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this request. The employee will be able to see this reason.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <label htmlFor="reject-reason" className="text-sm font-medium text-foreground">
            Rejection Reason
          </label>
          <Textarea
            id="reject-reason"
            rows={3}
            placeholder="Briefly explain why this request is being rejected."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={reason.trim().length === 0}
            onClick={() => {
              if (target) onConfirm(target.leaveRequestId, reason.trim());
            }}
          >
            Reject Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
type Props = {
  requests: AdminLeaveRequest[];
  onConfirm: (id: number, action: "approve" | "reject", reason?: string) => void;
  hasApproveLeave: boolean;
};

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------
export function AdminPendingRequestsTable({ requests, onConfirm, hasApproveLeave }: Props) {
  const [approveTarget, setApproveTarget] = useState<AdminLeaveRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminLeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  return (
    <>
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
              <TableHead className="w-32">Submitted</TableHead>
              {hasApproveLeave && <TableHead className="w-56">Actions</TableHead>}
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
                <TableCell className="text-sm text-foreground">
                  {formatDate(request.createdAt.split("T")[0])}
                </TableCell>
                {hasApproveLeave && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-success border-success/30 hover:bg-success/10 hover:text-success"
                        onClick={() => setApproveTarget(request)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setRejectTarget(request)}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ApproveDialog
        target={approveTarget}
        onConfirm={(id) => {
          onConfirm(id, "approve");
          setApproveTarget(null);
        }}
        onCancel={() => setApproveTarget(null)}
      />

      <RejectDialog
        target={rejectTarget}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onConfirm={(id, reason) => {
          onConfirm(id, "reject", reason);
          setRejectTarget(null);
          setRejectReason("");
        }}
        onCancel={() => { setRejectTarget(null); setRejectReason(""); }}
      />
    </>
  );
}
