import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Timer,
  Clock,
  CalendarDays,
  FolderKanban,
  History,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityFeedCard } from "@/features/dashboard";
import { useCurrentUser } from "@/stores/auth.store";
import { formatHoursMinutes } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export const Route = createFileRoute("/_employee/")({
  component: EmployeeHomePage,
});

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------
const STATIC_EMPLOYEE_STATS = {
  latenessRemainingMinutes: 255, // 4 h 15 m
  monthlyHours: 87.5,
  annualLeaveRemaining: 15,
  annualLeaveTotal: 20,
  currentMonth: "April",
} as const;

const QUICK_ACTIONS = [
  { label: "Clock In / Out", to: "/", Icon: Clock },
  { label: "Log Hours", to: "/attendance/log", Icon: FolderKanban },
  { label: "Attendance History", to: "/attendance", Icon: History },
  { label: "Leave Requests", to: "/leave", Icon: CalendarDays },
] as const;

// ---------------------------------------------------------------------------
// Greeting logic
// ---------------------------------------------------------------------------
function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
function EmployeeHomePage() {
  const user = useCurrentUser();
  const greeting = getTimeOfDayGreeting();
  const displayName = user?.username ?? "there";

  const {
    latenessRemainingMinutes,
    monthlyHours,
    annualLeaveRemaining,
    annualLeaveTotal,
    currentMonth,
  } = STATIC_EMPLOYEE_STATS;

  return (
    <div className="container py-6 space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {greeting}, {displayName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's your day at a glance.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Hours This Month */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Hours This Month
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {monthlyHours} h
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  logged in {currentMonth}
                </p>
              </div>
              <div className="rounded-full bg-muted p-2.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Lateness Balance */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Lateness Balance
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatHoursMinutes(latenessRemainingMinutes)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  remaining this month
                </p>
              </div>
              <div className="rounded-full bg-muted p-2.5">
                <Timer className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Annual Leave Left */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Annual Leave Left
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {annualLeaveRemaining} days
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  of {annualLeaveTotal} days total
                </p>
              </div>
              <div className="rounded-full bg-muted p-2.5">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                         border border-border bg-card hover:bg-muted transition-colors text-center"
            >
              <div className="rounded-full bg-muted p-2.5">
                <action.Icon className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Recent Activity
        </h2>
        <ActivityFeedCard />
      </section>
    </div>
  );
}
