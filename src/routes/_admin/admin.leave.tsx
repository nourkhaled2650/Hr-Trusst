import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHasPermission } from "@/hooks/use-has-permission";
import { PERMISSIONS } from "@/constants/permissions";
import { AdminLeaveStatCard } from "@/features/leave/components/admin-leave-stat-card";
import { AdminPendingRequestsTable } from "@/features/leave/components/admin-pending-requests-table";
import { AdminUpcomingApprovedTable } from "@/features/leave/components/admin-upcoming-approved-table";
import { AdminLeaveHistoryTable } from "@/features/leave/components/admin-leave-history-table";
import {
  ADMIN_LEAVE_STATS,
  ADMIN_PENDING_REQUESTS,
  ADMIN_UPCOMING_APPROVED,
  ADMIN_LEAVE_HISTORY,
} from "@/features/leave/constants/admin-leave-data";
import type { AdminLeaveRequest } from "@/features/leave/types/admin-leave.types";

// ---------------------------------------------------------------------------
// Admin Leave Management Page
// Route: /admin/leave
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/_admin/admin/leave")({
  component: AdminLeavePage,
});

function AdminLeavePage() {
  const [pendingRequests, setPendingRequests] =
    useState<AdminLeaveRequest[]>(ADMIN_PENDING_REQUESTS);
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [filterLeaveType, setFilterLeaveType] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const hasApproveLeave = useHasPermission(PERMISSIONS.APPROVE_LEAVE);

  function handleConfirm(id: number, action: "approve" | "reject", _reason?: string) {
    setPendingRequests((prev) =>
      prev.filter((r) => r.leaveRequestId !== id)
    );
    toast(action === "approve" ? "Request approved." : "Request rejected.", {
      description:
        action === "approve"
          ? "The employee will be notified."
          : "The request has been rejected.",
    });
    // TODO: Replace with useMutation → PUT /api/leave-requests/{id}/approve or /reject
  }

  const employeeNames = [
    ...new Set(ADMIN_LEAVE_HISTORY.map((r) => r.employeeName)),
  ].sort();

  const filtered = ADMIN_LEAVE_HISTORY.filter((r) => {
    const matchEmployee =
      filterEmployee === "all" || r.employeeName === filterEmployee;
    const matchType =
      filterLeaveType === "all" || r.leaveType === filterLeaveType;
    const matchStart = !filterStartDate || r.startDate >= filterStartDate;
    const matchEnd = !filterEndDate || r.startDate <= filterEndDate;
    return matchEmployee && matchType && matchStart && matchEnd;
  });

  return (
    <div className="container py-6 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Leave Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and manage employee leave requests.
        </p>
      </div>

      {/* Section 1 — Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ADMIN_LEAVE_STATS.map((stat) => (
          <AdminLeaveStatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Section 2 — Pending */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-foreground">
            Pending Requests
          </h2>
          {pendingRequests.length > 0 && (
            <Badge className="bg-warning text-warning-foreground">
              {pendingRequests.length}
            </Badge>
          )}
        </div>
        <Card>
          <CardContent className="p-0">
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No pending requests
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  All leave requests have been reviewed.
                </p>
              </div>
            ) : (
              <AdminPendingRequestsTable
                requests={pendingRequests}
                onConfirm={handleConfirm}
                hasApproveLeave={hasApproveLeave}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 3 — Upcoming Approved (conditional) */}
      {ADMIN_UPCOMING_APPROVED.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            Upcoming Approved Leave
          </h2>
          <Card>
            <CardContent className="p-0">
              <AdminUpcomingApprovedTable requests={ADMIN_UPCOMING_APPROVED} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section 4 — History */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Leave History</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Employee filter */}
          <Select value={filterEmployee} onValueChange={setFilterEmployee}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {employeeNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Leave type filter */}
          <Select value={filterLeaveType} onValueChange={setFilterLeaveType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="PAID">Annual Leave</SelectItem>
              <SelectItem value="SICK">Sick Leave</SelectItem>
              <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
            </SelectContent>
          </Select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-full sm:w-36"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              aria-label="Filter from date"
            />
            <span className="text-xs text-muted-foreground shrink-0">to</span>
            <Input
              type="date"
              className="w-full sm:w-36"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              aria-label="Filter to date"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No matching records
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Try adjusting the filters above.
                </p>
              </div>
            ) : (
              <AdminLeaveHistoryTable requests={filtered} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
