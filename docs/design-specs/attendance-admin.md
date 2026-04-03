# Design Spec — Admin Attendance Hub

**Date**: 2026-04-02
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation
**Replaces**: `src/routes/_admin/admin.attendance.tsx` (current placeholder with two empty stub cards)

---

## 1. Overview

The Admin Attendance Hub is the attendance control centre for HR admins. It surfaces three distinct concerns in one page without overwhelming the user:

1. **Today** — live status of every employee right now (who is clocked in, submitted, approved, not started).
2. **All Days** — a searchable, filterable, paginated record of all working days across all employees.
3. **Pending Review** — a focused list of days awaiting admin action, with a direct path to approve/reject.

Approve and reject actions themselves live on the employee detail page (the `EmployeeWorkingDaysTable` component is already built there). This page does not duplicate that UI — it links into it.

---

## 2. Route & File

Route: `/_admin/admin/attendance`
File: `src/routes/_admin/admin.attendance.tsx`

This replaces the existing placeholder file. The existing file can be overwritten entirely.

---

## 3. API Endpoints Used

### Existing (available now)
None of the endpoints on this page are currently built. All three tabs use static data until the backend delivers.

### Pending backend (mark as static-data-only until delivered)

**`GET /api/admin/attendance/today`**
Response:
```ts
Array<{
  employeeId: number;
  employeeName: string;
  employmentType: "FULL_TIME" | "PART_TIME";
  status: "not_started" | "active" | "submitted" | "approved" | "pending_review";
  clockedInAt: string | null;   // ISO-8601, null if not started
  totalHoursToday: number;      // 0 if not started
}>
```

Note on `status` values:
- `"not_started"` — no attendance record today
- `"active"` — session currently open (clocked in)
- `"submitted"` — day ended, project hours submitted, day locked but admin not yet actioned it (treated as `"pending_review"` from admin perspective)
- `"approved"` — admin approved the day
- `"pending_review"` — same as submitted; use this single term in the UI

**`GET /api/admin/attendance/days`**
Query params: `page` (0-indexed), `size` (default 20), `employeeId?`, `status?`, `startDate?`, `endDate?`, `hasManualSession?` (boolean)
Response:
```ts
{
  content: Array<{
    dayId: number;
    date: string;                  // YYYY-MM-DD
    employeeId: number;
    employeeName: string;
    employmentType: "FULL_TIME" | "PART_TIME";
    totalHours: number;
    dayStatus: "open" | "pending" | "approved" | "rejected";
    hasManualSession: boolean;
    overtimeHours: number;
    latenessMinutes: number;
  }>;
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
```

### Additional fields required on existing endpoints

**`GET /api/admin/attendance/today`** — add `isLateToday: boolean` to each item in the response array. `true` when the employee's first session of the day started after the configured shift start time. Part-time employees always return `false`.

**`GET /api/admin/dashboard`** — add two new fields to the response:
- `overtimeDaysThisMonth: number` — count of approved/pending working days in the current calendar month where `overtimeHours > 0` (full-time employees only)
- `manualSessionsThisMonth: number` — count of working days in the current calendar month where `hasManualSession === true`

These additions must be documented in `backend/docs/dashboard-backend-handoff.md` as amendments to the already-specified endpoint.

### Query Keys (add to `src/constants/query-keys.ts`)
```ts
admin: {
  // ... existing keys (employeeWorkingDays) ...
  attendanceToday: () => ["admin", "attendance", "today"],
  attendanceDays: (filters: AttendanceDayFilters) => ["admin", "attendance", "days", filters],
}
```

Where `AttendanceDayFilters` is:
```ts
interface AttendanceDayFilters {
  page: number;
  employeeId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  hasManualSession?: boolean;
}
```

---

## 4. Static Data for Development

Add stats static data alongside the existing statics:

