# Leave Module — Frontend Integration Next Steps

> All leave pages are complete with static data.
> Pick this up once the backend delivers the missing endpoints in `backend/docs/leave-backend-handoff.md`.
> Work through the steps in order — each step is independent but listed by priority.

---

## Step 1 — ~~Add `CANCELLED` to `LeaveStatus`~~ ✅ Done

Already completed in the static-data build phase. `LeaveStatus` includes `"CANCELLED"` and the history table badge handles all 4 statuses.

---

## Step 2 — Wire Employee Leave Balance Cards

**Backend ready when**: `GET /api/leave-balance/my` is implemented.

**What to build**:

1. Create `src/features/leave/api/leave.api.ts`:
```ts
export const leaveApi = {
  getMyBalance: () =>
    apiClient.get<ApiResponse<LeaveBalanceResponse>>("/api/leave-balance/my"),
  getMyRequests: () =>
    apiClient.get<ApiResponse<LeaveRequestResponse[]>>("/api/leave-requests/my"),
  submitRequest: (body: SubmitLeaveApiPayload) =>
    apiClient.post<ApiResponse<LeaveRequestResponse>>("/api/leave-requests", body),
  cancelRequest: (id: number) =>
    apiClient.put<ApiResponse<null>>(`/api/leave-requests/${id}`),
} as const;
```

2. Create `src/features/leave/api/leave.queries.ts`:
```ts
export const leaveKeys = {
  all: ["leave"] as const,
  myBalance: () => [...leaveKeys.all, "balance", "my"] as const,
  myRequests: () => [...leaveKeys.all, "requests", "my"] as const,
};

export function useMyLeaveBalanceQuery() {
  return useQuery({
    queryKey: leaveKeys.myBalance(),
    queryFn: () => leaveApi.getMyBalance().then((r) => r.data.data),
  });
}

export function useMyLeaveRequestsQuery() {
  return useQuery({
    queryKey: leaveKeys.myRequests(),
    queryFn: () => leaveApi.getMyRequests().then((r) => r.data.data),
  });
}
```

3. Add types in `leave.types.ts`:
```ts
export interface LeaveBalanceResponse {
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

// Backend API enum → frontend display label mapping
export const LEAVE_TYPE_DISPLAY: Record<"PAID" | "SICK" | "UNPAID", LeaveTypeName> = {
  PAID: "Annual Leave",
  SICK: "Sick Leave",
  UNPAID: "Unpaid Leave",
};

// API response shape (snake_case fields from backend)
export interface LeaveRequestResponse {
  leaveRequestId: number;
  employeeId: number;
  employeeName: string;
  leaveType: "PAID" | "SICK" | "UNPAID";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  status: LeaveStatus;
  approvedDate: string | null;
  createdAt: string;
}
```

4. In `leave.tsx` (employee route), replace `LEAVE_BALANCES` constant with the query. The balance cards need:
   - Annual Leave: from `GET /api/leave-balance/my` — `{ totalDays, usedDays, remainingDays }`
   - Sick Leave: derived from `GET /api/leave-requests/my` — count `totalDays` of all APPROVED SICK requests for the current year
   - Unpaid Leave: count `totalDays` of all APPROVED UNPAID requests for current year (no balance record exists for these)

5. Delete `src/features/leave/constants/leave-data.ts` once both balance + history are wired.

---

## Step 3 — Wire Employee Leave History Table

**Backend ready when**: `GET /api/leave-requests/my` is implemented (already exists).

**What to build**:

Replace `LEAVE_HISTORY` constant in `leave.tsx` with `useMyLeaveRequestsQuery()`.

Map `LeaveRequestResponse` → `LeaveRequest` (the display type):
```ts
function toLeaveRequest(r: LeaveRequestResponse): LeaveRequest {
  return {
    id: r.leaveRequestId,
    leaveType: LEAVE_TYPE_DISPLAY[r.leaveType],
    startDate: r.startDate,
    endDate: r.endDate,
    durationDays: r.totalDays,
    reason: r.reason ?? "",
    status: r.status,
    submittedAt: r.createdAt.split("T")[0],
  };
}
```

Pass `isLoading`, `isError`, and `refetch` props to `<LeaveHistoryTable>` — the component already accepts them.

---

## Step 4 — Wire Employee Submit Dialog

**Backend ready when**: `POST /api/leave-requests` (already exists).

**What to build**:

Replace the `TODO` placeholder in `submit-leave-request-dialog.tsx` with a real mutation:

```ts
const mutation = useMutation({
  mutationFn: (values: SubmitLeaveFormValues) =>
    leaveApi.submitRequest({
      leaveType: LEAVE_TYPE_API[values.leaveType],  // "Annual Leave" → "PAID" etc.
      startDate: values.startDate,
      endDate: values.endDate,
      reason: values.reason,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: leaveKeys.myRequests() });
    queryClient.invalidateQueries({ queryKey: leaveKeys.myBalance() });
    onOpenChange(false);
    toast.success("Leave request submitted.");
  },
});
```

