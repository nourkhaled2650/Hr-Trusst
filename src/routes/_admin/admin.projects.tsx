import { createFileRoute } from "@tanstack/react-router";

const AdminProjectsPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold">Projects</h1>
  </div>
);

export const Route = createFileRoute("/_admin/admin/projects")({
  component: AdminProjectsPage,
});