```ts
// src/features/attendance/static/admin-today.static.ts
// Note: isLateToday is a new field — pending backend implementation
export const STATIC_ADMIN_TODAY = [
  { employeeId: 1, employeeName: "Sara Mitchell",  employmentType: "FULL_TIME",  status: "active",         clockedInAt: "2026-04-02T09:22:00", totalHoursToday: 2.5,  isLateToday: true  },
  { employeeId: 2, employeeName: "James Oduya",    employmentType: "FULL_TIME",  status: "approved",       clockedInAt: "2026-04-02T09:00:00", totalHoursToday: 8.0,  isLateToday: false },
  { employeeId: 3, employeeName: "Lena Kovac",     employmentType: "PART_TIME",  status: "pending_review", clockedInAt: "2026-04-02T10:00:00", totalHoursToday: 4.0,  isLateToday: false },
  { employeeId: 4, employeeName: "Mark Osei",      employmentType: "FULL_TIME",  status: "not_started",    clockedInAt: null,                  totalHoursToday: 0,    isLateToday: false },
  { employeeId: 5, employeeName: "Priya Nair",     employmentType: "FULL_TIME",  status: "active",         clockedInAt: "2026-04-02T08:48:00", totalHoursToday: 2.75, isLateToday: false },
  { employeeId: 6, employeeName: "Khalid Youssef", employmentType: "FULL_TIME",  status: "not_started",    clockedInAt: null,                  totalHoursToday: 0,    isLateToday: false },
  { employeeId: 7, employeeName: "Mona Ibrahim",   employmentType: "FULL_TIME",  status: "active",         clockedInAt: "2026-04-02T09:35:00", totalHoursToday: 1.5,  isLateToday: true  },
];

// src/features/attendance/static/admin-stats.static.ts
// Today stats are derived from STATIC_ADMIN_TODAY at runtime — no separate static needed.
// Monthly stats mirror the dashboard endpoint additions:
export const STATIC_ATTENDANCE_MONTH_STATS = {
  overtimeDaysThisMonth: 12,
  manualSessionsThisMonth: 9,
  // monthlyHoursTotal comes from the dashboard query (GET /api/admin/dashboard)
  // Use STATIC_ADMIN_STATS.monthlyHoursFormatted from AdminStatsCard static data
} as const;

// src/features/attendance/static/admin-days.static.ts
export const STATIC_ADMIN_DAYS = {
  content: [
    { dayId: 200, date: "2026-03-31", employeeId: 1, employeeName: "Sara Mitchell",  employmentType: "FULL_TIME", totalHours: 9.0,  dayStatus: "pending",  hasManualSession: true,  overtimeHours: 1.0, latenessMinutes: 0  },
    { dayId: 201, date: "2026-03-31", employeeId: 2, employeeName: "James Oduya",    employmentType: "FULL_TIME", totalHours: 8.0,  dayStatus: "approved", hasManualSession: false, overtimeHours: 0,   latenessMinutes: 0  },
    { dayId: 202, date: "2026-03-31", employeeId: 3, employeeName: "Lena Kovac",     employmentType: "PART_TIME", totalHours: 4.0,  dayStatus: "approved", hasManualSession: false, overtimeHours: 0,   latenessMinutes: 0  },
    { dayId: 203, date: "2026-03-30", employeeId: 1, employeeName: "Sara Mitchell",  employmentType: "FULL_TIME", totalHours: 7.5,  dayStatus: "approved", hasManualSession: false, overtimeHours: 0,   latenessMinutes: 15 },
    { dayId: 204, date: "2026-03-30", employeeId: 5, employeeName: "Priya Nair",     employmentType: "FULL_TIME", totalHours: 8.5,  dayStatus: "pending",  hasManualSession: true,  overtimeHours: 0.5, latenessMinutes: 0  },
  ],
  totalElements: 5,
  totalPages: 1,
  number: 0,
  size: 20,
};
```

---

## 5. Page Layout

Route file: `src/routes/_admin/admin.attendance.tsx`
Root wrapper: `<div className="container py-6 space-y-6">` inside the admin layout content area.

