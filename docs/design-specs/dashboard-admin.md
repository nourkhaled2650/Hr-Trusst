# Design Spec — Admin Dashboard

**Date**: 2026-04-01
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation

---

## 1. Overview

The admin dashboard (`/admin`) is the operational command centre for HR staff. It surfaces critical daily signals — who is clocked in, what needs approval, who is on leave — without requiring the admin to navigate into individual modules. Information density is higher than the employee dashboard; admins are desktop users who process data.

This spec covers the **static-data phase**. Widgets that depend on unbuilt backend endpoints (activity log, payroll) render as locked placeholder cards. All other widgets use typed static constants the developer replaces with TanStack Query hooks when the backend delivers.

---

## 2. User Types

- **Super Admin**: full access — all 5 sections visible.
- **Sub-Admin**: same layout. Individual action buttons (approve/reject) are gated by `PERMISSIONS` constants — hidden from DOM when user lacks permission. The dashboard itself is always accessible.

---

## 3. Page Layout

Route file: `src/routes/_admin/admin.index.tsx`

Root wrapper: `<div className="container py-6 space-y-8">`

```
┌──────────────────────────────────────────────────────────────────────┐
│  ADMIN SIDEBAR (dark, fixed)  │  ADMIN NAVBAR (white, fixed, h-14)   │
├───────────────────────────────┴──────────────────────────────────────┤
│  bg-background, min-h-screen, overflow-y-auto                        │
│                                                                      │
│  <div class="container py-6 space-y-8">                              │
│                                                                      │
│  PAGE HEADER                                                         │
│  ─────────────────────────────────────────────────────────────────   │
│  SECTION 1 — TODAY AT A GLANCE                                       │
│    [Attendance Overview — 4 metric cards]                            │
│    [Pending Approvals — 3-row counter card]                          │
│  ─────────────────────────────────────────────────────────────────   │
│  SECTION 2 — WORKFORCE SNAPSHOT                                      │
│    [Headcount card]                                                  │
│    [Employees on Leave Today card]                                   │
│  ─────────────────────────────────────────────────────────────────   │
│  SECTION 3 — PROJECT HOURS HEALTH                                    │
│    [Yesterday's Submission Status card]                              │
│  ─────────────────────────────────────────────────────────────────   │
│  SECTION 4 — PAYROLL STATUS (placeholder)                            │
│  ─────────────────────────────────────────────────────────────────   │
│  SECTION 5 — RECENT ACTIVITY FEED (placeholder)                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Page Header

```tsx
<div className="space-y-1">
  <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
  <p className="text-sm text-muted-foreground">
    {todayFormatted} — here's what's happening today.
  </p>
</div>
```

`todayFormatted`: format `new Date()` as "Tuesday, April 1, 2026" using `Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })`. Evaluated once on render — no reactive clock.

---

## 5. Section 1 — Today at a Glance

```tsx
<section className="space-y-4">
  <h2 className="text-base font-semibold text-foreground">Today at a Glance</h2>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2">
      <AttendanceOverviewCard />
    </div>
    <div>
      <PendingApprovalsCard />
    </div>
  </div>
</section>
```

On `lg`+: `AttendanceOverviewCard` takes 2/3 width; `PendingApprovalsCard` takes 1/3. Below `lg`: stacked full-width.

### 5.1 AttendanceOverviewCard

**File**: `src/features/dashboard/components/AttendanceOverviewCard.tsx`

**Purpose**: Four live metrics on full-time employee attendance today. Each metric is a clickable chip that navigates to a filtered employee list (future — in static phase, chips are visually styled but not yet linked).

**Note on part-time exclusion**: Part-time employees are excluded from all four counts. The "Not clocked in" metric additionally only appears after the grace period has passed (configurable). In static phase, the "not clocked in" card renders unconditionally.

```
┌──────────────────────────────────────────────────────────┐
│  CardHeader                                              │
│  "Attendance Today"          [Users icon]                │
│──────────────────────────────────────────────────────────│
│  CardContent                                             │
│                                                          │
│  ┌──────────────┐ ┌──────────────┐                       │
│  │  22          │ │  17          │                       │
│  │  Total FT    │ │  Clocked In  │                       │
│  └──────────────┘ └──────────────┘                       │
│  ┌──────────────┐ ┌──────────────┐                       │
│  │  3           │ │  5           │                       │
│  │  Active Now  │ │  Not Clocked │                       │
│  └──────────────┘ └──────────────┘                       │
└──────────────────────────────────────────────────────────┘
```

**Grid**: `grid grid-cols-2 gap-3`

**Individual metric chip**:
```tsx
<button
  onClick={() => navigateToFilteredList(metric.filterKey)}
  className="flex flex-col gap-1 p-3 rounded-lg bg-muted
             hover:bg-muted/70 transition-colors text-left
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>
  <span className="text-2xl font-bold text-foreground">{metric.value}</span>
  <span className="text-xs text-muted-foreground">{metric.label}</span>
