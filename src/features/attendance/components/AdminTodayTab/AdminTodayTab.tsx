import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatHours } from "@/lib/utils";
import { AttendanceTodayStatusChip } from "../AttendanceTodayStatusChip";
import type { AdminTodayEmployee, AdminTodayStatus } from "../../types/attendance.types";

type Props = {
  data: AdminTodayEmployee[] | undefined;
  isLoading: boolean;
  isError: boolean;
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatTime(isoString: string | null): string {
  if (!isoString) return "—";
  return timeFormatter.format(new Date(isoString));
}

export function AdminTodayTab({ data, isLoading, isError }: Props) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  if (isLoading) {
    return (
      <div className="space-y-2 pt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription>Could not load today's attendance data.</AlertDescription>
      </Alert>
    );
  }

  const filtered = data.filter((e) => {
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && e.status === "active") ||
      (statusFilter === "pending_review" && (e.status === "pending_review" || e.status === "submitted")) ||
      (statusFilter === "approved" && e.status === "approved") ||
      (statusFilter === "not_started" && e.status === "not_started");
    const typeMatch =
      typeFilter === "all" ||
      (typeFilter === "full_time" && e.employmentType === "FULL_TIME") ||
      (typeFilter === "part_time" && e.employmentType === "PART_TIME");
    return statusMatch && typeMatch;
  });

  return (
    <div className="space-y-4 pt-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full_time">Full-time</SelectItem>
            <SelectItem value="part_time">Part-time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Employee</th>
              <th className="w-36 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="w-32 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Clocked In</th>
              <th className="w-28 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Hours Today</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-foreground">No employees found</p>
                  </div>
                </td>
              </tr>
            )}
            {filtered.length === 0 && data.length > 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No employees match the selected filters.
                </td>
              </tr>
            )}
            {filtered.map((employee) => (
              <tr
                key={employee.employeeId}
                onClick={() => void navigate({ to: "/admin/employees/$employeeId", params: { employeeId: String(employee.employeeId) } })}
                className={`border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 ${employee.status === "active" ? "border-l-2 border-green-500" : ""}`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{employee.employeeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {employee.employmentType === "FULL_TIME" ? "Full-time" : "Part-time"}
                  </p>
                </td>
                <td className="px-4 py-3 w-36">
                  <AttendanceTodayStatusChip status={employee.status as AdminTodayStatus} />
                </td>
                <td className="px-4 py-3 w-32 text-foreground">
                  {formatTime(employee.clockedInAt)}
                </td>
                <td className="px-4 py-3 w-28 text-foreground">
                  {employee.status === "not_started"
                    ? "—"
                    : formatHours(employee.totalHoursToday)}
                </td>
                <td className="px-4 py-3 w-10">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
