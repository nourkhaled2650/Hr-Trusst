# Projects Feature — Backend Integration Checklist
**Date written:** 2026-04-02
**Written by:** Orchestrator (pick-up reference for next session)
**Status:** Frontend complete, all new endpoints are mocked with static data — awaiting backend delivery

---

## What Is Complete

The entire Projects feature UI is built and working with static placeholder data:

- Screen 1 — project list with KPI strip, health dots, total cost column
- Screen 3 — hero card + 4-tab detail page
  - Tab 1 — Overview (health banner, key metrics, burn rate, cost composition, overtime callout, timeline)
  - Tab 2 — Costs (trend chart, employee cost table, manual cost CRUD)
  - Tab 3 — Team (active table, remove dialog, past members collapsible, assign dialog)
  - Tab 4 — Settings (project info form, financial fields: budget / revenueTarget / actualRevenue, danger zone)

---

## What the Backend Team Needs to Deliver

From `docs/decisions/project-health-business-rules.md` Section 12:

| # | Endpoint / Schema change | Notes |
|---|---|---|
| 1 | Add `budget`, `revenue_target`, `actual_revenue` columns to `projects` table | Nullable DECIMAL(15,2) |
| 2 | `PUT /api/projects/{id}` — accept `budget`, `revenueTarget`, `actualRevenue` in body | Already wired in frontend update schema |
| 3 | New `cost_category` lookup table | No seed data — admin creates categories via UI |
| 4 | New `manual_project_costs` table | Fields from §3.1. Soft delete via `deletedAt`. |
| 5 | `GET /api/admin/cost-categories` | Returns `[{ categoryId, categoryName, active }]` |
| 6 | `GET /api/admin/projects/{id}/cost-summary` | Full shape documented in `design-specs/projects-health.md` |
| 7 | `GET /api/admin/projects/{id}/trend` | Weekly series — all weeks, no gaps, zeros for idle weeks |
| 8 | `GET /api/admin/projects/kpis` | Company-wide aggregates |
| 9 | `GET /api/admin/projects/{id}/manual-costs` | List entries, soft-deleted excluded |
| 10 | `POST /api/admin/projects/{id}/manual-costs` | Create entry |
| 11 | `PUT /api/admin/projects/{projectId}/manual-costs/{costId}` | Edit entry |
| 12 | `DELETE /api/admin/projects/{projectId}/manual-costs/{costId}` | Soft delete |

---

## Frontend Integration Work (per API file)

When backend delivers each endpoint, swap out the placeholder in the corresponding file. The real implementations are already scaffolded as comments — just uncomment and remove the static import.

---

### 1. `GET /api/admin/projects/kpis`

**File:** `src/features/projects/api/projects.api.ts`

Replace the `fetchProjectKpis` function body. Implementation is already written as a comment directly above the static fallback — uncomment it and remove the `STATIC_PROJECT_KPIS` import and the `Promise.resolve(...)` line.

**Also:** Delete `src/features/projects/static/project-kpis.static.ts` once confirmed working.

**Type check:** `ProjectKpis` in `types/projects.types.ts` currently has non-nullable number fields. The API spec says several fields can be `null` (e.g., `totalBudgetAllocated` when no project has a budget set). Update the interface to match:
```ts
totalBudgetAllocated:   number | null;
budgetRemaining:        number | null;
totalRevenueRecognized: number | null;
overallGrossMargin:     number | null;
```
The `ProjectKpiStrip` component already handles null gracefully (shows `"N/A"`).

---

### 2. `GET /api/admin/projects/{id}/cost-summary`

**File:** `src/features/projects/api/cost-summary.api.ts`

Replace the `fetchCostSummary` function body with a real `apiClient.get` call:
```ts
const { data } = await apiClient.get<ApiResponse<ProjectCostSummary>>(
  `/api/admin/projects/${projectId}/cost-summary`,
  { _toast: false }
);
if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
return data.data;
```
Remove `STATIC_COST_SUMMARY` import. Delete `src/features/projects/static/cost-summary.static.ts`.

**Type check:** Review `ProjectCostSummary` fields that are currently typed as `number` (non-nullable) — confirm with backend which are truly always present vs. conditionally null. Most burn-rate and OT fields will be 0/null for new projects.

---

### 3. `GET /api/admin/projects/{id}/trend`

**File:** `src/features/projects/api/trend.api.ts`

Replace stub with real call, still apply `enrichTrendWeeks()` client-side (this adds `weekLabel` and `cumulativeCost` derived fields):
```ts
const { data } = await apiClient.get<ApiResponse<{ weeks: Omit<TrendWeek, 'weekLabel' | 'cumulativeCost'>[] }>>(
  `/api/admin/projects/${projectId}/trend`,
  { _toast: false }
);
if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
return enrichTrendWeeks(data.data.weeks);
```
Remove `STATIC_TREND_WEEKS` import. Delete `src/features/projects/static/project-trend.static.ts`.