```
┌────────────────────────────────────────────────────────────────────┐
│  ADMIN SIDEBAR (dark, fixed)  │  ADMIN NAVBAR (white, fixed, h-14) │
├──────────────────────────────────────────────────────────────────  │
│  bg-background, pt-14 (from layout), overflow-y-auto               │
│                                                                    │
│  <div class="container py-6 space-y-6">                           │
│                                                                    │
│  PAGE HEADER                                                       │
│  "Attendance"  text-2xl font-semibold                              │
│  "Manage and review employee attendance"  text-sm text-muted-fg   │
│                                                                    │
│  ────────────────────────────────────────────────────────────     │
│                                                                    │
│  STATS STRIP (always visible, above tabs)                          │
│  ┌──────────────┐ TODAY label                                      │
│  │ 17/22  ··  3  ··  4 late  ··  7 pending  │  (4-col grid)       │
│  └────────────────────────────────────────────                     │
│  ┌──────────────┐ THIS MONTH label                                 │
│  │ 1,840h  ··  12 overtime days  ··  9 manual │  (3-col grid)     │
│  └────────────────────────────────────────────                     │
│                                                                    │
│  ────────────────────────────────────────────────────────────     │
│                                                                    │
│  TABS                                                              │
│  [Today]  [All Days]  [Pending Review (3)]                         │
│                                                                    │
│  TAB CONTENT AREA (see each tab below)                             │
│                                                                    │
│  </div>                                                            │
└────────────────────────────────────────────────────────────────────┘
```

---

## 6. Page Header

```tsx
<div className="space-y-1">
  <h1 className="text-2xl font-semibold text-foreground">Attendance</h1>
  <p className="text-sm text-muted-foreground">
    Manage and review employee attendance
  </p>
</div>
```

No action buttons in the header.

---

## 6.5 Stats Strip

Always visible above the tabs regardless of which tab is active. Gives the manager an instant read on the current situation without requiring any interaction.

Divided into two labelled groups: **Today** (4 chips) and **This Month** (3 chips).

### Layout

```tsx
<div className="space-y-3">
  {/* Today row */}
  <div className="space-y-2">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today</p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 4 stat chips */}
    </div>
  </div>

  {/* This Month row */}
  <div className="space-y-2">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Month</p>
    <div className="grid grid-cols-3 gap-3">
      {/* 3 stat chips */}
    </div>
  </div>
</div>
```

### Stat Chip Component

Each chip is a compact card. Clicking a chip navigates to the relevant tab with a pre-applied filter (see "Click behaviour" below). Non-navigable chips are non-interactive (`<div>`, no hover state).

```tsx
// Clickable chip
<button
  onClick={onClick}
  className="flex items-center justify-between rounded-lg border border-border
             bg-card px-4 py-3 hover:bg-muted transition-colors text-left
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
  </div>
  <div className="rounded-full bg-muted p-2 shrink-0">
    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
  </div>
</button>

// Non-interactive chip — same markup but <div> not <button>, no hover class
```

### Today — 4 Chips

| # | Label | Value derivation | Icon | Click behaviour |
|---|---|---|---|---|
| 1 | Clocked In Today | `todayData.filter(e => e.status !== "not_started").length` + `" / "` + `todayData.filter(e => e.employmentType === "FULL_TIME").length` | `Users` | Navigates to Today tab, status filter = All |
| 2 | Active Right Now | `todayData.filter(e => e.status === "active").length` | `Activity` | Navigates to Today tab, status filter = Active |
| 3 | Late Arrivals | `todayData.filter(e => e.isLateToday).length` | `Clock` | Navigates to Today tab — no filter (late is not a filterable status in the tab, so just navigate to Today tab) |
| 4 | Pending Review | `pendingCount` (from the pending review query) | `Hourglass` | Navigates to Pending Review tab |

