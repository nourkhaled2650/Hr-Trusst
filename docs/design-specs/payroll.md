# Payroll Feature — Design Spec

## Business Rules Summary (from HR Expert)

### Full-time payslip components
- **Gross**: basicSalary (from config: basicSalary / workingDaysInMonth × actualWorkedDays, pre-deductions)
- **Normal OT**: hours × (basicSalary / (workingDaysInMonth × standardWorkingHours)) × normalOvertimeRate
- **Special OT**: hours × (basicSalary / (workingDaysInMonth × standardWorkingHours)) × specialOvertimeRate
- **Lateness deduction**: deducted hours × hourly rate
- **Leave deductions**: absent unpaid days × daily rate
- **Admin adjustments**: manual deductions or additions with a label and note (note appears on employee payslip)
- **Net payable** = gross + normal OT + special OT − lateness − leave deductions ± adjustments

### Part-time payslip components
- Net = worked hours × hourlyRate (no OT, no deductions, no adjustments)

### Approval
- Per-employee per-month — admin reviews and approves each employee individually
- Not batch — 10 employees = 10 approval actions
- Payslip lifecycle: DRAFT → APPROVED → PAID
- Once PAID, nothing changes

### Absence
- Handled exclusively through unpaid leave — no separate absence tracking

---

## Phase 1 — Admin Payroll List Page (`/admin/payroll`)

### Screen Purpose
Give the admin a company-wide payroll overview per month, with the ability to trigger and navigate to any month's processing.

