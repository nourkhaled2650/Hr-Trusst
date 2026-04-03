# Dashboard — Frontend Integration Next Steps

> Both dashboards are complete with static data.
> Pick this up once the backend delivers the endpoints in `backend/docs/dashboard-backend-handoff.md`.
> Work through the steps in order — each step is independent but listed by priority.

---

## Step 1 — Create the dashboard API + query layer

**Backend ready when**: `GET /api/employee/dashboard` and `GET /api/admin/dashboard` are implemented.

Create `src/features/dashboard/api/dashboard.api.ts`:

```ts
export const dashboardApi = {
  getEmployeeStats: () =>
    apiClient.get<ApiResponse<EmployeeDashboardStats>>("/api/employee/dashboard"),

  getAdminStats: () =>
    apiClient.get<ApiResponse<AdminDashboardStats>>("/api/admin/dashboard"),

  getActivityFeed: () =>
    apiClient.get<ApiResponse<ActivityFeedItem[]>>("/api/admin/activity"),
} as const;
```

Create `src/features/dashboard/types/dashboard.types.ts`:

```ts
export interface EmployeeDashboardStats {
  monthlyHoursLogged: number;
  latenessUsedMinutes: number;
  latenessLimitMinutes: number;
}

export interface AdminDashboardStats {
  // Attendance
  totalFullTime: number;
  clockedInToday: number;
  activeSessions: number;
  notClockedIn: number;
  // Headcount
  totalEmployees: number;
  fullTimeCount: number;
  partTimeCount: number;
  // Stats
  activeProjects: number;
  monthlyHoursTotal: number;
  onLeaveTodayCount: number;
  pendingWorkingDays: number;
  pendingLeaveRequests: number;
}

export type ActivityEventType =
  | "EMPLOYEE_CREATED"
  | "LEAVE_SUBMITTED"
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED"
  | "DAY_APPROVED"
  | "DAY_REJECTED"
  | "SESSION_FLAGGED";

export interface ActivityFeedItem {
  actorName: string;
  action: ActivityEventType;
  entityId: number;
  entityType: "LEAVE_REQUEST" | "WORKING_DAY" | "SESSION" | "EMPLOYEE";
  timestamp: string;
}
```

Create `src/features/dashboard/api/dashboard.queries.ts`:

```ts
export const dashboardKeys = {
  all: ["dashboard"] as const,
  employeeStats: () => [...dashboardKeys.all, "employee-stats"] as const,
  adminStats: ()   => [...dashboardKeys.all, "admin-stats"] as const,
  activity: ()     => [...dashboardKeys.all, "activity"] as const,
};

export function useEmployeeDashboardStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.employeeStats(),
    queryFn: () => dashboardApi.getEmployeeStats().then((r) => r.data.data),
  });
}

export function useAdminDashboardStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.adminStats(),
    queryFn: () => dashboardApi.getAdminStats().then((r) => r.data.data),
    staleTime: 60_000, // admin overview can tolerate 1 min staleness
  });
}

export function useActivityFeedQuery() {
  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: () => dashboardApi.getActivityFeed().then((r) => r.data.data),
    staleTime: 30_000,
  });
}
```

Export all from `src/features/dashboard/index.ts`:
```ts
export type { EmployeeDashboardStats, AdminDashboardStats, ActivityFeedItem, ActivityEventType } from "./types/dashboard.types";
export { dashboardApi } from "./api/dashboard.api";
export { dashboardKeys, useEmployeeDashboardStatsQuery, useAdminDashboardStatsQuery, useActivityFeedQuery } from "./api/dashboard.queries";
```

---

## Step 2 — Wire employee dashboard stats

**Backend ready when**: `GET /api/employee/dashboard` is implemented.

In `src/routes/_employee/index.tsx`, replace `STATIC_EMPLOYEE_STATS` with the query:

```ts
const { data: stats } = useEmployeeDashboardStatsQuery();

const latenessRemainingMinutes = stats
  ? stats.latenessLimitMinutes - stats.latenessUsedMinutes
  : 0;
const monthlyHours = stats?.monthlyHoursLogged ?? 0;
```

For annual leave remaining, this comes from `GET /api/leave-balance/my` — already documented in `leave-integration-next-steps.md` Step 2. Import `useMyLeaveBalanceQuery` from the leave feature once it exists:

```ts
const { data: leaveBalance } = useMyLeaveBalanceQuery();
const annualLeaveRemaining = leaveBalance?.remainingDays ?? 0;
const annualLeaveTotal     = leaveBalance?.totalDays     ?? 0;
```

Add skeleton states — while loading, render `<Skeleton className="h-[90px] rounded-xl" />` in each of the 3 stat card slots.

---

