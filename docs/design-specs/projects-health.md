# Design Spec — Project Health & Cost Tracking
**Date**: 2026-04-02
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation
**Extends**: `frontend/docs/design-specs/projects.md` (base spec — Screen 1, Screen 2, Screen 3 foundation)

---

## Overview

This spec is an additive layer on top of the existing Projects design spec. It does not replace that document — the frontend developer must read both.

Changes by area:

| Area | Type | Summary |
|---|---|---|
| Screen 1 — Project List | Enhancement | KPI strip above filters; health dot in Status column; Total Cost column |
| Screen 3 — Project Detail | Redesign | Replace single-card layout with hero card + 4-tab structure |
| New dialogs | New | Add Manual Cost, Edit Manual Cost |
| Existing dialogs | Carried forward | Create Project (unchanged), Assign Employee (moved to Tab 3) |

---

## New API Contracts (backend to build)

All new endpoints are Admin-only (`@PreAuthorize("hasRole('ADMIN')")`). The frontend must treat all of them as **static/placeholder** until the backend confirms they are implemented. See the static data strategy at the bottom of this document.

### Company KPIs

**`GET /api/admin/projects/kpis`**

Response shape:
```json
{
  "activeProjects": "int",
  "totalBudgetAllocated": "decimal | null",
  "totalCostIncurred": "decimal",
  "budgetRemaining": "decimal | null",
  "projectsAtRisk": "int",
  "projectsOverBudget": "int",
  "totalRevenueRecognized": "decimal | null",
  "overallGrossMargin": "decimal | null"
}
```

Fields are null when the metric cannot be computed (e.g., no project has a budget set → `totalBudgetAllocated` is null). Never return 0 for "not applicable" — always null.

---

### Per-Project Cost Summary

**`GET /api/admin/projects/{id}/cost-summary`**

Response shape:
```json
{
  "projectId": "long",
  "healthStatus": "ON_TRACK | AT_RISK | OVER_BUDGET | NO_BUDGET | COMPLETED_PROFITABLE | COMPLETED_AT_LOSS | COMPLETED_NEUTRAL",
  "budgetUtilizationPct": "decimal | null",
  "totalCost": "decimal",
  "totalSalaryCost": "decimal",
  "totalManualCost": "decimal",
  "budget": "decimal | null",
  "budgetVariance": "decimal | null",
  "projectedFinalCost": "decimal | null",
  "projectedVariance": "decimal | null",
  "revenueTarget": "decimal | null",
  "actualRevenue": "decimal | null",
  "grossMargin": "decimal | null",
  "marginPct": "decimal | null",
  "dailyBurnRate": "decimal | null",
  "weeklyBurnRateRolling": "decimal | null",
  "weeklyBurnRateAverage": "decimal | null",
  "activeDays": "int",
  "overtimeDelta": "decimal",
  "normalOtExtra": "decimal",
  "specialOtExtra": "decimal",
  "overtimePctOfSalaryCost": "decimal | null",
  "employeeCosts": [
    {
      "employeeId": "long",
      "employeeName": "string",
      "employmentType": "FULL_TIME | PART_TIME",
      "hoursLogged": "decimal",
      "salaryCost": "decimal",
      "costStatus": "ESTIMATED | CONFIRMED"
    }
  ]
}
```

---

### Weekly Trend

**`GET /api/admin/projects/{id}/trend`**

Response shape:
```json
{
  "weeks": [
    {
      "weekStart": "ISO-8601 date (Monday)",
      "salaryCost": "decimal",
      "manualCost": "decimal",
      "totalCost": "decimal",
      "hours": "decimal"
    }
  ]
}
```

All weeks from project `startDate` to today (or `endDate` if completed) are returned, with zeros for idle weeks. No sparse data — the frontend receives a complete, continuous series.

---

### Manual Cost Entries

**`GET /api/admin/projects/{id}/costs`**

Response shape:
```json
[
  {
    "costId": "long",
    "projectId": "long",
    "costDate": "ISO-8601 date",
    "category": "string",
    "description": "string",
    "amount": "decimal",
    "receiptRef": "string | null",
    "notes": "string | null",
    "createdAt": "ISO-8601 datetime"
  }
]
```

**`POST /api/admin/projects/{id}/costs`**

Request body:
```json
{
  "costDate": "ISO-8601 date",
  "category": "string",
  "description": "string",
  "amount": "decimal",
  "receiptRef": "string | null",
  "notes": "string | null"
}
```

**`PUT /api/admin/projects/{projectId}/costs/{costId}`** — same body as POST

**`DELETE /api/admin/projects/{projectId}/costs/{costId}`** — soft delete, no body

---

### Cost Categories

**`GET /api/admin/cost-categories`**

Response shape:
```json
[
  { "categoryId": "long", "name": "string", "active": "boolean" }
]
```

Frontend only shows active categories (`active: true`).

---

### Project Financial Fields (added to existing PUT)

**`PUT /api/projects/{id}`** — budget/revenue fields added to existing request body:
```json
{
  "budget": "decimal | null",
  "revenueTarget": "decimal | null",
  "actualRevenue": "decimal | null"
}
```

These are optional additions to the existing update payload. When omitted or null, backend stores null (not 0).

---

## Part 1 — Screen 1 Enhancements

### 1A — KPI Stats Strip

Inserted between the page header row and the filter/search row.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  "Projects"                                       [+ New Project]   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ ┌────┐ │
│  │ Active  │ │ Budget  │ │  Cost   │ │Remaining│ │At Risk│ │Over│ │
│  │ 12      │ │ $480k   │ │ $192k   │ │ $288k   │ │   2   │ │  0 │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘ └────┘ │
│  ┌──────────────────────┐ ┌────────────────────────┐               │
│  │  Revenue: $210k      │ │  Gross Margin: $18k     │               │
│  └──────────────────────┘ └────────────────────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│  [Search input]                              [Status filter]        │
├─────────────────────────────────────────────────────────────────────┤
│  DataTable                                                          │
└─────────────────────────────────────────────────────────────────────┘
```

The strip uses a `<div className="grid grid-cols-4 gap-3 sm:grid-cols-8">` for 8 chips on desktop, wrapping to 4 per row on narrower viewports. Each chip is a compact `<Card>`.

#### KPI Chip Spec

Each chip:
```tsx
<Card className="p-3">
  <p className="text-xs text-neutral-500 font-medium leading-none mb-1">{label}</p>
  <p className="text-lg font-semibold text-neutral-900">{value}</p>
</Card>
```

| # | Label | Value source | Format | Null/zero display |
|---|---|---|---|---|
| 1 | Active Projects | `kpis.activeProjects` | Integer | `0` |
| 2 | Budget Allocated | `kpis.totalBudgetAllocated` | Currency (compact: `$480k`) | `"N/A"` in `text-neutral-400` |
| 3 | Total Cost | `kpis.totalCostIncurred` | Currency (compact) | `$0` |
| 4 | Budget Remaining | `kpis.budgetRemaining` | Currency (compact), green if > 0, red if < 0 | `"N/A"` in `text-neutral-400` |
| 5 | At Risk | `kpis.projectsAtRisk` | Integer with amber dot prefix | `0` |
| 6 | Over Budget | `kpis.projectsOverBudget` | Integer with red dot prefix | `0` |
| 7 | Revenue | `kpis.totalRevenueRecognized` | Currency (compact) | `"N/A"` in `text-neutral-400` |
| 8 | Gross Margin | `kpis.overallGrossMargin` | Currency (compact), green if > 0, red if < 0 | `"N/A"` in `text-neutral-400` |

**Compact currency format**: numbers ≥ 1,000 display as `$1.2k`; ≥ 1,000,000 as `$1.2M`. Numbers below 1,000 display in full. Use a `formatCurrencyCompact(amount: number): string` utility in `src/lib/utils.ts`.

**Color accents**:
- Chip 5 (At Risk) value: `text-amber-600` when > 0, otherwise `text-neutral-900`
- Chip 6 (Over Budget) value: `text-red-600` when > 0, otherwise `text-neutral-900`
- Chip 4 (Budget Remaining) and Chip 8 (Gross Margin): `text-green-600` when positive, `text-red-600` when negative

**KPI strip loading state**: Replace each chip with `<Skeleton className="h-14 rounded-lg" />` × 8, in the same grid. Filter row and table render immediately.

**KPI strip error state**: Render the strip with all 8 chips showing `"—"` value. Do not block the table. Show no error alert — KPI failure should not dominate the page. The table data is independent.

**KPI strip static placeholder**: Until `GET /api/admin/projects/kpis` exists, the hook (`useProjectKpis`) returns `{ data: null, isLoading: false, isError: false }` immediately. The UI renders the strip with all values as `"N/A"` or `"—"`. A `// TODO: remove static placeholder when backend ready` comment in the hook.