### User Type
Admin (Super Admin + Sub-Admin with payroll permission)

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Payroll                                    [Month Selector]  │
├──────────────────────────────────────────────────────────┤
│  ← April 2026 →   (KPI strip for selected month)        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ Total  │ │ Total  │ │ Total  │ │Employees│           │
│  │ Net    │ │ Gross  │ │ Paid   │ │on Payroll│          │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ Avg    │ │ Normal │ │ Special│ │  Month │           │
│  │  Net   │ │  OT Pay│ │ OT Pay │ │ Status │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
├──────────────────────────────────────────────────────────┤
│  All Months Table (always shows all months, no filter)   │
│  Month        │ Employees │ Net Payroll │ Status │ Action│
│  ─────────────┼───────────┼────────────┼────────┼───────│
│  April 2026   │    —      │     —      │ PENDING│[Trigger Now] │
│  March 2026   │   12      │ EGP 48,200 │  PAID  │ [View]│
│  ...                                                     │
└──────────────────────────────────────────────────────────┘
```

### KPI Strip (8 cards, 2 rows of 4)
All values are for the **selected month** from the month selector.

| Card | Value | Null state |
|---|---|---|
| Total Net Payroll | Sum of all employee net payables | `—` |
| Total Gross Payroll | Sum of all gross (before deductions) | `—` |
| Total Paid | Amount actually marked as paid | `—` |
| Employees on Payroll | Count of employees in that month | `0` |
| Average Net Salary | Total Net / Employees | `—` |
| Total Normal OT Pay | Sum of normal OT amounts | `EGP 0` |
| Total Special OT Pay | Sum of special OT amounts | `EGP 0` |
| Month Status | Badge (see below) | — |

**Month Status badge variants:**
- `PENDING` — muted/secondary (month not yet triggered)
- `DRAFT` — warning/amber (triggered, in progress)
- `APPROVED` — primary/violet
- `PAID` — success/green

### Month List Table
- Shows **all months** regardless of the KPI month selector
- Sorted newest first
- Columns: Month, Employees, Net Payroll, Status, Action

**Row variants:**
- **PENDING row** (current in-progress month): Status = `PENDING` badge, Action = `"Trigger Now"` Button (variant: default/primary)
  - Clicking opens an `AlertDialog` confirmation: "This will generate payslip data for all active employees for [Month Year]. You can review and adjust before approving. Continue?"
  - On confirm: calls trigger endpoint, row transitions to DRAFT
- **Any other row**: Action = `"View"` Button (variant: outline) → navigates to `/admin/payroll/{year}/{month}`

### Currency Format
`Intl.NumberFormat` with `maximumFractionDigits: 0` + `"EGP "` prefix — **not** `style: 'currency'`.
Example: `EGP 48,200`

### Components
- `PageHeader` with title "Payroll"
- Month selector: custom prev/next `Button` (ghost, icon) + formatted month label
- KPI strip: 8 × `Card` with `CardHeader` (label) + `CardContent` (value)
- Status badges: `Badge` with semantic variant
- Table: shadcn `Table` (or plain HTML table with Tailwind)
- Trigger confirmation: `AlertDialog`
- Navigation: TanStack Router `Link` or `useNavigate`

### Interaction Notes
- Month selector changes KPI strip — table is unaffected
- "Trigger Now" → AlertDialog → confirm → optimistic row update to DRAFT + toast success
- "View" → navigate to `/admin/payroll/{year}/{month}`
- Empty state (no months yet): centered illustration + "No payroll runs yet"

### Edge Cases
- No payroll data at all: empty table with empty state, KPI strip shows all `—`
- Month triggered but no employees: `Employees on Payroll = 0`
- Loading: skeleton for KPI cards + table rows

### Query Keys
```ts
QUERY_KEYS.payroll.months()               // all months list
QUERY_KEYS.payroll.monthSummary(year, month)  // KPI strip for selected month
```

### API Endpoints Needed (backend to deliver)
```
GET  /api/admin/payroll/months              → months list + per-row summary
GET  /api/admin/payroll/{year}/{month}/summary  → KPI strip data
POST /api/admin/payroll/{year}/{month}/trigger  → generate payroll for month
```

---

## Phase 2 — Admin Month Detail View (`/admin/payroll/{year}/{month}`)

### Screen Purpose
Let the admin review every employee's payslip breakdown for the month, add adjustments, and approve each employee individually before marking the month as paid.

### User Type
Admin

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Payroll                                           │
│  April 2026 Payroll                    [DRAFT badge]         │
│                                                              │
│  Summary bar:                                                │
│  EGP 156,400 total net · 12 employees · 8 DRAFT · 4 APPROVED│
│                          [Mark Month as Paid] (when all APPROVED) │
├──────────────────────────────────────────────────────────────┤
│  FULL-TIME EMPLOYEES (8)                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Employee │ Gross │ Normal OT │ Spec OT │ Deductions │ Adj │ Net │ Status │ Actions │
│  ├──────────┼───────┼──────────┼─────────┼────────────┼─────┼─────┼────────┼─────────┤
│  │ Ahmed M. │ 8,500 │    420   │    —    │   (150)    │  —  │8,770│ DRAFT  │[Approve][+ Adj]│
│  │ Sara K.  │ 8,000 │     —    │   640   │    —       │(200)│8,440│ DRAFT  │[Approve][+ Adj]│
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  PART-TIME EMPLOYEES (4)                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Employee │ Hours Worked │ Rate (EGP/hr) │ Net │ Status │ Actions │
│  ├──────────┼─────────────┼───────────────┼─────┼────────┼─────────┤
│  │ Yara H.  │    72.5     │     25.00     │1,813│APPROVED│ (locked) │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Full-time Employee Table Columns

| Column | Description | Notes |
|---|---|---|
| Employee | Avatar + name | Clicking name opens employee record in new tab |
| Gross | Pro-rated basic salary | Before deductions |
| Normal OT | OT amount (1.5×) | `—` if none |
| Special OT | Holiday/leave OT (2×) | `—` if none |
| Deductions | Lateness + unpaid leave combined | Shown as `(amount)` in muted red |
| Adj | Net adjustment from admin entries | `+amount` green / `(amount)` red / `—` if none |
| Net Payable | Final amount | Bold, always shown |
| Status | Badge | DRAFT=amber, APPROVED=violet, PAID=green |
| Actions | Buttons | See below |

**Deductions column tooltip**: hover shows breakdown (lateness: X, leave: Y)
**Adj column tooltip**: hover shows list of all adjustments with labels

### Part-time Employee Table Columns

| Column | Description |
|---|---|
| Employee | Avatar + name |
| Hours Worked | Total logged hours this month |
| Rate (EGP/hr) | Snapshot hourly rate |
| Net Payable | hours × rate, bold |
| Status | Badge |
| Actions | See below |

### Per-employee Actions by Status

| Status | Available Actions |
|---|---|
| DRAFT | `Approve` (primary button) + `+ Adjustment` (ghost button) |
| APPROVED | `Approved` (success badge, not a button) + `+ Adjustment` (ghost, still allowed) |
| PAID | Row is read-only, no actions |

- Adjustments can be added even after APPROVED — final net recalculates live
- Part-time: no `+ Adjustment` button (PT payslip is pure hours × rate, no manual adjustments)

### Month-level "Mark Month as Paid" Button
- Appears in the summary bar only when **every employee is APPROVED**
- Variant: default (primary/violet)
- Clicking opens `AlertDialog`: "Mark April 2026 as paid? This will lock all payslips and cannot be undone."
- On confirm: all rows flip to PAID, button disappears, month badge becomes PAID/green

### Summary Bar
Always visible below the page title:
- Total net payroll for the month (EGP format)
- Employee count
- Approval progress: `X APPROVED · Y DRAFT` (when not all approved)
- "All approved — ready to mark as paid" (when all APPROVED, with the Mark as Paid button)

### Interaction Notes
- `Approve` button: optimistic update, row badge flips to APPROVED, button replaced with success badge
- `+ Adjustment` → opens Adjustment Dialog (Phase 3) — net column updates immediately after save
- Clicking employee name → opens employee record (new tab or drawer, TBD in Phase 3)
- Loading state: skeleton rows for both sections

### Edge Cases
- Month is PAID: entire page is read-only, no action buttons, banner: "This payroll period is locked."
- Employee with zero hours (was on full unpaid leave): row still present, gross = 0, net = 0 (or negative if there are prior adjustments)
- Single employee company: still requires 1 approval before Mark as Paid
- No part-time employees: PART-TIME section hidden entirely
- No full-time employees: FULL-TIME section hidden entirely

### Query Keys
```ts
QUERY_KEYS.payroll.monthDetail(year, month)       // full employee list with breakdowns
QUERY_KEYS.payroll.employeePayslip(year, month, employeeId)  // per-employee (for optimistic update target)
```

### API Endpoints Needed (backend to deliver)
```
GET  /api/admin/payroll/{year}/{month}/employees       → all employees with payslip breakdowns
POST /api/admin/payroll/{year}/{month}/{employeeId}/approve  → approve one employee
POST /api/admin/payroll/{year}/{month}/mark-paid       → lock entire month as paid
```

---

## Phase 3 — Adjustment Dialog

### Screen Purpose
Let the admin view, add, and delete manual adjustments (deductions or additions) on any full-time employee's payslip for the current month, with a note that appears on the employee's payslip.

### User Type
Admin

### Entry Point
`+ Adjustment` ghost button on any DRAFT or APPROVED full-time row in the Month Detail page.

### Component Choice: `Sheet` (side drawer)

A `Dialog` is too small for a list + form. A right-side `Sheet` gives space to show all existing adjustments and an add form without leaving the page context.

### Sheet Structure

```
┌─────────────────────────────────────────┐
│  Adjustments — Ahmed Mohamed      [✕]   │
│  April 2026                             │
├─────────────────────────────────────────┤
│  EXISTING ADJUSTMENTS                   │
│  ┌─────────────────────────────────┐    │
│  │ [DEDUCTION]  Equipment damage   │    │
│  │ Note: Broken monitor, deducted  │    │
│  │ from April salary               │    │
│  │                    (200.00) [🗑] │    │
│  ├─────────────────────────────────┤    │
│  │ [ADDITION]   Performance bonus  │    │
│  │ Note: Q1 target achieved        │    │
│  │                    +500.00 [🗑]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Net impact: +300.00                    │
│  (sum of all adjustments on this sheet) │
├─────────────────────────────────────────┤
│  ADD ADJUSTMENT                         │
│                                         │
│  Type    [DEDUCTION ▼]                  │
│  Label   [___________________]          │
│  Amount  [___________________]          │
│  Note    [___________________]          │
│          [___________________]          │
│                                         │
│                    [Add Adjustment]     │
└─────────────────────────────────────────┘
```

**Empty state** (no adjustments yet): skip the list section, show the Add form directly with a note: "No adjustments yet. Add the first one below."

### Add Adjustment Form Fields

| Field | Type | Validation | Notes |
|---|---|---|---|
| Type | `Select` (DEDUCTION / ADDITION) | Required | Default: DEDUCTION |
| Label | `Input` text | Required, max 100 | Appears as line item name on employee payslip |
| Amount | `Input` number | Required, > 0 | Always positive — type determines sign |
| Note | `Textarea` | Optional, max 500 | Visible to employee on their payslip |

**Note field hint text**: "This note will be visible to the employee on their payslip."

### Existing Adjustment Item

Each adjustment card shows:
- Type badge: `DEDUCTION` = destructive/red · `ADDITION` = success/green
- Label (bold)
- Note (muted, full text — no truncation)
- Amount: `(200.00)` red for DEDUCTION · `+500.00` green for ADDITION
- Delete icon button (🗑) — right aligned

**Delete behavior:**
- No confirmation dialog (the Sheet itself is focused — misclick risk is low)
- Optimistic removal from list
- Net impact line recalculates immediately
- Triggers invalidation of `QUERY_KEYS.payroll.monthDetail(year, month)`

### Net Impact Line
Below the adjustments list, above the add form:
- `Net impact: +300.00` — green when positive, red when negative, muted when zero
- Recalculates live as adjustments are added/deleted
- This is the total of all adjustments shown in the sheet, not the employee's full net payable

### Behavior After Adding
- Form resets (Type stays at last selected, Label/Amount/Note clear)
- New item appears at top of list
- Net impact updates
- Parent Month Detail row: Adj column and Net Payable column update via query invalidation

### Restrictions
- Sheet is read-only (no add/delete buttons) when month status is PAID
- `+ Adjustment` button is hidden for part-time employees entirely
- Adjustments can be added to both DRAFT and APPROVED rows — net recalculates, status does not regress

### Edge Cases
- Adding adjustment to APPROVED employee: allowed, net updates, status stays APPROVED
- Amount field: reject 0 and negative — always positive, type controls the sign
- Label already used: no uniqueness constraint — admin can add two "Penalty" entries if needed
- Very long note: wraps inside the card, no truncation

### Query Keys
```ts
QUERY_KEYS.payroll.adjustments(year, month, employeeId)  // list in the sheet
```

### API Endpoints Needed (backend to deliver)
```
GET    /api/admin/payroll/{year}/{month}/{employeeId}/adjustments   → list
POST   /api/admin/payroll/{year}/{month}/{employeeId}/adjustments   → add
DELETE /api/admin/payroll/{year}/{month}/{employeeId}/adjustments/{id}  → delete
```

---

## Phase 4 — Employee Payslip List (`/employee/payslips`)

### Screen Purpose
Let employees see all their finalized payslips in one place and navigate to any month's full breakdown.

### User Type
Employee (own payslips only — no cross-employee visibility)

### Visibility Rule
Employees only see payslips with status **APPROVED** or **PAID**. DRAFT is an admin-internal state and must never be shown to the employee.

### Layout

```
┌────────────────────────────────────────────┐
│  My Payslips                               │
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  │
│  │  March 2026                          │  │
│  │  Net Payable: EGP 8,770   [PAID] ──→ │  │
│  ├──────────────────────────────────────┤  │
│  │  February 2026                       │  │
│  │  Net Payable: EGP 8,200   [PAID] ──→ │  │
│  ├──────────────────────────────────────┤  │
│  │  April 2026                          │  │
│  │  Net Payable: EGP 9,100 [APPROVED]──→│  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