## Step 3 — Wire admin dashboard stats

**Backend ready when**: `GET /api/admin/dashboard` is implemented.

In `src/routes/_admin/admin.index.tsx`, call the query at the top:

```ts
const { data: stats } = useAdminDashboardStatsQuery();
```

Pass `stats` as props down into each card — the static data constants in each component become props. Update the following components to accept an optional `data` prop and fall back to the static constant when `undefined` (for safe rollout):

**`AttendanceOverviewCard`** — add props:
```ts
type Props = {
  totalFullTime?: number;
  clockedInToday?: number;
  activeSessions?: number;
  notClockedIn?: number;
};
```
Replace `STATIC_ATTENDANCE_OVERVIEW` values with props, falling back to the static constant.

**`HeadcountCard`** — add props:
```ts
type Props = {
  total?: number;
  fullTime?: number;
  partTime?: number;
};
```

**`PendingApprovalsCard`** — add props:
```ts
type Props = {
  pendingWorkingDays?: number;
  pendingLeaveRequests?: number;
};
```
Derive `count` for each row from props. The `to` links and labels stay hardcoded.

**`AdminStatsSection`** — add props:
```ts
type Props = {
  activeProjects?: number;
  monthlyHoursTotal?: number;
  onLeaveTodayCount?: number;
  approvalBacklog?: number; // pendingWorkingDays + pendingLeaveRequests
};
```

In `admin.index.tsx`, compute `approvalBacklog` from the response:
```ts
const approvalBacklog = (stats?.pendingWorkingDays ?? 0) + (stats?.pendingLeaveRequests ?? 0);
```

---

## Step 4 — Wire the activity feed (employee + admin)

**Backend ready when**: `GET /api/admin/activity` is implemented.

The `ActivityFeedCard` component is currently a static placeholder in both dashboards. Replace the placeholder body with a live list using `useActivityFeedQuery()`.

Build a `relativeTime(isoString: string): string` helper in `src/lib/utils.ts`:
- < 60 s → "just now"
- < 60 min → "Xm ago"
- < 24 h → "Xh ago"
- otherwise → formatted date ("Apr 1")

Build an `ACTIVITY_EVENT_LABELS` map in the component file:
```ts
const ACTIVITY_EVENT_LABELS: Record<ActivityEventType, (actorName: string) => string> = {
  EMPLOYEE_CREATED:  (n) => `${n} was added as a new employee`,
  LEAVE_SUBMITTED:   (n) => `${n} submitted a leave request`,
  LEAVE_APPROVED:    (n) => `${n}'s leave request was approved`,
  LEAVE_REJECTED:    (n) => `${n}'s leave request was rejected`,
  DAY_APPROVED:      (n) => `${n}'s working day was approved`,
  DAY_REJECTED:      (n) => `${n}'s working day was rejected`,
  SESSION_FLAGGED:   (n) => `${n}'s session was flagged for review`,
};
```

Build an `ACTIVITY_EVENT_ICONS` map:
```ts
// From lucide-react
const ACTIVITY_EVENT_ICONS: Record<ActivityEventType, LucideIcon> = {
  EMPLOYEE_CREATED: UserPlus,
  LEAVE_SUBMITTED:  CalendarPlus,
  LEAVE_APPROVED:   CalendarCheck,
  LEAVE_REJECTED:   CalendarX,
  DAY_APPROVED:     CheckSquare,
  DAY_REJECTED:     XSquare,
  SESSION_FLAGGED:  AlertTriangle,
};
```

The live event row markup is already designed — see `frontend/docs/design-specs/dashboard-admin.md` §9 for the exact JSX. The `View` link should navigate to the related record:
- `entityType === "LEAVE_REQUEST"` → `/admin/leave`
- `entityType === "WORKING_DAY"` → `/admin/attendance`
- `entityType === "EMPLOYEE"` → `/admin/employees/${entityId}`
- `entityType === "SESSION"` → `/admin/attendance`

The `ActivityFeedCard` is shared between employee and admin dashboards. The employee view renders the same feed — the backend returns only events relevant to the viewing employee (scoped by `actor_id`). No component change needed; the same card works for both.

---

## Step 5 — Delete static data once all wired

Once Steps 2–4 are complete, delete:
- `STATIC_EMPLOYEE_STATS` constant in `src/routes/_employee/index.tsx`
- `STATIC_ATTENDANCE_OVERVIEW` in `AttendanceOverviewCard.tsx`
- `STATIC_HEADCOUNT` in `HeadcountCard.tsx`
- `STATIC_ADMIN_STATS` in `AdminStatsCard.tsx`
- `APPROVAL_ITEMS` static counts in `PendingApprovalsCard.tsx` (keep labels and `to` links)