The "Clocked In Today" chip shows a fraction (e.g. "17 / 22") where the denominator is total full-time count. This is the most important single number on the page.

**Accent on Pending Review chip**: when `pendingCount > 0`, the chip gets `border-warning/40 bg-warning/5` instead of the default `border-border bg-card`. This draws the eye to the action item without being alarming.

**Accent on Late Arrivals chip**: when late count > 0, apply `border-warning/30 bg-warning/5`.

### This Month — 3 Chips

| # | Label | Value derivation | Icon | Click behaviour |
|---|---|---|---|---|
| 1 | Hours Logged | `adminDashboardStats.monthlyHoursTotal` formatted as `"1,840 h"` | `Clock` | No click — informational only |
| 2 | Overtime Days | `attendanceMonthStats.overtimeDaysThisMonth` | `TrendingUp` | Navigates to All Days tab with no pre-filter (overtime is not a dedicated filter) |
| 3 | Manual Sessions | `attendanceMonthStats.manualSessionsThisMonth` | `PenLine` | Navigates to All Days tab with Manual Only toggle pre-set to true (`?tab=all-days&hasManualSession=true`) |

### Data sources summary

| Stat | Source query | Notes |
|---|---|---|
| Clocked In, Active, Late | `useAdminTodayQuery` | Derived at render time from the today array |
| Pending count | `useAdminPendingCountQuery` (page=0 pending query) | `totalElements` |
| Hours Logged | `useAdminDashboardStatsQuery` | `monthlyHoursTotal` — reuse dashboard query, already cached |
| Overtime Days | `useAttendanceMonthStatsQuery` (new, hits `/api/admin/dashboard`) | `overtimeDaysThisMonth` field added to dashboard response |
| Manual Sessions | same as above | `manualSessionsThisMonth` field added to dashboard response |

Since the dashboard query is already called on the admin dashboard page and cached by TanStack Query, calling it here adds no network overhead.

### Loading state

While any source query is loading, render skeleton chips:

```tsx
<Skeleton className="h-[66px] rounded-lg" />
```

Show 4 skeletons for Today row, 3 for This Month row. Do not show partial data — wait for all queries to resolve before rendering the strip.

### Static data for the strip

```ts
// Derived at runtime from STATIC_ADMIN_TODAY (no separate static needed for today chips)
// Monthly stats from STATIC_ATTENDANCE_MONTH_STATS (defined in Section 4)
// Monthly hours from STATIC_ADMIN_STATS.monthlyHoursFormatted = "1,840 h"

// Derived today stats example (what the component computes):
// clockedInToday = 5 (all except Mark Osei)
// totalFullTime  = 5 (Sara, James, Mark, Priya, Khalid, Mona = 6 FT from updated static)
// activeNow      = 3 (Sara, Priya, Mona)
// lateToday      = 2 (Sara, Mona — both have isLateToday: true)
// pendingCount   = 7 (from STATIC_ADMIN_DAYS pending filter totalElements)
```

---

## 7. Tab Navigation

Use shadcn `<Tabs>` with `<TabsList>` and `<TabsTrigger>` and `<TabsContent>`.

```tsx
<Tabs defaultValue="today">
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

  <TabsContent value="today">   {/* Section 8 */} </TabsContent>
  <TabsContent value="all-days"> {/* Section 9 */} </TabsContent>
  <TabsContent value="pending">  {/* Section 10 */} </TabsContent>
</Tabs>
```

`pendingCount`: derived from the `GET /api/admin/attendance/days?status=pending` query (same query used by the Pending Review tab), using `totalElements`. While loading, omit the badge entirely (do not show "0"). Use a separate lightweight query for this count if needed, or reuse the Pending Review tab's query result.

The active tab persists in the URL as a search param: `?tab=today` | `?tab=all-days` | `?tab=pending`. Use TanStack Router's `useSearch` / `navigate`. Default to `"today"` if param is absent or invalid.

---

## 8. Tab 1 — Today

