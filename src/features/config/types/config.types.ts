/**
 * Matches PayrollSettingsResponse from the backend exactly.
 * Source: backend/docs/api-contracts/payroll-settings.md
 */
export interface PayrollSettings {
  settingId: number;
  normalOvertimeRate: number;
  specialOvertimeRate: number;
  standardWorkingHours: number;
  lateBalanceLimit: number;
  leaveBalanceLimit: number;
  /** Format: "HH:mm:ss" */
  workingDayStartTime: string;
  /** ISO-8601 datetime — null if not set */
  validFrom: string | null;
  /** ISO-8601 datetime — null if not set */
  validUntil: string | null;
  gracePeriod: number;
  isExpired: boolean;
}

/**
 * Full request body for POST /create and PUT /update/{id}.
 * PUT is full-replace: all fields must be sent on update.
 */
export interface PayrollSettingsRequest {
  normalOvertimeRate: number;
  specialOvertimeRate: number;
  standardWorkingHours: number;
  lateBalanceLimit: number;
  leaveBalanceLimit: number;
  /** Format: "HH:mm:ss" */
  workingDayStartTime: string;
  validFrom: string | null;
  validUntil: string | null;
  gracePeriod: number;
  isExpired: boolean;
}
