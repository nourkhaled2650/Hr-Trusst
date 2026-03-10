import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "../api/employees.api";
import { EMPLOYEES_QUERY_KEY } from "./use-employees";
import type { UpdateEmployeeFormValues } from "../types/employee.types";

type UpdateEmployeeArgs = {
  employeeId: number;
  values: UpdateEmployeeFormValues;
};

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, values }: UpdateEmployeeArgs) =>
      employeeApi.updateEmployee(employeeId, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
}