---

### 1B — Health Dot in Status Column

The Status column cell gains a small colored dot to the left of the existing status badge.

#### Health Dot Spec

```tsx
// HealthDot component — src/features/projects/components/health-dot.tsx
const dotStyles: Record<HealthStatus, string> = {
  ON_TRACK:             'bg-green-500',
  AT_RISK:              'bg-amber-500',
  OVER_BUDGET:          'bg-red-500',
  NO_BUDGET:            'bg-neutral-300',
  COMPLETED_PROFITABLE: '',   // no dot — project done
  COMPLETED_AT_LOSS:    '',
  COMPLETED_NEUTRAL:    '',
};

// Render:
<div className="flex items-center gap-2">
  {dot && <span className={cn('h-2 w-2 rounded-full shrink-0', dotStyles[healthStatus])} />}
  <ProjectStatusBadge status={projectStatus} />
</div>
```

When `healthStatus` is not yet available (data still loading / endpoint not built), render only the status badge — no dot. This ensures backward compatibility during the rollout.

The `healthStatus` value for each project row comes from the same `GET /api/admin/projects/kpis` response — the backend must include per-project health in a new field, OR the frontend fetches it lazily (see Dev Notes 1B).

**Static placeholder strategy for health dots**: If the per-project health endpoint is not yet ready, all dots are omitted. The table remains fully functional. No placeholder dots with fake data.

---

### 1C — Total Cost Column

New column added between "Status + health dot" and "Action".

| Column | Source | Display | Width |
|---|---|---|---|
| Total Cost | `project.totalCost` (from kpis or per-project data) | Currency formatted, `text-sm text-neutral-900`. `"—"` when null/zero (no hours, no manual costs) | `w-28` |

**Updated column order**:

| Project (name + code) | Description | Start | End | Status + health dot | Total Cost | Action |

**Total cost cell**:
```tsx
<span className="text-sm tabular-nums">
  {totalCost != null && totalCost > 0 ? formatCurrency(totalCost) : '—'}
</span>
```

Use `formatCurrency(amount: number): string` (full format, not compact) — e.g., `$12,450.00`. Add this utility alongside `formatCurrencyCompact` in `src/lib/utils.ts`.

**Static placeholder**: When cost data is unavailable, the column shows `"—"` for every row. The column header still renders. No skeleton, no spinner per-cell — the `"—"` is the graceful degraded state.

---

### Dev Notes — Screen 1

1. **Per-row health status source**: The company KPI endpoint returns aggregate totals, not per-row health. The per-row health dot must come from a separate call. Two options — choose the simpler one at implementation time:
   - Option A: Extend `GET /api/projects` response to include `healthStatus` and `totalCost` per project. Cleanest approach — discuss with backend.
   - Option B: Fetch `GET /api/admin/projects/{id}/cost-summary` lazily per row only when the row becomes visible. Use `useIntersectionObserver` to trigger. Complex — only use if Option A is not feasible.
   - Option C (recommended for MVP): Add a `GET /api/admin/projects/health-overview` endpoint returning `[{ projectId, healthStatus, totalCost }]` — one lightweight call for the whole table.
   Until any of these is built, health dots and total cost column show `"—"` / no dot.

2. **KPI query key**: `QUERY_KEYS.projects.kpis()` — add to `src/constants/query-keys.ts`.

3. **New query key shape**:
   ```ts
   projects: {
     list: () => ['projects'],
     detail: (id: string) => ['projects', id],
     kpis: () => ['projects', 'kpis'],
     healthOverview: () => ['projects', 'health-overview'],
     costSummary: (id: string) => ['projects', id, 'cost-summary'],
     trend: (id: string) => ['projects', id, 'trend'],
     costs: (id: string) => ['projects', id, 'costs'],
   }
   ```

4. **New lucide-react icons needed for Screen 1**: `TrendingUp`, `TrendingDown`, `Minus`.

5. **New shadcn components**: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Popover`, `PopoverTrigger`, `PopoverContent`.

---

## Part 2 — Screen 3 Redesign: Project Health Dashboard

### Overview

The page structure changes from a vertically stacked two-card layout to:

```
[Breadcrumb]
[Hero Card — always visible]
[Tabs: Overview | Costs | Team | Settings]
  [Tab content area]
```

The sticky bottom save bar is removed. Save functionality lives only inside the Settings tab.

---

### Revised Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN NAVBAR (h-14, fixed)                                         │
├─────────────────────────────────────────────────────────────────────┤
│  bg-neutral-50, pt-14                                               │
│                                                                     │
│  ← Projects                  (breadcrumb, px-6 pt-6)               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  HERO CARD  (px-6 py-4, white, border-b border-neutral-200) │    │
│  │  Project Alpha (h1)                    [ACTIVE badge]       │    │
│  │  PROJ-001 · 01 Jan 2026 → 30 Jun 2026                       │    │
│  │  Budget: $50,000  ·  Cost to date: $22,400  ·  [ON_TRACK ●] │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  [Overview] [Costs] [Team] [Settings]   (Tabs, px-6)        │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  Tab content area  (p-6)                                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

**Hero card** is a `<div className="bg-white border-b border-neutral-200 px-6 py-4">` — not a shadcn `<Card>`. It lives outside the tabs container and is always visible.

**Tabs container** is `<div className="px-6">` wrapping a `<Tabs defaultValue="overview">`. The `<TabsList>` sits at the top, content area has `<TabsContent>` with `className="pt-6"` for inner spacing.

---

### Hero Card Spec

```
┌──────────────────────────────────────────────────────────────────┐
│  Project Alpha                            [ACTIVE]               │
│  PROJ-001  ·  01 Jan 2026 → 30 Jun 2026                         │
│                                                                  │
│  Budget $50,000  ·  Cost $22,400  ·  ● ON TRACK                 │
└──────────────────────────────────────────────────────────────────┘
```

Row 1: `<h1 className="text-xl font-semibold text-neutral-900">` + `<ProjectStatusBadge>` right-aligned in a flex row.

Row 2: `<p className="text-sm text-neutral-500 font-mono mt-0.5">{projectCode}</p>` + date range in same line:
```tsx
<p className="text-sm text-neutral-500 mt-0.5">
  <span className="font-mono">{projectCode}</span>
  <span className="mx-2 text-neutral-300">·</span>
  {startDate ? formatDate(startDate) : '—'} → {endDate ? formatDate(endDate) : 'No end date'}
</p>
```

Row 3 (only when costSummary data available): compact financial summary line:
```tsx
<div className="flex items-center gap-4 mt-2 text-sm">
  {budget && <span className="text-neutral-500">Budget <span className="text-neutral-900 font-medium">{formatCurrency(budget)}</span></span>}
  <span className="text-neutral-500">Cost <span className="text-neutral-900 font-medium">{formatCurrency(totalCost)}</span></span>
  <HealthStatusPill status={healthStatus} />
</div>
```

**HealthStatusPill component** (`src/features/projects/components/health-status-pill.tsx`):
```tsx
// A small inline pill with colored dot + label
const pillConfig: Record<HealthStatus, { dot: string; label: string; text: string }> = {
  ON_TRACK:             { dot: 'bg-green-500',   label: 'On Track',    text: 'text-green-700' },
  AT_RISK:              { dot: 'bg-amber-500',   label: 'At Risk',     text: 'text-amber-700' },
  OVER_BUDGET:          { dot: 'bg-red-500',     label: 'Over Budget', text: 'text-red-700'   },
  NO_BUDGET:            { dot: 'bg-neutral-400', label: 'No Budget',   text: 'text-neutral-500'},
  COMPLETED_PROFITABLE: { dot: 'bg-green-500',   label: 'Profitable',  text: 'text-green-700' },
  COMPLETED_AT_LOSS:    { dot: 'bg-red-500',     label: 'At Loss',     text: 'text-red-700'   },
  COMPLETED_NEUTRAL:    { dot: 'bg-neutral-400', label: 'Completed',   text: 'text-neutral-500'},
};
```

When `costSummary` is loading, Row 3 is hidden entirely — not a skeleton, just absent. The hero card collapses gracefully to 2 rows.

---

### Tab Navigation

```tsx
<Tabs defaultValue="overview" className="w-full">
  <TabsList className="border-b border-neutral-200 bg-transparent h-auto p-0 rounded-none">
    <TabsTrigger value="overview"  className="...">Overview</TabsTrigger>
    <TabsTrigger value="costs"     className="...">Costs</TabsTrigger>
    <TabsTrigger value="team"      className="...">Team</TabsTrigger>
    <TabsTrigger value="settings"  className="...">Settings</TabsTrigger>
  </TabsList>
  ...