### 8.1 Purpose
Show every employee's current attendance state for today. The admin can see at a glance who is active, who is pending review, who has not started. Clicking a row navigates to that employee's detail page.

### 8.2 Filter Bar

Above the table, a single compact filter row:

```
┌───────────────────────────────────────────────────────────────────┐
│  [Status filter Select]   [Employee type filter Select]           │
│  w-44                     w-44                                    │
└───────────────────────────────────────────────────────────────────┘
```

- **Status filter**: `<Select>` — options: All, Active, Pending Review, Approved, Not Started. Default: All.
- **Type filter**: `<Select>` — options: All, Full-time, Part-time. Default: All.
- Both filters are client-side (applied to the full `today` response — it is not paginated).
- Filter row: `<div className="flex flex-wrap items-center gap-3">`. No label text above them — the Select placeholder text acts as label.

### 8.3 Today Table

Full-width table. Not paginated (typically < 100 employees). Use a standard HTML `<table>` styled to match the shadcn DataTable pattern rather than a full TanStack Table instance (this avoids pagination overhead for a small, non-paged dataset).

#### Columns

| Column | Header | Width | Notes |
|---|---|---|---|
| `employeeName` | Employee | auto | `font-medium text-foreground`. Below name: `text-xs text-muted-foreground` — employment type label ("Full-time" / "Part-time"). |
| `status` | Status | `w-36` | Status chip — see spec below |
| `clockedInAt` | Clocked In | `w-32` | Formatted as "9:00 AM". `"—"` if `null`. `text-sm` |
| `totalHoursToday` | Hours Today | `w-28` | `formatHours(totalHoursToday)`. `"—"` if 0 and status is `"not_started"`. |
| `action` | (none) | `w-10` | `ChevronRight` icon — visual affordance only |

#### Today Status Chip Spec

Small inline chip (same `<span>` pattern as the employee attendance page flag chips, but with label):

| `status` | Label | Icon | Style |
|---|---|---|---|
| `"not_started"` | "Not Started" | `Minus` (16px) | `bg-muted text-muted-foreground` |
| `"active"` | "Active" | `Radio` (16px, use lucide `Circle` with fill pulse or `Wifi`) — use `Activity` icon | `bg-green-50 text-green-700 border border-green-200` |
| `"submitted"` / `"pending_review"` | "Pending Review" | `Hourglass` (16px) | `bg-warning/10 text-warning-foreground border border-warning/30` |
| `"approved"` | "Approved" | `CheckCircle2` (16px) | `bg-success/10 text-success border border-success/30` |

Style each as:
```
className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
```

The `"active"` status uses a pulsing dot instead of an icon:
```tsx
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
</span>
```

#### Row Behaviour
- Entire row is clickable — navigate to `/admin/employees/${employeeId}`.
- `cursor-pointer`, `hover:bg-muted/50` on `<tr>`.
- Active employees (status `"active"`) have a subtle left border accent: `border-l-2 border-green-500` on the `<tr>`.

### 8.4 Loading State
Replace table rows with 5 skeleton rows. Each row: `<Skeleton className="h-4 w-full">` per cell.

### 8.5 Empty State
If no employees exist in the system:
```tsx
<div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-center">
  <Users className="h-10 w-10 text-muted-foreground" />
  <p className="text-sm text-foreground font-medium">No employees found</p>
  <p className="text-xs text-muted-foreground">Add employees to see today's attendance.</p>
</div>
```

If filters produce zero results:
```tsx
<p className="text-sm text-muted-foreground text-center py-8">
  No employees match the selected filters.
</p>
```

### 8.6 Error State
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Could not load today's attendance</AlertTitle>
  <AlertDescription>Refresh the page to try again.</AlertDescription>
