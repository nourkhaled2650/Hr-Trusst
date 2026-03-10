# Design Spec — Employee Leave Requests

**Date**: 2026-03-10
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation

---

## 1. Overview

The Leave Requests page (`/leave`) is the single page where an employee views their leave balances, reviews their request history, and submits new leave requests. It lives in the employee layout (white navbar, no sidebar).

This spec covers the static-data phase. Backend integration will follow when the leave API contract is ready.

---

## 2. Page Layout

Route file: `src/routes/_employee/leave.tsx`

Root wrapper: `<div className="container py-6 space-y-8">`

The page has three vertically stacked sections:

```
┌─────────────────────────────────────────────────────────────────┐
│  EMPLOYEE NAVBAR (fixed, h-14)                                  │
├─────────────────────────────────────────────────────────────────┤
│  bg-neutral-50, pt-14, min-h-screen                             │
│                                                                 │
│  <div class="container py-6 space-y-8">                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SECTION 1 — Page Header                                │    │
│  │  "Leave Requests"  (h1)          [Submit Leave Request] │    │
│  │  "View your leave balances..."   (description)          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SECTION 2 — Leave Balance Overview                     │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │    │
│  │  │ Annual Leave │ │  Sick Leave  │ │Unpaid Leave  │    │    │
│  │  │  15 of 20    │ │   8 of 10   │ │   3 of 5    │    │    │
│  │  │  remaining   │ │  remaining  │ │  remaining  │    │    │
│  │  │  [progress]  │ │  [progress] │ │  [progress] │    │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SECTION 3 — Leave Request History                      │    │
│  │  "Leave History"  (h2)                                  │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │  Type · Start · End · Duration · Reason · Status │   │    │
│  │  │  ──────────────────────────────────────────────  │   │    │
│  │  │  row  row  row ...                               │   │    │
│  │  └──────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Section 1 — Page Header

### Layout

`<div className="flex items-start justify-between gap-4">`

Left side:
- `<h1 className="text-2xl font-semibold text-neutral-900">Leave Requests</h1>`
- `<p className="text-sm text-muted-foreground mt-1">View your leave balances and manage your time-off requests.</p>`

Right side:
- `<Button variant="default">` labelled "Submit Leave Request" with lucide `Plus` icon (`h-4 w-4 mr-2`) as a prefix.
- Clicking this button opens the `SubmitLeaveRequestDialog` (see Section 6). It does NOT navigate away.

### Mobile behavior

Below the `sm` breakpoint, the header row switches to a column stack:
`<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">`

The button becomes full width on mobile: add `className="w-full sm:w-auto"`.

---

## 4. Section 2 — Leave Balance Overview

### Purpose

Give the employee an instant visual summary of how much leave they have left for each type, so they can make an informed decision before submitting a request.

### Layout

`<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">`

Three shadcn `<Card>` components side by side on `sm`+ screens, stacked on mobile.

### Individual Balance Card

Each card maps to one leave type. The card has no interactive controls — it is purely informational.

```
<Card className="relative overflow-hidden">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      {leaveType}
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-0">
    <div className="flex items-baseline gap-1.5">
      <span className="text-3xl font-bold text-foreground">{remaining}</span>
      <span className="text-sm text-muted-foreground">of {total} days</span>
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      {used} day{used !== 1 ? "s" : ""} used
    </p>
    <Progress
      value={(used / total) * 100}
      className="mt-3 h-1.5"
    />
  </CardContent>
</Card>
```

#### Progress bar color semantics

The `<Progress>` indicator color uses a semantic class on the `indicatorClassName` prop (shadcn Progress exposes this). Never use raw color classes.

| Usage threshold | Indicator class | Rationale |
|---|---|---|
| used / total < 0.5 | `bg-success` | Plenty remaining |
| used / total >= 0.5 and < 0.8 | `bg-warning` | Getting low |
| used / total >= 0.8 | `bg-destructive` | Almost exhausted |

The progress bar fills left-to-right proportional to days **used** (not remaining), so a fuller bar = fewer days left. This is the natural mental model — users see the bar "draining."

#### Static data for this phase

```ts
const LEAVE_BALANCES = [
  { type: "Annual Leave",  total: 20, used: 5  },
  { type: "Sick Leave",    total: 10, used: 2  },
  { type: "Unpaid Leave",  total: 5,  used: 0  },
] as const;
```

`remaining = total - used`.

Do not hardcode these values inline in JSX. Define them as a typed constant and map over them.

---

## 5. Section 3 — Leave Request History

