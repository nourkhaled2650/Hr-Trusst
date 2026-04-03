# Design Spec — Admin Leave Management Page

**Date**: 2026-04-01
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation

---

## 1. Overview

The Admin Leave Management page (`/admin/leave`) is the central hub for administrators to monitor leave activity across the entire organisation. Admins can approve or reject pending requests inline, scan upcoming approved leave for scheduling awareness, review historical leave data, and read aggregate statistics at a glance.

This spec covers the **static-data phase**. All data is hardcoded constants. Approve and Reject actions update local state only (optimistic removal from the pending list) and show a toast. No API calls.

---

## 2. User Type

Super Admin (full access) and Sub-Admin (subject to permission `PERMISSIONS.APPROVE_LEAVE` — if absent, the Approve / Reject action buttons in Section 2 are not rendered).

---

## 3. Page Layout

Route file: `src/routes/_admin/admin.leave.tsx`

Root wrapper: `<div className="container py-6 space-y-8">`

```
┌───────────────────────────────────────────────────────────────────────┐
│  ADMIN SIDEBAR (fixed, dark)  │  ADMIN NAVBAR (white, fixed, h-14)   │
├───────────────────────────────┴──────────────────────────────────────┤
│  <div class="container py-6 space-y-8">                               │
│                                                                       │
│  PAGE HEADER                                                          │
│  SECTION 1 — STATISTICS (3 stat cards)                                │
│  SECTION 2 — PENDING REQUESTS                                         │
│  [SECTION 3 — UPCOMING APPROVED — conditional]                        │
│  SECTION 4 — LEAVE HISTORY + FILTERS                                  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Page Header

```tsx
<div className="space-y-1">
  <h1 className="text-2xl font-semibold text-foreground">Leave Management</h1>
  <p className="text-sm text-muted-foreground">
    Review and manage employee leave requests.
  </p>
</div>
```

No buttons in the header.

---

## 5. Section 1 — Statistics Overview

### Layout

```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  {ADMIN_LEAVE_STATS.map((stat) => (
    <AdminLeaveStatCard key={stat.label} {...stat} />
  ))}
</div>
```

### Stat Card Component (`AdminLeaveStatCard`)

```tsx
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      {stat.label}
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-0">
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-foreground">{stat.value}</span>
      <span className="text-sm text-muted-foreground">{stat.unit}</span>
    </div>
    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
  </CardContent>
</Card>
```

### Three Stats

| Card label | `value` | `unit` | `description` |
|---|---|---|---|
| "Days Taken (YTD)" | 47 | "days" | "Across all employees, this year" |
| "Days Remaining" | 213 | "days" | "Sum of all active leave balances" |
| "Upcoming Approved" | 3 | "requests" | "Approved leave starting in the future" |

### Static data

```ts
// src/features/leave/constants/admin-leave-data.ts

export const ADMIN_LEAVE_STATS = [
  { label: "Days Taken (YTD)", value: 47, unit: "days", description: "Across all employees, this year" },
  { label: "Days Remaining", value: 213, unit: "days", description: "Sum of all active leave balances" },
  { label: "Upcoming Approved", value: 3, unit: "requests", description: "Approved leave starting in the future" },
] as const;
```

---

## 6. Section 2 — Pending Requests

### Layout

```tsx
<div className="space-y-3">
  <div className="flex items-center gap-3">
    <h2 className="text-base font-semibold text-foreground">Pending Requests</h2>
    {pendingRequests.length > 0 && (
      <Badge className="bg-warning text-warning-foreground">
        {pendingRequests.length}
      </Badge>
    )}
  </div>
  <Card>
    <CardContent className="p-0">
      {pendingRequests.length === 0
        ? <PendingEmptyState />
        : <AdminPendingRequestsTable
            requests={pendingRequests}
            confirming={confirming}
            onInitiateAction={setConfirming}
            onConfirm={handleConfirm}
            onCancelConfirm={() => setConfirming(null)}
            hasApproveLeave={hasApproveLeave}
          />
      }
    </CardContent>
  </Card>
