# Design Spec — Employee Attendance History & Day Detail (V2)

**Date**: 2026-04-01
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation
**Replaces**: `src/routes/_employee/attendance.tsx` (the legacy raw-sessions history page)

---

## 1. Overview

This spec covers two new screens that together replace the legacy attendance history page:

1. **Attendance History Page** (`/_employee/attendance/`) — paginated list of all working days, newest first, with quick-scan status badges and flag chips.
2. **Day Detail Page** (`/_employee/attendance/$date`) — full record for a single day: sessions timeline, project hour allocations, day-level stats, and re-entry CTA for rejected days.

The `SessionWidget` (navbar) and the Project Hours Log page (`/attendance/log`) are **not changed**.

---

## 2. Routes

| Route | File | Purpose |
|---|---|---|
| `/_employee/attendance/` | `src/routes/_employee/attendance.index.tsx` | History list — replaces the current `attendance.tsx` |
| `/_employee/attendance/$date` | `src/routes/_employee/attendance.$date.tsx` | Day detail — new route |

The `$date` segment is a `YYYY-MM-DD` string. The route file uses TanStack Router's `createFileRoute` with a `parseParams` / `validateSearch` to type the param as `string`.

---

## 3. API Endpoints Used

### Existing (available now)
| # | Method | Path | Purpose |
|---|---|---|---|
| E4 | GET | `/api/attendance/day-summary?date=YYYY-MM-DD` | Used on the day detail page to get current lock status |
| E10 | GET | `/api/project-hours/my?date=YYYY-MM-DD` | Project hour entries for a locked day |

### Pending backend (mark as static-data-only until delivered)

**`GET /api/attendance/my/days`**
Query params: `page` (0-indexed), `size` (default 20)
Response:
```ts
{
  content: Array<{
    dayId: number;
    date: string;               // YYYY-MM-DD
    totalHours: number;
    dayStatus: "open" | "pending" | "approved" | "rejected";
    hasManualSession: boolean;
    overtimeHours: number;      // 0 if none
    latenessMinutes: number;    // 0 if none; always 0 for part-time
  }>;
  totalElements: number;
  totalPages: number;
  number: number;               // current page (0-indexed)
  size: number;
}
```

**`GET /api/attendance/my/day/{date}`**
Response:
```ts
{
  date: string;                 // YYYY-MM-DD
  totalHours: number;
  dayStatus: "open" | "pending" | "approved" | "rejected";
  hasManualSession: boolean;
  latenessMinutes: number;      // 0 for part-time or on-time
  overtimeHours: number;        // 0 if none
  sessions: Array<{
    startTime: string;          // ISO-8601
    endTime: string | null;     // null if session still open
    durationHours: number;
    isManual: boolean;
  }>;
  projectEntries: Array<{
    projectName: string;
    hours: number;
    notes: string | null;
  }>;
}
```

### Query Keys (add to `src/constants/query-keys.ts`)
```ts
attendance: {
  // ... existing keys ...
  myDays: (page: number) => ["attendance", "my", "days", page],
  myDayDetail: (date: string) => ["attendance", "my", "day", date],
}
```

### Static data shape for development
Use this typed constant in the route file while the backend is pending:

```ts
// src/features/attendance/static/my-days.static.ts
import type { WorkingDayRow } from "@/features/attendance/types";

export const STATIC_MY_DAYS: WorkingDayRow[] = [
  { dayId: 101, date: "2026-03-31", totalHours: 9.25, dayStatus: "approved",  hasManualSession: false, overtimeHours: 1.25, latenessMinutes: 0 },
  { dayId: 100, date: "2026-03-30", totalHours: 8.0,  dayStatus: "pending",   hasManualSession: true,  overtimeHours: 0,    latenessMinutes: 0 },
  { dayId: 99,  date: "2026-03-27", totalHours: 7.5,  dayStatus: "approved",  hasManualSession: false, overtimeHours: 0,    latenessMinutes: 12 },
  { dayId: 98,  date: "2026-03-26", totalHours: 0,    dayStatus: "rejected",  hasManualSession: true,  overtimeHours: 0,    latenessMinutes: 0 },
  { dayId: 97,  date: "2026-03-25", totalHours: 8.0,  dayStatus: "approved",  hasManualSession: false, overtimeHours: 0,    latenessMinutes: 0 },
];
```