### Layout

```
<div className="space-y-3">
  <h2 className="text-base font-semibold text-foreground">Leave History</h2>
  <Card>
    <CardContent className="p-0">
      <Table>...</Table>
    </CardContent>
  </Card>
</div>
```

The table is wrapped in a `<Card>` with `p-0` on `<CardContent>` so the table borders meet the card edges cleanly. On mobile the card becomes horizontally scrollable: wrap the `<Table>` in `<div className="overflow-x-auto">`.

### Table Columns

shadcn `<Table>` with `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>`.

| Column | Header label | Source | Width | Notes |
|---|---|---|---|---|
| Leave Type | "Leave Type" | `request.leaveType` | auto | Plain text |
| Start Date | "Start Date" | `request.startDate` | `w-32` | Format as "Mar 10, 2026" |
| End Date | "End Date" | `request.endDate` | `w-32` | Same format |
| Duration | "Duration" | `request.durationDays` | `w-24` | Render as "X day" / "X days" |
| Reason | "Reason" | `request.reason` | auto, flex-grow | Clipped — see below |
| Status | "Status" | `request.status` | `w-32` | Status badge — see below |
| Submitted At | "Submitted" | `request.submittedAt` | `w-32` | Format as "Mar 10, 2026" |

#### Reason column — clip and tooltip

The reason cell clips long text to a single line and reveals the full text on hover via a shadcn `<Tooltip>`.

```tsx
<TableCell className="max-w-[180px]">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block truncate cursor-default text-sm text-foreground">
          {request.reason}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs whitespace-normal">
        {request.reason}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</TableCell>
```

Only render the `<Tooltip>` wrapper when `reason.length > 40` (approximate clip threshold). When reason is short, render the span directly with no tooltip overhead.

#### Status badge

Use shadcn `<Badge>` with semantic token classes. Never use raw color classes.

| `status` value | Badge classes | Icon (lucide) | Label |
|---|---|---|---|
| `PENDING` | `bg-warning text-warning-foreground` | `Clock` (`h-3 w-3`) | "Pending" |
| `APPROVED` | `bg-success text-success-foreground` | `CheckCircle2` (`h-3 w-3`) | "Approved" |
| `REJECTED` | `bg-destructive/10 text-destructive border border-destructive/20` | `XCircle` (`h-3 w-3`) | "Rejected" |

Badge anatomy:
```tsx
<Badge className={variantClasses}>
  <Icon className="h-3 w-3 mr-1" />
  {label}
</Badge>
```

Always include the icon. Never rely on color alone.

### Static data for this phase

```ts
const LEAVE_HISTORY = [
  {
    id: 1,
    leaveType: "Annual Leave",
    startDate: "2026-02-10",
    endDate: "2026-02-12",
    durationDays: 3,
    reason: "Family vacation to Alexandria for a long weekend.",
    status: "APPROVED",
    submittedAt: "2026-02-05",
  },
  {
    id: 2,
    leaveType: "Sick Leave",
    startDate: "2026-02-20",
    endDate: "2026-02-20",
    durationDays: 1,
    reason: "Flu symptoms and doctor visit.",
    status: "APPROVED",
    submittedAt: "2026-02-20",
  },
  {
    id: 3,
    leaveType: "Annual Leave",
    startDate: "2026-03-15",
    endDate: "2026-03-16",
    durationDays: 2,
    reason: "Personal errands.",
    status: "PENDING",
    submittedAt: "2026-03-10",
  },
  {
    id: 4,
    leaveType: "Unpaid Leave",
    startDate: "2026-01-08",
    endDate: "2026-01-08",
    durationDays: 1,
    reason: "Needed an extra day for a personal matter that came up unexpectedly — it was unavoidable.",
    status: "REJECTED",
    submittedAt: "2026-01-06",
  },
] as const;
```

Define this as a typed constant, not inline JSX. It will be replaced by a TanStack Query hook when the backend is ready.

### Empty state

When `LEAVE_HISTORY.length === 0`:

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" />
  <p className="text-sm font-medium text-muted-foreground">No leave requests yet</p>
  <p className="text-xs text-muted-foreground/70 mt-1">
    Submit your first request using the button above.
  </p>
