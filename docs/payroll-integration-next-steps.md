# Payroll Feature — Backend Integration Checklist
**Date written:** 2026-04-03
**Written by:** Orchestrator (pick-up reference for next session)
**Status:** Frontend complete with all API calls as error-throwing stubs — awaiting backend delivery

---

## What Is Complete

All 5 phases are built and wired. The UI renders correctly once real data flows in.

| Phase | Route | Description |
|---|---|---|
| 1 | `/admin/payroll` | Month list + 8-card KPI strip + Trigger Now flow |
| 2 | `/admin/payroll/$year/$month` | FT + PT employee tables, per-employee Approve, Mark as Paid |
| 3 | Sheet (on FT rows) | Adjustment list + add/delete, net impact, note visible on payslip |
| 4 | `/payslips` | Employee payslip list (APPROVED + PAID only) |
| 5 | `/payslips/$year/$month` | Full payslip detail — FT and PT variants |

---

## What the Backend Needs to Deliver

Full specification: `backend/docs/payroll-backend-handoff.md`

| # | Endpoint | Priority |
|---|---|---|
| 1 | `GET /api/admin/payroll/months` | HIGH |
| 2 | `GET /api/admin/payroll/{year}/{month}/summary` | HIGH |
| 3 | `POST /api/admin/payroll/{year}/{month}/trigger` | HIGH |
| 4 | `GET /api/admin/payroll/{year}/{month}/employees` | HIGH |
| 5 | `POST /api/admin/payroll/{year}/{month}/{employeeId}/approve` | HIGH |
| 6 | `POST /api/admin/payroll/{year}/{month}/mark-paid` | HIGH |
| 7 | `GET /api/admin/payroll/{year}/{month}/{employeeId}/adjustments` | HIGH |
| 8 | `POST /api/admin/payroll/{year}/{month}/{employeeId}/adjustments` | HIGH |
| 9 | `DELETE /api/admin/payroll/{year}/{month}/{employeeId}/adjustments/{id}` | HIGH |
| 10 | `GET /api/payroll/my-payslips` | HIGH |
| 11 | `GET /api/payroll/my-payslips/{year}/{month}` | HIGH |

---

## Frontend Integration Work

All changes go in one file: `src/features/payroll/api/payroll.api.ts`

Every function is currently a stub that throws. Replace each one with the real `apiClient` call below. No other files need changes — hooks, components, and types are all wired correctly already.

> **URL note:** The stubs used query-param-style paths as placeholders. The real URLs use path params as defined in the backend handoff. Use the URLs below exactly.

---

### 1. `getMonths` → `GET /api/admin/payroll/months`

```ts
getMonths: async (): Promise<PayrollMonth[]> => {
  const { data } = await apiClient.get<ApiResponse<PayrollMonth[]>>(
    "/api/admin/payroll/months",
    { _toast: false },
  );
  if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
  return data.data;
},
```

---

### 2. `getMonthSummary` → `GET /api/admin/payroll/{year}/{month}/summary`

```ts
getMonthSummary: async (year: number, month: number): Promise<PayrollMonthSummary> => {
  const { data } = await apiClient.get<ApiResponse<PayrollMonthSummary>>(
    `/api/admin/payroll/${year}/${month}/summary`,
    { _toast: false },
  );
  if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
  return data.data;
},
```

**Type check:** `PayrollMonthSummary` has most fields as `number | null`. Confirm backend returns `null` (not `0`) for `totalNetPayroll`, `totalGrossPayroll`, `totalPaid`, `employeeCount`, `averageNetSalary` when no run exists. Fields `totalNormalOtPay` and `totalSpecialOtPay` should be `0.00` (not null) when a run exists but has no OT.

---

### 3. `triggerPayroll` → `POST /api/admin/payroll/{year}/{month}/trigger`

```ts
triggerPayroll: async (year: number, month: number): Promise<PayrollMonth> => {
  const { data } = await apiClient.post<ApiResponse<PayrollMonth>>(
    `/api/admin/payroll/${year}/${month}/trigger`,
  );
  if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
  return data.data;
},
```