Sorted newest first. Entire row is clickable → navigates to payslip detail.

### List Item (Card row)

Each row is a `Card` (or styled `div`) with:
- **Month Year** — bold, left
- **Net Payable** — `EGP X,XXX` format, prominent
- **Status badge** — `APPROVED` = violet · `PAID` = green
- Chevron right icon — signals navigability

No separate "View" button — the whole card is the tap target (important for mobile).

### Components
- Page header: "My Payslips"
- List: stacked `Card` items, subtle divider between them
- Status badges: `Badge`
- Navigation: TanStack Router `Link` wrapping each card

### Empty State
Centered, simple:
- Icon (e.g. `FileText` from lucide)
- "No payslips yet"
- "Your payslips will appear here once approved."

### Loading State
3–5 skeleton card rows (same height as real rows).

### Edge Cases
- Only APPROVED payslips exist (none paid yet): all show violet APPROVED badge — normal
- Employee was part-time for some months and full-time for others: list looks identical — type distinction is in the detail page only
- Employee just joined: 1 payslip or empty state

### Query Keys
```ts
QUERY_KEYS.payroll.myPayslips()  // employee's own list
```

### API Endpoints Needed (backend to deliver)
```
GET /api/payroll/my-payslips  → list of { year, month, netPayable, status } for the authenticated employee
                                Only returns APPROVED and PAID — never DRAFT
```