</div>
```

Render this inside the `<Card>` in place of the table.

### Loading state (for future backend integration)

When the query is `isPending`, render 4 `<Skeleton>` rows inside the table structure:

```tsx
{Array.from({ length: 4 }).map((_, i) => (
  <TableRow key={i}>
    {Array.from({ length: 7 }).map((_, j) => (
      <TableCell key={j}>
        <Skeleton className="h-4 w-full rounded" />
      </TableCell>
    ))}
  </TableRow>
))}
```

Keep the `<TableHeader>` visible during loading — only skeleton the body rows.

### Error state (for future backend integration)

Full-width inside the card:

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center gap-3">
  <AlertCircle className="h-8 w-8 text-destructive/60" />
  <p className="text-sm text-muted-foreground">Could not load leave history. Try refreshing the page.</p>
  <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
</div>
```

---

## 6. Submit Leave Request Dialog (`SubmitLeaveRequestDialog`)

### 6.1 Purpose

A focused modal form that lets the employee select a leave type, pick a date range, and provide a reason for the request.

### 6.2 Trigger

Clicking "Submit Leave Request" in the page header (Section 1). The button does not navigate — it opens this dialog only.

### 6.3 Dialog Structure

shadcn `<Dialog>` with `<DialogContent className="sm:max-w-md">`.

```
┌───────────────────────────────────────────────────────┐
│  DialogHeader                                         │
│  "Submit Leave Request"               (DialogTitle)   │
│  "Fill in the details for your time-off request."    │
│                                       (DialogDesc)   │
├───────────────────────────────────────────────────────┤
│  Leave Type *           [Select ▼]                    │
│                                                       │
│  Start Date *           [Input type="date"]           │
│  End Date *             [Input type="date"]           │
│                                                       │
│  Duration               [computed, read-only]         │
│                                                       │
│  Reason *               [Textarea]                    │
│                                                       │
│  [inline error — conditional]                         │
├───────────────────────────────────────────────────────┤
│  [Cancel]                   [Submit Request]          │
│                    (ghost)              (default)     │
└───────────────────────────────────────────────────────┘
```

### 6.4 Fields

All fields use `@/components/ui/field` for the label+input+error wrapper. Do NOT use shadcn `<Form>`, `<FormField>`, or `<FormControl>` — they are banned in this project.

#### Leave Type

- Component: shadcn `<Select>` + `<SelectTrigger>` + `<SelectContent>` + `<SelectItem>`
- Label: "Leave Type"
- Placeholder in trigger: "Select leave type"
- Options — map from the same constant used in Section 2:
  - "Annual Leave"
  - "Sick Leave"
  - "Unpaid Leave"
- Required. Show inline error "Please select a leave type." if submitted without selection.

#### Start Date

- Component: `<Input type="date">`
- Label: "Start Date"
- Required.
- Constraint: must not be in the past. On blur, if the selected date < today, show "Start date cannot be in the past."
- Set `min={todayDateString}` on the input.

#### End Date

- Component: `<Input type="date">`
- Label: "End Date"
- Required.
- Constraint: must be >= start date. On blur, if end date < start date, show "End date must be on or after the start date."
- Set `min={startDateValue || todayDateString}` on the input (updates reactively as start date changes).

#### Duration (computed, read-only)

Displayed below the date pair as a muted helper line — not a form field, not submitted:

```tsx
{startDate && endDate && endDate >= startDate && (
  <p className="text-sm text-muted-foreground -mt-1">
    Duration: <span className="font-medium text-foreground">{durationDays} day{durationDays !== 1 ? "s" : ""}</span>
  </p>
)}
```

Duration calculation (calendar days, inclusive):
```ts
const durationDays =
  Math.floor(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
```

This is display-only. The backend will calculate actual working days when the API is ready.

#### Reason

- Component: `<Textarea rows={3} placeholder="Briefly describe the reason for your leave request." />`
- Label: "Reason"
- Required. Min 5 characters. Max 500 characters.
- Show character count below the textarea: `<p className="text-xs text-muted-foreground text-right">{reason.length} / 500</p>`
- If submitted empty or < 5 chars: "Please provide a reason (at least 5 characters)."
- If > 500 chars: "Reason must not exceed 500 characters." and apply `border-destructive` to the textarea.

### 6.5 Zod Schema

```ts
const submitLeaveSchema = z.object({
  leaveType: z.enum(["Annual Leave", "Sick Leave", "Unpaid Leave"], {
    required_error: "Please select a leave type.",
  }),
  startDate: z.string().min(1, "Start date is required.").refine(
    (val) => val >= new Date().toISOString().split("T")[0],
    "Start date cannot be in the past."
  ),
  endDate: z.string().min(1, "End date is required."),
  reason: z.string().min(5, "Please provide a reason (at least 5 characters).").max(500, "Reason must not exceed 500 characters."),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: "End date must be on or after the start date.", path: ["endDate"] }
);

type SubmitLeaveFormValues = z.infer<typeof submitLeaveSchema>;
```

