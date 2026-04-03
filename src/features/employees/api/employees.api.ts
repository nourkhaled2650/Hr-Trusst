import { apiClient } from "@/lib/axios";
import type { Employee, UpdateEmployeeFormValues } from "../types/employee.types";
import type { CreateEmployeeFormValues } from "../types/employee.types";
import { buildUpdatePayload } from "../utils/employees.utils";

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
    const body = {
      email: values.email,
      username: values.username,
      password: values.password,
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      position: values.position || undefined,
      employeeType: values.employeeType || undefined,
      basicSalary:
        values.basicSalary != null ? values.basicSalary.toFixed(2) : undefined,
      hourlyRate:
        values.hourlyRate != null ? values.hourlyRate : undefined,
    };

    const { data } = await apiClient.post<null>("/api/employee", body);
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to create employee");
    }
  },

  updateEmployee: async (
    employeeId: number,
    values: UpdateEmployeeFormValues,
  ): Promise<void> => {
    const { data } = await apiClient.put<null>(
      `/api/employee/admin/${employeeId}`,
      buildUpdatePayload(values),
    );
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to update employee");
    }
  },
} as const;