</Tabs>
```

Tab trigger style: underline style tabs — `data-[state=active]:border-b-2 data-[state=active]:border-violet-600 data-[state=active]:text-violet-700 rounded-none px-4 py-3 text-sm font-medium text-neutral-500 hover:text-neutral-700`. Background is transparent (not the default pill style).

---

## Tab 1 — Overview

### Purpose

A complete health snapshot. The CEO opens this tab and immediately knows if the project needs attention.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [A] Health Status Banner (full-width)                           │
├──────────────────────────────────────────────────────────────────┤
│  [B] Key Metrics Row (4 cards in a row)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ ┌────────────┐  │
│  │Total Cost│ │  Budget  │ │  Budget Used %   │ │Gross Margin│  │
│  │  $22,400 │ │  $50,000 │ │ ████████░░  44%  │ │   $18,000  │  │
│  └──────────┘ └──────────┘ └──────────────────┘ └────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│  [C] Revenue & Budget Details (2-col grid, shown if budget/rev)  │
│  ┌────────────────────────┐ ┌────────────────────────────────┐   │
│  │ Budget Breakdown       │ │ Revenue                        │   │
│  │ Target: $50,000        │ │ Target: $40,000                │   │
│  │ Cost to date: $22,400  │ │ Actual: $37,000 [Add Revenue]  │   │
│  │ Variance: +$27,600     │ │ Gross margin: $14,600          │   │
│  │ Proj. final: $38,000   │ │ Margin %: 39.5%                │   │
│  └────────────────────────┘ └────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  [D] Burn Rate (2 cards side by side)                            │
│  ┌────────────────────────┐ ┌────────────────────────────────┐   │
│  │ Daily Burn Rate        │ │ Weekly Burn Rate                │   │
│  │ $820/day               │ │ Rolling 7d: $4,200             │   │
│  │                        │ │ Project avg: $3,900            │   │
│  └────────────────────────┘ └────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  [E] Cost Composition  (donut chart + legend)                    │
│  [F] Overtime Impact callout  (conditional)                      │
│  [G] Project Timeline  (conditional)                             │
└──────────────────────────────────────────────────────────────────┘
```

---

### Section A — Health Status Banner

A full-width `<Alert>` component with customized variants:

| `healthStatus` | Variant/classes | Icon | Message |
|---|---|---|---|
| `ON_TRACK` | `className="bg-green-50 border-green-200 text-green-800"` | `CheckCircle2` green | "This project is on track." |
| `AT_RISK` | `className="bg-amber-50 border-amber-200 text-amber-800"` | `AlertTriangle` amber | "This project is approaching its budget limit." |
| `OVER_BUDGET` | `className="bg-red-50 border-red-200 text-red-800"` | `XCircle` red | "This project has exceeded its budget." |
| `NO_BUDGET` | `className="bg-neutral-50 border-neutral-200 text-neutral-700"` | `Info` neutral | "No budget has been set for this project. Set a budget in Settings to enable health tracking." |
| `COMPLETED_PROFITABLE` | `className="bg-green-50 border-green-200 text-green-800"` | `CheckCircle2` green | `"Project completed. Margin: +{marginPct}%"` |
| `COMPLETED_AT_LOSS` | `className="bg-red-50 border-red-200 text-red-800"` | `TrendingDown` red | `"Project completed at a loss. Margin: −{Math.abs(marginPct)}%"` |
| `COMPLETED_NEUTRAL` | `className="bg-neutral-50 border-neutral-200 text-neutral-600"` | `CheckCircle2` neutral | "Project completed. No revenue data available." |

Use `<Alert>` + `<AlertDescription>` from shadcn. Do not use `variant="destructive"` — apply className overrides directly.

**Loading state**: Show a `<Skeleton className="h-12 w-full rounded-lg" />` while cost summary fetches.

---

### Section B — Key Metrics Row

Four equal-width cards in `<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">`.

**Card 1 — Total Cost**:
```
┌──────────────────────────┐
│ Total Cost               │
│ $22,400.00               │
│ Salary + Manual          │
└──────────────────────────┘
```
- Title: `text-xs text-neutral-500 font-medium`
- Value: `text-2xl font-semibold text-neutral-900 tabular-nums`
- Sub-label: `text-xs text-neutral-400 mt-1` — "Salary + Manual"

**Card 2 — Budget**:
```
┌──────────────────────────┐
│ Budget                   │
│ $50,000.00               │
│ [Set in Settings]        │  ← when null
└──────────────────────────┘
```
When `budget` is null: value shows `<span className="text-neutral-400 text-base font-medium">No budget set</span>` and sub-label shows a small text-link `<button className="text-xs text-violet-600 underline">Set in Settings →</button>` that switches to the Settings tab programmatically.

**Card 3 — Budget Used %**:
```
┌──────────────────────────┐
│ Budget Used              │
│ 44%                      │
│ ████████░░░░             │  ← Progress bar
└──────────────────────────┘
```
Use shadcn `<Progress value={budgetUtilizationPct} className="h-2 mt-2" />`. Color the progress indicator based on health: green for ON_TRACK, amber for AT_RISK, red for OVER_BUDGET. Apply via `[&>div]:bg-green-500` etc. on the `<Progress>` wrapper.

When `budget` is null: value shows `"N/A"`, no progress bar.

**Card 4 — Gross Margin**:
```
┌──────────────────────────┐
│ Gross Margin             │
│ $18,000.00               │
│ Revenue not yet set      │  ← when null
└──────────────────────────┘
```
Value color: `text-green-700` when positive, `text-red-600` when negative.
When `actualRevenue` is null: show `<span className="text-neutral-400 text-sm">Revenue not yet set</span>` and sub-label with the same "Set in Settings →" text-link.

---

### Section C — Revenue & Budget Details

Shown only when `budget !== null || revenueTarget !== null || actualRevenue !== null`.

Two `<Card>` components in `<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">`.

**Left Card — Budget Breakdown**:

`<CardTitle>Budget Breakdown</CardTitle>`

Row list (each row: `<div className="flex justify-between text-sm py-1.5 border-b border-neutral-100 last:border-0">`):

| Label | Value | Notes |
|---|---|---|
| Budget target | `formatCurrency(budget)` | `"—"` when null |
| Cost to date | `formatCurrency(totalCost)` | always shown |
| Variance | `formatCurrency(budgetVariance)` | green if positive, red if negative. Prefix: `+` or `-` (already in the sign). `"—"` when no budget |
| Projected final cost | `formatCurrency(projectedFinalCost)` | shown in italic `text-neutral-400`. Only shown when `endDate` is set and project is `ACTIVE`. `"—"` when null. |
| Projected variance | `formatCurrency(projectedVariance)` | same conditions as above, green/red colored |

**Right Card — Revenue**:

`<CardTitle>Revenue</CardTitle>`

| Label | Value | Notes |
|---|---|---|
| Revenue target | `formatCurrency(revenueTarget)` | `"—"` when null |
| Actual revenue | `formatCurrency(actualRevenue)` or "Not yet recorded" | When null: show a `[Add Revenue]` `<Button variant="outline" size="sm">` that opens the quick-add inline edit (described below) |
| Gross margin | `formatCurrency(grossMargin)` | green/red. `"—"` when no revenue |
| Margin % | `{marginPct}%` | green/red. `"—"` when no revenue |

**[Add Revenue] quick action**: Clicking this button does NOT open a dialog. Instead, it switches to the Settings tab and focuses the Actual Revenue field. Implement with:
```tsx
// In Overview tab, pass a ref to the Settings tab's actual revenue input
// Or: use tab switching + scrollIntoView after tab switch settles
const switchToSettings = () => {
  setActiveTab('settings');
  setTimeout(() => document.getElementById('actualRevenue')?.focus(), 100);
};
```