**Note:** Update the return type from `Promise<void>` to `Promise<PayrollMonth>` — the trigger returns the created run summary so the table row can update without a full refetch.

---

### 4. `getMonthDetail` → `GET /api/admin/payroll/{year}/{month}/employees`

```ts
getMonthDetail: async (year: number, month: number): Promise<PayrollMonthDetail> => {
  const { data } = await apiClient.get<ApiResponse<PayrollMonthDetail>>(
    `/api/admin/payroll/${year}/${month}/employees`,
    { _toast: false },
  );
  if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
  return data.data;
},
```

**Type check:** `PayrollMonthDetail` must include `approvedCount` and `draftCount` at the top level — confirm these are present in the response. The `MonthSummaryBar` component reads them to render the progress line.

---

### 5. `approvePayroll` → `POST /api/admin/payroll/{year}/{month}/{employeeId}/approve`

The stub signature is missing `employeeId`. Update both the stub and the hook call:

```ts
approvePayroll: async (
  year: number,
  month: number,
  employeeId: number,
): Promise<PayrollEmployeeRow> => {
  const { data } = await apiClient.post<ApiResponse<PayrollEmployeeRow>>(
    `/api/admin/payroll/${year}/${month}/${employeeId}/approve`,
  );
  if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
  return data.data;
},
```

**Also update** `useApprovePayroll` in `payroll.queries.ts` — the mutation currently passes `{ year, month }` only. Change it to pass `{ year, month, employeeId }` and update all call sites in `FullTimeEmployeesTable.tsx` and `PartTimeEmployeesTable.tsx`.

---

### 6. `markPayrollPaid` → `POST /api/admin/payroll/{year}/{month}/mark-paid`

```ts
markPayrollPaid: async (year: number, month: number): Promise<void> => {
  const { data } = await apiClient.post<ApiResponse<null>>(
    `/api/admin/payroll/${year}/${month}/mark-paid`,
  );
  if (data.status !== "success") throw new Error(data.message ?? "Failed");
},
```

---

### 7. `getAdjustments` → `GET /api/admin/payroll/{year}/{month}/{employeeId}/adjustments`

```ts
getAdjustments: async (
  year: number,
  month: number,
  employeeId: number,
): Promise<PayrollAdjustment[]> => {
  const { data } = await apiClient.get<ApiResponse<PayrollAdjustment[]>>(
    `/api/admin/payroll/${year}/${month}/${employeeId}/adjustments`,
    { _toast: false },
  );
  if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
  return data.data;
},
```

---

### 8. `createAdjustment` → `POST /api/admin/payroll/{year}/{month}/{employeeId}/adjustments`

```ts
createAdjustment: async (
  values: AdjustmentFormValues & { year: number; month: number; employeeId: number },
): Promise<PayrollAdjustment> => {
  const { year, month, employeeId, ...body } = values;
  const { data } = await apiClient.post<ApiResponse<PayrollAdjustment>>(
    `/api/admin/payroll/${year}/${month}/${employeeId}/adjustments`,
    body,
  );
  if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
  return data.data;
},
```

---

### 9. `deleteAdjustment` → `DELETE /api/admin/payroll/{year}/{month}/{employeeId}/adjustments/{id}`

The stub only accepts `adjustmentId`. Update the signature to also accept `year`, `month`, `employeeId` (needed to build the URL):

```ts
deleteAdjustment: async (
  year: number,
  month: number,
  employeeId: number,
  adjustmentId: number,
): Promise<void> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(
    `/api/admin/payroll/${year}/${month}/${employeeId}/adjustments/${adjustmentId}`,
  );
  if (data.status !== "success") throw new Error(data.message ?? "Failed");
},
```

**Also update** `useDeleteAdjustment` in `payroll.queries.ts` and the call site in `AdjustmentList.tsx` to pass `{ year, month, employeeId, adjustmentId }`.

---

