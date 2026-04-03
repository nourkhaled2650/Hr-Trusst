import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, CalendarX2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatHours } from "@/lib/utils";
import { useEmployees } from "@/features/employees";
import { DayStatusBadge } from "../DayStatusBadge";
import { DayFlagChips } from "../DayFlagChips";
import { useAdminDaysQuery } from "../../api/admin-attendance.queries";
import type { AttendanceDayFilters } from "../../types/attendance.types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return dateFormatter.format(new Date(Date.UTC(year!, month! - 1, day!)));
}

type Props = {
  page: number;
  onPageChange: (page: number) => void;
  externalFilters?: Partial<AttendanceDayFilters>;
};

export function AdminAllDaysTab({ page, onPageChange, externalFilters }: Props) {
  const navigate = useNavigate();
  const { data: employees } = useEmployees();

  const [employeeId, setEmployeeId] = useState<number | undefined>(externalFilters?.employeeId);
  const [status, setStatus] = useState<string | undefined>(externalFilters?.status);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [manualOnly, setManualOnly] = useState<boolean>(externalFilters?.hasManualSession ?? false);
  const [empOpen, setEmpOpen] = useState(false);

  const filters: AttendanceDayFilters = {
    page,
    employeeId,
    status,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    hasManualSession: manualOnly || undefined,
  };

  const { data, isLoading, isError } = useAdminDaysQuery(filters);

  const hasFilters = employeeId !== undefined || status !== undefined || startDate !== "" || endDate !== "" || manualOnly;

  function clearFilters() {
    setEmployeeId(undefined);
    setStatus(undefined);
    setStartDate("");
    setEndDate("");
    setManualOnly(false);
    onPageChange(0);
  }

  const selectedEmployee = employees?.find((e) => e.employeeId === employeeId);

  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const start = page * (data?.size ?? 20) + 1;
  const end = Math.min(start + (data?.content.length ?? 0) - 1, totalElements);

  return (
    <div className="space-y-4 pt-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Employee combobox */}
        <Popover open={empOpen} onOpenChange={setEmpOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-52 justify-start font-normal", !selectedEmployee && "text-muted-foreground")}>
              {selectedEmployee
                ? `${selectedEmployee.firstName ?? ""} ${selectedEmployee.lastName ?? ""}`.trim() || selectedEmployee.email
                : "All employees"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-64" align="start">
            <div className="flex flex-col gap-1 p-1 max-h-64 overflow-y-auto">
              <button
                type="button"
                className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-muted text-left"
                onClick={() => { setEmployeeId(undefined); setEmpOpen(false); onPageChange(0); }}
              >
                All employees
              </button>
              {employees?.map((emp) => {
                const name = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || emp.email;
                return (
                  <button
                    type="button"
                    key={String(emp.employeeId)}
                    className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-muted text-left"
                    onClick={() => { setEmployeeId(emp.employeeId as unknown as number); setEmpOpen(false); onPageChange(0); }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Status select */}
        <Select value={status ?? "all"} onValueChange={(v) => { setStatus(v === "all" ? undefined : v); onPageChange(0); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            className="w-36"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); onPageChange(0); }}
          />
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            className="w-36"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); onPageChange(0); }}
          />
        </div>

        {/* Manual only toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="manual-only"
            checked={manualOnly}
            onCheckedChange={(checked) => { setManualOnly(checked); onPageChange(0); }}
          />
          <Label htmlFor="manual-only" className="text-sm">Manual only</Label>
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Result count */}
      {!isLoading && !isError && (
        <p className="text-xs text-muted-foreground">{totalElements} day(s) found</p>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-36 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Employee</th>
              <th className="w-24 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Hours</th>
              <th className="w-32 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="w-40 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Flags</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {isLoading && [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                <td />
              </tr>
            ))}
            {isError && (
              <tr>
                <td colSpan={6} className="px-4 py-6">
                  <Alert variant="destructive">
                    <AlertDescription>Could not load attendance records.</AlertDescription>
                  </Alert>
                </td>
              </tr>
            )}
            {!isLoading && !isError && data?.content.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-2 text-center min-h-[240px] justify-center">
                    <CalendarX2 className="h-12 w-12 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-foreground">No days found</p>
                    <p className="text-xs text-muted-foreground">Try adjusting your filters.</p>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && !isError && data?.content.map((row) => (
              <tr
                key={row.dayId}
                onClick={() => void navigate({ to: "/admin/employees/$employeeId", params: { employeeId: String(row.employeeId) } })}
                className={cn(
                  "border-b border-border last:border-0 cursor-pointer hover:bg-muted/50",
                  row.dayStatus === "pending" && "border-l-2 border-warning",
                )}
              >
                <td className="px-4 py-3 w-36 text-foreground">{formatDate(row.date)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{row.employeeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.employmentType === "FULL_TIME" ? "Full-time" : "Part-time"}
                  </p>
                </td>
                <td className="px-4 py-3 w-24 text-foreground">
                  {row.totalHours === 0 ? "—" : formatHours(row.totalHours)}
                </td>
                <td className="px-4 py-3 w-32">
                  <DayStatusBadge status={row.dayStatus} />
                </td>
                <td className="px-4 py-3 w-40">
                  <DayFlagChips
                    latenessMinutes={row.latenessMinutes}
                    overtimeHours={row.overtimeHours}
                    hasManualSession={row.hasManualSession}
                    employmentType={row.employmentType}
                  />
                </td>
                <td className="px-4 py-3 w-10">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && totalElements > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Showing {start}–{end} of {totalElements} days</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
