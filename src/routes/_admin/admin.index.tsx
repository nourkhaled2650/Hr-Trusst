import { createFileRoute } from "@tanstack/react-router";

const AdminDashboardPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
    {/* Admin dashboard — built as part of the dashboard feature */}
  </div>
);

export const Route = createFileRoute("/_admin/admin/")({
  component: AdminDashboardPage,
});
