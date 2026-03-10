import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/stores/auth.store";
import { useAttendanceLogsQuery } from "@/features/attendance";
import { AttendanceTodayCard, AttendanceHistoryList } from "@/features/attendance";
import { filterLogsByDate, getTodayString } from "@/features/attendance";

// ---------------------------------------------------------------------------
// Employee Attendance History Page
// Route: /attendance (index)
// Shows today's sessions at the top, followed by a paginated history list.
// ---------------------------------------------------------------------------

function AttendancePage() {
  const user = useCurrentUser();
  const employeeId = user?.employeeId ?? null;

  const { data: logs, isLoading, isError } = useAttendanceLogsQuery(employeeId);

  // GAP: employeeId is null because the backend does not return it in
  // GET /api/auth/session yet (GAP-session-employeeId).
  if (employeeId === null) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your session history
          </p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-6 text-center">
          <p className="text-sm font-medium">Attendance history unavailable</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {/* GAP-session-employeeId: GET /api/auth/session does not return employeeId.
                Once the backend adds employeeId to the session response, this placeholder
                will be replaced by the actual attendance history. */}
            Your employee profile is not yet linked to your account. Contact your
            administrator if this persists.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Attendance</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || logs === undefined) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Attendance</h1>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive">
            Failed to load attendance records
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  const today = getTodayString();
  const todayLogs = filterLogsByDate(logs, today);

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">Your session history</p>
      </div>

      <AttendanceTodayCard todayLogs={todayLogs} />

      <h2 className="text-sm font-medium text-muted-foreground mb-3">Past Records</h2>
      <AttendanceHistoryList logs={logs} />
    </div>
  );
}

export const Route = createFileRoute("/_employee/attendance/")({
  component: AttendancePage,
});
