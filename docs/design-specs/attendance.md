# Design Spec — Attendance Feature (Version 2)

**Date**: 2026-03-07
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation
**Supersedes**: All prior attendance design specs

---

## 1. Overview

The attendance flow is the highest-frequency daily interaction in the system. Every employee uses it at least twice a day. The design keeps session controls permanently in the navbar so they are reachable from any page in one click.

The flow has two phases:

1. **Session tracking** — clock in / clock out via the navbar widget (`SessionWidget`)
2. **Hour allocation** — distribute the day's total worked hours across project assignments, then submit (`/attendance/log` page)

Admin review lives on the employee detail page under a "Working Days" tab.

### What changed from V1

- Session state is now fully server-driven. No `localStorage` session state. The widget derives everything from E1 (`GET /api/attendance/session/status`).
- State model is now 5 widget states driven by `{ start_time, day_status }` instead of the old 4-state enum.
- The "End Working Day" button is always present when `day_status === "open"` — separate from the session start/stop actions.
- The project hours page now has two modes: **open** (allocation form) and **locked** (read-only summary), driven by E4.
- Admin review is per working day (not per session). Approve/reject acts on the full day record.
- Rejected days trigger a re-entry flow (E6) before the employee can resubmit.
- `StaleSessionBanner` and `StaleSessionRecoveryDialog` are removed — the stale session concept does not exist in V2.

---

## 2. Data Model & API Reference

| # | Method | Path | Who | Purpose |
|---|---|---|---|---|
| E1 | GET | `/api/attendance/session/status` | Employee | Fetch current session status — called on every page load |
| E2 | POST | `/api/attendance/clock-in` | Employee | Start a working session |
| E3 | POST | `/api/attendance/clock-out` | Employee | End a working session |
| E4 | GET | `/api/attendance/day-summary?date=YYYY-MM-DD` | Employee | Fetch day total hours + lock status |
| E5 | POST | `/api/project-hours/submit` | Employee | Bulk submit project hour allocation for a day |
| E6 | POST | `/api/attendance/reentry` | Employee | Submit a fresh manual session for a rejected day |
| E7 | GET | `/api/admin/attendance/employee/{employeeId}/days` | Admin | List all working days for an employee |
| E8 | POST | `/api/admin/attendance/days/{dayId}/approve` | Admin | Approve a pending working day |
| E9 | POST | `/api/admin/attendance/days/{dayId}/reject` | Admin | Reject a pending working day |
| E10 | GET | `/api/project-hours/my?date=YYYY-MM-DD` | Employee | Fetch submitted entries for a locked day |

### E1 Response Shape

```ts
{
  start_time: string | null;  // ISO-8601 if session running, null otherwise
  day_status: "open" | "pending" | "approved" | "rejected";
}
```

**Important**: If the employee has no attendance record today at all, E1 still returns `{ start_time: null, day_status: "open" }`. The widget treats this as "no session started yet" — identical to a day where sessions exist but none are currently running.

### E4 Response Shape

```ts
{
  total_hours: number;
  day_status: "open" | "locked";
}
```

### E7 Response Shape

```ts
Array<{
  day_id: number;
  date: string;              // YYYY-MM-DD
  total_hours: number;
  day_status: "pending" | "approved" | "rejected";
  has_manual_session: boolean;
}>
```

### E10 Response Shape

```ts
{
  date: string;
  total_hours: number;
  entries: Array<{
    project_id: number;
    project_name: string;
    hours: number;
    notes: string | null;
  }>;
}
```

---

## 3. Query Keys

Add these to `src/constants/query-keys.ts`:

```ts
attendance: {
  sessionStatus: ["attendance", "session", "status"],
  daySummary: (date: string) => ["attendance", "day-summary", date],
},
projectHours: {
  myByDate: (date: string) => ["project-hours", "my", date],
},
admin: {
  employeeWorkingDays: (employeeId: number) =>
    ["admin", "attendance", "employee", employeeId, "days"],
},
```

The existing `QUERY_KEYS.attendance.logs` and `QUERY_KEYS.attendance.activeSession` are deprecated. Remove them after migration.

---

## 4. Navbar Session Widget (`SessionWidget`)

### 4.1 Purpose

Provides always-accessible session controls and day status for the logged-in employee. Mounted inside the employee layout navbar on every page.

### 4.2 User Type

Employees only. Not shown in the admin layout.

### 4.3 Data Source

- Query: `useSessionStatusQuery` wrapping E1 (`GET /api/attendance/session/status`)
- Query key: `QUERY_KEYS.attendance.sessionStatus`
- `staleTime: 0` — always considered stale
- `refetchOnWindowFocus: true` — refetches when the employee returns to the tab