</button>
```

In static phase, `onClick` is a no-op (`() => {}`). The developer wires navigation when the filtered employee list is built.

**Metrics definition**:

| Metric | Label | `filterKey` | Static value |
|---|---|---|---|
| Total full-time headcount | "Total Full-Time" | `"all_ft"` | 22 |
| Clocked in today (FT only) | "Clocked In Today" | `"clocked_in"` | 17 |
| Active session right now (FT) | "Active Sessions" | `"active_now"` | 3 |
| Not clocked in yet (FT, after grace period) | "Not Clocked In" | `"not_clocked"` | 5 |

**"Not clocked in" visibility**: Show after the configurable grace period. In static phase, always show. When backend integration arrives, hide this chip before the grace period has elapsed (derive from config endpoint).

**Static data**:
```ts
const STATIC_ATTENDANCE_OVERVIEW = {
  totalFullTime: 22,
  clockedIn: 17,
  activeSessions: 3,
  notClockedIn: 5,
};
```

**Loading state**: Full card `<Skeleton>` — `h-[180px] rounded-xl`.

### 5.2 PendingApprovalsCard

**File**: `src/features/dashboard/components/PendingApprovalsCard.tsx`

**Purpose**: Three approval queues in one card. Never hidden — shows a confirmation state when all counts are 0.

```
┌──────────────────────────────────────────────────────────┐
│  CardHeader                                              │
│  "Pending Approvals"         [Bell icon]                 │
│──────────────────────────────────────────────────────────│
│  CardContent                                             │
│                                                          │
│  NORMAL STATE (any > 0):                                 │
│    ─ 4   Manual Sessions     [→ Attendance]             │
│    ─ 7   Working Days        [→ Attendance]             │
│    ─ 3   Leave Requests      [→ Leave]                  │
│                                                          │
│  ALL ZERO STATE:                                         │
│    [CheckCircle icon, success]                           │
│    "All caught up!"                                      │
│    "No pending approvals."                               │
└──────────────────────────────────────────────────────────┘
```

**Item markup** (normal state):
```tsx
<Link
  to={item.to}
  className="flex items-center justify-between py-2.5 border-b border-border
             last:border-0 hover:bg-muted -mx-6 px-6 transition-colors"
>
  <span className="text-sm text-foreground">{item.label}</span>
  <div className="flex items-center gap-2">
    <Badge
      variant={item.count > 0 ? "destructive" : "secondary"}
      className="min-w-[1.5rem] justify-center"
    >
      {item.count}
    </Badge>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </div>
</Link>
```

**Items**:
```ts
const APPROVAL_ITEMS = [
  { label: "Manual Sessions",  count: 4, to: "/admin/attendance" },
  { label: "Working Days",     count: 7, to: "/admin/attendance" },
  { label: "Leave Requests",   count: 3, to: "/admin/leave"      },
] as const;
```

**All-zero state**:
```tsx
<div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
  <CheckCircle2 className="h-8 w-8 text-success" />
  <p className="text-sm font-medium text-foreground">All caught up!</p>
  <p className="text-xs text-muted-foreground">No pending approvals.</p>
</div>
```

All-zero state triggers when all three counts equal 0.

**Badge variant**: `"destructive"` when count > 0, `"secondary"` when count is 0. A zero count badge is still rendered (it communicates completeness).

**Loading state**: 3× `<Skeleton className="h-10 w-full" />` with `space-y-2`.

---

## 6. Section 2 — Workforce Snapshot

```tsx
<section className="space-y-4">
  <h2 className="text-base font-semibold text-foreground">Workforce Snapshot</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <HeadcountCard />
    <EmployeesOnLeaveCard />
  </div>
