import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useRouter } from "@tanstack/react-router";
import { FolderX } from "lucide-react";
import { useState } from "react";
import { useCostSummary } from "../../hooks/use-cost-summary";
import { useProject } from "../../hooks/use-project";
import { ProjectHeroCard } from "../ProjectHeroCard";
import { CostsTab } from "../costs";
import { OverviewTab } from "../overview";
import { ProjectSettingsTab } from "../settings";
import { TeamTab } from "../team";

type TabValue = "overview" | "costs" | "team" | "settings";

type Props = {
  projectId: string;
};

function ProjectDetailSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb skeleton */}
      <div className="px-6 pt-6 pb-2">
        <Skeleton className="h-5 w-20" />
      </div>
      {/* Hero band skeleton */}
      <div className="border-b px-6 py-4 bg-card space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-64" />
      </div>
      {/* Tab bar skeleton */}
      <div className="px-6">
        <div className="flex gap-2 border-b py-3">
          {["Overview", "Costs", "Team", "Settings"].map((label) => (
            <Skeleton key={label} className="h-5 w-16" />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="pt-6 space-y-4">
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

function ProjectNotFound() {
  const router = useRouter();
  return (
    <div className="container py-6 flex flex-col items-center justify-center min-h-64 text-center">
      <FolderX className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <p className="text-base font-medium text-muted-foreground">
        Project not found
      </p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        This project may have been deleted or the link is invalid.
      </p>
      <Button
        variant="outline"
        className="mt-6"
        onClick={() => void router.navigate({ to: "/admin/projects" })}
      >
        Back to Projects
      </Button>
    </div>
  );
}

export function ProjectDetailPage({ projectId }: Props) {
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  const { data: project, isLoading, isError } = useProject(projectId);
  const {
    data: costSummary,
    isLoading: costSummaryLoading,
    isError: costSummaryError,
  } = useCostSummary(projectId);

  if (isLoading) return <ProjectDetailSkeleton />;
  if (isError || !project) return <ProjectNotFound />;

  return (
    <div className="bg-background min-h-screen container py-6 space-y-4">
      {/* Breadcrumb */}
      <div className="px-6 pt-6 pb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/projects">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.projectName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Hero card — always visible */}
      <ProjectHeroCard project={project} costSummary={costSummary} />

      {/* Tabs */}
      <div className="px-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
        >
          <TabsList className="border-b border-border h-auto px-2 w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6">
            <OverviewTab
              costSummary={costSummary}
              isLoading={costSummaryLoading}
              isError={costSummaryError}
              project={project}
              onSwitchToSettings={() => setActiveTab("settings")}
            />
          </TabsContent>
          <TabsContent value="costs" className="pt-6">
            <CostsTab
              projectId={projectId}
              project={project}
              costSummary={costSummary}
            />
          </TabsContent>
          <TabsContent value="team" className="pt-6">
            <TeamTab
              projectId={projectId}
              project={project}
              employeeCosts={costSummary?.employeeCosts ?? []}
            />
          </TabsContent>
          <TabsContent value="settings" className="pt-6">
            <ProjectSettingsTab project={project} projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
