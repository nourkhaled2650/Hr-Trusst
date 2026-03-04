import { useQuery } from "@tanstack/react-query";
import { employeeApi } from "../api/employees.api";
import type { Employee } from "../types/employee.types";

export const EMPLOYEES_QUERY_KEY = ["employees"] as const;

export function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: employeeApi.fetchEmployees,
  });
}
