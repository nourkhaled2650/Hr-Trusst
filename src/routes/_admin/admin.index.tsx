import { createFileRoute } from "@tanstack/react-router";
import {
  AttendanceOverviewCard,
  PendingApprovalsCard,
  HeadcountCard,
  PayrollPlaceholderCard,
  ActivityFeedCard,
  AdminStatsSection,
} from "@/features/dashboard";

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export const Route = createFileRoute("/_admin/admin/")({
  component: AdminDashboardPage,
});

// ---------------------------------------------------------------------------
// Date formatting — evaluated once on render
// ---------------------------------------------------------------------------
const TODAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
function AdminDashboardPage() {
  const todayFormatted = TODAY_FORMATTER.format(new Date());

  return (
    <div className="container py-6 space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {todayFormatted} — here's what's happening today.
        </p>
      </div>

      {/* Admin stats — 4 CEO-relevant KPI cards */}
      <AdminStatsSection />

      {/* Section: Today at a Glance */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Today at a Glance
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AttendanceOverviewCard />
          </div>
          <div>
            <PendingApprovalsCard />
          </div>
        </div>
      </section>

      {/* Section: Workforce */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Workforce
        </h2>
        <HeadcountCard />
      </section>

      {/* Section: Payroll Status */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Payroll Status
        </h2>
        <PayrollPlaceholderCard />
      </section>

      {/* Section: Recent Activity */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Recent Activity
        </h2>
        <ActivityFeedCard />
      </section>
    </div>
  );
}