---

### Section D — Burn Rate

Two equal cards in `<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">`.

**Card — Daily Burn Rate**:
```
┌──────────────────────────┐
│ Daily Burn Rate          │
│ $820.00 / day            │
│ Based on 28 active days  │
└──────────────────────────┘
```
Sub-label: `"Based on {activeDays} active day{s}"`. When `dailyBurnRate` is null (no active days): `"—"`.

**Card — Weekly Burn Rate**:
```
┌─────────────────────────────────────────┐
│ Weekly Burn Rate                        │
│                                         │
│ Rolling 7 days    Project average       │
│ $4,200            $3,900                │
└─────────────────────────────────────────┘
```
Two-column sub-grid inside the card:
```tsx
<div className="grid grid-cols-2 gap-4 mt-3">
  <div>
    <p className="text-xs text-neutral-400 mb-0.5">Rolling 7 days</p>
    <p className="text-lg font-semibold tabular-nums">{formatCurrency(weeklyBurnRateRolling)}</p>
  </div>
  <div>
    <p className="text-xs text-neutral-400 mb-0.5">Project average</p>
    <p className="text-lg font-semibold tabular-nums">{formatCurrency(weeklyBurnRateAverage)}</p>
  </div>
</div>
```
When both are null (new project, no costs yet): `"—"` in both columns.

---

### Section E — Cost Composition

Shown only when `totalCost > 0`.

`<Card>` with `<CardTitle>Cost Composition</CardTitle>`.

**Donut Chart** (Recharts `<PieChart>` with `<Pie>` using `innerRadius`):

```
Center label: "Total Cost"
              "$22,400"

Segments:
  - Salary cost:  violet-600  (primary)
  - Manual costs: amber-500
```

Recharts spec:
```tsx
<PieChart width={240} height={240}>
  <Pie
    data={[
      { name: 'Salary', value: totalSalaryCost, fill: 'var(--violet-600)' },
      { name: 'Manual', value: totalManualCost, fill: 'var(--amber-500)' },
    ]}
    cx="50%"
    cy="50%"
    innerRadius={70}
    outerRadius={100}
    paddingAngle={2}
    dataKey="value"
  />
  <Tooltip formatter={(value) => formatCurrency(value as number)} />
</PieChart>
```

Center of donut (absolute-positioned inside the chart container):
```tsx
<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
  <p className="text-xs text-neutral-400">Total Cost</p>
  <p className="text-base font-semibold text-neutral-900 tabular-nums">{formatCurrencyCompact(totalCost)}</p>
</div>
```

Place the chart and center label inside `<div className="relative inline-flex">`.

**Legend row** below the chart — top 3 manual cost categories + "Other":
```tsx
<div className="flex flex-wrap gap-3 mt-4">
  {legendItems.map(item => (
    <div key={item.category} className="flex items-center gap-1.5 text-xs text-neutral-600">
      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
      <span>{item.category}</span>
      <span className="font-medium tabular-nums">{formatCurrencyCompact(item.amount)}</span>
      <span className="text-neutral-400">({item.pct}%)</span>
    </div>
  ))}
</div>
```

When only salary cost exists (no manual costs): donut shows a single violet segment; legend is omitted.

Layout: chart left, legend right, on desktop. Stack vertically on mobile. Use `<div className="flex flex-col sm:flex-row items-start gap-6">`.

---

### Section F — Overtime Impact Callout

Shown only when `overtimeDelta > 0` AND the project has full-time employees.

A `<Card>` styled as a callout — not a full section. Use `className="border-l-4"` with border color matched to severity:
- If `overtimePctOfSalaryCost > atRiskThreshold` (system-configured, default 10%): `border-amber-400 bg-amber-50`
- Otherwise: `border-neutral-200 bg-white`

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠ Overtime Impact (Estimated)                                    │
│                                                                  │
│ Estimated overtime extra: $1,240.00                              │
│                                                                  │
│ Normal overtime extra:   $840.00                                 │
│ Special overtime extra:  $400.00                                 │
│                                                                  │
│ Overtime accounts for 8.2% of salary costs on this project.     │
└──────────────────────────────────────────────────────────────────┘
```

- Header row: `TrendingUp` icon (amber when high, neutral when low) + "Overtime Impact" + `<Badge className="text-xs bg-neutral-100 text-neutral-500">Estimated</Badge>`
- Sub-rows in a `<dl>` with `<dt>` / `<dd>` pairs. `dd` values: `tabular-nums font-medium`.
- The `"accounts for X%"` line: only shown when `overtimePctOfSalaryCost !== null`. Amber text when high threshold.

**Never** display the overtime section without the "Estimated" label. This is a hard rule — overtime figures are always estimates until payslip generation.

---

### Section G — Project Timeline

Shown only when `startDate` is set.

A compact `<Card>` with a horizontal timeline bar.

**Case: startDate set, endDate set, project not past end**:
```
Start: 01 Jan 2026          Today          End: 30 Jun 2026
|─────────────────────●────────────────────|
                       44% elapsed  (75 of 181 days)
```

**Case: startDate set, no endDate**:
```
Started 01 Jan 2026 · 75 days running
```
No progress bar — just a `<p>` text.

**Case: past endDate, still ACTIVE**:
Progress bar filled 100% in amber. Below it:
```
<Alert className="bg-amber-50 border-amber-200 text-amber-700 mt-3 py-2">
  <AlertTriangle className="h-4 w-4" />
  <AlertDescription>End date passed — project still active</AlertDescription>
</Alert>
```

**Timeline bar implementation**:
```tsx
<div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
  <div
    className={cn("h-full rounded-full", pctElapsed >= 100 ? "bg-amber-400" : "bg-violet-400")}
    style={{ width: `${Math.min(pctElapsed, 100)}%` }}
  />
</div>
```

Today marker: a small absolute-positioned dot at the `pctElapsed` position.

---

### Overview Tab — States

**Loading (costSummary fetching)**:
- Section A: `<Skeleton className="h-12 w-full" />`
- Section B: 4 `<Skeleton className="h-24 rounded-lg" />` in grid
- Sections C, D, E, F, G: `<Skeleton className="h-32 rounded-lg" />` stacked

**Error (costSummary failed)**:
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Failed to load project health data. <button className="underline">Retry</button></AlertDescription>
</Alert>
```
Retry re-triggers the query.

**Static/placeholder state** (backend not yet built):
Show a single info banner instead of sections B through G:
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center text-neutral-400">
  <BarChart3 className="h-10 w-10 mb-3 text-neutral-300" />
  <p className="text-sm font-medium text-neutral-600">Project health data is not yet available.</p>
  <p className="text-xs text-neutral-400 mt-1">The cost tracking backend is under development.</p>
</div>
```

---

## Tab 2 — Costs

### Purpose

Full cost transparency — breakdown by employee and manual entries, trend over time.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [A] Weekly Cost Trend Chart (full-width card)                   │
│      Stacked bars (salary / manual) + cumulative line            │
├──────────────────────────────────────────────────────────────────┤
│  [B] Cost by Employee (card)                                     │
│      Name · FT/PT · Hours · Salary Cost · Status                 │
│      ─────────────────────────────────────────                   │
│      Manual Costs subtotal  [expandable]                         │
├──────────────────────────────────────────────────────────────────┤
│  [C] Manual Cost Entries (card)             [+ Add Cost]         │
│      Date · Category · Description · Amount · Receipt · Actions  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Section A — Weekly Cost Trend Chart

Full-width `<Card>` with `<CardTitle>Weekly Cost Trend</CardTitle>` and `<CardDescription>Salary and manual costs by week</CardDescription>`.

**Recharts component**: `<ComposedChart>` — stacked bars + cumulative line + optional dashed budget threshold line.

```tsx
<ComposedChart data={trendWeeks} margin={{ top: 8, right: 40, left: 8, bottom: 8 }}>
  <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" />
  <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
  <YAxis yAxisId="left" tickFormatter={formatCurrencyCompact} tick={{ fontSize: 11 }} />
  <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrencyCompact} tick={{ fontSize: 11 }} />

  {/* Stacked bars — left Y axis */}
  <Bar yAxisId="left" dataKey="salaryCost" stackId="cost" fill="var(--violet-500)" name="Salary" />
  <Bar yAxisId="left" dataKey="manualCost" stackId="cost" fill="var(--amber-400)" name="Manual" radius={[3, 3, 0, 0]} />

  {/* Cumulative cost line — right Y axis */}
  <Line yAxisId="right" dataKey="cumulativeCost" stroke="var(--neutral-600)" strokeWidth={2} dot={false} name="Cumulative" />

  {/* Budget threshold dashed line — only when budget is set */}
  {budget && (
    <ReferenceLine yAxisId="right" y={budget} stroke="var(--red-400)" strokeDasharray="6 3" label={{ value: 'Budget', fill: 'var(--red-500)', fontSize: 11 }} />
  )}

  <Tooltip content={<CostTrendTooltip />} />
  <Legend iconType="circle" iconSize={8} />