No localStorage. No derived state from prior responses. Always reflects the latest E1 result.

### 4.4 Widget States

The widget maps `{ start_time, day_status }` from E1 to one of six render states:

---

#### State 0 — Loading (skeleton)

**Condition**: E1 query is in `isPending` state (initial load).

**Display**:
- Two `<Skeleton>` pills side by side, sized to match the approximate width of the action buttons (e.g. `w-28 h-8` each).
- Do NOT render any action buttons, badges, or timer until E1 resolves.
- This prevents flash-of-wrong-state and accidental clicks during load.

**Component**: shadcn `<Skeleton>` inside a `flex gap-2` container.

---

#### State 1 — No Active Session (`start_time: null`, `day_status: "open"`)

**Display**:
- `[Start Session]` — `<Button variant="default">`
- `[End Working Day]` — `<Button variant="outline">`
- Both buttons side by side.

**Interactions**:
- `[Start Session]` opens `StartSessionDialog`
- `[End Working Day]` navigates directly to `/attendance/log` (no session running, no clock-out needed)

---

#### State 2 — Session Active (`start_time: not null`, `day_status: "open"`)

**Display**:
- Live elapsed time counter — monospace text, e.g. `02:34:17`
- `[Stop]` — `<Button variant="outline" className="border-destructive text-destructive">`
- `[End Working Day]` — `<Button variant="outline">`

**Timer behavior**:
- On mount (or when `start_time` changes after a refetch): calculate elapsed seconds as `Math.floor((Date.now() - new Date(start_time).getTime()) / 1000)`.
- Run `setInterval` every 1000ms to increment the counter.
- Format as `HH:MM:SS`.
- Clear the interval on unmount and restart it whenever `start_time` changes.
- Timer is purely derived — never stored.

**Interactions**:
- `[Stop]` opens `EndSessionDialog`
- `[End Working Day]` calls E3 with no body (automatic mode). While in flight: disable both buttons and show a spinner on `[End Working Day]`. On success: navigate to `/attendance/log`. On error: show a shadcn toast ("Could not end session. Please try again.") and re-enable both buttons.

---

#### State 3 — Pending (`day_status: "pending"`)

**Display**:
- Amber badge: "Pending Approval" with lucide `Clock` icon to the left of the text.
- No session action buttons.

**Badge style**: `bg-warning text-warning-foreground` rounded pill.

---

#### State 4 — Approved (`day_status: "approved"`)

**Display**:
- Green badge: "Day Approved" with lucide `CheckCircle2` icon to the left of the text.
- No session action buttons.

**Badge style**: `bg-success text-success-foreground` rounded pill.

---

#### State 5 — Rejected (`day_status: "rejected"`)

**Display**:
- Muted red badge: "Day Rejected" with lucide `XCircle` icon.
- `[Re-enter Day]` — `<Button variant="ghost" size="sm">` — rendered immediately to the right of the badge.

**Badge style**: `bg-destructive/10 text-destructive border border-destructive/20` (subtle, not solid red).

**Interactions**:
- `[Re-enter Day]` opens `RejectedDayReentryDialog`

---

### 4.5 Error State (E1 fails)

If E1 returns an error, render a small muted "—" placeholder in the widget area. Do not render any action buttons. Do not crash the navbar.

### 4.6 Layout

The widget sits on the right side of the employee navbar, before the user avatar/menu. Use a `flex items-center gap-2` wrapper.

**Mobile (< `md`)**: Collapse `[Start Session]` and `[End Working Day]` to icon-only buttons wrapped in shadcn `<Tooltip>`. Use lucide `Play` for Start Session, lucide `LogOut` for End Working Day, lucide `Square` for Stop. The elapsed timer (`HH:MM:SS`) stays visible at all widths — it is critical real-time information. Status badges show icon only on mobile; full text label on `md`+.

---

## 5. Start Session Dialog (`StartSessionDialog`)

### 5.1 Purpose

Lets the employee clock in, with the option to enter a manual start time if they forgot to clock in on arrival.

### 5.2 Trigger

Clicking `[Start Session]` in the widget (State 1).

### 5.3 Layout

shadcn `<Dialog>` — ~400px wide, centered.

**Header**: "Start Session"

**Body**:

Time mode toggle: shadcn `<Switch>` labelled "Enter time manually". Default: off (Automatic).

- **Automatic mode** (switch off): Read-only display text — "Start time: Now". No editable input.
- **Manual mode** (switch on): `<Input type="time">` labelled "Start time". Required. Inline validation: if the entered time is in the future, show "Start time cannot be in the future." beneath the input with `text-destructive text-sm`.

