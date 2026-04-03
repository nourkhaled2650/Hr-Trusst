import { FolderKanban, Clock, CalendarDays, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Static data — replace with TanStack Query hooks when endpoints are available
// ---------------------------------------------------------------------------
const STATIC_ADMIN_STATS = {
  activeProjects: 8,
  monthlyHoursFormatted: "1,840 h",
  onLeaveToday: 3,
  approvalBacklog: 10, // sum of pending working days + leave requests
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AdminStatsSection() {
  const { activeProjects, monthlyHoursFormatted, onLeaveToday, approvalBacklog } =
    STATIC_ADMIN_STATS;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Projects</p>
              <p className="text-2xl font-bold text-foreground mt-1">{activeProjects}</p>
              <p className="text-xs text-muted-foreground mt-0.5">running this month</p>
            </div>
            <div className="rounded-full bg-muted p-2.5">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Hours This Month</p>
              <p className="text-2xl font-bold text-foreground mt-1">{monthlyHoursFormatted}</p>
              <p className="text-xs text-muted-foreground mt-0.5">logged by all employees</p>
            </div>
            <div className="rounded-full bg-muted p-2.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">On Leave Today</p>
              <p className="text-2xl font-bold text-foreground mt-1">{onLeaveToday}</p>
              <p className="text-xs text-muted-foreground mt-0.5">employees absent</p>
            </div>
            <div className="rounded-full bg-muted p-2.5">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Approval Backlog</p>
              <p className="text-2xl font-bold text-foreground mt-1">{approvalBacklog}</p>
              <p className="text-xs text-muted-foreground mt-0.5">items awaiting action</p>
            </div>
            <div className="rounded-full bg-muted p-2.5">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