---

## 4. Screen 1 — Attendance History Page

### 4.1 Purpose
Give the employee a fast, scannable view of all their working days. The primary need is to spot any pending or rejected days that need action and to browse recent history.

### 4.2 User Type
Employees only (employee layout, white navbar, no sidebar).

### 4.3 Layout

```
┌────────────────────────────────────────────────────────────────┐
│  EMPLOYEE NAVBAR (fixed, h-14) — title: "Attendance"           │
├────────────────────────────────────────────────────────────────┤
│  bg-background, pt-14, px-4 md:px-6, py-6                     │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PAGE HEADER ROW                                         │  │
│  │  "Attendance"  text-2xl font-semibold text-foreground    │  │
│  │  "Your working day history"  text-sm text-muted-fg       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  DAYS TABLE                                              │  │
│  │  Date  │  Hours  │  Status  │  Flags  │                  │  │
│  │  ───────────────────────────────────────                 │  │
│  │  row  row  row  row ...  (20 per page)                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  PAGINATION ROW                                          │  │
│  │  "Showing 1–20 of 312 days"   [← Prev]  [Next →]        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

Root wrapper: `<div className="container py-6 space-y-4">` inside the employee layout content area.

### 4.4 Page Header

```tsx
<div className="space-y-1">
  <h1 className="text-2xl font-semibold text-foreground">Attendance</h1>
  <p className="text-sm text-muted-foreground">Your working day history</p>