---

### 4. `GET /api/admin/cost-categories` + `POST /api/admin/cost-categories`

**File:** `src/features/projects/api/cost-categories.api.ts`

Replace `fetchCostCategories` stub with real call:
```ts
const { data } = await apiClient.get<ApiResponse<CostCategory[]>>(
  `/api/admin/cost-categories`,
  { _toast: false }
);
if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
return data.data.filter((c) => c.active);
```

Replace `createCostCategory` stub with real call:
```ts
const { data } = await apiClient.post<ApiResponse<CostCategory>>(
  `/api/admin/cost-categories`,
  { name: values.name, description: values.description || null },
  { _toast: false }
);
if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
return data.data;
```

Remove `STATIC_COST_CATEGORIES` import from `manual-costs.static.ts`.

**Type check:** Confirm backend returns `categoryName` (not `name`) to match `CostCategory.categoryName` in types.

---

### 5. Manual Costs CRUD

**File:** `src/features/projects/api/manual-costs.api.ts`

All four functions have their real implementations already written as commented-out code. For each:
1. Uncomment the real implementation block
2. Remove the `throw new Error("... not yet implemented")` line
3. Import `apiClient` from `@/lib/axios`

**Additionally**, `fetchManualCosts` needs a real response shape check — the backend response will be wrapped in `ApiResponse<ManualCostEntry[]>`.

**Type check:** `ManualCostEntry` currently has `categoryId: number`. The design spec's GET response returns `category: string` (the category name, not the ID). Check what backend actually returns and update the type accordingly. The `ManualCostTable` renders the category name as a badge — it expects a string, not an ID.

Delete `src/features/projects/static/manual-costs.static.ts` once all four functions are live.

---

### 6. `PUT /api/projects/{id}` — financial fields

**File:** `src/features/projects/api/projects.api.ts` → `updateProject`

The `updateProjectSchema` already includes `budget`, `revenueTarget`, `actualRevenue` as nullable optional fields. Confirm the existing `updateProject` API call sends them (they should be included since the form values are spread into the PUT body). No code change likely needed — just verify the backend accepts and persists them.

---

## Response Shape Discrepancies to Confirm with Backend

Before wiring in real calls, get explicit confirmation on these shape questions:

| # | Question | Relevant file |
|---|---|---|
| 1 | Does `GET /cost-summary` return `totalHours` or `hoursLogged` inside `employeeCosts[]`? | `EmployeeCostEntry` in types |
| 2 | Does `GET /manual-costs` return `category` (string name) or `categoryId` (FK)? | `ManualCostEntry` in types |
| 3 | Does `GET /projects/kpis` return nulls for unavailable fields, or zeros? | `ProjectKpis` in types |
| 4 | Does `GET /trend` wrap weeks in `{ weeks: [] }` or return the array directly? | `trend.api.ts` |
| 5 | Does `GET /cost-categories` use `categoryName` or `name` as the display field? | `CostCategory` in types |

---

## Post-Integration Cleanup

Once all endpoints are live and smoke-tested:

1. Delete the entire `src/features/projects/static/` folder (4 files)
2. Remove any remaining `// PLACEHOLDER` and `// TODO: replace` comments from api files
3. Run `npx tsc --noEmit` — should still be zero errors
4. Smoke-test all 4 tabs on a real project with data

---

## Files Changed / Owned by Projects Feature

```
src/features/projects/
├── api/
│   ├── projects.api.ts          ← KPIs placeholder + real project CRUD
│   ├── cost-summary.api.ts      ← PLACEHOLDER — swap when backend ready
│   ├── trend.api.ts             ← PLACEHOLDER — swap when backend ready
│   ├── manual-costs.api.ts      ← PLACEHOLDER — real impl already in comments
│   └── cost-categories.api.ts  ← PLACEHOLDER — swap when backend ready
├── static/                      ← DELETE entire folder post-integration
│   ├── cost-summary.static.ts
│   ├── project-trend.static.ts
│   ├── project-kpis.static.ts
│   └── manual-costs.static.ts
```

All hooks, components, schemas, and types are production-ready. Only the api layer files above need changes.

---

## Open Backend Issues Blocking Full Accuracy (pre-existing)

From project memory — already tracked but not resolved:
- `NEW-011`: `is_submitted` column missing Liquibase changeset
- `DEV-NEW-028/029/030`: PayrollSettingsService bugs affecting salary cost accuracy

These affect cost accuracy at the payslip level but do not block the projects UI integration.
