// ---------------------------------------------------------------------------
// Admin leave static data — will be replaced by TanStack Query hooks once
// the leave API contract is ready.
// ---------------------------------------------------------------------------

import type { AdminLeaveStat, AdminLeaveRequest } from "../types/admin-leave.types";

export const ADMIN_LEAVE_STATS: readonly AdminLeaveStat[] = [
  { label: "Days Taken (YTD)", value: 47, unit: "days", description: "Across all employees, this year" },
  { label: "Days Remaining", value: 213, unit: "days", description: "Sum of all active leave balances" },
  { label: "Upcoming Approved", value: 3, unit: "requests", description: "Approved leave starting in the future" },
] as const;

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
