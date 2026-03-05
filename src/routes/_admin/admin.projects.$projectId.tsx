import { createFileRoute } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { projectsApi, ProjectDetailPage } from "@/features/projects";

export const Route = createFileRoute("/_admin/admin/projects/$projectId")({
  loader: ({ params }) =>
    queryClient.ensureQueryData({
      queryKey: ["projects", params.projectId],
      queryFn: () => projectsApi.fetchProject(params.projectId),
    }),
  component: AdminProjectDetailPage,
});

function AdminProjectDetailPage() {
  const { projectId } = Route.useParams();
  return <ProjectDetailPage projectId={projectId} />;
}