### 6.6 Footer Buttons

- `[Cancel]` — `<Button variant="ghost">` — closes dialog, no action. No dirty-check needed for this form (low stakes, short form).
- `[Submit Request]` — `<Button variant="default">` — triggers submit handler.

### 6.7 Submit Behavior (static phase)

Since the backend is not ready, the submit handler in this phase:

1. Validates the form against the Zod schema.
2. On success: close the dialog, show a shadcn toast: "Leave request submitted." (This is a placeholder — no actual API call.)
3. On validation failure: display inline errors below each failing field.

The component must be structured so that when the API is ready, the only change needed is replacing the placeholder handler with a `useMutation` call. Comment the placeholder clearly:

```ts
// TODO: Replace with useMutation → POST /api/leave/request when backend is ready.
```

### 6.8 Loading State (for future use)

When the mutation is in flight:
- `[Submit Request]` shows lucide `Loader2` with `animate-spin` and is `disabled`.
- All inputs and the `[Cancel]` button are `disabled`.

Structure the component to support this state via a local `isSubmitting` boolean.

### 6.9 Error State (for future use)

If the API returns an error, render an inline error panel above the footer:

```tsx
<p className="text-sm text-destructive flex items-center gap-1.5">
  <AlertCircle className="h-4 w-4 shrink-0" />
  Submission failed. Please check your details and try again.
</p>
```

Keep the dialog open. Re-enable all inputs.

### 6.10 Dialog Open State

Managed in the page component via `const [dialogOpen, setDialogOpen] = useState(false)`.
Pass `open={dialogOpen}` and `onOpenChange={setDialogOpen}` to the dialog.

On open: reset the form to empty defaults.
```ts
useEffect(() => { if (dialogOpen) resetForm(); }, [dialogOpen]);
```

---

## 7. Interaction Notes

| Action | Result |
|---|---|
| Click "Submit Leave Request" | `SubmitLeaveRequestDialog` opens. Form is blank. |
| Change start date in dialog | End date's `min` attribute updates. Duration line hides if end date is now invalid. |
| Change end date in dialog | Duration line recalculates and appears if valid range. |
| Submit dialog with valid form (static phase) | Dialog closes. Toast "Leave request submitted." |
| Submit dialog with invalid form | Inline field errors appear. Dialog stays open. |
| Click Cancel in dialog | Dialog closes. No action. |
| Press Escape | Dialog closes (shadcn default). |
| Hover a clipped reason cell in the table | Full reason text appears in a shadcn Tooltip above the cell. |

---

## 8. Edge Cases

### Balance card — 0 remaining

When `remaining === 0`, the "remaining" count displays as `0` in bold and the progress bar fills completely with `bg-destructive`. No special warning banner needed on the balance cards themselves — the visual is sufficient. The dialog does not block submission when balance is 0 (that is a backend enforcement concern).

### Balance card — fully unused (used === 0)

Progress bar is empty (0%). Displays `{total} of {total} days` remaining. No special treatment needed.

### Leave history — single day request

When `startDate === endDate`, duration cell displays "1 day".

### Leave history — very long reason

Reason is clipped to one line in the table cell (`truncate`). Full text available on hover via Tooltip. No character limit is enforced on the display side.

### Leave history — all same status

The table renders normally. No grouping or filter is applied in this static phase (filtering is a future enhancement).

### Dialog — end date before start date