</Alert>
```

---

## 9. Tab 2 — All Days

### 9.1 Purpose
A complete, filterable, paginated record of all working days across all employees. Supports historical lookups, auditing, and spotting patterns (e.g. recurring lateness, frequent manual sessions).

### 9.2 Filter Bar

Compact filter row above the table:

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Employee combobox]   [Status select]   [Date range]   [Manual only]  │
│  w-56                  w-40              w-64            toggle         │
└────────────────────────────────────────────────────────────────────────┘
```

- **Employee combobox**: shadcn `<Popover>` + `<Command>` pattern (same as used in forms). Searchable dropdown listing all employees (name + employee code). Placeholder: "All employees". Selecting one sets `employeeId` filter.
- **Status select**: `<Select>` — options: All, Pending, Approved, Rejected. Default: All.
- **Date range**: Two shadcn `<Input type="date">` fields side by side, labelled "From" and "To" (inline labels as `<span>` before each input, `text-xs text-muted-foreground`). Wrap in `<div className="flex items-center gap-1.5">`.
- **Manual only toggle**: shadcn `<Switch>` with label "Manual only" (`text-sm text-foreground`). When on, adds `hasManualSession=true` to the filter.
- `[Clear filters]` link: `<Button variant="ghost" size="sm">` — only visible when any filter is active. Clicking resets all filters to default and returns to page 0.

Filter row: `<div className="flex flex-wrap items-center gap-3">`. On mobile, filters stack. All filters are server-side — changing any filter resets to page 0 and re-fetches.

### 9.3 All Days Table

Full-width, server-side paginated (20 rows per page). Use shadcn DataTable pattern (TanStack Table v8).

#### Columns

| Column | Header | Width | Notes |
|---|---|---|---|
| `date` | Date | `w-36` | Format: "Mon, Mar 31, 2026" |
| `employeeName` | Employee | auto | Name + employment type sublabel (same as Today tab) |
| `totalHours` | Hours | `w-24` | `formatHours(totalHours)`. `"—"` if 0. |
| `dayStatus` | Status | `w-32` | `DayStatusBadge` component (from employee spec — same badge) |
| `flags` | Flags | `w-40` | Flag chips: Late, Overtime, Manual. Same chip spec as employee page. Omit Late/Overtime for part-time rows. |
| `action` | (none) | `w-10` | `ChevronRight` icon |

Clicking a row navigates to `/admin/employees/${employeeId}` (the employee detail page, which has the Working Days tab with approve/reject).

#### Row Behaviour
- `cursor-pointer`, `hover:bg-muted/50`.
- Rows with `dayStatus === "pending"` have a subtle left border: `border-l-2 border-warning`.

### 9.4 Result Summary
Below the filter bar, above the table:
```tsx
<p className="text-xs text-muted-foreground">
  {totalElements === 0 ? "No results" : `${totalElements} day${totalElements !== 1 ? "s" : ""} found`}
</p>
```

### 9.5 Pagination
Same pattern as employee attendance history page (Section 4.6 of `attendance-employee-v2.md`). Page state in `?tab=all-days&page=0` URL param.

"Showing {start}–{end} of {total} days" + [← Previous] [Next →].

### 9.6 Loading State
8 skeleton rows (same pattern as employee spec).

### 9.7 Empty State

No results (query returns 0):
```tsx
<div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-center">
  <CalendarX2 className="h-10 w-10 text-muted-foreground" />
  <p className="text-sm text-foreground font-medium">No days found</p>
  <p className="text-xs text-muted-foreground">Try adjusting your filters.</p>
</div>
```

### 9.8 Error State
Same `<Alert variant="destructive">` pattern as other tabs.

---

## 10. Tab 3 — Pending Review

### 10.1 Purpose
A focused, action-oriented list of working days that need admin attention. Every row has a direct link to the employee detail page where approve/reject lives. The goal is to let the admin clear their queue efficiently.

### 10.2 Data Source
Same `GET /api/admin/attendance/days` endpoint but with `status=pending` hardcoded and not configurable. No additional filters on this tab. Paginated (20 per page).