</ComposedChart>
```

**Tooltip component** (`CostTrendTooltip`):
```
Week of Mar 10
─────────────────
Salary:     $3,200
Manual:     $  400
Total:      $3,600
Hours:      42h
Cumulative: $18,400
```

**`weekLabel` field**: formatted as `"Mar 3"` (`MMM d` format) from `weekStart` date.

**`cumulativeCost` field**: computed on the frontend from the trend array. Each week's cumulativeCost = sum of all `totalCost` values from week 0 through current week. This is a derived field, not from the API.

**Colors**:
- Salary bars: `#7c3aed` (violet-700, close to `bg-primary`)
- Manual bars: `#f59e0b` (amber-400)
- Cumulative line: `#525252` (neutral-600)
- Budget reference line: `#f87171` (red-400) dashed

**Empty state** (no weeks with data):
```tsx
<div className="flex flex-col items-center justify-center h-48 text-neutral-400">
  <BarChart3 className="h-8 w-8 mb-2 text-neutral-300" />
  <p className="text-sm">No cost data yet.</p>
  <p className="text-xs mt-0.5">Costs will appear once employees log hours or manual costs are added.</p>
</div>
```

**Trend static placeholder**: When `GET /api/admin/projects/{id}/trend` is not yet built, the chart section shows the empty state with the note "Cost trend data is under development."

**Chart container**: `<div className="w-full h-64">` wrapping a `<ResponsiveContainer width="100%" height="100%">`.

---

### Section B — Cost by Employee

`<Card>` with `<CardTitle>Cost by Employee</CardTitle>`.

Table columns (`<Table>` from shadcn):

| Column | Source | Display |
|---|---|---|
| Employee | `employeeName` | `text-sm font-medium` |
| Type | `employmentType` | `<Badge>` — `FT` (violet, small) or `PT` (blue, small) |
| Hours Logged | `hoursLogged` | `{N}h` tabular-nums |
| Salary Cost | `salaryCost` | `formatCurrency(amount)` tabular-nums |
| Status | `costStatus` | `<Badge>` — `ESTIMATED` amber, `CONFIRMED` green |

Sort: by `salaryCost` descending (frontend sort, no backend pagination).

**Employment type badge styles**:
- `FULL_TIME`: `<Badge className="bg-violet-50 text-violet-700 border border-violet-200 text-xs">FT</Badge>`
- `PART_TIME`: `<Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">PT</Badge>`

**Cost status badge styles**:
- `ESTIMATED`: `<Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">Estimated</Badge>`
- `CONFIRMED`: `<Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">Confirmed</Badge>`

**"Estimated" tooltip**: Hover over `ESTIMATED` badge shows a `<Tooltip>` (shadcn): "Full-time salary cost is estimated until the monthly payslip is generated."

**Manual Costs summary row** below employee rows — separated by a `<Separator>`. A collapsible row:
```tsx
<TableRow className="bg-neutral-50">
  <TableCell colSpan={3} className="font-medium text-sm text-neutral-600">
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-1 text-sm text-neutral-600">
        <ChevronRight className="h-3.5 w-3.5 data-[state=open]:rotate-90 transition-transform" />
        Manual Costs
      </CollapsibleTrigger>
      <CollapsibleContent>
        {/* inline mini-table of manual cost entries by category */}
      </CollapsibleContent>
    </Collapsible>
  </TableCell>
  <TableCell className="text-sm font-medium tabular-nums">{formatCurrency(totalManualCost)}</TableCell>
  <TableCell />
</TableRow>
```

Expanded content shows entries grouped by category: `Category name — $amount`.

**Total row** (table footer):
```tsx
<TableFooter>
  <TableRow>
    <TableCell colSpan={3} className="font-semibold">Total</TableCell>
    <TableCell className="font-semibold tabular-nums">{formatCurrency(totalCost)}</TableCell>
    <TableCell />
  </TableRow>
</TableFooter>
```

**Empty state** (no assignments, no hours):
```
<div className="py-8 text-center text-neutral-400 text-sm">
  No cost data yet. Assign employees and have them log hours.
</div>
```

---

### Section C — Manual Cost Entries

`<Card>` with `<CardHeader className="flex flex-row items-center justify-between">`:
- Left: `<CardTitle>Manual Costs</CardTitle>`
- Right: `<Button size="sm" variant="outline" onClick={openAddCostDialog}><Plus className="h-4 w-4 mr-1.5" /> Add Cost</Button>`

**Table columns**:

| Column | Source | Display | Width |
|---|---|---|---|
| Date | `costDate` | `formatDate(costDate)` | `w-28` |
| Category | `category` | `<CategoryBadge>` (amber/neutral styled, see below) | `w-32` |
| Description | `description` | Truncated to 1 line, `text-sm text-neutral-600` | flex-grow |
| Amount | `amount` | `formatCurrency(amount)` `tabular-nums font-medium` | `w-28` |
| Receipt | `receiptRef` | Monospace text or `—` | `w-24` |
| Actions | — | Edit icon + Delete icon | `w-16` |

Sort: by `costDate` descending (newest first). Frontend sort.

**Category badge**: `<Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">{category}</Badge>`

**Edit action**: `<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>` — opens Edit Manual Cost Dialog pre-filled.

**Delete action**: `<Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>` — does NOT immediately delete. Opens an `<AlertDialog>` inline confirmation (see below).

**Delete confirmation AlertDialog**:
```
┌──────────────────────────────────────────┐
│  Delete this cost entry?                 │
│                                          │
│  This cannot be undone.                  │
│                                          │
│  [Cancel]          [Delete]              │
└──────────────────────────────────────────┘
```
"Delete" button: `className="bg-red-600 hover:bg-red-700 text-white"`, shows spinner when pending.
On confirm: `DELETE /api/admin/projects/{projectId}/costs/{costId}`. On success: invalidate costs query, show toast `"Cost entry deleted"`.

**Empty state**:
```tsx
<div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-neutral-200 rounded-lg">
  <Receipt className="h-8 w-8 text-neutral-300 mb-2" />
  <p className="text-sm text-neutral-500">No manual costs recorded yet.</p>
  <Button size="sm" variant="outline" className="mt-3" onClick={openAddCostDialog}>
    <Plus className="h-4 w-4 mr-1.5" /> Add Cost
  </Button>
</div>
```

**Loading state** (fetching costs): 3 `<Skeleton className="h-10 w-full" />` rows.

**Error state**: `<Alert variant="destructive">` inside the card, with retry button.

---

### Add / Edit Manual Cost Dialog

`<Dialog>` (not AlertDialog). Max width `sm:max-w-lg`.

```
┌──────────────────────────────────────────────────────────┐
│  Add Manual Cost          (or "Edit Manual Cost")        │
│  "Record an expense for this project."                   │
├──────────────────────────────────────────────────────────┤
│  Amount *                                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ $  [number input, min 0.01, step 0.01]          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Category *                                              │
│  [Select — dynamically loaded from GET /cost-categories] │
│                                                          │
│  Description *                                           │
│  [Textarea, max 500 chars]                               │
│  When category = "Other": "Please describe the expense   │
│   in detail." helper text shown below textarea.          │
│                                                          │
│  Cost Date *                                             │
│  [date input — defaults to today]                        │
│                                                          │
│  Receipt Ref                    (optional)               │
│  [text input]                                            │
│                                                          │
│  Notes                          (optional)               │
│  [Textarea, max 1000 chars]                              │
│                                                          │
│  [Error alert — conditional]                             │
├──────────────────────────────────────────────────────────┤
│  [Cancel]                            [Add Cost / Save]   │
└──────────────────────────────────────────────────────────┘
```

