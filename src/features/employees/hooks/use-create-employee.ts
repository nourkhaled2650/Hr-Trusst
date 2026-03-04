import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "../api/employees.api";
import { EMPLOYEES_QUERY_KEY } from "./use-employees";
import type { CreateEmployeeFormValues } from "../types/employee.types";

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateEmployeeFormValues) =>
      employeeApi.createEmployee(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
}