The `pendingCount` badge on the tab uses `totalElements` from this query.

### 10.3 Layout

No filter bar — this tab is pre-filtered. The tab serves only one purpose: clear the queue.

Above the table, a summary banner:

```tsx
{totalElements > 0 && (
  <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 flex items-center gap-2">
    <Hourglass className="h-4 w-4 text-warning-foreground shrink-0" />
    <p className="text-sm text-foreground">
      <span className="font-semibold">{totalElements}</span>{" "}
      {totalElements === 1 ? "day requires" : "days require"} review.
      Go to each employee's profile to approve or reject.
    </p>
  </div>
)}
```

### 10.4 Pending Review Table

Columns:

| Column | Header | Width | Notes |
|---|---|---|---|
| `date` | Date | `w-36` | "Mon, Mar 31, 2026" |
| `employeeName` | Employee | auto | Name + type sublabel |
| `totalHours` | Hours | `w-24` | `formatHours(totalHours)` |
| `flags` | Flags | `w-32` | Manual chip (always shown if `hasManualSession`). Overtime chip for full-time. No Late chip — pending days are already submitted, lateness is informational only here. |
| `action` | Review | `w-32` | `<Button variant="outline" size="sm">` labelled "Review" with `ExternalLink` icon (14px). Navigates to `/admin/employees/${employeeId}`. This button should stand out — it is the primary action. |

No row click navigation — only the explicit "Review" button navigates. Rows do not have `cursor-pointer`. This is intentional to prevent accidental navigation while the admin is scanning the list.

### 10.5 "Review" Button Behaviour
Navigates to `/admin/employees/${employeeId}` and should ideally scroll the Working Days tab into view. Since TanStack Router navigation does not natively scroll to a tab, append a `?tab=working-days` search param if the employee detail page already supports tab routing via URL (check `employees.md` spec). If not supported, navigating to the employee page is sufficient — the admin can manually open the tab.

### 10.6 Empty State — Queue Clear

When `totalElements === 0`:

```tsx
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
```

This is a positive reinforcement state — use green success colour to make it feel rewarding.

### 10.7 Loading State
5 skeleton rows.

### 10.8 Error State
Same `<Alert variant="destructive">` pattern.

### 10.9 Pagination
Same as other tabs. Page param: `?tab=pending&page=0`.

---

## 11. Shared Components

### `AttendanceTodayStatusChip`
Component: `src/features/attendance/components/AttendanceTodayStatusChip.tsx`
Props: `{ status: "not_started" | "active" | "submitted" | "pending_review" | "approved" }`
Returns the inline chip element. The pulsing dot for `"active"` is internal to this component.

### `DayStatusBadge`
Already specified in `attendance-employee-v2.md`. Import from `@/features/attendance` — do not re-implement. The admin tables use the same badge.

### `DayFlagChips`
Already specified in `attendance-employee-v2.md`. Accepts `employmentType` prop to suppress lateness/overtime for part-time. Import from `@/features/attendance`.

### `formatHours`
Already specified in `attendance-employee-v2.md`. In `src/lib/utils.ts`. Import everywhere.

---

## 12. Query Strategy

All three tabs should use **independent queries** so navigating between tabs does not trigger re-fetches of already-loaded tabs.