**Amount field**: Prefix element showing currency symbol `"$"` using a non-interactive span inside a `FieldGroup` with `className="flex items-center"`:
```tsx
<FieldGroup className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-violet-500">
  <span className="px-3 text-sm text-neutral-500 bg-neutral-50 border-r border-neutral-200 select-none">$</span>
  <Input
    type="number"
    min="0.01"
    step="0.01"
    className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
    {...register('amount', { valueAsNumber: true })}
  />
</FieldGroup>
```

**Category Select**: Uses `useQuery` to fetch `GET /api/admin/cost-categories`. Filters to `active: true` entries. Loading state: disabled select with "Loading categories..." placeholder. Error state: disabled select with "Unable to load categories".

**Category = "Other" behavior**: When the selected category name is `"Other"`, show helper text below the description textarea: `<p className="text-xs text-neutral-400 mt-1">Please describe the expense in detail.</p>`. This is purely a UX hint — the description field is required regardless of category.

**Default values**:
- `costDate`: today's date (ISO string via `new Date().toISOString().split('T')[0]`)
- All others: empty / undefined

**Zod schema** (lives in `src/features/projects/schemas/manual-cost.schema.ts`):
```ts
const manualCostSchema = z.object({
  amount:      z.number({ invalid_type_error: 'Amount is required' }).min(0.01, 'Amount must be greater than 0'),
  category:    z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(500),
  costDate:    z.string().min(1, 'Date is required'),
  receiptRef:  z.string().max(200).optional().or(z.literal('')),
  notes:       z.string().max(1000).optional().or(z.literal('')),
});
```

**Interactions**:

| Action | Result |
|---|---|
| Open (Add mode) | Form resets to defaults. Focus on amount field. |
| Open (Edit mode) | Form pre-filled from existing entry. |
| Submit (Add) | `POST /api/admin/projects/{id}/costs`. Button: "Adding..." + spinner. |
| Submit (Edit) | `PUT /api/admin/projects/{projectId}/costs/{costId}`. Button: "Saving..." + spinner. |
| Success | Dialog closes. Toast: "Cost added" / "Cost updated". Invalidate costs query + cost summary query. |
| Error | `<Alert variant="destructive">` above footer with server message. |
| Cancel dirty | `<AlertDialog>` discard confirmation. |
| Escape dirty | Same discard confirmation. |

---

## Tab 3 — Team

### Purpose

Who is on the project, what is their role, and what have they contributed.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Team                              [+ Assign Employee]           │
│  ─────────────────────────────────────────────────────────────  │
│  Employee  Type  Alloc%  Assigned  Hours  Cost  Status  Actions  │
│  ────────────────────────────────────────────────────────────── │
│  Jane Doe  FT    80%    01 Jan    120h   $4,200  Active  [Remove]│
│  ...                                                             │
│  ─────────────────────────────────────────────────────────────  │
│  [▶ Show removed members (2)]                                    │
└──────────────────────────────────────────────────────────────────┘
```

Single `<Card>` with `<CardHeader className="flex flex-row items-center justify-between">`:
- Left: `<CardTitle>Team</CardTitle>`
- Right: `<Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-2" /> Assign Employee</Button>`

---

### Active Team Members Table

`<Table>` from shadcn.

| Column | Source | Display | Notes |
|---|---|---|---|
| Employee | `employeeName` + `roleInProject` | Name `text-sm font-medium` + role below in `text-xs text-neutral-400` | If no role: omit sub-line |
| Type | `employmentType` | FT/PT badge (same as Costs tab) | |
| Alloc % | `allocationPercentage` | `{N}%` or `—` | |
| Assigned | `assignedDate` | `formatDate(date)` | |
| Hours | `hoursLogged` from cost summary | `{N}h` or `—` | Cross-reference with `employeeCosts` in costSummary by `employeeId` |
| Cost | `salaryCost` from cost summary | `formatCurrency` + `ESTIMATED`/`CONFIRMED` badge below | Same source as Costs tab |
| Status | `active` | Active (green) / Inactive (neutral) badge | Active assignments only in this table |
| Actions | — | `[Remove]` button | |

**Filter**: Only rows where `assignment.active === true` appear in this table.

**[Remove] button**: `<Button variant="ghost" size="sm" className="text-neutral-500 hover:text-red-600">Remove</Button>`. Opens inline `<AlertDialog>`:
```
┌──────────────────────────────────────────────┐
│  Remove {employeeName} from this project?    │
│                                              │
│  They will no longer appear as an active     │
│  team member. Logged hours are preserved.    │
│                                              │
│  [Cancel]               [Remove]             │
└──────────────────────────────────────────────┘
```
On confirm: `DELETE /api/admin/projects/assignments/{assignmentId}`. On success: toast `"{employeeName} removed from project"`. Invalidate assignments query.

---

### Past Team Members (Collapsible)

Only rendered when there are inactive assignments (`active === false`).

```tsx
<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" size="sm" className="text-neutral-500 mt-2">
      <ChevronRight className="h-4 w-4 mr-1 data-[state=open]:rotate-90 transition-transform" />
      Show removed members ({inactiveCount})
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <Table>
      {/* Same columns as above, minus the Actions column */}
    </Table>
  </CollapsibleContent>
</Collapsible>
```

Inactive rows use `className="text-neutral-400"` on all cells for visual de-emphasis.

---

### Team Tab — Empty State

When there are no assignments at all (active or inactive):

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Users className="h-12 w-12 text-neutral-300 mb-4" />
  <p className="text-base font-medium text-neutral-600">No employees assigned yet.</p>
  <p className="text-sm text-neutral-400 mt-1">Use the button above to assign employees to this project.</p>
  <Button variant="outline" className="mt-4" onClick={openAssignDialog}>
    <UserPlus className="h-4 w-4 mr-2" /> Assign Employee
  </Button>
</div>
```

---

### Team Tab — Loading State

3 `<Skeleton className="h-12 w-full" />` rows while assignments fetch.

---

## Tab 4 — Settings

### Purpose

Edit project metadata, financial targets, and danger zone operations. This is the full existing Screen 3 edit form, relocated into a tab.

### Changes from existing Screen 3

1. The sticky bottom save bar is removed. A standard `<Button type="submit">` lives at the bottom of the settings form card.
2. The hero-top `[Save Changes]` button is removed.
3. The `<Section 2 — Assigned Employees>` placeholder is completely replaced by Tab 3 (Team).
4. A new **Financial Settings** card is added below the project info card, before the Danger Zone.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  PROJECT INFO CARD                                               │
│  ─────────────────────────────────────────────────────────────  │
│  Project Name *  [input]                                         │
│  Project Code *  [input]                                         │
│  Description     [textarea]                                      │
│  Start Date [date]    End Date [date]                            │
│  Status      [select]                                            │
├──────────────────────────────────────────────────────────────────┤
│  FINANCIAL SETTINGS CARD                                         │
│  ─────────────────────────────────────────────────────────────  │
│  Budget           $ [number input, optional]                     │
│  Revenue Target   $ [number input, optional]                     │
│  Actual Revenue   $ [number input, optional]                     │
│                     ↳ "Enter actual revenue once confirmed"      │
├──────────────────────────────────────────────────────────────────┤
│  DANGER ZONE (inside project info card or as separator section)  │
│  [Close Project button] — only when status != COMPLETED          │
├──────────────────────────────────────────────────────────────────┤
│  [Save Changes button, right-aligned]                            │
│  [Save error alert — conditional, above save button]             │
└──────────────────────────────────────────────────────────────────┘
```

---

### Financial Settings Card

`<Card>` placed between the project info card and the danger zone (if they are separate), OR as a new section within the same card (separated by `<Separator>`).

Recommended: separate `<Card>` for clarity.

`<CardTitle>Financial Settings</CardTitle>` + `<CardDescription>Set budget and revenue targets for health tracking.</CardDescription>`

**Fields**:

| Field | API field | Label | Required | Helper text |
|---|---|---|---|---|
| Budget | `budget` | Budget | No | none |
| Revenue Target | `revenueTarget` | Revenue Target | No | none |
| Actual Revenue | `actualRevenue` | Actual Revenue | No | "Enter actual revenue once confirmed" |

Each field uses the same `$` currency prefix pattern as the Add Cost dialog:
```tsx
<FieldGroup className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-violet-500">
  <span className="px-3 text-sm text-neutral-500 bg-neutral-50 border-r border-neutral-200 select-none">$</span>
  <Input
    id="budget"
    type="number"
    min="0"
    step="0.01"
    placeholder="0.00"
    className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
    {...register('budget', { setValueAs: v => v === '' ? null : Number(v) })}
  />
</FieldGroup>
```

