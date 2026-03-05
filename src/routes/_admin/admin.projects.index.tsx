import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/query-client";
import {
  ProjectTable,
  CreateProjectDialog,
  useProjects,
  projectsApi,
  PROJECTS_QUERY_KEY,
} from "@/features/projects";
import type { Project } from "@/features/projects";

export const Route = createFileRoute("/_admin/admin/projects/")({
  loader: () =>
    queryClient.ensureQueryData({
      queryKey: PROJECTS_QUERY_KEY,
      queryFn: projectsApi.fetchProjects,
    }),
  component: AdminProjectsPage,
});

function AdminProjectsPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: projects = [], isLoading, isError } = useProjects();

  const handleNavigate = (project: Project) => {
    void router.navigate({
      to: "/admin/projects/$projectId",
      params: { projectId: String(Number(project.projectId)) },
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Projects</h1>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <ProjectTable
        projects={projects}
        isLoading={isLoading}
        isError={isError}
        onNavigate={handleNavigate}
        onCreateClick={() => setCreateOpen(true)}
      />

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