</div>
```

No action buttons in the header. Clock-in/out lives in the navbar widget.

### 4.5 Table

shadcn `DataTable` pattern (TanStack Table v8). Client-side pagination is NOT used — use server-side pagination against `GET /api/attendance/my/days?page=X&size=20`.

#### Column Definitions

| Column | Header | Width | Notes |
|---|---|---|---|
| `date` | Date | `w-36` | Format: "Mon, Mar 31, 2026" using `Intl.DateTimeFormat('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })` |
| `totalHours` | Hours | `w-24` | Format as `"8h 30m"` — see formatting helper below |
| `dayStatus` | Status | `w-32` | Status badge (see badge spec) |
| `flags` | Flags | auto | Chip row (see flag chip spec) |
| `action` | (none) | `w-10` | `ChevronRight` icon button — navigates to `/$date` detail page |

**Hours formatting helper** (`formatHours(h: number): string`):
- `0` → `"—"` (em-dash, muted)
- `< 1` → `"${Math.round(h * 60)}m"`
- Otherwise → `"${Math.floor(h)}h ${Math.round((h % 1) * 60)}m"` (omit `" 0m"` suffix if minutes are zero)

#### Status Badge Spec

Use shadcn `<Badge>` with explicit class overrides (semantic tokens only):

| `dayStatus` | Label | Style |
|---|---|---|
| `"open"` | "In Progress" | `bg-blue-50 text-blue-700 border border-blue-200` — use inline className, not a semantic token (no semantic token maps to info-blue yet) |
| `"pending"` | "Pending" | `bg-warning/10 text-warning-foreground border border-warning/30` |
| `"approved"` | "Approved" | `bg-success/10 text-success border border-success/30` |
| `"rejected"` | "Rejected" | `bg-destructive/10 text-destructive border border-destructive/20` |

All badges: `variant="outline"` as base (to get the rounded-full pill shape), with class overrides above. Icon prefix per status:
- `"open"` → lucide `Clock3` (16px)
- `"pending"` → lucide `Hourglass` (16px)
- `"approved"` → lucide `CheckCircle2` (16px)
- `"rejected"` → lucide `XCircle` (16px)

#### Flag Chip Spec

Rendered in the `flags` column as a horizontal `flex gap-1 flex-wrap` row. Each chip is a small inline label — not a `<Badge>` but a `<span>` styled:

```
className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium"
```

| Condition | Label | Style |
|---|---|---|
| `latenessMinutes > 0` | "Late" | `bg-warning/10 text-warning-foreground` |
| `overtimeHours > 0` | "Overtime" | `bg-primary/10 text-primary` |
| `hasManualSession` | "Manual" | `bg-muted text-muted-foreground` |

Show lateness and overtime chips **only for full-time employees**. The employee's `employmentType` is available on `SessionUser` from the auth store. If part-time, skip both chips regardless of the values from the server (the server returns 0 for these anyway, but the frontend should also guard by type).

If no flags apply, render nothing in this column (empty cell).

#### Row Click Behaviour
The entire row is clickable and navigates to `/_employee/attendance/$date`. Use `cursor-pointer` on `<tr>`. The `ChevronRight` action column is a visual affordance only — it does not need its own click handler separate from the row.

On hover: `hover:bg-muted/50` on the row.

### 4.6 Pagination

Below the table, full width:

```
┌────────────────────────────────────────────────────────────────┐
│  "Showing 1–20 of 312 days"   text-sm text-muted-foreground   │
│                               [← Previous]  [Next →]          │
└────────────────────────────────────────────────────────────────┘
```

- Text: `"Showing {start}–{end} of {total} days"`. Calculate `start = page * 20 + 1`, `end = Math.min((page + 1) * 20, total)`.
- `[← Previous]` — `<Button variant="outline" size="sm">` — disabled on page 0.
- `[Next →]` — `<Button variant="outline" size="sm">` — disabled on last page.
- Page state lives in the URL as a search param `?page=0` (0-indexed). Use TanStack Router's `useSearch` / `navigate` to read and write it.

### 4.7 Loading State

While the query is pending (initial load or page change):
- Render the table header normally.
- Replace table rows with 8 `<Skeleton>` rows. Each skeleton row has three cells: `Skeleton className="h-4 w-32"`, `Skeleton className="h-4 w-16"`, `Skeleton className="h-5 w-24 rounded-full"` for the badge placeholder.
- Pagination row is hidden during load.

### 4.8 Empty State

When `totalElements === 0` (new employee with no attendance history):

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│            [lucide CalendarX2 — 48px, text-muted-foreground]  │
│            "No attendance records yet"                         │
│            text-base font-medium text-foreground              │
│            "Your working days will appear here once you       │
│             start clocking in."                               │
│            text-sm text-muted-foreground                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

Centered vertically within the table area (`min-h-[240px] flex flex-col items-center justify-center gap-2`).

### 4.9 Error State

If the query errors:

```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Could not load attendance history</AlertTitle>
  <AlertDescription>
    Please refresh the page. If the problem persists, contact support.
  </AlertDescription>
</Alert>
```

---

## 5. Screen 2 — Day Detail Page (`/$date`)

### 5.1 Purpose
A complete record for one working day: sessions, project hour allocations, day statistics, and re-entry action if needed. This is the employee's single source of truth for any historical day.

### 5.2 User Type
Employees only.

### 5.3 Layout — Wider Screens (md+)

```
┌────────────────────────────────────────────────────────────────┐
│  EMPLOYEE NAVBAR (fixed, h-14)                                 │
├────────────────────────────────────────────────────────────────┤
│  bg-background, pt-14, px-4 md:px-6, py-6                     │
│                                                                │
│  BREADCRUMB                                                    │
│  ← Attendance  /  Mon, Mar 31, 2026                            │
│                                                                │
│  PAGE HEADER ROW (flex justify-between items-start)            │
│  "Mon, Mar 31, 2026"  text-2xl font-semibold   [STATUS BADGE] │
│                                                                │
│  ─────────────────────────────────────────────                 │
│                                                                │
│  REJECTED BANNER (only if dayStatus = "rejected")              │
│                                                                │
│  ─────────────────────────────────────────────                 │
│                                                                │
│  STATS ROW (3 cards in a row)                                  │
│  [Total Hours]  [Lateness]  [Overtime]                         │
│                                                                │
│  ─────────────────────────────────────────────                 │
│                                                                │
│  TWO-COLUMN GRID (grid-cols-1 lg:grid-cols-2 gap-6)           │
│  ┌────────────────────────┐  ┌───────────────────────────┐    │
│  │  SESSIONS CARD         │  │  PROJECT HOURS CARD        │    │
│  │  Timeline of sessions  │  │  Entries list              │    │
│  └────────────────────────┘  └───────────────────────────┘    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Mobile (< md)**: Single column. Stat cards stack vertically (2-col grid to keep them compact: `grid-cols-2`). Sessions card and Project Hours card stack below the stats.

### 5.4 Breadcrumb

```tsx
<nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
  <Link to="/attendance" className="hover:text-foreground transition-colors">
    Attendance
  </Link>
  <ChevronRight className="h-3.5 w-3.5" />
  <span className="text-foreground font-medium">{formattedDate}</span>
</nav>
```

`formattedDate`: use `Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })` on the parsed `$date` param.

### 5.5 Page Header Row

```
"Mon, March 31, 2026"    text-2xl font-semibold text-foreground
[STATUS BADGE]           — same badge spec as the table rows (Section 4.5)
```

If `hasManualSession: true`: render a small `<Badge variant="outline" className="bg-muted text-muted-foreground">` labelled "Manual" immediately after the status badge.

### 5.6 Rejected Day Banner

Shown only when `dayStatus === "rejected"`. Placed between the page header and the stats row.

```tsx
<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
  <div className="flex-1 space-y-2">
    <p className="text-sm font-medium text-destructive">This day was rejected</p>
    <p className="text-sm text-muted-foreground">
      Your submitted hours were not approved. You can re-enter this day's attendance data.
    </p>
  </div>
  <Button
    variant="destructive"
    size="sm"
    onClick={() => navigate({ to: "/attendance/log", search: { date: params.date, reentry: "true" } })}
  >
    Re-enter Day
  </Button>