The `LEAVE_TYPE_API` reverse map (display → enum):
```ts
const LEAVE_TYPE_API: Record<LeaveTypeName, "PAID" | "SICK" | "UNPAID"> = {
  "Annual Leave": "PAID",
  "Sick Leave": "SICK",
  "Unpaid Leave": "UNPAID",
};
```

Backend error messages to handle in the error toast:
- `"Insufficient Leave Balance"` → "You don't have enough leave balance for this request."
- `"Cannot submit leave request: Overlapping days with another request"` → "These dates overlap with an existing request."
- `"Part time Employees cannot submit leave requests"` → surface as-is.
- `"All selected days are holidays"` → surface as-is.

---

## Step 5 — Add Cancel Button to Employee History Table

**Backend ready when**: `PUT /api/leave-requests/{id}` (already exists).

**What to build**:

Add a cancel action to PENDING rows in `leave-history-table.tsx`. Only show for `status === "PENDING"`.

```ts
const cancelMutation = useMutation({
  mutationFn: (id: number) => leaveApi.cancelRequest(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: leaveKeys.myRequests() });
    queryClient.invalidateQueries({ queryKey: leaveKeys.myBalance() });
    toast.success("Leave request cancelled.");
  },
});
```

Show a minimal inline confirm before calling — a small popover or `window.confirm` is acceptable here since cancellations are low-risk.

---

## Step 6 — Wire Admin Leave Page

**Backend ready when**: ALL 4 endpoints in `backend/docs/leave-backend-handoff.md` are implemented.

**What to build** — 4 query hooks:

```ts
// In leave.queries.ts (admin additions):

export const adminLeaveKeys = {
  stats: () => [...leaveKeys.all, "admin", "stats"] as const,
  pending: () => [...leaveKeys.all, "admin", "pending"] as const,
  upcomingApproved: () => [...leaveKeys.all, "admin", "upcoming"] as const,
  history: (filters: AdminLeaveHistoryFilters) =>
    [...leaveKeys.all, "admin", "history", filters] as const,
};

export function useAdminLeaveStatsQuery() { ... }         // GET /api/leave-stats/admin
export function usePendingRequestsQuery() { ... }         // GET /api/leave-requests/pending
export function useUpcomingApprovedQuery() { ... }        // GET /api/leave-requests/upcoming-approved
export function useAdminLeaveHistoryQuery(filters) { ... } // GET /api/leave-requests/all
```

**Approve/Reject mutations**:
```ts
export function useApproveLeaveRequestMutation() {
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.put(`/api/leave-requests/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLeaveKeys.pending() });
      queryClient.invalidateQueries({ queryKey: adminLeaveKeys.stats() });
      queryClient.invalidateQueries({ queryKey: adminLeaveKeys.upcomingApproved() });
    },
  });
}

export function useRejectLeaveRequestMutation() {
  return useMutation({
    // Reject now sends a body — the admin rejection reason collected in the dialog.
    // Backend must accept { rejectionReason: string } — see backend/docs/leave-backend-handoff.md §2.1
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      apiClient.put(`/api/leave-requests/${id}/reject`, { rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLeaveKeys.pending() });
      queryClient.invalidateQueries({ queryKey: adminLeaveKeys.stats() });
    },
  });
}
```

**Wiring the dialogs to mutations** — the `handleConfirm` in `admin.leave.tsx` currently has signature `(id, action, _reason?)`. When replacing with real mutations:

```ts
function handleConfirm(id: number, action: "approve" | "reject", reason?: string) {
  if (action === "approve") {
    approveMutation.mutate(id);
  } else {
    rejectMutation.mutate({ id, reason: reason ?? "" });
  }
}
```

Also add `rejectionReason: string | null` to `AdminLeaveRequest` (in `admin-leave.types.ts`) and `LeaveRequestResponse` (in `leave.types.ts`) once the backend exposes the field — the history table can then display it.

Replace all static data constants in `admin.leave.tsx` with these query hooks. The stat cards, pending list, upcoming section, and history table components already accept the right props — just swap the data source.

**Filter state** in the admin history section:
```ts
const [filters, setFilters] = useState<AdminLeaveHistoryFilters>({
  employeeId: undefined,
  leaveType: undefined,
  startDate: undefined,
  endDate: undefined,
});
```

The employee dropdown in the filter bar should fetch from `GET /api/employee` (already used in the employees feature — reuse the employees query).

---

## Known Backend Issues That Affect the Frontend

1. **DEV-LEAVE-NEW-008**: Overlap check only covers PENDING, not APPROVED requests. After this is fixed, no frontend change needed — the backend will start returning a 400 that the dialog already handles.

2. **Balance for SICK/UNPAID**: There is no `EmployeeLeaveBalance` record for sick or unpaid leave — the balance is unlimited / tracking-only. The balance card for these two types must derive "used days" from the requests list, not from a balance endpoint. See Step 2 above.
