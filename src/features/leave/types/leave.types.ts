// ---------------------------------------------------------------------------
// Leave feature — domain types
// All form-level types are derived from Zod schemas in schemas/
// ---------------------------------------------------------------------------

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type LeaveTypeName = "Annual Leave" | "Sick Leave" | "Unpaid Leave";

export interface LeaveBalance {
  type: LeaveTypeName;
  total: number;
  used: number;
}

export interface LeaveRequest {
  id: number;
  leaveType: LeaveTypeName;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationDays: number;
  reason: string;
  status: LeaveStatus;
  submittedAt: string; // YYYY-MM-DD
}