</div>
```

The `[Re-enter Day]` button navigates to `/attendance/log?date=YYYY-MM-DD&reentry=true`. The re-entry dialog (`RejectedDayReentryDialog`) already intercepts that route when both search params are present — no new dialog logic needed here.

### 5.7 Stats Row

Three stat cards in `<div className="grid grid-cols-2 md:grid-cols-3 gap-4">`.

Each card uses shadcn `<Card>`:
```tsx
<Card>
  <CardContent className="p-4">
    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
    {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
  </CardContent>
</Card>
```

| Card | Label | Value | Subtext | Show condition |
|---|---|---|---|---|
| Total Hours | "Total Hours" | `formatHours(totalHours)` (same helper as table) | `"—"` if 0 | Always |
| Lateness | "Late Start" | `"${latenessMinutes} min"` | `"Arrived after shift start"` | Only full-time AND `latenessMinutes > 0` |
| Overtime | "Overtime" | `formatHours(overtimeHours)` | `"Beyond daily target"` | Only full-time AND `overtimeHours > 0` |

If the employee is part-time OR the value is 0: the Lateness and Overtime cards are not rendered (not just hidden — do not render them at all). The Total Hours card always renders.

On mobile, if only one card exists, it spans the full width of the 2-column grid (use `col-span-2`).

### 5.8 Sessions Card

shadcn `<Card>` with `<CardHeader>` and `<CardContent>`.

**Header**:
```tsx
<CardHeader className="pb-3">
  <CardTitle className="text-base">Sessions</CardTitle>
  <CardDescription>Individual clock-in / clock-out pairs for this day</CardDescription>
</CardHeader>
```

**Content** — a vertical timeline. For each session in `sessions[]`:

```
┌────────────────────────────────────────────────┐
│  ○ — SESSION 1                                 │
│      "9:00 AM → 12:30 PM"     3h 30m           │
│      [Manual badge if isManual]                │
│                                                │
│  ○ — SESSION 2                                 │
│      "1:15 PM → 5:00 PM"      3h 45m           │
└────────────────────────────────────────────────┘
```

Timeline implementation:
- Wrap in `<ol className="relative border-l border-border ml-2 space-y-4 pl-4">`.
- Each `<li>` has an absolutely-positioned circle dot (`w-2 h-2 rounded-full bg-border -left-[5px] top-1.5`).
- Session label: `"Session {index + 1}"` — `text-xs text-muted-foreground font-medium uppercase tracking-wide`.
- Times: `"{formattedStart} → {formattedEnd}"` — format with `Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })`. If `endTime` is `null` (session still open): show `"{formattedStart} → ongoing"` with `text-muted-foreground` on "ongoing".
- Duration: `formatHours(durationHours)` — `text-sm text-muted-foreground` to the right (flex justify-between on the row).
- If `isManual`: render a small `<span className="text-xs bg-muted text-muted-foreground rounded-sm px-1.5 py-0.5">Manual</span>` chip below the time row.

**Empty state** (no sessions yet — `sessions.length === 0`):
```tsx
<p className="text-sm text-muted-foreground text-center py-6">
  No sessions recorded for this day.