Duration line is hidden (conditional render). End date field shows inline error on blur. Submit button does not block on the UI side (Zod schema's `.refine` handles this at submit time).

---

## 9. Component Inventory

### New files to create

| Component/File | Path |
|---|---|
| Leave page | `src/routes/_employee/leave.tsx` |
| Leave feature folder | `src/features/leave/` |
| Balance card | `src/features/leave/components/leave-balance-card.tsx` |
| History table | `src/features/leave/components/leave-history-table.tsx` |
| Submit dialog | `src/features/leave/components/submit-leave-request-dialog.tsx` |
| Leave schema | `src/features/leave/schemas/submit-leave.schema.ts` |
| Leave types | `src/features/leave/types/leave.types.ts` |
| Static data / constants | `src/features/leave/constants/leave-data.ts` |
| Public exports | `src/features/leave/index.ts` |

### shadcn Components Required

| Component | Used in |
|---|---|
| `Card`, `CardHeader`, `CardTitle`, `CardContent` | Balance cards, history table wrapper |
| `Progress` | Balance cards |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | History table |
| `Badge` | Status column |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | Reason column clip |
| `Button` | Page header, dialog footer |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | Submit dialog |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` | Leave type field in dialog |
| `Input` | Date fields in dialog |
| `Textarea` | Reason field in dialog |
| `Skeleton` | History table loading state |

Install any missing components via `npx shadcn@latest add <name>`.

### lucide-react Icons Required

| Icon | Used in |
|---|---|
| `Plus` | Page header button |
| `Clock` | PENDING status badge |
| `CheckCircle2` | APPROVED status badge |
| `XCircle` | REJECTED status badge |
| `CalendarDays` | Empty state illustration |
| `AlertCircle` | Error states |
| `Loader2` | Submit button loading state |

---

## 10. Handoff Notes for Frontend Developer

1. **Forms use `@/components/ui/field`**: Do NOT use shadcn's `<Form>`, `<FormField>`, or `<FormControl>`. All form field wrappers in the dialog use the project's `field` component. This is a hard project rule.

2. **Schema first**: Define and export the Zod schema in `submit-leave.schema.ts` before writing the component. Derive the TypeScript form type via `z.infer<typeof submitLeaveSchema>`. Never write the form values type manually.

3. **Static data as typed constants**: Define `LEAVE_BALANCES` and `LEAVE_HISTORY` in `src/features/leave/constants/leave-data.ts` as typed constants. The page component imports them. This keeps the swap to real API calls clean — replace the import with a query hook, delete the constants file.

4. **Leave types type definition** — add to `src/features/leave/types/leave.types.ts`:
   ```ts
   export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
   export type LeaveTypeName = "Annual Leave" | "Sick Leave" | "Unpaid Leave";

   export interface LeaveBalance {
     type: LeaveTypeName;
     total: number;
     used: number;
   }

   export interface LeaveRequest {
     id: number;
     leaveType: LeaveTypeName;
     startDate: string;   // YYYY-MM-DD
     endDate: string;     // YYYY-MM-DD
     durationDays: number;
     reason: string;
     status: LeaveStatus;
     submittedAt: string; // YYYY-MM-DD
   }
   ```

5. **Progress bar `indicatorClassName` prop**: The shadcn `Progress` component in this project may not expose `indicatorClassName` by default. If it does not, the developer must add a data attribute or className override to the `<ProgressPrimitive.Indicator>` inside `src/components/ui/progress.tsx`. Adjust the component minimally — do not rewrite it. Alternative: use a plain `<div>` progress bar if the component cannot be extended cleanly.

6. **Date formatting**: Use `Intl.DateTimeFormat` or a simple utility. No date library import is needed:
   ```ts
   function formatDate(dateStr: string): string {
     return new Intl.DateTimeFormat("en-US", {
       month: "short", day: "numeric", year: "numeric",
     }).format(new Date(dateStr + "T00:00:00")); // Force local timezone parse
   }
   ```
   Add this utility to `src/features/leave/utils/format-date.ts` or reuse an existing project utility if one exists.

7. **Duration calculation is inclusive**: `endDate - startDate + 1 day`. A same-day request (start === end) is 1 day. This is a calendar-day count for display only; the backend will calculate business days.

8. **Tooltip only when reason is long**: Conditionally wrap the reason cell content in `<Tooltip>` only when `reason.length > 40`. Below that threshold, render the text directly without a tooltip — avoids unnecessary tooltip overhead for short reasons.

9. **Dialog form reset on open**: Use a `useEffect` that watches the `open` prop. When `open` transitions to `true`, call the form reset. This ensures a clean form every time the dialog opens.

10. **`container` class**: The page root uses `container py-6`. The `container` Tailwind class must be configured in the project's `tailwind.config.ts`. Confirm it exists; if not, use `max-w-5xl mx-auto px-4 sm:px-6`.

11. **Route context title**: Set `context: { title: 'Leave' }` in the route definition so the employee navbar active link and any future page-title reads are correct.

12. **No permission gates on this page**: All employees can see this page. The employee layout guard already handles authentication.

13. **Public exports from `index.ts`**: Export only the page component and any types needed by other features. Internal components (balance card, history table, dialog) are not exported from `index.ts` — they are imported directly within the feature.

14. **shadcn Toast**: Use the existing `useToast` hook (from `src/components/ui/use-toast`) for the placeholder success toast. Match the pattern used in the employees feature.
