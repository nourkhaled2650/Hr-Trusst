# Attendance — Frontend Integration Next Steps

> All attendance pages are complete with static data.
> Pick this up once the backend delivers the endpoints in `backend/docs/attendance-backend-handoff.md`.
> Work through the steps in order — each step is independent but listed by priority.

---

## Step 1 — Wire Employee Attendance History Page

**Backend ready when**: `GET /api/attendance/my/days` is implemented.

In `src/features/attendance/api/my-days.api.ts`, replace the static return with the real call:

```ts
// Remove:
return Promise.resolve({ ...STATIC_MY_DAYS, number: page });

// Replace with:
return apiClient
  .get<ApiResponse<PagedResponse<WorkingDayRow>>>(`/api/attendance/my/days?page=${page}&size=20`)
  .then((r) => r.data.data!);
```

No component changes needed — `useMyDaysQuery(page)` in `attendance.index.tsx` already consumes the response shape.

Remove the TODO comment and delete `src/features/attendance/static/my-days.static.ts` once confirmed working.

---

## Step 2 — Wire Employee Day Detail Page

**Backend ready when**: `GET /api/attendance/my/day/{date}` is implemented.

In `src/features/attendance/api/my-days.api.ts`, replace the static return with the real call:

```ts
// Remove:
return Promise.resolve(STATIC_MY_DAY_DETAIL);

// Replace with:
return apiClient
  .get<ApiResponse<DayDetail>>(`/api/attendance/my/day/${date}`)
  .then((r) => r.data.data!);
```

The component (`attendance.$date.tsx`) already handles the 404 case via `isError` — no additional error handling needed.

Remove the TODO comment and delete `src/features/attendance/static/my-day-detail.static.ts`.

---

## Step 3 — Wire Admin Today Tab

**Backend ready when**: `GET /api/admin/attendance/today` is implemented (with `isLateToday` field).

In `src/features/attendance/api/admin-attendance.api.ts`, replace the static return with the real call:

```ts
// Remove:
return Promise.resolve(STATIC_ADMIN_TODAY);

// Replace with:
return apiClient
  .get<ApiResponse<AdminTodayEmployee[]>>("/api/admin/attendance/today")
  .then((r) =>
    (r.data.data ?? []).map((e) => ({
      ...e,
      // Normalise "submitted" → "pending_review" (backend may use either)
      status: e.status === "submitted" ? "pending_review" : e.status,
    }))
  );
```

The `useAdminTodayQuery` already has `staleTime: 60_000` and `refetchInterval: 60_000` — the tab will auto-refresh every minute once live.

Delete `src/features/attendance/static/admin-today.static.ts`.

---

## Step 4 — Wire Admin All Days Tab

**Backend ready when**: `GET /api/admin/attendance/days` is implemented.

In `src/features/attendance/api/admin-attendance.api.ts`, replace the static return with the real call:

```ts
// Remove:
return Promise.resolve(STATIC_ADMIN_DAYS);

// Replace with:
const params = new URLSearchParams();
params.set("page", String(filters.page));
params.set("size", String(filters.size ?? 20));
if (filters.employeeId)      params.set("employeeId",      String(filters.employeeId));
if (filters.status)          params.set("status",           filters.status);
if (filters.startDate)       params.set("startDate",        filters.startDate);
if (filters.endDate)         params.set("endDate",          filters.endDate);
if (filters.hasManualSession !== undefined)
  params.set("hasManualSession", String(filters.hasManualSession));

return apiClient
  .get<ApiResponse<PagedResponse<AdminWorkingDayRow>>>(`/api/admin/attendance/days?${params}`)
  .then((r) => r.data.data!);
```

This same function is called by both the **All Days tab** and the **Pending Review tab** (the pending tab calls it with `status: "pending"` hardcoded). Both wire automatically once the static return is replaced.

Delete `src/features/attendance/static/admin-days.static.ts`.

---

## Step 5 — Wire the Stats Strip Monthly Numbers