</p>
```

### 5.9 Project Hours Card

shadcn `<Card>`.

**Header**:
```tsx
<CardHeader className="pb-3">
  <CardTitle className="text-base">Project Hours</CardTitle>
  <CardDescription>Hour allocation submitted for this day</CardDescription>
</CardHeader>
```

**Content** — list of `projectEntries[]`:

Each entry:
```
┌────────────────────────────────────────────────────────┐
│  Project Alpha                            3h 30m        │
│  "Worked on API integration and testing"               │
│  text-sm text-muted-foreground italic                  │
└────────────────────────────────────────────────────────┘
```

Separator (`<Separator />`) between entries. Project name: `text-sm font-medium text-foreground`. Hours: `text-sm text-foreground` right-aligned.

Notes are optional — render only if `notes` is non-null and non-empty. If notes exist, show in a `<p className="text-xs text-muted-foreground italic mt-0.5">` below the project name/hours row.

A summary row at the bottom (below final separator):
```
Total                                    8h 00m
text-sm font-semibold                    text-sm font-semibold
```

**Empty state — not yet submitted** (day is `open`):
```tsx
<p className="text-sm text-muted-foreground text-center py-6">
  Project hours will appear here once you submit your day.
</p>
```

**Empty state — submitted but no entries** (unusual, edge case):
```tsx
<p className="text-sm text-muted-foreground text-center py-6">
  No project hours were recorded for this day.
</p>
```

Show the "not yet submitted" variant when `dayStatus === "open"`. Show the "no entries" variant when `dayStatus !== "open"` and `projectEntries.length === 0`.

### 5.10 Loading State

While the `myDayDetail` query is pending:
- Breadcrumb and page header render immediately with the date from the URL param (it is available without a network call).
- Stats row: render 1–3 `<Card>` skeletons with `<Skeleton className="h-8 w-20 mt-1">` in each.
- Sessions card and Project Hours card: render the card shell with a `<Skeleton className="h-32 w-full">` in the content area of each.

### 5.11 Error State

If the query errors (e.g. invalid date, server error):

```tsx
<div className="container py-6 space-y-4">
  {/* breadcrumb still visible */}
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Could not load day details</AlertTitle>
    <AlertDescription>
      Check your connection and try again, or{" "}
      <Link to="/attendance" className="underline">return to history</Link>.
    </AlertDescription>
  </Alert>