</section>
```

Two equal-width cards side by side on `md`+, stacked on mobile.

### 6.1 HeadcountCard

**File**: `src/features/dashboard/components/HeadcountCard.tsx`

**Purpose**: Quick headcount split. Read-only — no actions.

```
┌──────────────────────────────────────────────────────────┐
│  CardHeader                                              │
│  "Headcount"                 [Users icon]                │
│──────────────────────────────────────────────────────────│
│  CardContent                                             │
│                                                          │
│  27                                                      │
│  Total employees                                         │
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │  22             │  │  5              │               │
│  │  Full-time      │  │  Part-time      │               │
│  └─────────────────┘  └─────────────────┘               │
└──────────────────────────────────────────────────────────┘
```

**Markup**:
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">Headcount</CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <p className="text-3xl font-bold text-foreground">{total}</p>
      <p className="text-xs text-muted-foreground">Total employees</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: "Full-time", value: fullTime },
        { label: "Part-time", value: partTime },
      ].map(item => (
        <div key={item.label} className="rounded-lg bg-muted p-3">
          <p className="text-xl font-bold text-foreground">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

**Static data**:
```ts
const STATIC_HEADCOUNT = {
  total: 27,
  fullTime: 22,
  partTime: 5,
};
```

**Loading state**: Full card `<Skeleton>` — `h-[180px] rounded-xl`.

### 6.2 EmployeesOnLeaveCard

**File**: `src/features/dashboard/components/EmployeesOnLeaveCard.tsx`

**Purpose**: Names of employees whose approved leave covers today. Max 5 shown + "View all" link.

**Conditions**:
- Only `status === "APPROVED"` leave requests where `startDate <= today <= endDate`.
- Max 5 names shown. If more: "View all (N)" link below the list.
- Empty state if none.

```
┌──────────────────────────────────────────────────────────┐
│  CardHeader                                              │
│  "On Leave Today"            [CalendarDays icon]         │
│──────────────────────────────────────────────────────────│
│  CardContent                                             │
│                                                          │
│  NORMAL STATE:                                           │
│    Ahmed Hassan      Annual Leave                        │
│    Nour El-Din       Sick Leave                          │
│    Sara Mohamed      Annual Leave                        │
│    [View all (3)]                                        │
│                                                          │
│  EMPTY STATE:                                            │
│    [CalendarDays icon]                                   │
│    "No employees on leave today"                         │
└──────────────────────────────────────────────────────────┘
```

**Item markup**:
```tsx
<div className="flex items-center justify-between py-2 border-b border-border last:border-0">
  <div className="flex items-center gap-2">
    <Avatar className="h-6 w-6">
      <AvatarFallback className="text-xs bg-muted text-muted-foreground">
        {initials(employee.name)}
      </AvatarFallback>
    </Avatar>
    <span className="text-sm text-foreground">{employee.name}</span>
  </div>
  <LeaveTypeBadge type={employee.leaveType} />
</div>
```

`initials(name: string)`: first letter of first word + first letter of last word, uppercase. "Ahmed Hassan" → "AH". Single name → first letter only.

**"View all" link** (shown when total > 5):
```tsx
<Link
  to="/admin/leave"
  className="text-xs text-primary font-medium hover:underline mt-1 inline-block"
>
  View all ({totalOnLeave})
</Link>
```

**Empty state**:
```tsx
<div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
  <CalendarDays className="h-8 w-8 text-muted-foreground opacity-50" />
  <p className="text-sm text-muted-foreground">No employees on leave today</p>
</div>
```

**Static data**:
```ts
const STATIC_ON_LEAVE_TODAY = [
  { employeeId: 1, name: "Ahmed Hassan",   leaveType: "PAID"   },
  { employeeId: 2, name: "Nour El-Din",    leaveType: "SICK"   },
  { employeeId: 3, name: "Sara Mohamed",   leaveType: "PAID"   },
];
```

Reuse `LeaveTypeBadge` from `src/features/leave/components/`.

**Loading state**: 3× `<Skeleton className="h-8 w-full" />` with `space-y-2`.

---

## 7. Section 3 — Project Hours Health

```tsx
<section className="space-y-4">
  <h2 className="text-base font-semibold text-foreground">Project Hours Health</h2>
  <YesterdaySubmissionCard />
