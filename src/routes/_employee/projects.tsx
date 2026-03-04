import { createFileRoute } from "@tanstack/react-router";

const ProjectsPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold">Projects</h1>
  </div>
);

export const Route = createFileRoute("/_employee/projects")({
  component: ProjectsPage,
});
