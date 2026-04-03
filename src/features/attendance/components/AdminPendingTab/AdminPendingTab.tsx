import { Link } from "@tanstack/react-router";
import { Hourglass, CheckCircle2, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHours } from "@/lib/utils";
import { DayFlagChips } from "../DayFlagChips";
import { useAdminDaysQuery } from "../../api/admin-attendance.queries";

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
};

export function AdminPendingTab({ page, onPageChange }: Props) {
  const { data, isLoading, isError } = useAdminDaysQuery({ page, status: "pending" });
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const start = page * (data?.size ?? 20) + 1;
  const end = Math.min(start + (data?.content.length ?? 0) - 1, totalElements);

  return (
    <div className="space-y-4 pt-4">
      {/* Banner */}
      {!isLoading && !isError && totalElements > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 flex items-center gap-2">
          <Hourglass className="h-4 w-4 text-warning-foreground shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{totalElements}</span>{" "}
            {totalElements === 1 ? "day requires" : "days require"} review.
            Go to each employee&apos;s profile to approve or reject.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-36 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Employee</th>
              <th className="w-24 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Hours</th>
              <th className="w-32 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Flags</th>
              <th className="w-32 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Review</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && [1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                <td className="px-4 py-3"><Skeleton className="h-8 w-20" /></td>
              </tr>
            ))}
            {isError && (
              <tr>
                <td colSpan={5} className="px-4 py-6">
                  <Alert variant="destructive">
                    <AlertDescription>Could not load pending days.</AlertDescription>
                  </Alert>
                </td>
              </tr>
            )}
            {!isLoading && !isError && totalElements === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="flex flex-col items-center justify-center min-h-[240px] gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-7 w-7 text-success" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-medium text-foreground">All caught up</p>
                      <p className="text-sm text-muted-foreground">
                        There are no working days waiting for review.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && !isError && data?.content.map((row) => (
              <tr key={row.dayId} className="border-b border-border last:border-0">
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
                  <DayFlagChips
                    latenessMinutes={0}
                    overtimeHours={row.overtimeHours}
                    hasManualSession={row.hasManualSession}
                    employmentType={row.employmentType}
                  />
                </td>
                <td className="px-4 py-3 w-32">
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <Link to="/admin/employees/$employeeId" params={{ employeeId: String(row.employeeId) }}>
                      <ExternalLink className="h-3.5 w-3.5" />
                      Review
                    </Link>
                  </Button>
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