### 10. `getMyPayslips` → `GET /api/payroll/my-payslips`

```ts
getMyPayslips: async (): Promise<PayslipSummary[]> => {
  const { data } = await apiClient.get<ApiResponse<PayslipSummary[]>>(
    "/api/payroll/my-payslips",
    { _toast: false },
  );
  if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
  return data.data;
},
```

---

### 11. `getMyPayslipDetail` → `GET /api/payroll/my-payslips/{year}/{month}`

```ts
getMyPayslipDetail: async (year: number, month: number): Promise<PayslipDetail> => {
  const { data } = await apiClient.get<ApiResponse<PayslipDetail>>(
    `/api/payroll/my-payslips/${year}/${month}`,
    { _toast: false },
  );
  if (data.status !== "success" || !data.data) throw new Error(data.message ?? "Failed");
  return data.data;
},
```

---

## Stub Signature Fixes Required

Two stubs have wrong signatures that must be fixed alongside the real implementation:

| Stub | Problem | Fix |
|---|---|---|
| `approvePayroll` | Missing `employeeId` param | Add `employeeId: number` param + update hook + table call sites |
| `deleteAdjustment` | Missing `year`, `month`, `employeeId` params | Add all three + update hook + `AdjustmentList.tsx` call site |

---

## Type Checks to Confirm Before Going Live

| # | Check | File |
|---|---|---|
| 1 | `PayrollMonthSummary` — confirm `null` vs `0` behaviour matches backend for each field | `types/payroll.types.ts` |
| 2 | `PayrollMonthDetail` — confirm `approvedCount` and `draftCount` are present in response | `types/payroll.types.ts` |
| 3 | `PayrollAdjustment` — confirm `adjustmentId` field name matches backend (not `id`) | `types/payroll.types.ts` |
| 4 | `PayslipSummary` — confirm field name is `netPayable` (not `netSalary`) — there was a naming inconsistency during build | `types/payroll.types.ts` + `MyPayslipsPage.tsx` |
| 5 | `triggerPayroll` return type — update from `void` to `PayrollMonth` | `payroll.api.ts` + `payroll.queries.ts` |

---

## Post-Integration Cleanup

Once all endpoints are live and smoke-tested:

1. Run `npx tsc --noEmit` — must be zero errors
2. Remove all `// TODO:` comments from `payroll.api.ts`
3. Smoke-test admin side: trigger a month → approve each employee → mark as paid
4. Smoke-test employee side: view payslip list → view detail for FT and PT employee
5. Verify adjustment note appears on employee payslip detail
6. Verify DRAFT payslips return 403 on `GET /api/payroll/my-payslips/{year}/{month}`

---

## Files Owned by Payroll Feature

```
src/features/payroll/
├── api/
│   ├── payroll.api.ts         ← ALL stubs here — single file to update
│   └── payroll.queries.ts     ← Update approvePayroll + deleteAdjustment signatures
├── schemas/
│   └── payroll.schema.ts      ← Adjustment form schema — no changes needed
├── types/
│   └── payroll.types.ts       ← Verify field names match backend (see type checks above)
├── utils/
│   └── payroll.utils.ts       ← formatEGP, formatMonthYear, prevMonth, nextMonth — no changes needed
├── components/
│   ├── PayrollListPage/       ← Phase 1 — no changes needed
│   ├── PayrollMonthDetailPage/ ← Phase 2 + 3 — update approve/delete call sites only
│   └── MyPayslipsPage/        ← Phase 4 + 5 — no changes needed
└── index.ts

src/routes/_admin/
├── admin.payroll.tsx           ← Layout shell
└── admin.payroll.index.tsx     ← Phase 1 page

src/routes/_employee/
├── payslips.tsx                ← Layout shell
├── payslips.index.tsx          ← Phase 4 page
└── payslips.$year.$month.tsx   ← Phase 5 page

src/constants/query-keys.ts    ← payroll.* keys — no changes needed
```

No static data files to delete — this feature used error-throwing stubs, not mock data.