</section>
```

Single full-width card.

### 7.1 YesterdaySubmissionCard

**File**: `src/features/dashboard/components/YesterdaySubmissionCard.tsx`

**Purpose**: Show yesterday's project hours submission status — who submitted vs. who had hours and didn't. Employees with 0 hours yesterday are excluded from both lists. Missing submissions are clickable (future — no-op in static phase).

```
┌──────────────────────────────────────────────────────────────────┐
│  CardHeader                                                      │
│  "Yesterday's Project Hours — Mar 31"    [FolderKanban icon]    │
│──────────────────────────────────────────────────────────────────│
│  CardContent                                                     │
│                                                                  │
│  ┌─── SUBMITTED (left col) ───┐  ┌─── MISSING (right col) ─────┐│
│  │ 14 employees               │  │ 3 employees                  ││
│  │                            │  │                              ││
│  │  Ahmed Hassan  · 8h        │  │  ⚠ Sara Mohamed              ││
│  │  Nour El-Din   · 6.5h      │  │  ⚠ Khalid Youssef            ││
│  │  …             · …         │  │  ⚠ Mona Ibrahim              ││
│  │  (max 5 shown)             │  │  (all shown — max 10)        ││
│  │  "View all (14)"           │  │                              ││
│  └────────────────────────────┘  └──────────────────────────────┘│
│                                                                  │
│  ALL SUBMITTED STATE:                                            │
│  [CheckCircle icon, success]  "All employees submitted yesterday" │
└──────────────────────────────────────────────────────────────────┘
```

**Layout**: `grid grid-cols-1 md:grid-cols-2 gap-6`

**Left column — Submitted**:
```tsx
<div className="space-y-3">
  <div className="flex items-center gap-2">
    <CheckCircle2 className="h-4 w-4 text-success" />
    <span className="text-sm font-medium text-foreground">
      Submitted — {submittedCount}
    </span>
  </div>
  <div className="space-y-1">
    {submittedList.slice(0, 5).map(emp => (
      <div
        key={emp.employeeId}
        className="flex items-center justify-between text-sm py-1"
      >
        <span className="text-foreground">{emp.name}</span>
        <span className="text-muted-foreground text-xs">{emp.hours}h</span>
      </div>
    ))}
  </div>
  {submittedCount > 5 && (
    <p className="text-xs text-muted-foreground">
      +{submittedCount - 5} more
    </p>
  )}
</div>
```

Submitted list: max 5 shown. A "+N more" text note below (no link needed — no dedicated submitted list page planned).

**Right column — Missing**:
```tsx
<div className="space-y-3">
  <div className="flex items-center gap-2">
    <AlertCircle className="h-4 w-4 text-warning" />
    <span className="text-sm font-medium text-foreground">
      Missing — {missingCount}
    </span>
  </div>
  {missingCount > 0 ? (
    <div className="space-y-1">
      {missingList.slice(0, 10).map(emp => (
        <button
          key={emp.employeeId}
          onClick={() => navigateToEmployee(emp.employeeId)}
          className="flex items-center gap-2 text-sm py-1 w-full text-left
                     hover:text-primary transition-colors"
        >
          <AlertCircle className="h-3 w-3 text-warning shrink-0" />
          <span>{emp.name}</span>
        </button>
      ))}
    </div>
  ) : (
    <p className="text-xs text-muted-foreground">—</p>
  )}
