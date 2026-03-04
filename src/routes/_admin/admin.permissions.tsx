import { createFileRoute } from "@tanstack/react-router";

const AdminPermissionsPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold">Permissions</h1>
  </div>
);

export const Route = createFileRoute("/_admin/admin/permissions")({
  component: AdminPermissionsPage,
});
