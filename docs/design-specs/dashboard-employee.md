# Design Spec — Employee Dashboard

**Date**: 2026-04-01
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation

---

## 1. Overview

The employee dashboard (`/`) is the first screen every employee sees after login. It surfaces the most time-sensitive information — session state, hours worked today, leave balances, lateness — without requiring navigation. The design prioritises daily-use simplicity over information density.

This spec covers the **static-data phase**. Widgets that depend on unbuilt backend endpoints render as locked placeholder cards. All other widgets use typed static constants that the developer replaces with TanStack Query hooks when the backend delivers.

---

## 2. Employment Type Branching

The page content varies by employment type:

| Section | Full-time | Part-time |
|---|---|---|
| Section 1 — Today's Attendance | Shown | Shown |
| Section 2 — Leave Status | Shown | **Hidden** |
| Section 3 — Monthly Lateness Balance | Shown | **Hidden** |
| Section 4 — Quick Links | Shown | Shown |

The employment type comes from `SessionUser`. In the static phase, read from a local constant. In production, derive from the session user's `employmentType` field (once the backend exposes it on the session endpoint — treat as `"FULL_TIME"` for now so all sections render during static build).

---

## 3. Page Layout

Route file: `src/routes/_employee/index.tsx`

Root wrapper: `<div className="container py-6 space-y-6">`

```
┌──────────────────────────────────────────────────────────────────┐
│  EMPLOYEE NAVBAR (fixed, h-14)                                   │
├──────────────────────────────────────────────────────────────────┤
│  bg-background (neutral-50), pt-14, min-h-screen                 │
│                                                                  │
│  <div class="container py-6 space-y-6">                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  PAGE HEADER                                               │  │
│  │  "Good morning, [first name]"  h1                         │  │
│  │  "Here's your day at a glance."  p                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  SECTION 1 — TODAY'S ATTENDANCE                            │  │
│  │  ┌──────────────────────────┐  ┌─────────────────────────┐│  │
│  │  │  SessionWidget (reused)  │  │  Today's Hours Summary  ││  │
│  │  │  (existing component)    │  │  (new card)             ││  │
│  │  └──────────────────────────┘  └─────────────────────────┘│  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Project Hours Status (conditionally shown)          │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  SECTION 2 — LEAVE STATUS (full-time only)                 │  │
│  │  ┌─────────────────────────────┐  ┌──────────────────────┐│  │
│  │  │  Leave Balance              │  │  Upcoming / Pending  ││  │
│  │  │  (3 balance mini-cards)     │  │  Requests            ││  │
│  │  └─────────────────────────────┘  └──────────────────────┘│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  SECTION 3 — MONTHLY LATENESS BALANCE (full-time only)     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  SECTION 4 — QUICK LINKS                                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Page Header

```tsx
<div className="space-y-1">
  <h1 className="text-2xl font-semibold text-foreground">
    Good {timeOfDayGreeting}, {user.firstName ?? user.username}
  </h1>
  <p className="text-sm text-muted-foreground">
    Here's your day at a glance.
  </p>
</div>
```

**Greeting logic** (pure function, no library):
- 05:00–11:59 → "Good morning"
- 12:00–17:59 → "Good afternoon"
- 18:00–04:59 → "Good evening"

Use `new Date().getHours()` evaluated once on render — no reactive updates.

If `user.firstName` is available use it; otherwise fall back to `user.username`. This is a display string only.

---

## 5. Section 1 — Today's Attendance

### 5.1 Layout

Two-column grid on `md`+, stacked on mobile:

```tsx
<section className="space-y-4">
  <h2 className="text-base font-semibold text-foreground">
    Today's Attendance
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Left: SessionWidget */}
    {/* Right: TodaysHoursSummaryCard */}
  </div>
  {/* Below the grid: ProjectHoursStatusCard (conditional) */}
