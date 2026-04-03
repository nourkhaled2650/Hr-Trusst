import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminTodayQuery,
  useAdminDaysQuery,
  useAdminMonthStatsQuery,
  AdminStatsStrip,
  AdminTodayTab,
  AdminAllDaysTab,
  AdminPendingTab,
} from "@/features/attendance";

// ---------------------------------------------------------------------------
// Route setup
// ---------------------------------------------------------------------------
const tabValues = ["today", "all-days", "pending"] as const;
type TabValue = (typeof tabValues)[number];

export const Route = createFileRoute("/_admin/admin/attendance")({
  validateSearch: z.object({
    tab: z.enum(tabValues).optional().default("today"),
    page: z.coerce.number().optional().default(0),
    employeeId: z.coerce.number().optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    hasManualSession: z.boolean().optional(),
  }),
  component: AdminAttendancePage,
});

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
function AdminAttendancePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const todayQuery = useAdminTodayQuery();
  const monthStatsQuery = useAdminMonthStatsQuery();
  const pendingQuery = useAdminDaysQuery({ page: 0, status: "pending" });

  const pendingCount = pendingQuery.data?.totalElements ?? 0;
  const totalFT =
    todayQuery.data?.filter((e) => e.employmentType === "FULL_TIME").length ?? 0;

  function setTab(tab: TabValue) {
    void navigate({ search: (prev) => ({ ...prev, tab, page: 0 }) });
  }

  function setPage(page: number) {
    void navigate({ search: (prev) => ({ ...prev, page }) });
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground">Manage and review employee attendance</p>
      </div>

      {/* Stats strip — always visible above tabs */}
      <AdminStatsStrip
        todayData={todayQuery.data}
        pendingCount={pendingCount}
        monthStats={monthStatsQuery.data}
        isLoading={todayQuery.isLoading || monthStatsQuery.isLoading}
        totalFT={totalFT}
        onNavigateToday={() => setTab("today")}
        onNavigatePending={() => setTab("pending")}
        onNavigateAllDays={() => setTab("all-days")}
        onNavigateAllDaysManual={() => {
          void navigate({ search: (prev) => ({ ...prev, tab: "all-days" as TabValue, page: 0, hasManualSession: true }) });
        }}
      />

      {/* Tabs */}
      <Tabs value={search.tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="all-days">All Days</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Review
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold min-w-[18px] h-[18px] px-1">
                {pendingCount > 99 ? "99+" : pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <AdminTodayTab
            data={todayQuery.data}
            isLoading={todayQuery.isLoading}
            isError={todayQuery.isError}
          />
        </TabsContent>

        <TabsContent value="all-days">
          <AdminAllDaysTab
            page={search.page}
            onPageChange={setPage}
            externalFilters={{
              employeeId: search.employeeId,
              status: search.status,
              hasManualSession: search.hasManualSession,
            }}
          />
        </TabsContent>

        <TabsContent value="pending">
          <AdminPendingTab page={search.page} onPageChange={setPage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