</div>
```

Missing list: max 10 shown. Each name is a `<button>` that navigates to the employee's attendance detail page (no-op in static phase: `onClick={() => {}`).

**All-submitted state** (when `missingCount === 0` AND `submittedCount > 0`):
```tsx
<div className="flex items-center gap-3 py-2">
  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
  <p className="text-sm text-foreground">
    All employees submitted yesterday's hours.
  </p>
</div>
```

**Card title** shows the actual date: "Yesterday's Project Hours — Mar 31". Format: `MMM D` (no year). Use `Intl.DateTimeFormat`.

**Static data**:
```ts
const STATIC_YESTERDAY_SUBMISSIONS = {
  date: "2026-03-31",
  submitted: [
    { employeeId: 1, name: "Ahmed Hassan",    hours: 8   },
    { employeeId: 2, name: "Nour El-Din",     hours: 6.5 },
    { employeeId: 4, name: "Mohamed Ali",     hours: 7   },
    { employeeId: 5, name: "Layla Farouk",    hours: 5.5 },
    { employeeId: 6, name: "Tarek Mansour",   hours: 8   },
    { employeeId: 7, name: "Hana Ramzy",      hours: 4   },
  ],
  missing: [
    { employeeId: 3, name: "Sara Mohamed"     },
    { employeeId: 8, name: "Khalid Youssef"   },
    { employeeId: 9, name: "Mona Ibrahim"     },
  ],
};
```

**Loading state**: Full card `<Skeleton>` — `h-[200px] rounded-xl`.

---

## 8. Section 4 — Payroll Status (Placeholder)

**File**: `src/features/dashboard/components/PayrollPlaceholderCard.tsx`

**Purpose**: Permanent slot in the dashboard grid. Never removed. Locked visual until payroll module is built.

```
┌──────────────────────────────────────────────────────────┐
│  CardHeader                                              │
│  "Payroll Status"            [Wallet icon]               │
│──────────────────────────────────────────────────────────│
│  CardContent                                             │
│                                                          │
│  [lock icon, large, muted]                               │
│  "Payroll module coming soon"                            │
│  "Payslip generation, salary processing, and payroll     │
│   summaries will appear here."                           │
└──────────────────────────────────────────────────────────┘
```

**Markup**:
```tsx
<Card className="border-dashed">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Payroll Status
    </CardTitle>
    <Wallet className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent className="flex flex-col items-center justify-center py-8 gap-3 text-center">
    <div className="rounded-full bg-muted p-3">
      <Lock className="h-5 w-5 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">Payroll module coming soon</p>
      <p className="text-xs text-muted-foreground max-w-[260px]">
        Payslip generation, salary processing, and payroll summaries will appear here.
      </p>
    </div>
  </CardContent>
</Card>
```

`border-dashed` on the `<Card>` visually signals this is a placeholder slot, not missing data. Do not use `opacity` or `grayscale` — the card is intentionally prominent to reserve the layout space.

**This card is never replaced.** When the payroll module is built, it is replaced with a live `PayrollStatusCard` component — the `PayrollPlaceholderCard` file is deleted at that time.

---

## 9. Section 5 — Recent Activity Feed (Placeholder)

**File**: `src/features/dashboard/components/ActivityFeedCard.tsx`

**Purpose**: Placeholder for the last 10 HR events feed. The backend activity log endpoint does not exist yet. The card is shown now so its position is locked in the layout. When the endpoint ships, the static content is replaced with a live query.

```
┌──────────────────────────────────────────────────────────┐
│  CardHeader                                              │
│  "Recent Activity"           [Activity icon]             │
│──────────────────────────────────────────────────────────│
│  CardContent                                             │
│                                                          │
│  [Activity icon, large, muted]                           │
│  "Activity feed coming soon"                             │
│  "HR events (leave requests, approvals, new employees,   │
│   manual sessions) will stream here once the backend     │
│   endpoint is available."                                │
└──────────────────────────────────────────────────────────┘
```

**Markup**:
```tsx
<Card className="border-dashed">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Recent Activity
    </CardTitle>
    <Activity className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent className="flex flex-col items-center justify-center py-8 gap-3 text-center">
    <div className="rounded-full bg-muted p-3">
      <Activity className="h-5 w-5 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">Activity feed coming soon</p>
      <p className="text-xs text-muted-foreground max-w-[300px]">
        HR events — leave requests, approvals, new employees, and flagged sessions — will stream here once the backend endpoint is available.
      </p>
    </div>
  </CardContent>
</Card>
```

**When the backend delivers the activity log endpoint**, replace the placeholder body with a live list. The designed event row format is:

```tsx
<div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
  <div className="rounded-full bg-muted p-1.5 mt-0.5 shrink-0">
    <EventIcon className="h-3 w-3 text-muted-foreground" />
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm text-foreground leading-snug">{event.description}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{relativeTime(event.createdAt)}</p>
  </div>
  <Link to={event.recordUrl} className="text-xs text-primary hover:underline shrink-0">
    View
  </Link>
