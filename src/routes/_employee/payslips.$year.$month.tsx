import { createFileRoute } from "@tanstack/react-router";
import { MyPayslipDetailPage } from "@/features/payroll";

export const Route = createFileRoute("/_employee/payslips/$year/$month")({
  component: PayslipDetailRoute,
});

function PayslipDetailRoute() {
  const { year, month } = Route.useParams();
  return (
    <MyPayslipDetailPage year={Number(year)} month={Number(month)} />
  );
}
