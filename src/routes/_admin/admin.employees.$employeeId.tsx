import { createFileRoute } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { employeeApi, EMPLOYEES_QUERY_KEY, EmployeeDetailPage } from "@/features/employees";

export const Route = createFileRoute("/_admin/admin/employees/$employeeId")({
  loader: () =>
    queryClient.ensureQueryData({
      queryKey: EMPLOYEES_QUERY_KEY,
      queryFn: employeeApi.fetchEmployees,
    }),
  component: AdminEmployeeDetailPage,
});

function AdminEmployeeDetailPage() {
  const { employeeId } = Route.useParams();
  return <EmployeeDetailPage employeeId={employeeId} />;
}
