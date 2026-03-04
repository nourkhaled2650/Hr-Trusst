import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "../api/employees.api";
import { EMPLOYEES_QUERY_KEY } from "./use-employees";
import type { UpdateEmployeeFormValues } from "../types/employee.types";
import { buildUpdatePayload } from "../utils/employees.utils";

type UpdateEmployeeArgs = {
  employeeId: number;
  values: UpdateEmployeeFormValues;
};

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, values }: UpdateEmployeeArgs) => {
      const payload = buildUpdatePayload(values);
      return employeeApi.updateEmployee(employeeId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
}
