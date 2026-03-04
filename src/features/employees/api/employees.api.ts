import { apiClient } from "@/lib/axios";
import type { Employee } from "../types/employee.types";
import type { CreateEmployeeFormValues } from "../types/employee.types";

// ---------------------------------------------------------------------------
// Request payload types
// ---------------------------------------------------------------------------

type CreateEmployeePayload = {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  position?: string;
  employeeType?: "FULL_TIME" | "PART_TIME";
  basicSalary?: string;
};

type UpdateEmployeePayload = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  position?: string;
  basicSalary?: number | null;
  hourlyRate?: number | null;
  dateOfBirth?: string | null;
  hireDate?: string | null;
  employeeType?: "FULL_TIME" | "PART_TIME" | null;
  managerId?: number | null;
  configurationException?: {
    normalOvertimeRate?: number | null;
    specialOvertimeRate?: number | null;
    standardWorkingHours?: number | null;
    lateBalanceLimit?: number | null;
    leaveBalanceLimit?: number | null;
    workingDayStartTime?: string | null;
  } | null;
};

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export const employeeApi = {
  fetchEmployees: async (): Promise<Employee[]> => {
    const { data } = await apiClient.get<Employee[]>("/api/employee", {
      _toast: false,
    });
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to fetch employees");
    }
    return data.data;
  },

  createEmployee: async (
    values: CreateEmployeeFormValues,
  ): Promise<void> => {
    const payload: CreateEmployeePayload = {
      email: values.email,
      username: values.username,
      password: values.password,
    };

    if (values.firstName) payload.firstName = values.firstName;
    if (values.lastName) payload.lastName = values.lastName;
    if (values.department) payload.department = values.department;
    if (values.position) payload.position = values.position;
    if (values.employeeType) payload.employeeType = values.employeeType;
    if (values.basicSalary !== undefined && values.basicSalary !== null) {
      payload.basicSalary = values.basicSalary.toFixed(2);
    }

    const { data } = await apiClient.post<null>("/api/employee", payload);
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to create employee");
    }
  },

  updateEmployee: async (
    employeeId: number,
    payload: UpdateEmployeePayload,
  ): Promise<void> => {
    const { data } = await apiClient.put<null>(
      `/api/employee/admin/${employeeId}`,
      payload,
    );
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to update employee");
    }
  },
} as const;