**Footer**:
- `[Cancel]` — `<Button variant="ghost">` — closes dialog, no action
- `[Confirm]` — `<Button variant="default">` — triggers E2

### 5.4 E2 Call Behavior

- **Automatic**: POST E2 with empty body `{}`
- **Manual**: POST E2 with `{ "manual_time": "<YYYY-MM-DDTHH:MM:00>" }` (today's date + entered time)

### 5.5 On Success

- Close dialog.
- Invalidate `QUERY_KEYS.attendance.sessionStatus`.
- Widget transitions to State 2 once E1 refetches and returns `start_time: not null`.

### 5.6 On Error

- Keep dialog open.
- Show inline error below the footer buttons: "Failed to start session. Please try again." in `text-destructive text-sm`.
- Re-enable `[Confirm]`.

### 5.7 Loading State

`[Confirm]` shows lucide `Loader2` with `animate-spin` and is `disabled` while the E2 mutation is in flight. `[Cancel]` remains enabled.

---

## 6. End Session Dialog (`EndSessionDialog`)

### 6.1 Purpose

Lets the employee clock out. Offers two outcomes: end the session only, or end the full working day and proceed to hour allocation.

### 6.2 Trigger

Clicking `[Stop]` in the widget (State 2).

### 6.3 Layout

shadcn `<Dialog>` — ~400px wide, centered.

**Header**: "End Session"

**Body**:

Read-only info row (muted text, `text-muted-foreground text-sm`):
- "Session started: [formatted start_time]" — format as "9:14 AM"
- "Elapsed: [duration]" — snapshot the HH:MM:SS value at the moment the dialog opens. Do not continue ticking inside the dialog.

Time mode toggle: shadcn `<Switch>` labelled "Enter time manually". Default: off.
- **Automatic**: Read-only display "End time: Now"
- **Manual**: `<Input type="time">` labelled "End time". Inline validation: end time must be after `start_time`. Error: "End time must be after session start time."

shadcn `<Separator>` then two action options:

**Option A — End Session Only**
- Description (muted, `text-sm`): "Close this session. You can start another session later."
- `<Button variant="outline">` — "End Session Only"

**Option B — End Working Day**
- Description (muted, `text-sm`): "Close this session and go to hour allocation."
- `<Button variant="default">` — "End Working Day"

**Footer**:
- `[Cancel]` — `<Button variant="ghost">` — closes dialog, session continues uninterrupted

### 6.4 E3 Call Behavior

Both options call E3:
- **Automatic**: POST E3 with `{}`
- **Manual**: POST E3 with `{ "manual_time": "<YYYY-MM-DDTHH:MM:00>" }`

### 6.5 On Success — Option A

- Close dialog.
- Invalidate `QUERY_KEYS.attendance.sessionStatus`.
- Widget returns to State 1 (`start_time: null`, `day_status: "open"`).
- Stay on the current page.

### 6.6 On Success — Option B

- Close dialog.
- Invalidate `QUERY_KEYS.attendance.sessionStatus`.
- Navigate to `/attendance/log`.

### 6.7 On Error

- Keep dialog open.
- Show inline error below the action buttons: "Failed to end session. Please try again."
- Both action buttons and `[Cancel]` re-enable.

### 6.8 Loading State

Whichever option button was clicked shows `Loader2` spinner and is `disabled`. The other option button and `[Cancel]` are also `disabled` while the mutation is in flight — prevent conflicting double-actions.

---

## 7. End Working Day — Direct Path (no dialog)

This describes the behavior of `[End Working Day]` in States 1 and 2, outside of the `EndSessionDialog`.

### State 1 (no session running)

Click navigates directly to `/attendance/log`. No API call. No dialog. Instant.

### State 2 (session running)

Click calls E3 with no body (automatic clock-out only — no manual time option here).

While in flight:
- Disable both `[Stop]` and `[End Working Day]` navbar buttons.
- Show `Loader2` spinner on `[End Working Day]`.

On success: navigate to `/attendance/log`.

On error: show shadcn toast "Could not end session. Please try again." Re-enable both buttons. Stay on current page.

**Design rationale**: This path exists for the common case of "I'm done, take me to log my hours." It is zero-friction by design — no dialog, no time picker. If the employee needs to enter a manual end time, they should use `[Stop]` to open `EndSessionDialog` and choose Option B.

---

## 8. Project Hours Page (`/attendance/log`)

### 8.1 Purpose

Lets the employee allocate their worked hours across projects for a given date and submit for approval.

### 8.2 User Type

Employees only. Route file: `src/routes/_employee/attendance.log.tsx`.

### 8.3 Page Layout

Full-width within the employee layout (no sidebar).

Sections top to bottom:
1. Page header — "Log Working Day" (`<h1>` or equivalent heading)
2. Date picker row
3. Day content area (mode-dependent)

### 8.4 Date Picker Row

- shadcn `<Popover>` + `<Calendar>` — trigger button shows the selected date as "Monday, March 7, 2026".
- Default selected date: today (on initial mount with no URL param), or the `?date=YYYY-MM-DD` query param if present.
- On date change: call E4 (`GET /api/attendance/day-summary?date=YYYY-MM-DD`). Query key: `QUERY_KEYS.attendance.daySummary(date)`.
- Disable future dates in the `<Calendar>` (`disabled` prop with a function checking `date > today`).

### 8.5 Mode A — Open Day (`E4.day_status === "open"`)

The employee builds and submits their allocation.

#### Summary Bar

Displayed directly below the date picker, above the entry list:

- Left side: "Total hours to allocate: **X.X hrs**" — from `E4.total_hours`. This value is fixed; it does not change as the employee adds entries.
- Right side: Running balance pill — `remaining = E4.total_hours - sum of all entry hours` — recalculates in real time as entries are added, edited, or deleted:
  - `remaining === 0` — `bg-success text-success-foreground` — "Balanced"
  - `remaining > 0` — `bg-warning text-warning-foreground` — "X.X hrs remaining"
  - `remaining < 0` — `bg-destructive/10 text-destructive border border-destructive/20` — "X.X hrs over"

#### Entry List

Zero or more `HourEntryRow` components (see Section 9) held in local React state (`useState`). Local state only — nothing is persisted to the server until `[Submit]` is clicked.

#### [+ Add Entry] Button

`<Button variant="outline" className="w-full">` — appends a new blank entry object to local state. Full width for visual prominence.

#### [Submit] Button

`<Button variant="default">` — enabled only when `remaining === 0` AND entry count >= 1.

When disabled, add `title="Allocate all hours before submitting"` so hovering reveals the reason.

#### Submit Behavior (E5)

POST `/api/project-hours/submit`:
```json
{
  "date": "YYYY-MM-DD",
  "entries": [
    { "project_id": 1, "hours": 4.0, "notes": "optional or omit" }
  ]
}
```

While pending:
- `[Submit]` shows spinner and is `disabled`.
- All `HourEntryRow` inputs become read-only (`disabled`).
- `[+ Add Entry]` is `disabled`.

On success:
- Invalidate `QUERY_KEYS.attendance.daySummary(date)`.
- E4 refetches. Because the backend now returns `day_status: "locked"`, the page automatically transitions to Mode B. No manual state manipulation needed.

On error:
- Re-enable all rows and buttons.
- Show an inline error banner below the entry list: "Submission failed. Please try again." Style: `bg-destructive/10 text-destructive border border-destructive/20 rounded p-3`.

#### Empty State (no entries yet)

When the entry list is empty, show centered content in place of the entry list:
- lucide `ClipboardList` icon (muted, large)
- Text: "No hours logged yet. Click '+ Add Entry' to start."

### 8.6 Mode B — Locked Day (`E4.day_status === "locked"`)

The day has been submitted and its allocation is locked. Read-only view.

#### Data Source

After E4 confirms `locked`, enable E10: `GET /api/project-hours/my?date=YYYY-MM-DD`. Query key: `QUERY_KEYS.projectHours.myByDate(date)`. Use `enabled: daySummary?.day_status === "locked"` on the query so it only runs when needed.

#### Layout

**Status banner** (full width, below date picker, above table):
- Text: "Day approved — allocation locked."
- Style: `bg-success/10 text-success border border-success/20 rounded p-3 flex items-center gap-2`
- Include lucide `CheckCircle2` icon to the left of the text.

**Read-only table** — shadcn `<Table>`:

| Column | Source |
|---|---|
| Project | `entry.project_name` |
| Hours | `entry.hours` formatted as "X.X hrs" |
| Notes | `entry.notes` or "—" if null |

Footer row: **Total** | `total_hours` from E10 formatted as "X.X hrs" | —

No edit controls. No delete controls. No `[Submit]` button.

#### Loading State (E10 pending)

Render 3 `<Skeleton>` rows inside a table structure while E10 resolves.

#### Error State (E10 fails)

Full-width error panel: "Could not load submitted hours. Try refreshing the page." with a `[Retry]` button that calls `refetch()` on the E10 query.

### 8.7 Mode C — No Day Record

**Condition**: E4 returns a 404 or `total_hours: 0` with `day_status: "locked"` for a date with no sessions at all.

**Display**: Centered empty state with lucide `CalendarX` icon (large, muted) and message:

"No sessions recorded for this date. Start a session from the navbar to begin your day."

No form. No submit button.

**Note**: The backend returns `{ total_hours: 0, day_status: "locked" }` when there is no attendance record for the requested date. The frontend should detect this case (locked + zero hours + E10 returns empty entries) and show Mode C instead of Mode B.

### 8.8 Loading State (E4 pending)

Replace the entire day content area with:
- A skeleton block the height of the summary bar
- A skeleton table with 3 rows

Do not show partial UI while E4 is loading.

### 8.9 Error State (E4 fails)

Full-width error panel: "Could not load day summary. Try refreshing the page." with a `[Retry]` button.

---

## 9. Hour Entry Row (`HourEntryRow`)

### 9.1 Purpose

One editable row for a single project-hour entry in the Mode A allocation form.

### 9.2 Props

```ts
interface HourEntryRowProps {
  entry: {
    id: string;
    project_id: number | null;
    hours: number | "";
    notes: string;
  };
  onChange: (id: string, updates: Partial<HourEntryRowEntry>) => void;
  onDelete: (id: string) => void;
  assignmentOptions: Array<{ project_id: number; project_name: string }>;
  excludedProjectIds: number[];  // project IDs selected in sibling rows
  disabled?: boolean;            // true when E5 submit is in flight
}
```

### 9.3 Field Layout — Desktop (flex row)

| Field | Component | Detail |
|---|---|---|
| Project | shadcn `<Select>` | Options filtered to exclude `excludedProjectIds`. Placeholder: "Select project". |
| Hours | `<Input type="number">` | `step="0.5"` `min="0.5"`. Placeholder: "0.0". |
| Notes | `<Input type="text">` | Optional. Placeholder: "Optional notes". |
| Delete | `<Button variant="ghost" size="icon">` with lucide `Trash2` | Calls `onDelete(entry.id)`. |

**Mobile layout (< `md`)**: Stack fields vertically. Project select: full width. Hours + Delete: side by side on one line. Notes: full width below.

### 9.4 Validation

- Project: required. Invalid if `null`.
- Hours: required. Must be a number > 0.
- On blur of each field: if invalid, apply `className="border-destructive"` to the input and show a `text-destructive text-xs` message directly below it.
- Validate on blur, not on every keystroke.

### 9.5 Disabled State

When `disabled={true}` (E5 in flight): set `disabled` on all inputs, the `<Select>`, and the delete button.

Mode B does not use `HourEntryRow` at all — it uses a plain `<Table>`.

---

## 10. Rejected Day Re-entry Dialog (`RejectedDayReentryDialog`)

### 10.1 Purpose

Lets the employee submit a fresh manual session for a day that was rejected by admin, so they can resubmit their hour allocation.

### 10.2 Design Choice

Dialog (not a full page). Only three fields are needed. Full-page navigation would be unnecessary friction.

### 10.3 Trigger

Clicking `[Re-enter Day]` in the navbar widget (State 5).

### 10.4 Layout

shadcn `<Dialog>` — ~440px wide, centered.

**Header**: "Re-enter Working Day"

**Dialog description** (rendered in `<DialogDescription>`, muted text): "Your previous submission was rejected. Enter your actual working hours to resubmit."

**Body** — all fields use `@/components/ui/field` (shadcn `FormField`/`FormControl` is banned in this project):

- **Date** — `<Input>` read-only, pre-filled with today's date as `YYYY-MM-DD`. Use `disabled` styling (muted, not interactive). The rejected day is always today — E1 reflects today's status.
- **Start Time** — `<Input type="time">` labelled "Start time". Required.
- **End Time** — `<Input type="time">` labelled "End time". Required. Must be after start time. Inline error on blur if invalid: "End time must be after start time."

**Footer**:
- `[Cancel]` — `<Button variant="ghost">` — closes dialog, no action
- `[Submit]` — `<Button variant="default">` — triggers E6. Disabled if start or end time is empty, or if end <= start.

### 10.5 Form Schema (Zod)

```ts
const reentrySchema = z.object({
  date: z.string(),
  start_time: z.string().min(1, "Required"),
  end_time: z.string().min(1, "Required"),
}).refine(
  (data) => data.end_time > data.start_time,
  { message: "End time must be after start time", path: ["end_time"] }
);

type ReentryFormValues = z.infer<typeof reentrySchema>;
```

### 10.6 E6 Call Body

```json
{
  "date": "YYYY-MM-DD",
  "start_time": "YYYY-MM-DDTHH:MM:00",
  "end_time": "YYYY-MM-DDTHH:MM:00"
}
```

Construct ISO strings by combining today's date with the `HH:MM` value from each `<input type="time">`:
```ts
const iso = `${todayDateString}T${timeValue}:00`;
```

### 10.7 On Success

- Close dialog.
- Invalidate `QUERY_KEYS.attendance.sessionStatus`.
- Navigate to `/attendance/log?date=YYYY-MM-DD` (today's date). E4 will return `day_status: "open"` for the fresh re-entry, so Mode A (allocation form) will appear.

### 10.8 On Error

- Keep dialog open.
- Show inline error below the form fields: "Submission failed. Please check your times and try again."
- Re-enable `[Submit]`.

### 10.9 Loading State

While E6 is in flight: `[Submit]` shows `Loader2` spinner and is `disabled`. All inputs are `disabled`. `[Cancel]` is `disabled`.

---

## 11. Admin — Employee Working Days (`EmployeeWorkingDaysTable`)

### 11.1 Purpose

Lets admins review, approve, or reject submitted working days for a specific employee.

### 11.2 User Type

Admin layout only. Visible to Super Admin and Sub-Admins with the relevant attendance permission. When a Sub-Admin lacks the permission: the entire "Working Days" tab is absent from the DOM — not rendered, never disabled.

### 11.3 Access Point

A "Working Days" tab on the employee detail page:
Admin sidebar > Employees > [Employee Name] > Working Days tab.

This is a tab panel within the existing employee detail route — not a standalone route.

### 11.4 Data Source

- E7: `GET /api/admin/attendance/employee/{employeeId}/days`
- Query key: `QUERY_KEYS.admin.employeeWorkingDays(employeeId)`
- `employeeId` from the employee detail route params.

### 11.5 Filter Bar

Displayed above the table. Filtering is client-side — filter the E7 result in the component. No additional API call.

- shadcn `<Select>` with options: "All" / "Pending" / "Approved" / "Rejected". Default: "All".

### 11.6 Table

shadcn `<Table>` with the following columns:

| Column | Source | Render |
|---|---|---|
| Date | `day.date` | "Mon, Mar 7 2026" |
| Total Hours | `day.total_hours` | "8.0 hrs" |
| Status | `day.day_status` | Status badge (see 11.7) |
| Manual | `day.has_manual_session` | lucide `AlertTriangle` in `text-warning` if `true`; empty cell if `false` |
| Actions | — | Approve + Reject buttons for `pending` rows; empty for others |

**Pending row visual treatment**:
- Apply to the `<tr>`: `className="border-l-4 border-warning bg-warning/5"`
- Left accent border + subtle amber background tint makes pending rows immediately visible.

### 11.7 Status Badges

| `day_status` | Badge style | Label | Icon |
|---|---|---|---|
| `pending` | `bg-warning text-warning-foreground` | "Pending Approval" | lucide `Clock` |
| `approved` | `bg-success text-success-foreground` | "Approved" | lucide `CheckCircle2` |
| `rejected` | `bg-muted text-muted-foreground` | "Rejected" | lucide `XCircle` |

Always include the icon alongside the text. Never rely on color alone.

### 11.8 Action Buttons

**Approved and rejected rows**: No action buttons. Actions column is empty.

**Pending rows**:
- `[Approve]` — `<Button variant="default" size="sm">` — calls E8 directly on click. No confirmation dialog (approve is non-destructive).
- `[Reject]` — `<Button variant="outline" size="sm" className="border-destructive text-destructive">` — opens a shadcn `<AlertDialog>` before calling E9.

**Reject confirmation `<AlertDialog>`**:
- Title: "Reject Working Day"
- Description: "Are you sure you want to reject this working day? The employee will need to re-enter their sessions."
- `[Cancel]` — `<AlertDialogCancel>`
- `[Reject]` — `<AlertDialogAction className="bg-destructive text-destructive-foreground">` — calls E9 on confirm

### 11.9 After Approve / Reject

On E8 or E9 success: invalidate `QUERY_KEYS.admin.employeeWorkingDays(employeeId)`. The table refetches and the row updates to its new status automatically.

On error: show a shadcn toast error ("Action failed. Please try again."). Row remains pending. Action buttons re-enable.

### 11.10 Loading States

- **Initial load (E7 pending)**: Render 5 `<Skeleton>` rows inside the table structure.
- **Per-row action in flight**: Disable both action buttons on that specific row. Show `Loader2` spinner on the clicked button. All other rows remain fully interactive.

### 11.11 Empty States

- E7 returns empty array: centered content with lucide `CalendarDays` icon and text "No working days recorded for this employee."
- E7 has data but the status filter yields zero matches: "No working days match the selected filter."

### 11.12 Error State (E7 fails)

Full-width error panel: "Could not load working days. Try refreshing." with a `[Retry]` button that calls `refetch()` on the E7 query.

### 11.13 Mobile Layout

On screens < `md`: render a card list instead of a table. Each card shows:
- Date (bold, top line)
- Status badge + manual indicator on second line
- Total hours on third line
- Action buttons (pending cards only) full width, stacked below

---

## 12. Component Inventory

### Existing components — update

| Component | File | Required change |
|---|---|---|
| `SessionWidget` | `src/features/attendance/components/session-widget.tsx` | Full redesign to 5-state model. Remove all `localStorage` reads/writes. |
| `StartSessionDialog` | `src/features/attendance/components/start-session-dialog.tsx` | Remove any `localStorage` writes. Logic otherwise mostly unchanged. |
| `EndSessionDialog` | `src/features/attendance/components/end-session-dialog.tsx` | Two choices become two explicit buttons with per-button loading state. Remove `localStorage`. |
| `HourEntryRow` | `src/features/attendance/components/hour-entry-row.tsx` | Align props to new contract (see Section 9.2). |

### Existing components — delete

| Component | Reason |
|---|---|
| `StaleSessionBanner` | Stale session concept removed in V2. |
| `StaleSessionRecoveryDialog` | Same. |

### New components to create

| Component | File |
|---|---|
| `RejectedDayReentryDialog` | `src/features/attendance/components/rejected-day-reentry-dialog.tsx` |
| `EmployeeWorkingDaysTable` | `src/features/attendance/components/employee-working-days-table.tsx` |

### Hooks — create or update

| Hook | Wraps | On-success side-effect |
|---|---|---|
| `useSessionStatusQuery` | E1 | — (read query) |
| `useClockInMutation` | E2 | Invalidate `sessionStatus` |
| `useClockOutMutation` | E3 | Invalidate `sessionStatus` |
| `useDaySummaryQuery(date)` | E4 | — (read query) |
| `useSubmitProjectHoursMutation` | E5 | Invalidate `daySummary(date)` |
| `useReentryMutation` | E6 | Invalidate `sessionStatus` |
| `useEmployeeWorkingDaysQuery(employeeId)` | E7 | — (read query) |
| `useApproveDayMutation(employeeId)` | E8 | Invalidate `employeeWorkingDays(employeeId)` |
| `useRejectDayMutation(employeeId)` | E9 | Invalidate `employeeWorkingDays(employeeId)` |
| `useMyProjectHoursQuery(date)` | E10 | — (read query) |

---

## 13. Interaction Flows (Summary)

### Normal day — employee

```
Any page loads → E1 resolves:
  { start_time: null,  day_status: "open" }    → State 1: [Start Session] + [End Working Day]
  { start_time: "…",  day_status: "open" }     → State 2: Timer + [Stop] + [End Working Day]
  {                   day_status: "pending" }   → State 3: "Pending Approval" badge
  {                   day_status: "approved" }  → State 4: "Day Approved" badge
  {                   day_status: "rejected" }  → State 5: "Day Rejected" badge + [Re-enter Day]

[Start Session] (State 1)
  → StartSessionDialog opens
  → Employee selects Automatic or Manual start time
  → [Confirm] → E2 → invalidate sessionStatus → widget refetches → State 2

[Stop] (State 2)
  → EndSessionDialog opens
  → Option A "End Session Only" → E3 → invalidate sessionStatus → State 1, stay on page
  → Option B "End Working Day" → E3 → invalidate sessionStatus → navigate to /attendance/log

[End Working Day] (State 1) → navigate to /attendance/log (no API call)
[End Working Day] (State 2) → E3 (automatic, no dialog) → on success navigate to /attendance/log

/attendance/log:
  Date picker defaults to today (or ?date= param)
  → E4 called on date selection:
      day_status: "open"   → Mode A: allocation form
      day_status: "locked" → E10 called → Mode B: read-only summary
      no record case       → Mode C: empty state

Mode A:
  Employee adds HourEntryRow entries (local state)
  Balance pill updates in real time
  remaining === 0 AND entries >= 1 → [Submit] enabled
  [Submit] → E5 → on success: invalidate daySummary(date) → E4 refetches → Mode B
```

### Rejected day — employee

```
State 5 in navbar widget → [Re-enter Day]
  → RejectedDayReentryDialog opens (date pre-filled read-only, today)
  → Employee enters start time + end time
  → [Submit] → E6
  → on success: invalidate sessionStatus
               navigate to /attendance/log?date=YYYY-MM-DD
  → /attendance/log loads → E4 returns day_status: "open" → Mode A appears
  → Employee adds entries, submits via E5
```

### Admin review

```
Admin → Employee detail page → "Working Days" tab
  → E7 fetches working day list
  → Optional: filter by status
  → Pending row → [Approve] → E8 (no confirmation) → row updates to "Approved"
  → Pending row → [Reject] → AlertDialog confirmation → [Reject] → E9 → row updates to "Rejected"
```

---

## 14. Accessibility Notes

- All interactive elements use shadcn defaults — visible focus rings included automatically.
- Status badges always include an icon alongside text. Never rely on color alone.
- Live timer: set `aria-live="polite"` on a wrapper element that updates its accessible text once per minute (not every second) to avoid flooding screen reader announcements.
- `<AlertDialog>` is the correct accessible pattern for destructive confirmations (the Reject action).
- `<Dialog>` components trap focus by default in shadcn.
- Disabled `[Submit]` button: add `title="Allocate all hours before submitting"` so the reason is visible on hover for sighted users.
- `[End Working Day]` button when E3 is in flight: set `aria-busy="true"` on the button element.

---

## 15. Implementation Notes for Frontend Developer

1. **Remove all `localStorage` session state.** The `trusst:session:active` key is no longer used. Delete every read and write to it across the codebase.

2. **`useSessionStatusQuery` is the single source of truth for `SessionWidget`.** Do not derive widget state from any other query, store, or ref.

3. **Timer construction in `SessionWidget`**:
   ```ts
   const startMs = new Date(start_time).getTime();
   const initialElapsed = Math.floor((Date.now() - startMs) / 1000);
   const [elapsed, setElapsed] = useState(initialElapsed);

   useEffect(() => {
     const interval = setInterval(() => setElapsed(s => s + 1), 1000);
     return () => clearInterval(interval);
   }, [start_time]); // restart when start_time changes
   ```

4. **E1 window-focus refetch**: `useSessionStatusQuery` must use `refetchOnWindowFocus: true`. This keeps the widget accurate when the employee returns to the tab.

5. **`[End Working Day]` in State 2 is direct** — calls E3 with `{}` immediately on click, no dialog. Navigate only after confirmed E3 success. On error: toast, re-enable buttons, stay on page.

6. **E10 enabled guard**: Only fetch E10 when E4 confirms `locked`:
   ```ts
   const { data: projectHours } = useMyProjectHoursQuery(selectedDate, {
     enabled: daySummary?.day_status === "locked",
   });
   ```

7. **ISO-8601 construction from `<input type="time">`**: The time input returns `HH:MM`. Combine with the date string:
   ```ts
   const iso = `${dateString}T${timeValue}:00`;
   ```
   Use this pattern for E2 manual clock-in, E3 manual clock-out, and E6 re-entry.

8. **`HourEntryRow` project filtering**: Fetch the assignments list once at the page level (`GET /api/project-hours/my/assignments`). Pass each `HourEntryRow` the full list plus an `excludedProjectIds` array derived from all other rows' selected `project_id` values. Do not re-fetch per row.

9. **Admin mutations — no optimistic updates.** Always wait for E8/E9 to succeed before the table refetches. Show per-row in-flight state on the action buttons only.

10. **Delete `StaleSessionBanner` and `StaleSessionRecoveryDialog`** from `src/features/attendance/components/`. These components have no place in V2 and should not remain in the codebase.

11. **Query keys in `src/constants/query-keys.ts`**: Add the keys listed in Section 3. Do not remove existing keys that may still be used by other features until confirmed unused.

12. **`/attendance/log?date=` query param**: On mount, read the `date` search param via TanStack Router's `useSearch`. If present and in `YYYY-MM-DD` format, use it as the initial date picker value. If absent, default to today's date.

13. **Form system**: Use `@/components/ui/field` for all form field wrappers in dialogs. Do NOT use shadcn's `<Form>`, `<FormField>`, or `<FormControl>` — they are banned in this project.

14. **Schema first**: Define and export the Zod schema before the component for every dialog that accepts user input (`StartSessionDialog`, `EndSessionDialog`, `RejectedDayReentryDialog`). Derive the TypeScript type from the schema using `z.infer<typeof schema>`. Do not write form value types manually.

15. **`assignmentId` vs `project_id` in E5**: The backend DTO uses `assignmentId` (not `project_id`) in the E5 request body entries. The assignments returned by `GET /api/project-hours/my/assignments` include both `assignmentId` and `projectId`. Use `assignmentId` when building the E5 payload. See the API contract for the exact field name.