</div>
```

### Table columns

shadcn `<Table>` wrapped in `<div className="overflow-x-auto">`.

| Column | Header label | Source | Notes |
|---|---|---|---|
| Employee | "Employee" | `request.employeeName` | `font-medium` |
| Leave Type | "Leave Type" | `request.leaveType` | `<LeaveTypeBadge>` |
| Start | "Start" | `request.startDate` | "Apr 5, 2026" format |
| End | "End" | `request.endDate` | Same format |
| Duration | "Duration" | `request.totalDays` | "X day" / "X days" |
| Reason | "Reason" | `request.reason` | Clipped + tooltip; `"—"` if null |
| Submitted | "Submitted" | `request.createdAt` | Date only |
| Actions | "" | — | Conditional on `hasApproveLeave` |

### Leave type badge (`LeaveTypeBadge` component)

shadcn `<Badge variant="outline">`:

| `leaveType` | Label | Classes |
|---|---|---|
| `PAID` | "Annual" | `border-primary text-primary` |
| `SICK` | "Sick" | `border-warning text-warning-foreground bg-warning/10` |
| `UNPAID` | "Unpaid" | `border-border text-muted-foreground` |

### Action column — inline confirmation pattern

Only rendered when `hasApproveLeave === true`.

**Default state**:
```tsx
<div className="flex items-center justify-end gap-2">
  <Button size="sm" variant="outline"
    className="text-success border-success/30 hover:bg-success/10 hover:text-success"
    onClick={() => onInitiateAction({ id: request.leaveRequestId, action: "approve" })}>
    Approve
  </Button>
  <Button size="sm" variant="outline"
    className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
    onClick={() => onInitiateAction({ id: request.leaveRequestId, action: "reject" })}>
    Reject
  </Button>
</div>
```

**Confirming state** (when `confirming?.id === request.leaveRequestId`):
```tsx
<div className="flex items-center justify-end gap-2">
  <span className="text-sm text-muted-foreground whitespace-nowrap">
    {confirming.action === "approve" ? "Approve this request?" : "Reject this request?"}
  </span>
  <Button size="sm" variant={confirming.action === "approve" ? "default" : "destructive"}
    onClick={() => onConfirm(request.leaveRequestId, confirming.action)}>
    {confirming.action === "approve" ? "Confirm" : "Confirm Reject"}
  </Button>
  <Button size="sm" variant="ghost" onClick={onCancelConfirm}>Cancel</Button>
</div>
```

Only one row is in confirming state at a time. Clicking a different row while one is confirming replaces it.

**Confirm handler (static phase)**:
```ts
function handleConfirm(id: number, action: "approve" | "reject") {
  setPendingRequests((prev) => prev.filter((r) => r.leaveRequestId !== id));
  setConfirming(null);
  // TODO: Replace with useMutation → PUT /api/leave-requests/{id}/approve or /reject
}
```
Show a toast: `"Request approved."` / `"Request rejected."`

### Pending empty state

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <CheckCircle2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
  <p className="text-sm font-medium text-muted-foreground">No pending requests</p>
  <p className="text-xs text-muted-foreground/70 mt-1">All leave requests have been reviewed.</p>
</div>
```

### Static data

```ts
export const ADMIN_PENDING_REQUESTS: AdminLeaveRequest[] = [
  {
    leaveRequestId: 10, employeeId: 3, employeeName: "Sara Hassan",
    leaveType: "PAID", startDate: "2026-04-10", endDate: "2026-04-14",
    totalDays: 5, reason: "Annual holiday trip with family.",
    status: "PENDING", approvedDate: null, createdAt: "2026-03-28T09:15:00",
  },
  {
    leaveRequestId: 11, employeeId: 7, employeeName: "Karim Nour",
    leaveType: "SICK", startDate: "2026-04-02", endDate: "2026-04-03",
    totalDays: 2, reason: "Medical appointment and recovery.",
    status: "PENDING", approvedDate: null, createdAt: "2026-04-01T08:00:00",
  },
  {
    leaveRequestId: 12, employeeId: 5, employeeName: "Mona Adel",
    leaveType: "UNPAID", startDate: "2026-04-07", endDate: "2026-04-07",
    totalDays: 1, reason: "Personal matter that cannot be rescheduled.",
    status: "PENDING", approvedDate: null, createdAt: "2026-03-30T14:22:00",
  },
];
```

Page initialises: `const [pendingRequests, setPendingRequests] = useState<AdminLeaveRequest[]>(ADMIN_PENDING_REQUESTS);`

---

## 7. Section 3 — Upcoming Approved (Conditional)

### Visibility rule

Only rendered when `ADMIN_UPCOMING_APPROVED.length > 0`. No empty state — if no data, section is absent from the DOM entirely.