---

## Phase 5 — Employee Payslip Detail (`/employee/payslips/{year}/{month}`)

### Screen Purpose
Show the employee their complete payslip breakdown for one month — earnings, deductions, adjustments with admin notes, and net payable.

### User Type
Employee (own payslip only — backend enforces ownership)

### Two Variants
The layout adapts based on the employee's type **at the time the payslip was generated**:
- **Full-time variant**: full breakdown with earnings, deductions, adjustments
- **Part-time variant**: simple hours × rate card

---

### Full-time Variant Layout

```
┌──────────────────────────────────────────────┐
│  ← My Payslips                               │
│  April 2026 Payslip                 [PAID]   │
│  Ahmed Mohamed · Full-time                   │
├──────────────────────────────────────────────┤
│  EARNINGS                                    │
│  Basic Salary (pro-rated)      EGP  8,500    │
│  Normal Overtime  (4.5 hrs)    EGP    283    │
│  Special Overtime (3.0 hrs)    EGP    378    │
│                          ─────────────────   │
│  Total Earnings                EGP  9,161    │
├──────────────────────────────────────────────┤
│  DEDUCTIONS                                  │
│  Lateness (2.0 hrs deducted)  (EGP   126)   │
│  Unpaid Leave (1.0 day)       (EGP   403)   │
│                          ─────────────────   │
│  Total Deductions             (EGP   529)   │
├──────────────────────────────────────────────┤
│  ADJUSTMENTS                  (if any)       │
│  Equipment damage             (EGP   200)   │
│  Note: Broken monitor,                       │
│        deducted from April salary            │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─     │
│  Performance bonus            +EGP  500     │
│  Note: Q1 target achieved                    │
│                          ─────────────────   │
│  Net Adjustments              +EGP  300      │
├──────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐    │
│  │  NET PAYABLE          EGP  8,932     │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### Full-time Section Details

**EARNINGS section**
| Line | Value |
|---|---|
| Basic Salary (pro-rated) | Pro-rated gross for the month |
| Normal Overtime (X hrs) | OT amount; hidden if 0 hours |
| Special Overtime (X hrs) | Special OT amount; hidden if 0 hours |
| **Total Earnings** | Sum of above, bold |

**DEDUCTIONS section**
| Line | Value |
|---|---|
| Lateness (X hrs deducted) | Deduction amount in `(parentheses)` red; hidden if none |
| Unpaid Leave (X days) | Deduction amount in `(parentheses)` red; hidden if none |
| **Total Deductions** | Sum, bold, red |

If no deductions at all: section is **hidden entirely** (not "EGP 0").

**ADJUSTMENTS section**
Only shown if the admin entered at least one adjustment.

Each adjustment item:
- Label (bold) + amount (`(EGP 200)` red for DEDUCTION · `+EGP 500` green for ADDITION)
- Note on the next line (muted, italic) — always shown if present, never truncated
- Thin dashed divider between items

Net Adjustments line at the bottom of the section: green if net positive, red if net negative.

If no adjustments: section is **hidden entirely**.

**NET PAYABLE**
- Always visible, in a highlighted `Card` / bordered box
- Large text, prominent
- Formula: Total Earnings − Total Deductions ± Net Adjustments

---

### Part-time Variant Layout

```
┌──────────────────────────────────────────────┐
│  ← My Payslips                               │
│  April 2026 Payslip                 [PAID]   │
│  Yara Hassan · Part-time                     │
├──────────────────────────────────────────────┤
│  Hours Worked         72.5 hrs               │
│  Hourly Rate          EGP 25.00 / hr         │
│                  ─────────────────────────   │
│  ┌──────────────────────────────────────┐    │
│  │  NET PAYABLE          EGP  1,813     │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

