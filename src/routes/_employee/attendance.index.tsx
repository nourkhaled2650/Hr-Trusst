import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CalendarX2, ChevronRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/stores/auth.store";
import { formatHours } from "@/lib/utils";
import { useMyDaysQuery, DayStatusBadge, DayFlagChips } from "@/features/attendance";

// ---------------------------------------------------------------------------
// Route setup
// ---------------------------------------------------------------------------
export const Route = createFileRoute("/_employee/attendance/")({
  validateSearch: z.object({
    page: z.coerce.number().optional().default(0),
  }),
  component: AttendanceHistoryPage,
});

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
function AttendanceHistoryPage() {
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const user = useCurrentUser();
  const employmentType = user?.employmentType ?? null;

  const { data, isLoading, isError } = useMyDaysQuery(page);

  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const size = data?.size ?? 20;
  const start = page * size + 1;
  const end = Math.min(start + (data?.content.length ?? 0) - 1, totalElements);

  function goToPage(next: number) {
    void navigate({ search: (prev) => ({ ...prev, page: next }) });
  }

  return (
    <div className="container py-6 space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground">Your working day history</p>
      </div>

      {/* Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Could not load attendance history.</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      {!isError && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-36 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="w-24 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Total Hours</th>
                <th className="w-32 text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Flags</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {/* Loading skeleton */}
              {isLoading && [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td />
                </tr>
              ))}

              {/* Empty state */}
              {!isLoading && totalElements === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center gap-2 min-h-[240px] text-center">
                      <CalendarX2 className="h-12 w-12 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-foreground">No attendance records yet</p>
                      <p className="text-xs text-muted-foreground">
                        Your working day history will appear here once you start recording attendance.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!isLoading && data?.content.map((row) => (
                <tr
                  key={row.dayId}
                  onClick={() => void navigate({ to: "/attendance/$date", params: { date: row.date } })}
                  className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50"
                >
                  <td className="px-4 py-3 w-36 text-foreground">{formatDate(row.date)}</td>
                  <td className="px-4 py-3 w-24 text-foreground">{formatHours(row.totalHours)}</td>
                  <td className="px-4 py-3 w-32">
                    <DayStatusBadge status={row.dayStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <DayFlagChips
                      latenessMinutes={row.latenessMinutes}
                      overtimeHours={row.overtimeHours}
                      hasManualSession={row.hasManualSession}
                      employmentType={employmentType}
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
      )}

      {/* Pagination */}
      {!isLoading && totalElements > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Showing {start}–{end} of {totalElements} days</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
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
