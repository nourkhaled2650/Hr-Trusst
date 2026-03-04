import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/query-client";
import {
  EmployeeTable,
  CreateEmployeeDialog,
  useEmployees,
  employeeApi,
  EMPLOYEES_QUERY_KEY,
} from "@/features/employees";
import type { Employee } from "@/features/employees";

export const Route = createFileRoute("/_admin/admin/employees/")({
  loader: () =>
    queryClient.ensureQueryData({
      queryKey: EMPLOYEES_QUERY_KEY,
      queryFn: employeeApi.fetchEmployees,
    }),
  component: AdminEmployeesPage,
});

function AdminEmployeesPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: employees = [], isLoading, isError } = useEmployees();

  const handleNavigate = (employee: Employee) => {
    void router.navigate({
      to: "/admin/employees/$employeeId",
      params: { employeeId: String(Number(employee.employeeId)) },
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Employees</h1>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Employee
        </Button>
      </div>

      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        isError={isError}
        onNavigate={handleNavigate}
        onCreateClick={() => setCreateOpen(true)}
      />

      <CreateEmployeeDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