### Layout

```tsx
{ADMIN_UPCOMING_APPROVED.length > 0 && (
  <div className="space-y-3">
    <h2 className="text-base font-semibold text-foreground">Upcoming Approved Leave</h2>
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>...</Table>
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

### Table columns (read-only, no actions)

| Column | Header label | Source | Notes |
|---|---|---|---|
| Employee | "Employee" | `request.employeeName` | `font-medium` |
| Leave Type | "Leave Type" | `request.leaveType` | `<LeaveTypeBadge>` |
| Dates | "Dates" | `startDate` + `endDate` | "Apr 5 → Apr 6" (short month+day format) |
| Duration | "Duration" | `request.totalDays` | "X day" / "X days" |
| Approved On | "Approved On" | `request.approvedDate` | Date only |

#### Dates column

```tsx
<TableCell>
  <span className="text-sm text-foreground">{formatDateShort(request.startDate)}</span>
  <span className="text-xs text-muted-foreground mx-1.5">→</span>
  <span className="text-sm text-foreground">{formatDateShort(request.endDate)}</span>
</TableCell>
```

`formatDateShort` = month + day only: `"Apr 5"`. Add to `src/lib/utils.ts`.

### Static data

```ts
export const ADMIN_UPCOMING_APPROVED: AdminLeaveRequest[] = [
  {
    leaveRequestId: 7, employeeId: 2, employeeName: "Ahmed Saleh",
    leaveType: "PAID", startDate: "2026-04-20", endDate: "2026-04-24",
    totalDays: 5, reason: "Pre-planned vacation.",
    status: "APPROVED", approvedDate: "2026-03-15T11:00:00", createdAt: "2026-03-10T09:00:00",
  },
  {
    leaveRequestId: 8, employeeId: 6, employeeName: "Nadia Fawzy",
    leaveType: "SICK", startDate: "2026-04-05", endDate: "2026-04-06",
    totalDays: 2, reason: "Follow-up medical procedure.",
    status: "APPROVED", approvedDate: "2026-04-01T10:30:00", createdAt: "2026-03-31T16:00:00",
  },
  {
    leaveRequestId: 9, employeeId: 4, employeeName: "Omar Tarek",
    leaveType: "UNPAID", startDate: "2026-04-15", endDate: "2026-04-15",
    totalDays: 1, reason: null,
    status: "APPROVED", approvedDate: "2026-03-28T14:00:00", createdAt: "2026-03-25T11:45:00",
  },
];
```

`reason: null` renders as `"—"`.

---

## 8. Section 4 — Leave History

### Layout

```tsx
<div className="space-y-3">
  <h2 className="text-base font-semibold text-foreground">Leave History</h2>

  {/* Filter controls */}
  <div className="flex flex-col sm:flex-row gap-3">
    {/* Employee select */}
    {/* Leave type select */}
    {/* Date range inputs */}
  </div>

  <Card>
    <CardContent className="p-0">
      {filtered.length === 0
        ? <HistoryEmptyState />
        : <div className="overflow-x-auto"><AdminLeaveHistoryTable requests={filtered} /></div>
      }
    </CardContent>
  </Card>
</div>
```

### Filter controls

**Employee filter** — shadcn `<Select>`, `w-full sm:w-48`:
- Options: "All employees" (value `"all"`) + one item per unique `employeeName` in `ADMIN_LEAVE_HISTORY`, sorted A-Z.

**Leave type filter** — shadcn `<Select>`, `w-full sm:w-40`:
- Options: "All types" (value `"all"`), "Annual Leave" (value `"PAID"`), "Sick Leave" (value `"SICK"`), "Unpaid Leave" (value `"UNPAID"`).

**Date range** — two `<Input type="date">` with a `"to"` label between them:
```tsx
<div className="flex items-center gap-2">
  <Input type="date" className="w-full sm:w-36" value={filterStartDate}
    onChange={(e) => setFilterStartDate(e.target.value)} aria-label="Filter from date" />
  <span className="text-xs text-muted-foreground shrink-0">to</span>
  <Input type="date" className="w-full sm:w-36" value={filterEndDate}
    onChange={(e) => setFilterEndDate(e.target.value)} aria-label="Filter to date" />