</section>
```

### 5.2 SessionWidget

**Reuse verbatim.** Import from `src/features/attendance/components/SessionWidget`.

No changes to the component. No prop overrides. Place it as the left card in the grid.

The `SessionWidget` is already connected to E1 (`GET /api/attendance/session/status`) and manages its own query. No data needs to be passed into it from the dashboard.

### 5.3 TodaysHoursSummaryCard

**File**: `src/features/dashboard/components/TodaysHoursSummaryCard.tsx`

**Purpose**: Shows total hours accumulated today (closed sessions only). Does not count the running session until it is closed.

**Component**: shadcn `<Card>` with header and content.

```
┌─────────────────────────────────────────┐
│  CardHeader                             │
│  "Today's Hours"          [Clock icon]  │
│─────────────────────────────────────────│
│  CardContent                            │
│                                         │
│  FULL-TIME:                             │
│    4.5 / 8.5 h                          │  ← large number
│    [progress bar]                       │
│    "Target: 8.5 hours"   subdued text   │
│                                         │
│  PART-TIME:                             │
│    4.5 h                                │  ← large number
│    "Hours logged today"  subdued text   │
└─────────────────────────────────────────┘
```

**Markup**:
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Today's Hours
    </CardTitle>
    <Clock className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    {/* Full-time */}
    <div className="flex items-baseline gap-1.5">
      <span className="text-3xl font-bold text-foreground">{hoursLogged}</span>
      <span className="text-sm text-muted-foreground">/ {targetHours} h</span>
    </div>
    <Progress
      value={Math.min((hoursLogged / targetHours) * 100, 100)}
      className="mt-3 h-1.5"
    />
    <p className="text-xs text-muted-foreground mt-2">
      Target: {targetHours} hours
    </p>

    {/* Part-time — replaces above */}
    <div className="flex items-baseline gap-1.5">
      <span className="text-3xl font-bold text-foreground">{hoursLogged}</span>
      <span className="text-sm text-muted-foreground">h</span>
    </div>
    <p className="text-xs text-muted-foreground mt-2">Hours logged today</p>
  </CardContent>
</Card>
```

**Progress bar color** (full-time only):

| Condition | `indicatorClassName` |
|---|---|
| `hoursLogged / targetHours < 0.5` | `bg-muted-foreground` (neutral — still early in day) |
| `hoursLogged / targetHours >= 0.5 and < 1` | `bg-primary` (on track) |
| `hoursLogged >= targetHours` | `bg-success` (target met) |

**Static data** (replace with TanStack Query hook when backend endpoint is available):
```ts
const STATIC_HOURS_SUMMARY = {
  hoursLogged: 4.5,
  targetHours: 8.5,   // from payroll config — never hardcode in production
  employmentType: "FULL_TIME" as "FULL_TIME" | "PART_TIME",
};
```

**Conditions**:
- The running active session's duration is NOT included — only closed sessions count. This is intentional per product decision.
- If `hoursLogged === 0` and no session is active: show `0.0` — do not show empty state.
- `targetHours` is a configurable system value. In production, pull it from the payroll/config endpoint.

**Loading state**: Full card `<Skeleton>` — `h-[140px] rounded-xl`.

### 5.4 ProjectHoursStatusCard

**File**: `src/features/dashboard/components/ProjectHoursStatusCard.tsx`

**Visibility rules** (all must be true to show):
1. Employee has at least 1 active project assignment.
2. Session is NOT currently active (derived from E1 `startTime !== null`).

If either condition is false, render `null` — no placeholder, no collapsed state.

**Purpose**: Quick signal on whether the employee has submitted today's project hours. CTA to the log page if not.

**Two sub-states**:

**State A — Not yet submitted:**
```
┌───────────────────────────────────────────────────────────────┐
│  CardHeader                                                   │
│  "Project Hours"                      [FolderKanban icon]     │
│───────────────────────────────────────────────────────────────│
│  CardContent                                                  │
│                                                               │
│  [AlertCircle icon, warning color]                            │
│  "You haven't logged today's project hours yet."              │
│  [Button] "Log Hours →"                                       │
└───────────────────────────────────────────────────────────────┘
```

**State B — Already submitted:**
```
┌───────────────────────────────────────────────────────────────┐
│  CardHeader                                                   │
│  "Project Hours"                      [CheckCircle icon]      │
│───────────────────────────────────────────────────────────────│
│  CardContent                                                  │
│                                                               │
│  [CheckCircle icon, success color]                            │
│  "Logged today"                                               │
│  Breakdown: "Project A · 3h, Project B · 1.5h"               │
└───────────────────────────────────────────────────────────────┘
```

