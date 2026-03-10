import { createFileRoute } from "@tanstack/react-router";
import { Flag, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_admin/admin/attendance")({
  component: AdminAttendancePage,
});

function AdminAttendancePage() {
  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Admin Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage employee attendance records and review manual session flags.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Section 1 — Flagged session review */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-warning-foreground" />
              <CardTitle className="text-base">Session Review — Flagged Sessions</CardTitle>
            </div>
            <CardDescription>
              Review sessions where employees submitted manual clock-in or clock-out times.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/*
              BLOCKED: The isManual and adminApproved fields exist in the database but
              are not yet exposed in the API response (NEW-024).
              Approve/reject endpoints also need to be added.
              Tracked as: NEW-024
            */}
            <Alert>
              <Flag className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Backend changes required (NEW-024)</p>
                <p className="text-xs mt-1">
                  Flagged session review requires backend changes. The{" "}
                  <code className="font-mono text-xs">isManual</code> and{" "}
                  <code className="font-mono text-xs">adminApproved</code> fields exist in the
                  database but are not yet exposed in the API response (NEW-024). Approve/reject
                  endpoints also need to be added. This view will show sessions where employees
                  entered times manually and need supervisor sign-off.
                </p>
              </AlertDescription>
            </Alert>
            <Button disabled variant="outline" className="w-full sm:w-auto">
              Review Flagged Sessions
            </Button>
          </CardContent>
        </Card>

        {/* Section 2 — Attendance logs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Attendance Logs</CardTitle>
            </div>
            <CardDescription>
              View, filter, and override attendance records across all employees.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* PENDING DESIGN: Admin attendance log view is pending design */}
            <Alert>
              <ClipboardList className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Pending design</p>
                <p className="text-xs mt-1">
                  Admin attendance log view is pending design. Will display all employee
                  attendance logs with date filtering, manual override capability, and session
                  editing.
                </p>
              </AlertDescription>
            </Alert>
            <Button disabled variant="outline" className="w-full sm:w-auto">
              View All Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
