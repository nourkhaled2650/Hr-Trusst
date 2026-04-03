import { createFileRoute } from "@tanstack/react-router";
import { PayrollMonthDetailPage } from "@/features/payroll/components/PayrollMonthDetailPage";

export const Route = createFileRoute("/_admin/admin/payroll/$year/$month")({
  component: AdminPayrollMonthDetailPage,
});

function AdminPayrollMonthDetailPage() {
  const { year, month } = Route.useParams();
  return (
    <PayrollMonthDetailPage year={Number(year)} month={Number(month)} />
  );
}