**Actual Revenue helper text**:
```tsx
<p className="text-xs text-neutral-400 mt-1">Enter actual revenue once confirmed. Leave blank if not yet known.</p>
```

**Actual Revenue field `id="actualRevenue"`** — required so the "Add Revenue" quick action from Tab 1 can `focus()` it.

**Validation additions to `updateProjectSchema`**:
```ts
// Add to existing schema:
budget:        z.coerce.number().min(0).nullable().optional()
               .or(z.literal('').transform(() => null)),
revenueTarget: z.coerce.number().min(0).nullable().optional()
               .or(z.literal('').transform(() => null)),
actualRevenue: z.coerce.number().min(0).nullable().optional()
               .or(z.literal('').transform(() => null)),
```

Empty string → send `null` to the API. `null` means "not set". `0` is a valid value (zero budget).

**Save**: These three fields are saved in the same `PUT /api/projects/{id}` call as all other project fields. No separate endpoint.

**Form initialization**: `mapProjectToFormValues` must be updated to populate `budget`, `revenueTarget`, `actualRevenue` from the project data.

---

### Settings Tab — Save Button

Replace the sticky save bar with a standard footer inside the tab content area:
```tsx
<div className="flex justify-end pt-4">
  {saveError && (
    <Alert variant="destructive" className="mb-3 flex-1">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{saveError}</AlertDescription>
    </Alert>
  )}
  <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={isSubmitting}>
    {isSubmitting
      ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Saving...</>
      : 'Save Changes'
    }
  </Button>
</div>
```

The dirty navigation guard (`useBlocker`) remains — tab switching does NOT dismiss the guard. If the form is dirty, navigating away from the page (via breadcrumb or router) still triggers the discard confirmation. Switching between tabs on the same page does NOT trigger the guard.

---

## Existing Dialogs — Carried Forward

### Assign Employee Dialog

Identical to the existing spec in `projects.md`. Location: triggered from Tab 3 (Team), not from the hero card. No changes to the form fields, schema, or mutation.

One addition: on success, invalidate `QUERY_KEYS.projects.assignments(projectId)` (new key) to refresh the team table. The existing spec invalidated nothing because the table was a placeholder.

### Create Project Dialog

Unchanged from existing spec. Lives on Screen 1.

### Close Project AlertDialog

Unchanged from existing spec. Triggered from Settings tab Danger Zone (same as before, just different DOM location).

---

## Static / Placeholder Strategy

This table defines what is built immediately vs. what waits for the backend.

| Feature | Status | Fallback until backend ready |
|---|---|---|
| KPI strip | Placeholder | All chips show `"N/A"` or `"—"`. Hook returns null data immediately. |
| Health dots on list | Placeholder | No dots rendered. Status badge only. |
| Total Cost column | Placeholder | Column renders, all cells show `"—"`. |
| Tab 1 — Overview | Placeholder | Single "under development" banner replacing all sections B–G. Banner A still renders (with `NO_BUDGET` state as default). |
| Tab 2 — Trend chart | Placeholder | Empty state: "Cost trend data is under development." |
| Tab 2 — Cost by Employee | Placeholder | Empty state table. |
| Tab 2 — Manual Cost Entries | Functional immediately | POST/PUT/DELETE manual costs work as soon as backend builds those endpoints. GET list shows empty state until data exists. |
| Tab 3 — Team | Functional immediately | Uses existing `GET /api/admin/projects/assignments/project/{id}`. Hours and Cost columns show `"—"` until cost summary is ready. |
| Tab 4 — Settings | Functional immediately (existing fields). Financial fields placeholder | Financial fields render immediately. They save `null` until the PUT endpoint accepts them. No validation failure — fields are optional. When backend adds support, they begin persisting. |
| Cost categories | Placeholder | If `GET /api/admin/cost-categories` not ready: hardcode a minimal list in the hook as static fallback. `// TODO: replace with live data`. Fallback list: `["Travel", "Software", "Hardware", "Consulting", "Other"]`. |

**Pattern**: Every new query hook that targets an unbuilt endpoint must include a feature flag comment at the top:
```ts
// PLACEHOLDER: returns null until GET /api/admin/projects/kpis is implemented
// Remove this block and uncomment the real queryFn when backend is ready
```

---

## Updated Folder Structure

```
src/features/projects/
├── api/
│   ├── projects.api.ts              # existing — add: fetchProjectKpis, fetchHealthOverview
│   ├── cost-summary.api.ts          # NEW: fetchCostSummary(projectId)
│   ├── trend.api.ts                 # NEW: fetchProjectTrend(projectId)
│   ├── manual-costs.api.ts          # NEW: fetchManualCosts, addManualCost, editManualCost, deleteManualCost
│   └── cost-categories.api.ts       # NEW: fetchCostCategories
├── components/
│   ├── project-columns.tsx          # existing — add health dot + total cost column
│   ├── project-table.tsx            # existing — add KPI strip above table
│   ├── create-project-dialog.tsx    # existing — unchanged
│   ├── assign-employee-dialog.tsx   # existing — unchanged
│   ├── project-status-badge.tsx     # existing — unchanged
│   ├── health-dot.tsx               # NEW: small colored dot for list table
│   ├── health-status-pill.tsx       # NEW: inline pill for hero card row 3
│   ├── project-kpi-strip.tsx        # NEW: 8-chip KPI row on Screen 1
│   ├── project-hero-card.tsx        # NEW: hero card extracted from Screen 3
│   ├── project-tabs.tsx             # NEW: Tabs wrapper with 4 tabs
│   ├── overview/
│   │   ├── health-banner.tsx        # Tab 1 Section A
│   │   ├── key-metrics-row.tsx      # Tab 1 Section B (4 cards)
│   │   ├── budget-revenue-cards.tsx # Tab 1 Section C
│   │   ├── burn-rate-cards.tsx      # Tab 1 Section D
│   │   ├── cost-composition-chart.tsx # Tab 1 Section E (donut)
│   │   ├── overtime-callout.tsx     # Tab 1 Section F
│   │   └── timeline-bar.tsx         # Tab 1 Section G
│   ├── costs/
│   │   ├── cost-trend-chart.tsx     # Tab 2 Section A
│   │   ├── cost-trend-tooltip.tsx   # Custom Recharts tooltip
│   │   ├── employee-cost-table.tsx  # Tab 2 Section B
│   │   ├── manual-cost-table.tsx    # Tab 2 Section C
│   │   └── manual-cost-dialog.tsx   # Add/Edit manual cost dialog
│   ├── team/
│   │   ├── team-table.tsx           # Tab 3 active assignments
│   │   └── past-members-collapsible.tsx # Tab 3 inactive collapsible
│   └── settings/
│       ├── project-info-form.tsx    # Tab 4 project metadata fields
│       └── financial-settings-card.tsx # Tab 4 NEW financial fields
├── hooks/
│   ├── use-projects.ts              # existing
│   ├── use-project.ts               # existing
│   ├── use-create-project.ts        # existing
│   ├── use-update-project.ts        # existing — update to include financial fields
│   ├── use-close-project.ts         # existing
│   ├── use-assign-employee.ts       # existing
│   ├── use-deactivate-assignment.ts # NEW (was placeholder before)
│   ├── use-project-kpis.ts          # NEW (placeholder → real)
│   ├── use-cost-summary.ts          # NEW
│   ├── use-project-trend.ts         # NEW
│   ├── use-manual-costs.ts          # NEW: query for GET
│   ├── use-add-manual-cost.ts       # NEW: mutation POST
│   ├── use-edit-manual-cost.ts      # NEW: mutation PUT
│   ├── use-delete-manual-cost.ts    # NEW: mutation DELETE
│   └── use-cost-categories.ts       # NEW
├── schemas/
│   ├── create-project.schema.ts     # existing — unchanged
│   ├── update-project.schema.ts     # existing — ADD budget/revenue fields
│   ├── assign-employee.schema.ts    # existing — unchanged
│   └── manual-cost.schema.ts        # NEW
├── types/
│   └── project.types.ts             # existing — ADD new types below
└── index.ts                         # Public exports — add new hooks and components
```

---

## New TypeScript Types

Add to `src/features/projects/types/project.types.ts`:

