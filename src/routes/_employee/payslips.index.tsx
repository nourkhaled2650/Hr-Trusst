import { createFileRoute } from "@tanstack/react-router";
import { MyPayslipsPage } from "@/features/payroll";

export const Route = createFileRoute("/_employee/payslips/")({
  component: MyPayslipsPage,
});