</div>
```

### 5.12 Invalid Date Param

If `$date` is not a valid `YYYY-MM-DD` string (regex check on load): immediately redirect to `/attendance` using TanStack Router's `redirect` in the route's `beforeLoad` or `loader`. Do not render an error page for this case.

---

## 6. Feature Folder Structure

```
src/features/attendance/
├── api/
│   ├── get-my-days.ts          # calls GET /api/attendance/my/days
│   └── get-my-day-detail.ts    # calls GET /api/attendance/my/day/{date}
├── hooks/
│   ├── use-my-days-query.ts    # useQuery wrapping get-my-days
│   └── use-my-day-detail-query.ts
├── components/
│   ├── DayStatusBadge.tsx      # shared badge — used in table AND detail header
│   ├── DayFlagChips.tsx        # Late / Overtime / Manual chips
│   ├── SessionTimeline.tsx     # the sessions card content
│   └── ProjectHoursCard.tsx    # the project hours card content
├── static/
│   └── my-days.static.ts       # static dev data (remove when backend delivers)
├── types.ts                    # WorkingDayRow, DayDetail, SessionEntry, ProjectEntry
└── index.ts                    # re-exports
```

`DayStatusBadge` is the canonical badge — import it everywhere rather than reimplementing badge logic.

---

## 7. Types

```ts
// src/features/attendance/types.ts (additions)

export interface WorkingDayRow {
  dayId: number;
  date: string;
  totalHours: number;
  dayStatus: "open" | "pending" | "approved" | "rejected";
  hasManualSession: boolean;
  overtimeHours: number;
  latenessMinutes: number;
}

export interface SessionEntry {
  startTime: string;      // ISO-8601
  endTime: string | null;
  durationHours: number;
  isManual: boolean;
}

export interface ProjectEntry {
  projectName: string;
  hours: number;
  notes: string | null;
}

export interface DayDetail {
  date: string;
  totalHours: number;
  dayStatus: "open" | "pending" | "approved" | "rejected";
  hasManualSession: boolean;
  latenessMinutes: number;
  overtimeHours: number;
  sessions: SessionEntry[];
  projectEntries: ProjectEntry[];
}
```

---

## 8. Handoff Notes for Frontend Developer

1. **Static data first**: both queries (`useMyDaysQuery`, `useMyDayDetailQuery`) should accept an optional `staticData` prop or simply hard-switch to static mode when an env flag is set. Use the static shapes defined in Section 3 and Section 5.12. Remove static mode when backend delivers.

2. **Part-time guard**: read `employmentType` from the auth store (`useAuthStore(s => s.user?.employmentType)`). Ensure the `SessionUser` type in `src/types/index.ts` includes `employmentType: "FULL_TIME" | "PART_TIME"`. If it does not exist yet, add it and ensure the `/session` endpoint response populates it.

3. **`formatHours` helper**: create once in `src/lib/utils.ts` and import everywhere. Do not inline it per-component.

4. **`DayStatusBadge`**: accepts `dayStatus` and `size?: "sm" | "default"`. The `sm` variant renders a 14px icon and smaller text (used in the history table). The `default` variant renders a 16px icon (used in the detail page header).

5. **Date param validation**: in the `$date` route's `beforeLoad`, validate the param with a simple regex `/^\d{4}-\d{2}-\d{2}$/.test(date)`. Redirect to `/attendance` if invalid.

6. **Pending backend warning**: add a TODO comment in both API files and both query hooks:
   ```ts
   // TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
   ```

7. **Query invalidation**: when `RejectedDayReentryDialog` succeeds (E6 call), invalidate `QUERY_KEYS.attendance.myDays(0)` and `QUERY_KEYS.attendance.myDayDetail(date)` so the list and detail pages reflect the new `"open"` status.

8. **Navigation from list to detail**: use `<Link to="/attendance/$date" params={{ date: row.date }}>` or the router's `navigate` function inside the row click handler — do not construct URLs with string concatenation.

9. **Tab title**: set `document.title` to `"Attendance — {formattedDate} | Trusst"` on the detail page. Use a `useEffect` with the date param as dependency.
