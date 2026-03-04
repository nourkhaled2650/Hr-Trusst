import type { Employee } from "../types/employee.types";
import type { UpdateEmployeeFormValues } from "../types/employee.types";

// ---------------------------------------------------------------------------
// Password generation
// ---------------------------------------------------------------------------

export function generateSecurePassword(length = 16): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*";
  const all = upper + lower + digits + special;
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  const chars = Array.from(array).map((n) => all[n % all.length]);
  // Guarantee at least one of each required class
  chars[0] = upper[array[0] % upper.length];
  chars[1] = digits[array[1] % digits.length];
  chars[2] = special[array[2] % special.length];
  return chars.sort(() => Math.random() - 0.5).join("");
}

// ---------------------------------------------------------------------------
// Name helpers
// ---------------------------------------------------------------------------

export function getFullName(employee: Employee): string {
  const parts = [employee.firstName, employee.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "";
}

export function getInitials(employee: Employee): string {
  if (employee.firstName && employee.lastName) {
    return `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  }
  if (employee.firstName) {
    return employee.firstName[0].toUpperCase();
  }
  if (employee.lastName) {
    return employee.lastName[0].toUpperCase();
  }
  return employee.email[0].toUpperCase();
}

// ---------------------------------------------------------------------------
// Map API Employee to form default values
// ---------------------------------------------------------------------------

export function mapEmployeeToFormValues(
  employee: Employee,
): UpdateEmployeeFormValues {
  const ce = employee.configurationException;
  return {
    firstName: employee.firstName ?? "",
    lastName: employee.lastName ?? "",
    phoneNumber: employee.phoneNumber ?? "",
    address: employee.address ?? "",
    position: employee.position ?? "",
    basicSalary: employee.basicSalary ?? null,
    dateOfBirth: employee.dateOfBirth ?? null,
    hireDate: employee.hireDate ?? null,
    employeeType: employee.employeeType ?? null,
    configurationException: ce
      ? {
          normalOvertimeRate: ce.normalOvertimeRate ?? null,
          specialOvertimeRate: ce.specialOvertimeRate ?? null,
          standardWorkingHours: ce.standardWorkingHours ?? null,
          lateBalanceLimit: ce.lateBalanceLimit ?? null,
          leaveBalanceLimit: ce.leaveBalanceLimit ?? null,
          // Backend sends HH:mm:ss — form uses HH:mm
          workingDayStartTime: ce.workingDayStartTime
            ? ce.workingDayStartTime.slice(0, 5)
            : null,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Build update payload — strip empty strings, convert types
// ---------------------------------------------------------------------------

type UpdatePayload = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  position?: string;
  basicSalary?: number | null;
  dateOfBirth?: string | null;
  hireDate?: string | null;
  employeeType?: "FULL_TIME" | "PART_TIME" | null;
  configurationException?: {
    normalOvertimeRate?: number | null;
    specialOvertimeRate?: number | null;
    standardWorkingHours?: number | null;
    lateBalanceLimit?: number | null;
    leaveBalanceLimit?: number | null;
    workingDayStartTime?: string | null;
  } | null;
};

export function buildUpdatePayload(
  values: UpdateEmployeeFormValues,
): UpdatePayload {
  const payload: UpdatePayload = {};

  if (values.firstName !== undefined)
    payload.firstName = values.firstName || undefined;
  if (values.lastName !== undefined)
    payload.lastName = values.lastName || undefined;
  if (values.phoneNumber !== undefined)
    payload.phoneNumber = values.phoneNumber || undefined;
  if (values.address !== undefined)
    payload.address = values.address || undefined;
  if (values.position !== undefined)
    payload.position = values.position || undefined;

  payload.basicSalary = values.basicSalary ?? null;
  payload.dateOfBirth = values.dateOfBirth ?? null;
  payload.hireDate = values.hireDate ?? null;
  payload.employeeType = values.employeeType ?? null;

  const ce = values.configurationException;
  if (ce === null || ce === undefined) {
    payload.configurationException = null;
  } else {
    const cePayload: UpdatePayload["configurationException"] = {
      normalOvertimeRate: ce.normalOvertimeRate ?? null,
      specialOvertimeRate: ce.specialOvertimeRate ?? null,
      standardWorkingHours: ce.standardWorkingHours ?? null,
      lateBalanceLimit: ce.lateBalanceLimit ?? null,
      leaveBalanceLimit: ce.leaveBalanceLimit ?? null,
      // Append :00 for backend HH:mm:ss format
      workingDayStartTime: ce.workingDayStartTime
        ? `${ce.workingDayStartTime}:00`
        : null,
    };

    // If all fields are null, send configurationException: null
    const allNull = Object.values(cePayload).every((v) => v === null);
    payload.configurationException = allNull ? null : cePayload;
  }

  return payload;
}