**Markup (State A)**:
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Project Hours
    </CardTitle>
    <AlertCircle className="h-4 w-4 text-warning" />
  </CardHeader>
  <CardContent className="space-y-3">
    <p className="text-sm text-muted-foreground">
      You haven't logged today's project hours yet.
    </p>
    <Button variant="default" size="sm" asChild>
      <Link to="/attendance/log">Log Hours</Link>
    </Button>
  </CardContent>
</Card>
```

**Markup (State B)**:
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Project Hours
    </CardTitle>
    <CheckCircle2 className="h-4 w-4 text-success" />
  </CardHeader>
  <CardContent className="space-y-2">
    <p className="text-sm font-medium text-foreground">Logged today</p>
    <p className="text-xs text-muted-foreground">
      {entries.map(e => `${e.projectName} · ${e.hours}h`).join(", ")}
    </p>
  </CardContent>
</Card>
```

**Static data**:
```ts
const STATIC_PROJECT_HOURS = {
  submitted: false,
  hasAssignments: true,
  entries: [
    { projectName: "Project Alpha", hours: 3 },
    { projectName: "Project Beta", hours: 1.5 },
  ],
};
```

**Loading state**: Full card `<Skeleton>` — `h-[120px] rounded-xl`.

---

## 6. Section 2 — Leave Status (full-time only)

Render `null` for part-time employees. No placeholder card.

### 6.1 Layout

```tsx
<section className="space-y-4">
  <h2 className="text-base font-semibold text-foreground">Leave Status</h2>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2">
      <LeaveBalanceCard />
    </div>
    <div>
      <UpcomingLeaveCard />
    </div>
  </div>
</section>
```

On `lg`+ screens: `LeaveBalanceCard` takes 2/3 width, `UpcomingLeaveCard` takes 1/3. On smaller screens both stack full-width.

### 6.2 LeaveBalanceCard

**File**: `src/features/dashboard/components/LeaveBalanceCard.tsx`

**Purpose**: Three mini balance indicators in one card. Always shown even if all balances are 0.

```
┌──────────────────────────────────────────────────────────────┐
│  CardHeader                                                  │
│  "Leave Balance"                                             │
│──────────────────────────────────────────────────────────────│
│  CardContent                                                 │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Annual        │  │  Sick          │  │  Unpaid        │  │
│  │  15 remaining  │  │  8 remaining   │  │  5 remaining   │  │
│  │  of 20 days    │  │  of 10 days    │  │  of 5 days     │  │
│  │  [progress]    │  │  [progress]    │  │  [progress]    │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
│                                                              │
│  "View all leave →" [link]                                   │
└──────────────────────────────────────────────────────────────┘
```

**Markup**:
```tsx
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Leave Balance
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      {LEAVE_BALANCES.map(balance => (
        <div key={balance.type} className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{balance.label}</p>
          <p className="text-xl font-bold text-foreground">{balance.remaining}</p>
          <p className="text-xs text-muted-foreground">of {balance.total} days</p>
          <Progress
            value={(balance.used / balance.total) * 100}
            className="h-1"
            indicatorClassName={progressColor(balance.used, balance.total)}
          />
        </div>
      ))}
    </div>
    <Link
      to="/leave"
      className="text-xs text-primary font-medium hover:underline"
    >
      View all leave →
    </Link>
  </CardContent>
</Card>
```

**Progress color** (same thresholds as leave.md spec):

| `used / total` | `indicatorClassName` |
|---|---|
| < 0.5 | `bg-success` |
| >= 0.5 and < 0.8 | `bg-warning` |
| >= 0.8 | `bg-destructive` |

**Static data**:
```ts
const LEAVE_BALANCES = [
  { type: "PAID",   label: "Annual",  total: 20, used: 5  },
  { type: "SICK",   label: "Sick",    total: 10, used: 2  },
  { type: "UNPAID", label: "Unpaid",  total: 5,  used: 0  },
] as const;
```

`remaining = total - used`. Never render negative remaining — clamp at 0.

**Zero balance**: Show `0` as the big number. No special visual change — the depleted progress bar communicates the state.

**Loading state**: Full card `<Skeleton>` — `h-[160px] rounded-xl`.

