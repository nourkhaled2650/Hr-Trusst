import { createFileRoute } from "@tanstack/react-router";
import { PayrollListPage } from "@/features/payroll";

export const Route = createFileRoute("/_admin/admin/payroll/")({
  component: PayrollListPage,
});