</div>
```

**Filter logic**:
```ts
const filtered = ADMIN_LEAVE_HISTORY.filter((r) => {
  const matchEmployee = filterEmployee === "all" || r.employeeName === filterEmployee;
  const matchType = filterLeaveType === "all" || r.leaveType === filterLeaveType;
  const matchStart = !filterStartDate || r.startDate >= filterStartDate;
  const matchEnd = !filterEndDate || r.startDate <= filterEndDate;
  return matchEmployee && matchType && matchStart && matchEnd;
});
```

### Table columns

| Column | Header | Source | Notes |
|---|---|---|---|
| Employee | "Employee" | `employeeName` | `font-medium` |
| Leave Type | "Leave Type" | `leaveType` | `<LeaveTypeBadge>` |
| Start | "Start" | `startDate` | "Apr 5, 2026" |
| End | "End" | `endDate` | Same |
| Duration | "Duration" | `totalDays` | "X day/days" |
| Reason | "Reason" | `reason` | Clipped + tooltip; `"—"` if null |
| Status | "Status" | `status` | `<LeaveStatusBadge>` |
| Submitted | "Submitted" | `createdAt` | Date only |

### Status badge (`LeaveStatusBadge`)

| `status` | Label | Classes | Icon |
|---|---|---|---|
| `PENDING` | "Pending" | `bg-warning text-warning-foreground` | `Clock` |
| `APPROVED` | "Approved" | `bg-success text-success-foreground` | `CheckCircle2` |
| `REJECTED` | "Rejected" | `bg-destructive/10 text-destructive border border-destructive/20` | `XCircle` |
| `CANCELLED` | "Cancelled" | `bg-muted text-muted-foreground border border-border` | `Ban` |

### History empty state (filters return zero)

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
  <p className="text-sm font-medium text-muted-foreground">No matching records</p>
  <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting the filters above.</p>
</div>
```

### Static data

```ts
export const ADMIN_LEAVE_HISTORY: AdminLeaveRequest[] = [
  {
    leaveRequestId: 1, employeeId: 2, employeeName: "Ahmed Saleh",
    leaveType: "PAID", startDate: "2026-02-10", endDate: "2026-02-12",
    totalDays: 3, reason: "Family vacation.",
    status: "APPROVED", approvedDate: "2026-02-05T11:00:00", createdAt: "2026-02-03T09:00:00",
  },
  {
    leaveRequestId: 2, employeeId: 3, employeeName: "Sara Hassan",
    leaveType: "SICK", startDate: "2026-02-20", endDate: "2026-02-20",
    totalDays: 1, reason: "Flu and doctor visit.",
    status: "APPROVED", approvedDate: "2026-02-20T08:30:00", createdAt: "2026-02-20T07:45:00",
  },
  {
    leaveRequestId: 3, employeeId: 5, employeeName: "Mona Adel",
    leaveType: "UNPAID", startDate: "2026-01-08", endDate: "2026-01-08",
    totalDays: 1, reason: "Personal matter — unavoidable last-minute situation that required full-day absence.",
    status: "REJECTED", approvedDate: null, createdAt: "2026-01-06T14:00:00",
  },
  {
    leaveRequestId: 4, employeeId: 7, employeeName: "Karim Nour",
    leaveType: "PAID", startDate: "2026-03-01", endDate: "2026-03-05",
    totalDays: 5, reason: "Spring holiday.",
    status: "APPROVED", approvedDate: "2026-02-25T10:00:00", createdAt: "2026-02-22T12:00:00",
  },
  {
    leaveRequestId: 5, employeeId: 6, employeeName: "Nadia Fawzy",
    leaveType: "PAID", startDate: "2026-03-15", endDate: "2026-03-16",
    totalDays: 2, reason: "Personal errands.",
    status: "CANCELLED", approvedDate: null, createdAt: "2026-03-10T09:00:00",
  },
  {
    leaveRequestId: 6, employeeId: 4, employeeName: "Omar Tarek",
    leaveType: "SICK", startDate: "2026-03-22", endDate: "2026-03-22",
    totalDays: 1, reason: null,
    status: "APPROVED", approvedDate: "2026-03-22T09:00:00", createdAt: "2026-03-22T08:30:00",
  },
];
```

---

## 9. Interaction Notes