Simple — no sections, no deductions, no adjustments. Just hours, rate, net.

---

### Shared Details (both variants)

**Header**
- Back link: "← My Payslips"
- Title: "April 2026 Payslip"
- Status badge: `APPROVED` = violet · `PAID` = green
- Employee name + employment type (muted, below title)

**Download button** (secondary action, top-right of header)
- Label: "Download PDF"
- Opens browser print dialog (or triggers a backend PDF endpoint if available)
- Icon: `Download` from lucide

**Section headers**
- All caps, small, letter-spaced, muted — e.g. `EARNINGS`, `DEDUCTIONS`, `ADJUSTMENTS`
- Used as visual separators between blocks

**Number alignment**
- All amounts right-aligned in their column
- Deductions and negative adjustments always in `(parentheses)` — never a minus sign
- Currency prefix: `EGP` before every amount

### Components
- Back navigation: TanStack Router `Link`
- Status badge: `Badge`
- Section blocks: plain `div` with `border-b` divider or `Separator`
- Net Payable box: `Card` with accent background (`bg-primary/5` or similar)
- Download: `Button` variant outline + `Download` icon

### Loading State
Full-page skeleton: header skeleton + 2–3 section skeletons + net box skeleton.

### Edge Cases
- No deductions: DEDUCTIONS section hidden — do not show a zero row
- No OT: OT lines hidden — do not show zero rows
- No adjustments: ADJUSTMENTS section hidden entirely
- All-zero month (e.g. full unpaid leave): Earnings = 0, Deductions = full salary, Net = 0 (or negative if adjustments) — still render correctly
- Employee changed type mid-year: each payslip reflects the type at generation time (backend provides this)

