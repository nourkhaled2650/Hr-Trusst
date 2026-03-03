import { createFileRoute } from "@tanstack/react-router";

const EmployeeHomePage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold">Welcome</h1>
    {/* Employee dashboard — built as part of the dashboard feature */}
  </div>
);

export const Route = createFileRoute("/_employee/")({
  component: EmployeeHomePage,
});
