// ---------------------------------------------------------------------------
// Admin leave feature — domain types
// ---------------------------------------------------------------------------

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