```ts
export type HealthStatus =
  | 'ON_TRACK'
  | 'AT_RISK'
  | 'OVER_BUDGET'
  | 'NO_BUDGET'
  | 'COMPLETED_PROFITABLE'
  | 'COMPLETED_AT_LOSS'
  | 'COMPLETED_NEUTRAL';

export type CostStatus = 'ESTIMATED' | 'CONFIRMED';

export interface ProjectKpis {
  activeProjects:          number;
  totalBudgetAllocated:    number | null;
  totalCostIncurred:       number;
  budgetRemaining:         number | null;
  projectsAtRisk:          number;
  projectsOverBudget:      number;
  totalRevenueRecognized:  number | null;
  overallGrossMargin:      number | null;
}

export interface EmployeeCostEntry {
  employeeId:       number;
  employeeName:     string;
  employmentType:   'FULL_TIME' | 'PART_TIME';
  hoursLogged:      number;
  salaryCost:       number;
  costStatus:       CostStatus;
}

export interface ProjectCostSummary {
  projectId:                 number;
  healthStatus:              HealthStatus;
  budgetUtilizationPct:      number | null;
  totalCost:                 number;
  totalSalaryCost:           number;
  totalManualCost:           number;
  budget:                    number | null;
  budgetVariance:            number | null;
  projectedFinalCost:        number | null;
  projectedVariance:         number | null;
  revenueTarget:             number | null;
  actualRevenue:             number | null;
  grossMargin:               number | null;
  marginPct:                 number | null;
  dailyBurnRate:             number | null;
  weeklyBurnRateRolling:     number | null;
  weeklyBurnRateAverage:     number | null;
  activeDays:                number;
  overtimeDelta:             number;
  normalOtExtra:             number;
  specialOtExtra:            number;
  overtimePctOfSalaryCost:   number | null;
  employeeCosts:             EmployeeCostEntry[];
}

export interface TrendWeek {
  weekStart:      string;   // ISO date (Monday)
  weekLabel:      string;   // formatted "Mar 3" — computed on frontend
  salaryCost:     number;
  manualCost:     number;
  totalCost:      number;
  hours:          number;
  cumulativeCost: number;   // derived on frontend from cumulative sum
}

export interface ManualCostEntry {
  costId:     number;
  projectId:  number;
  costDate:   string;
  category:   string;
  description:string;
  amount:     number;
  receiptRef: string | null;
  notes:      string | null;
  createdAt:  string;
}

export interface CostCategory {
  categoryId: number;
  name:       string;
  active:     boolean;
}

// Updated Project type — add financial fields
export interface Project {
  projectId:     number;
  projectName:   string;
  projectCode:   string;
  description:   string | null;
  startDate:     string | null;
  endDate:       string | null;
  status:        'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  budget:        number | null;   // NEW
  revenueTarget: number | null;   // NEW
  actualRevenue: number | null;   // NEW
}
```

---

## Query Keys

Add to `src/constants/query-keys.ts`:

```ts
projects: {
  list:            ()            => ['projects']                          as const,
  detail:          (id: string)  => ['projects', id]                     as const,
  kpis:            ()            => ['projects', 'kpis']                 as const,
  healthOverview:  ()            => ['projects', 'health-overview']      as const,
  costSummary:     (id: string)  => ['projects', id, 'cost-summary']     as const,
  trend:           (id: string)  => ['projects', id, 'trend']            as const,
  costs:           (id: string)  => ['projects', id, 'costs']            as const,
  assignments:     (id: string)  => ['projects', id, 'assignments']      as const,
  costCategories:  ()            => ['projects', 'cost-categories']      as const,
},
```

---

## shadcn Components — Full Updated List

New additions (install if not present):

| Component | Used in |
|---|---|
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Screen 3 tab structure |
| `Progress` | Overview tab — Budget Used % card |
| `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | Team tab past members; Cost tab manual cost expand |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | Costs tab — Estimated badge hover |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableFooter` | Costs tab, Team tab |

---

## lucide-react Icons — Full Updated List

New additions:

| Icon | Used in |
|---|---|
| `CheckCircle2` | Overview — ON_TRACK and COMPLETED_PROFITABLE banner |
| `AlertTriangle` | Overview — AT_RISK banner; Timeline overdue warning; Overtime high callout |
| `Info` | Overview — NO_BUDGET banner |
| `TrendingUp` | Overview — Overtime callout header |
| `TrendingDown` | Overview — COMPLETED_AT_LOSS banner |
| `BarChart3` | Overview empty state; Costs chart empty state |
| `Receipt` | Costs tab — manual cost empty state |
| `Pencil` | Costs tab — edit manual cost action |
| `Trash2` | Costs tab — delete manual cost action |
| `DollarSign` | KPI strip — budget/cost chips (optional decorative) |
| `Minus` | KPI strip — neutral/zero states |

---

## Utilities — New/Updated in `src/lib/utils.ts`

```ts
// Compact currency: $1.2k, $1.2M
export function formatCurrencyCompact(amount: number | null | undefined): string

// Full currency: $12,450.00
export function formatCurrency(amount: number | null | undefined): string

// Percent: "44.2%"
export function formatPercent(value: number | null | undefined, decimals?: number): string

// Derive trend data (add cumulative + weekLabel) from API response
export function enrichTrendWeeks(weeks: Omit<TrendWeek, 'weekLabel' | 'cumulativeCost'>[]): TrendWeek[]

// Compute % elapsed between two dates (returns 0–100, clamped)
export function computePctElapsed(startDate: string, endDate: string | null, today?: Date): number
```

---

## Notes for Frontend Developer

1. **Tab state**: Use controlled tabs with `const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'team' | 'settings'>('overview')`. Pass `setActiveTab` down to child components that need to switch tabs (e.g., the "Set in Settings →" link in Overview).

2. **Cost summary and trend are independent queries**: Do not chain them. Both fire in parallel when the detail page mounts. Use `useQuery` for each separately.

3. **Recharts import**: `import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, PieChart, Pie } from 'recharts'`. Recharts is already in the project via shadcn chart primitives — no additional install needed. Use it directly rather than through the shadcn `<ChartContainer>` wrapper for these custom compositions.

4. **Dirty form guard scope**: The `useBlocker` guard is scoped to the Settings tab's form. Switching between tabs (Overview, Costs, Team, Settings) is NOT a route change — it is local component state. The blocker only fires on full route navigation away from `/admin/projects/$projectId`.

5. **Assignments source for Team tab**: `GET /api/admin/projects/assignments/project/{id}` returns both active and inactive. Filter in the component: `active.filter(a => a.active)` and `inactive.filter(a => !a.active)`. Note the field is `"active"` (not `"isActive"`) due to the Lombok serialization deviation documented in the API contract.

6. **No hardcoded thresholds**: The AT_RISK threshold (default 80%) and the Overtime high-impact threshold (default 10%) are system-configured values. The `healthStatus` field from the backend already encodes the AT_RISK determination — the frontend does not need to reproduce the threshold logic. For the overtime "high" check, use `overtimePctOfSalaryCost` from the cost summary response and compare against a constant fetched from system settings, or treat > 10% as the "show amber" rule only after confirming a config endpoint exists. For MVP: use `overtimePctOfSalaryCost > 10` as the amber threshold, but add a `// TODO: use configurable system threshold` comment.

7. **No employee-facing access**: All new components and hooks are under the admin layout and/or gated by `useHasPermission(PERMISSIONS.ADMIN_PROJECTS)`. Employees have no visibility into cost data. This is enforced by route guards, not just UI hiding.

8. **`formatCurrencyCompact` precision**: Use `Intl.NumberFormat` with `notation: 'compact'` and `maximumFractionDigits: 1`. Currency symbol comes from a project-wide locale constant (do not hardcode `$`).

9. **Screen 3 route data strategy update**: The route loader still fetches `GET /api/projects/{id}` for the base project data (name, code, dates, status, financial fields once added). The cost summary, trend, and costs are separate queries initiated inside the tab components themselves — they are NOT pre-loaded in the route loader. This avoids waterfall for users who only visit the Settings tab.

10. **Progressive enhancement**: Every new section degrades gracefully. A user who opens a project detail page before the backend has built any new endpoints sees: a functional hero card, the tab structure, a placeholder banner in Overview, empty chart states in Costs, a functional team table (existing endpoint), and a functional settings form. Nothing breaks.