| Tab | Query key | Fetch condition |
|---|---|---|
| Today | `QUERY_KEYS.admin.attendanceToday()` | Fetched when the page mounts (not just when Today tab is active). `staleTime: 60_000` (1 min — today's data changes frequently but polling is not needed). |
| All Days | `QUERY_KEYS.admin.attendanceDays(filters)` | Fetched when All Days tab is first activated or when filters change. `staleTime: 30_000`. |
| Pending Review | `QUERY_KEYS.admin.attendanceDays({ status: "pending", page: 0, size: 20 })` | Fetched on page mount (needed for tab badge count). `staleTime: 30_000`. A separate query instance (different `filters` key) from All Days. |

The Pending Review tab's query at `page: 0` with no employee filter gives the count for the badge. When the user navigates to page 2+ of pending, a separate query fires with the new page. The badge count always reads from the `page: 0` result's `totalElements`.

---

## 13. Permissions

The entire page is accessible to both Super Admin and Sub-Admin (the route-level guard is already handled by the admin layout).

Individual approve/reject buttons on the employee detail page are already permission-gated there — this page does not need additional gating.

The "Review" button in the Pending Review tab navigates to the employee detail page for all admins — whether the approve/reject buttons are visible there is the employee detail page's concern, not this page's.

---

## 14. Feature Folder Additions

```
src/features/attendance/
├── api/
│   ├── ...existing...
│   ├── get-admin-today.ts          # GET /api/admin/attendance/today
│   └── get-admin-days.ts           # GET /api/admin/attendance/days (paginated + filtered)
├── hooks/
│   ├── ...existing...
│   ├── use-admin-today-query.ts
│   └── use-admin-days-query.ts     # used by both All Days and Pending Review tabs
├── components/
│   ├── ...existing...
│   ├── AttendanceTodayStatusChip.tsx
│   ├── AdminTodayTable.tsx          # Today tab table
│   ├── AdminAllDaysTable.tsx        # All Days tab table + filters
│   └── AdminPendingTable.tsx        # Pending Review tab table
├── static/
│   ├── ...existing...
│   ├── admin-today.static.ts
│   └── admin-days.static.ts
└── index.ts
```

---

## 15. Handoff Notes for Frontend Developer

1. **Static data first**: both admin API functions (`getAdminToday`, `getAdminDays`) should detect a static mode flag and return static data. Add a `// TODO: Pending backend` comment to both files and remove static mode when the backend delivers.

2. **Tab URL state**: use `?tab=today|all-days|pending` as a search param. Default to `"today"` when absent. Use TanStack Router's `validateSearch` with Zod to type this:
   ```ts
   validateSearch: z.object({
     tab: z.enum(["today", "all-days", "pending"]).optional().default("today"),
     page: z.coerce.number().optional().default(0),
   })
   ```

3. **All Days filters state**: filters (employeeId, status, startDate, endDate, hasManualSession) live in the URL search params — not in component state. This allows sharing filtered URLs. Extend the `validateSearch` schema to include all filter fields.

4. **Employee combobox data**: the All Days employee combobox needs a list of all employees. Reuse the existing `useEmployeesQuery` from `src/features/employees` (the employee list is already fetched on the employees page and cached). Do not create a separate endpoint call.

5. **`pendingCount` badge rendering**: only render the red badge on the tab when the Pending Review query has resolved AND `totalElements > 0`. Do not show "0" badge. Do not show the badge while loading.

6. **`"submitted"` vs `"pending_review"`**: the backend may use either term. Treat both as `"pending_review"` in the frontend — normalise in the API function. Document this in `get-admin-today.ts`.

7. **Today tab refetch**: add `refetchInterval: 60_000` to `useAdminTodayQuery` so the table stays relatively fresh without requiring a manual page refresh. This is important because session state changes frequently during business hours.

8. **Mobile**: the All Days filter bar collapses gracefully with `flex-wrap`. On very small screens, the date range inputs may overflow — consider stacking them vertically inside a `flex-col gap-1` wrapper inside `flex-wrap`.

9. **Active row highlight**: the `border-l-2` accent on `<tr>` requires `relative` on the row and `absolute` on the border element, OR use `border-l-2` directly on the `<tr>` (this works in most browsers with standard HTML tables but requires the table to not use `border-collapse`). Test this visually and adjust if needed.

10. **Navigation to employee detail with tab**: when the "Review" button navigates to `/admin/employees/${employeeId}`, append `?tab=working-days` if and only if the employee detail page's `validateSearch` includes a `tab` param. Check `src/routes/_admin/admin.employees.$employeeId.tsx` before implementing.
