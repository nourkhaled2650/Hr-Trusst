// ---------------------------------------------------------------------------
// Static placeholder data — will be replaced by TanStack Query hooks once
// the leave API contract is ready.
// ---------------------------------------------------------------------------

import type { LeaveBalance, LeaveRequest } from "../types/leave.types";

export const LEAVE_BALANCES: readonly LeaveBalance[] = [
  { type: "Annual Leave", total: 20, used: 5 },
  { type: "Sick Leave", total: 10, used: 2 },
  { type: "Unpaid Leave", total: 5, used: 0 },
] as const;

export const LEAVE_HISTORY: readonly LeaveRequest[] = [
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
    reason:
      "Needed an extra day for a personal matter that came up unexpectedly — it was unavoidable.",
    status: "REJECTED",
    submittedAt: "2026-01-06",
  },
  {
    id: 5,
    leaveType: "Annual Leave",
    startDate: "2026-04-20",
    endDate: "2026-04-24",
    durationDays: 5,
    reason: "Pre-planned family vacation.",
    status: "APPROVED",
    submittedAt: "2026-03-28",
  },
] as const;