</div>
```

Event icon mapping (for future use):

| Event type | Icon |
|---|---|
| New employee | `UserPlus` |
| Leave submitted | `CalendarPlus` |
| Leave approved/rejected | `CalendarCheck` / `CalendarX` |
| Day approved/rejected | `CheckSquare` / `XSquare` |
| Manual session flagged | `AlertTriangle` |

---

## 10. Full-Page Layout — Final Assembly

```tsx
// src/routes/_admin/admin.index.tsx
export function AdminDashboard() {
  return (
    <div className="container py-6 space-y-8">
      {/* Header */}
      <PageHeader />

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Today at a Glance
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AttendanceOverviewCard />
          </div>
          <PendingApprovalsCard />
        </div>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Workforce Snapshot
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HeadcountCard />
          <EmployeesOnLeaveCard />
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Project Hours Health
        </h2>
        <YesterdaySubmissionCard />
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Payroll Status
        </h2>
        <PayrollPlaceholderCard />
      </section>

      {/* Section 5 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Recent Activity
        </h2>
        <ActivityFeedCard />
      </section>
    </div>
  );
}
```

---

## 11. Component Inventory

### New files to create

| File | Description |
|---|---|
| `src/routes/_admin/admin.index.tsx` | Admin dashboard route |
| `src/features/dashboard/components/AttendanceOverviewCard.tsx` | 4-metric attendance grid |
| `src/features/dashboard/components/PendingApprovalsCard.tsx` | 3-row approval counters |
| `src/features/dashboard/components/HeadcountCard.tsx` | Total/FT/PT headcount |
| `src/features/dashboard/components/EmployeesOnLeaveCard.tsx` | Today's leave list |
| `src/features/dashboard/components/YesterdaySubmissionCard.tsx` | Project hours submitted vs missing |
| `src/features/dashboard/components/PayrollPlaceholderCard.tsx` | Locked payroll slot |
| `src/features/dashboard/components/ActivityFeedCard.tsx` | Placeholder activity feed |
| `src/features/dashboard/index.ts` | Barrel export (shared with employee dashboard) |

### Existing files reused (no changes)

| File | Reused as |
|---|---|
| `src/features/leave/components/LeaveTypeBadge` | EmployeesOnLeaveCard rows |

### shadcn components required

`Card`, `CardHeader`, `CardTitle`, `CardContent`, `Badge`, `Alert`, `AlertDescription`, `Avatar`, `AvatarFallback`, `Skeleton`, `Button`, `Progress`

All should already be installed. Verify in `src/components/ui/` before building.

### lucide-react icons required

`Users`, `Bell`, `CalendarDays`, `FolderKanban`, `CheckCircle2`, `AlertCircle`, `AlertTriangle`, `Wallet`, `Lock`, `Activity`, `ChevronRight`, `UserPlus`, `CalendarPlus`, `CalendarCheck`, `CalendarX`

---

## 12. Handoff Notes

1. **Route file**: Admin dashboard is `src/routes/_admin/admin.index.tsx`. The existing `src/routes/_admin.tsx` wrapper handles auth guard and sidebar layout. The route is accessed at `/admin`. Confirm the TanStack Router file-based route maps `admin.index.tsx` to the `/admin` exact path.

2. **`features/dashboard/`**: Both employee and admin dashboards share the `src/features/dashboard/` feature folder. The barrel `index.ts` should export only the components actually consumed by route files — do not re-export everything.

3. **Clickable metrics in AttendanceOverviewCard**: In static phase, `onClick` is a no-op. When the filtered employee list page exists, wire `onClick` to navigate with a query param (e.g., `/admin/employees?filter=not_clocked`). The `filterKey` is already stubbed into the data definition for this reason.

4. **Sub-Admin access to approvals**: `PendingApprovalsCard` shows approval counts to all admins. The links navigate to the feature pages where the actual approve/reject buttons are gated by `PERMISSIONS`. No permission gate on the count display itself.

5. **YesterdaySubmissionCard — missing employee navigation**: In static phase, clicking a missing employee name does nothing. When employee detail pages exist, navigate to `/admin/employees/{employeeId}/attendance`.

6. **Date of "yesterday"**: `YesterdaySubmissionCard` title shows yesterday's date computed from `new Date()`. Use `new Date(Date.now() - 86400000)` and format with `Intl.DateTimeFormat`. Do not hardcode a date string.

7. **`initials` helper**: Define in `src/lib/utils.ts`. Takes a full name string, returns 1–2 uppercase letters. Handle edge cases: empty string → "?", single word → first letter only.

8. **Placeholder cards use `border-dashed`**: This is a visual convention for "slot reserved, content coming". Both `PayrollPlaceholderCard` and `ActivityFeedCard` use it. Do not apply it to any data card.

9. **Section `<h2>` tags**: Each section heading uses `text-base font-semibold text-foreground`. This is consistent with the admin leave page heading style.

10. **Static data phase discipline**: Every static constant must be typed. Use `as const` where the values drive type inference. No `any`. The developer should be able to delete the static constant and drop in a `useQuery` hook return value with zero type errors.

11. **`Activity` icon**: This is `Activity` from lucide-react (a waveform/pulse icon). Do not confuse with `ActivitySquare`.

12. **`LeaveTypeBadge` in `EmployeesOnLeaveCard`**: This badge maps `"PAID" | "SICK" | "UNPAID"` to display labels. The same component is used on the employee leave page — import from `src/features/leave/components/` via the barrel `index.ts`.