### 6.3 UpcomingLeaveCard

**File**: `src/features/dashboard/components/UpcomingLeaveCard.tsx`

**Purpose**: Shows the next 3 leave requests that are either PENDING or APPROVED and start within 30 days of today. Sorted by `startDate` ascending.

**Conditions**:
- Requests shown: `status === "PENDING" OR (status === "APPROVED" AND startDate <= today + 30 days)`
- Max items: 3
- Empty state: rendered when 0 qualifying requests

```
┌───────────────────────────────────────────────────┐
│  CardHeader                                       │
│  "Upcoming & Pending"                             │
│───────────────────────────────────────────────────│
│  CardContent                                      │
│                                                   │
│  [item] Mar 15 – Mar 19  Annual  PENDING          │
│  [item] Apr 2 – Apr 5    Sick    APPROVED         │
│  [item] Apr 20           Annual  PENDING          │
│                                                   │
│  — or —                                           │
│                                                   │
│  [CalendarDays icon]                              │
│  "No upcoming leave requests"                     │
└───────────────────────────────────────────────────┘
```

**Item markup**:
```tsx
<div className="flex items-center justify-between py-2 border-b border-border last:border-0">
  <div className="space-y-0.5">
    <p className="text-sm font-medium text-foreground">
      {formatDateRange(req.startDate, req.endDate)}
    </p>
    <p className="text-xs text-muted-foreground">{req.totalDays} day{req.totalDays !== 1 ? "s" : ""}</p>
  </div>
  <div className="flex items-center gap-2">
    <LeaveTypeBadge type={req.leaveType} />
    <LeaveStatusBadge status={req.status} />
  </div>
</div>
```

Reuse `LeaveTypeBadge` and `LeaveStatusBadge` from `src/features/leave/components/`.

**Date format**: "Mar 15 – 19" when same month, "Mar 15 – Apr 5" when different months. Single-day: "Mar 15".

**Empty state**:
```tsx
<div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
  <CalendarDays className="h-8 w-8 text-muted-foreground opacity-50" />
  <p className="text-sm text-muted-foreground">No upcoming leave requests</p>
</div>
```

**Static data**:
```ts
const STATIC_UPCOMING_LEAVE: LeaveRequest[] = [
  {
    leaveRequestId: 1,
    leaveType: "PAID",
    startDate: "2026-04-15",
    endDate: "2026-04-19",
    totalDays: 5,
    status: "PENDING",
    reason: "Vacation",
  },
  {
    leaveRequestId: 2,
    leaveType: "SICK",
    startDate: "2026-04-22",
    endDate: "2026-04-22",
    totalDays: 1,
    status: "APPROVED",
    reason: null,
  },
];
```

**Loading state**: 3 skeleton rows — `<Skeleton className="h-10 w-full" />` × 3 with `space-y-2`.

---

## 7. Section 3 — Monthly Lateness Balance (full-time only)

Render `null` for part-time employees. No placeholder card.

**File**: `src/features/dashboard/components/LatenessBalanceCard.tsx`

**Purpose**: Shows how much lateness grace the employee has remaining this month. Limits are configurable — never hardcode the threshold value.

```
┌──────────────────────────────────────────────────────────────┐
│  CardHeader                                                  │
│  "Monthly Lateness Balance"          [Timer icon]            │
│──────────────────────────────────────────────────────────────│
│  CardContent                                                 │
│                                                              │
│  NORMAL STATE:                                               │
│    4 h 15 m remaining                  (large)              │
│    of 6 h monthly limit               (subdued)             │
│    [progress bar — fills as lateness accumulates]           │
│    "1 h 45 m used this month"          (caption)            │
│                                                              │
│  WARNING STATE (0 remaining):                               │
│    [Alert] "Lateness balance exhausted. Additional lateness  │
│     will be deducted from your salary."                     │
│    0 h 0 m remaining                                        │
│    of 6 h monthly limit                                     │
│    [progress bar — 100% full, destructive color]            │
└──────────────────────────────────────────────────────────────┘
```