### Query Keys
```ts
QUERY_KEYS.payroll.myPayslipDetail(year, month)  // full breakdown for authenticated employee
```

### API Endpoints Needed (backend to deliver)
```
GET /api/payroll/my-payslips/{year}/{month}  → full payslip detail for authenticated employee
                                               Only returns APPROVED or PAID — 403 if DRAFT
```

### Response Shape
```json
{
  "year": 2026,
  "month": 4,
  "status": "PAID",
  "employeeName": "Ahmed Mohamed",
  "employmentType": "FULL_TIME",

  // Full-time fields (null for part-time)
  "basicSalary": 8500.00,
  "normalOvertimeHours": 4.5,
  "normalOvertimeAmount": 283.00,
  "specialOvertimeHours": 3.0,
  "specialOvertimeAmount": 378.00,
  "totalEarnings": 9161.00,
  "latenessDeductionHours": 2.0,
  "latenessDeductionAmount": 126.00,
  "leaveDeductionDays": 1.0,
  "leaveDeductionAmount": 403.00,
  "totalDeductions": 529.00,
  "adjustments": [
    {
      "type": "DEDUCTION",
      "label": "Equipment damage",
      "amount": 200.00,
      "note": "Broken monitor, deducted from April salary"
    },
    {
      "type": "ADDITION",
      "label": "Performance bonus",
      "amount": 500.00,
      "note": "Q1 target achieved"
    }
  ],
  "netAdjustments": 300.00,

  // Part-time fields (null for full-time)
  "hoursWorked": null,
  "hourlyRate": null,

  "netPayable": 8932.00
}
```