**Backend ready when**: `GET /api/admin/dashboard` has the two new fields (`overtimeDaysThisMonth`, `manualSessionsThisMonth`).

The stats strip (`AdminStatsStrip`) currently reads monthly stats from `STATIC_ATTENDANCE_MONTH_STATS`. Once the dashboard endpoint delivers the new fields, swap the source:

In `src/features/attendance/components/AdminStatsStrip/AdminStatsStrip.tsx`, replace:

```ts
// Remove — static import:
import { STATIC_ATTENDANCE_MONTH_STATS } from "../../static/admin-days.static";

// Replace — use dashboard query (already cached from admin dashboard page):
import { useAdminDashboardStatsQuery } from "@/features/dashboard";

// In component:
const { data: dashboardStats } = useAdminDashboardStatsQuery();
const overtimeDaysThisMonth   = dashboardStats?.overtimeDaysThisMonth ?? 0;
const manualSessionsThisMonth = dashboardStats?.manualSessionsThisMonth ?? 0;
const monthlyHoursTotal       = dashboardStats?.monthlyHoursTotal ?? 0;
```

The dashboard query is already cached by TanStack Query — calling it here adds zero network overhead when the admin dashboard page has been visited. `staleTime: 60_000` means it will serve from cache for 1 minute.

Also update `AdminDashboardStats` in `src/features/dashboard/types/dashboard.types.ts` to add the two new fields:

```ts
export interface AdminDashboardStats {
  // ... existing fields ...
  overtimeDaysThisMonth: number;
  manualSessionsThisMonth: number;
}
```

Delete `STATIC_ATTENDANCE_MONTH_STATS` from `src/features/attendance/static/admin-days.static.ts` after Step 4 and this step are both done.

---

## Step 6 — Add `employmentType` to Session Response

**Backend ready when**: `GET /api/auth/session` returns `employmentType`.

`SessionUser` in `src/types/index.ts` already has `employmentType: "FULL_TIME" | "PART_TIME" | null` defined. The field is populated from the auth store once the backend adds it to the session response.

The attendance pages already guard on `employmentType` — the Late and Overtime chips/cards are suppressed for part-time employees. No component changes needed once the session response includes the field.

Until then, `employmentType` will be `null` for all users, which causes the frontend to treat them as full-time (showing all flags). This is acceptable for the static-data phase.

---

## Step 7 — Query Invalidation After Re-entry

The `RejectedDayReentryDialog` (E6) already exists. Once `useMyDaysQuery` and `useMyDayDetailQuery` are live, add invalidations to the re-entry mutation's `onSuccess` in `src/features/attendance/api/attendance.queries.ts`:

```ts
// In useReentryMutation onSuccess:
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.attendance.myDays(0) });
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.attendance.myDayDetail(date) });
```

This ensures the history list and day detail page reflect the new `"open"` status immediately after re-entry.

---

## Step 8 — Delete All Static Data

Once Steps 1–6 are all wired and confirmed working in staging:

- Delete `src/features/attendance/static/` directory entirely
- Remove static imports from:
  - `src/features/attendance/api/my-days.api.ts`
  - `src/features/attendance/api/admin-attendance.api.ts`
  - `src/features/attendance/components/AdminStatsStrip/AdminStatsStrip.tsx`
- Remove the TODO comments in both API files and both query files
- Remove the `static/` folder from the feature folder structure in this doc

---

## Known Backend Issues to Watch

- **`submitted` vs `pending_review`**: backend may return either string for the same state. The real API call in Step 3 normalises this — keep the mapping even if the backend settles on one term.
- **`isLateToday` missing on first deploy**: if the backend ships the today endpoint without `isLateToday`, the field will be `undefined`. The frontend treats `undefined` as `false` — Late Arrivals chip will show 0 incorrectly until the field is added. Flag to the backend team.
- **Part-time `latenessMinutes`/`overtimeHours`**: backend spec says these are always 0 for part-time. If they ever arrive as non-zero, the frontend guards by `employmentType` from the row — the numbers will still be hidden correctly.