**Markup**:
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Monthly Lateness Balance
    </CardTitle>
    <Timer className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent className="space-y-3">
    {exhausted && (
      <Alert variant="destructive" className="py-2 px-3">
        <AlertDescription className="text-xs">
          Lateness balance exhausted. Additional lateness will be deducted from your salary.
        </AlertDescription>
      </Alert>
    )}
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-foreground">
          {formatHoursMinutes(remainingMinutes)}
        </span>
        <span className="text-sm text-muted-foreground">remaining</span>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">
        of {formatHoursMinutes(limitMinutes)} monthly limit
      </p>
    </div>
    <Progress
      value={Math.min((usedMinutes / limitMinutes) * 100, 100)}
      className="h-1.5"
      indicatorClassName={exhausted ? "bg-destructive" : usedMinutes / limitMinutes >= 0.75 ? "bg-warning" : "bg-primary"}
    />
    <p className="text-xs text-muted-foreground">
      {formatHoursMinutes(usedMinutes)} used this month
    </p>
  </CardContent>
</Card>
```

**`formatHoursMinutes(minutes: number): string`** helper:
- 105 → "1 h 45 m"
- 60 → "1 h"
- 30 → "30 m"
- 0 → "0 m"

**Progress bar fills as lateness accumulates** (left = clean, right = late). Bar represents `usedMinutes / limitMinutes`.

**Color thresholds**:

| `used / limit` | `indicatorClassName` |
|---|---|
| < 0.75 | `bg-primary` |
| >= 0.75 | `bg-warning` |
| >= 1.0 (exhausted) | `bg-destructive` |

**`exhausted`**: `remainingMinutes <= 0`.

**Static data**:
```ts
const STATIC_LATENESS = {
  usedMinutes: 105,      // 1 h 45 m
  limitMinutes: 360,     // 6 h — from config, never hardcoded in production
  remainingMinutes: 255, // 4 h 15 m
};
```

**Loading state**: Full card `<Skeleton>` — `h-[160px] rounded-xl`.

---

## 8. Section 4 — Quick Links

**File**: `src/features/dashboard/components/QuickLinksCard.tsx`

**Purpose**: One-tap navigation to the most frequent employee destinations. My Payslips is hidden until the payroll module is built.

```
┌──────────────────────────────────────────────────────────────┐
│  CardHeader                                                  │
│  "Quick Links"                                               │
│──────────────────────────────────────────────────────────────│
│  CardContent                                                 │
│                                                              │
│  [Clock]  Log Today's Hours    →                            │
│  [CalendarDays]  Leave Requests    →                        │
│  [History]  Attendance History    →                         │
│  [Receipt]  My Payslips  [COMING SOON badge]                │
└──────────────────────────────────────────────────────────────┘
```

**Markup**:
```tsx
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Quick Links
    </CardTitle>
  </CardHeader>
  <CardContent className="p-0">
    <nav>
      {QUICK_LINKS.map(link => (
        <Link
          key={link.label}
          to={link.to}
          className="flex items-center gap-3 px-6 py-3 hover:bg-muted
                     border-b border-border last:border-0 group transition-colors"
        >
          <link.Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground flex-1">
            {link.label}
          </span>
          {link.badge && (
            <Badge variant="secondary" className="text-xs">
              {link.badge}
            </Badge>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ))}
    </nav>
  </CardContent>
</Card>
```

**Links definition**:
```ts
const QUICK_LINKS = [
  {
    label: "Log Today's Hours",
    to: "/attendance/log",
    Icon: Clock,
    badge: null,
  },
  {
    label: "Leave Requests",
    to: "/leave",
    Icon: CalendarDays,
    badge: null,
  },
  {
    label: "Attendance History",
    to: "/attendance",
    Icon: History,
    badge: null,
  },
  // My Payslips: render only when payroll module is live
  // Omit from this array entirely in static phase
  // {
  //   label: "My Payslips",
  //   to: "/payslips",
  //   Icon: Receipt,
  //   badge: "Coming Soon",
  // },
] as const;
```

My Payslips is **omitted entirely** from the array in the static phase. When the payroll module is built, uncomment it. Do not render a disabled or greyed-out row.

Icons: `Clock`, `CalendarDays`, `History`, `ChevronRight` from lucide-react.

---

## 9. Loading States

All cards use `<Skeleton>` during data fetching (future state — static phase shows data immediately):

| Card | Skeleton height |
|---|---|
| TodaysHoursSummaryCard | `h-[140px]` |
| ProjectHoursStatusCard | `h-[120px]` |
| LeaveBalanceCard | `h-[160px]` |
| UpcomingLeaveCard | 3× `h-10` rows |
| LatenessBalanceCard | `h-[160px]` |

Wrap each card's loading skeleton in `rounded-xl`.

---

## 10. Component Inventory

### New files to create

| File | Description |
|---|---|
| `src/routes/_employee/index.tsx` | Dashboard route — new file |
| `src/features/dashboard/components/TodaysHoursSummaryCard.tsx` | Hours summary card |
| `src/features/dashboard/components/ProjectHoursStatusCard.tsx` | Project hours status |
| `src/features/dashboard/components/LeaveBalanceCard.tsx` | Leave balance 3-column mini-card |
| `src/features/dashboard/components/UpcomingLeaveCard.tsx` | Upcoming/pending requests list |
| `src/features/dashboard/components/LatenessBalanceCard.tsx` | Monthly lateness balance |
| `src/features/dashboard/components/QuickLinksCard.tsx` | Quick navigation links |
| `src/features/dashboard/index.ts` | Barrel export for all dashboard components |

### Existing files reused (no changes)

| File | Reused as |
|---|---|
| `src/features/attendance/components/SessionWidget` | Placed verbatim in Section 1 left column |
| `src/features/leave/components/LeaveTypeBadge` | Used in UpcomingLeaveCard rows |
| `src/features/leave/components/LeaveStatusBadge` | Used in UpcomingLeaveCard rows |

### shadcn components required

`Card`, `CardHeader`, `CardTitle`, `CardContent`, `Progress`, `Badge`, `Alert`, `AlertDescription`, `Skeleton`, `Button`

All should already be installed. Verify in `src/components/ui/` before building.

### lucide-react icons required

`Clock`, `CalendarDays`, `CheckCircle2`, `AlertCircle`, `Timer`, `History`, `ChevronRight`, `FolderKanban`

---

## 11. Handoff Notes

1. **Route file**: The employee dashboard is the root authenticated route (`/`). The existing `src/routes/_employee.tsx` wrapper handles auth guard and layout. Create `src/routes/_employee/index.tsx` (not `_employee.tsx`).

2. **SessionWidget**: Import exactly as-is. Do not wrap it in an additional `<Card>` — the component renders its own card shell. The grid cell simply holds it.

3. **Employment type**: In the static phase, default to `"FULL_TIME"` so all four sections render. The developer must not hide sections 2 and 3 during static build — they are needed for visual verification. When TanStack Query hooks are wired, derive type from the session or employee record.

4. **Part-time**: Sections 2 and 3 render `null` — not `hidden`, not `opacity-0`. They are completely absent from the DOM.

5. **Progress component**: The `indicatorClassName` prop is a custom addition to the shadcn `Progress` in this codebase (used in the leave spec). Confirm the prop exists on `src/components/ui/progress.tsx` before using it here.

6. **formatHoursMinutes utility**: Define in `src/lib/utils.ts` or a dashboard-local `utils.ts`. Do not inline the logic inside the component.

7. **Configurable values**: `targetHours` (daily target) and `limitMinutes` (lateness limit) come from the payroll/config endpoint. In production, both are fetched via TanStack Query. During static phase, declare them as named constants at the top of each component file — never inline magic numbers in JSX.

8. **ProjectHoursStatusCard hide logic**: The card is hidden if `sessionActive === true` OR `hasAssignments === false`. In static phase, hardcode `sessionActive = false` and `hasAssignments = true` so the card is visible for layout verification.

9. **"Log Hours" button**: Must navigate to `/attendance/log` with today's date pre-selected. In static phase, `<Link to="/attendance/log">` is sufficient.

10. **Leave type labels**: The API returns `"PAID"`, `"SICK"`, `"UNPAID"`. The display labels ("Annual", "Sick", "Unpaid") are a frontend mapping. Keep this mapping in a constant (`LEAVE_TYPE_LABELS`) in `src/features/dashboard/components/LeaveBalanceCard.tsx`, not inline JSX.
