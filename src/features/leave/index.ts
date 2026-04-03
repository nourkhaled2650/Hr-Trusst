// ---------------------------------------------------------------------------
// Leave feature — public API
// Nothing inside this feature is imported directly from outside.
// All cross-feature access goes through this file.
// ---------------------------------------------------------------------------

// Types needed by other features / pages
export type { LeaveBalance, LeaveRequest, LeaveStatus, LeaveTypeName } from "./types/leave.types";

// Components needed by other features
export { LeaveTypeBadge } from "./components/leave-type-badge";
export { LeaveStatusBadge } from "./components/leave-status-badge";
export type {
  AdminLeaveRequest,
  AdminLeaveStatus,
  AdminLeaveType,
  AdminLeaveStat,
  ConfirmingState,
} from "./types/admin-leave.types";