| Action | Result |
|---|---|
| Click "Approve" | Row enters confirming state |
| Click "Approve" on different row while one confirming | Previous cancelled, new row enters confirming |
| Click "Confirm" (approve) | Row removed from pending list. Toast: "Request approved." |
| Click "Confirm Reject" | Row removed from pending list. Toast: "Request rejected." |
| Click "Cancel" | Row reverts to two-button state |
| Change any filter | History table re-renders synchronously |
| All filters return no rows | History empty state inside card |
| Hover clipped reason | Tooltip shows full text |

---

## 10. Edge Cases

- **Pending list empties**: Empty state inside card. Section heading stays.
- **Section 3 with no data**: Set `ADMIN_UPCOMING_APPROVED = []` — entire section vanishes. No empty state.
- **Null reason**: Renders `"—"`. Guard all `.length` calls — never call on `null`.
- **Permission guard**: `hasApproveLeave === false` → no Actions `<TableHead>` or `<TableCell>`. Data still shows.
- **Mobile filters**: Stack vertically. Date pair stays inline even on mobile.

---

## 11. Component Inventory

### New files

| Component / File | Path |
|---|---|
| Admin leave page | `src/routes/_admin/admin.leave.tsx` |
| Admin stat card | `src/features/leave/components/admin-leave-stat-card.tsx` |
| Pending requests table | `src/features/leave/components/admin-pending-requests-table.tsx` |
| Upcoming approved table | `src/features/leave/components/admin-upcoming-approved-table.tsx` |
| Leave history table (admin) | `src/features/leave/components/admin-leave-history-table.tsx` |
| Leave type badge | `src/features/leave/components/leave-type-badge.tsx` |
| Leave status badge | `src/features/leave/components/leave-status-badge.tsx` |
| Admin static data | `src/features/leave/constants/admin-leave-data.ts` |
| Admin leave types | `src/features/leave/types/admin-leave.types.ts` |

### Types (`admin-leave.types.ts`)

```ts
export type AdminLeaveType = "PAID" | "SICK" | "UNPAID";
export type AdminLeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface AdminLeaveRequest {
  leaveRequestId: number;
  employeeId: number;
  employeeName: string;
  leaveType: AdminLeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  status: AdminLeaveStatus;
  approvedDate: string | null;
  createdAt: string;
}

export interface AdminLeaveStat {
  label: string;
  value: number;
  unit: string;
  description: string;
}

export type ConfirmingState = { id: number; action: "approve" | "reject" } | null;
```

### shadcn Components

Card, CardHeader, CardTitle, CardContent, Table/Header/Body/Row/Head/Cell, Badge, Button, Select/Trigger/Content/Item/Value, Input, Tooltip/Provider/Trigger/Content — all already in use, no new installs.

### lucide-react Icons

`CheckCircle2`, `Clock`, `XCircle`, `Ban`, `Search` (history empty state).

---

## 12. Handoff Notes for Frontend Developer

1. **Static data in `admin-leave-data.ts`**: All 4 constants live here. When backend is ready, replace with TanStack Query hooks.
2. **Pending requests as `useState`**: Initialise from `ADMIN_PENDING_REQUESTS`. Optimistic removal on confirm. When API is wired, replace with mutation + query invalidation.
3. **One `confirming` state per table**: Lives in the page or `AdminPendingRequestsTable`. Not per-row. Clicking a new row replaces the confirming state.
4. **`LeaveTypeBadge` and `LeaveStatusBadge` are shared**: Both tables use them. Keep them as dedicated small components.
5. **Filter state is all local `useState`**: No URL params in static phase. `filterEmployee` and `filterLeaveType` init to `"all"`. Dates init to `""`.
6. **`formatDateShort`**: month + day only (`"Apr 5"`). Add to `src/lib/utils.ts` alongside `formatDate`.
7. **No forms**: Filter controls are plain `<Input>` and `<Select>` wired to state directly. React Hook Form not used.
8. **Permission check**: `const hasApproveLeave = useHasPermission(PERMISSIONS.APPROVE_LEAVE)`. Conditionally renders the entire Actions column (both `<TableHead>` and all action `<TableCell>`s).
9. **Null reason guard everywhere**: Both tables receive `reason: string | null`. Never call `.length` without null check.
10. **`createdAt` is ISO datetime**: For "Submitted" column, use `formatDate(request.createdAt.split("T")[0])`.
11. **Route title**: `context: { title: 'Leave Management' }` in route definition.
12. **Component size limit**: Page route file assembles sections and holds shared state only. No inline table markup.
