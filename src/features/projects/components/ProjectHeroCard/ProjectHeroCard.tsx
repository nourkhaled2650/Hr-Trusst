import type { Project, ProjectCostSummary } from "../../types/projects.types";
import { ProjectStatusBadge } from "../project-status-badge";
import { HealthStatusPill } from "../HealthStatusPill";
import { formatDate, formatCurrency } from "@/lib/utils";

type Props = {
  project: Project;
  costSummary: ProjectCostSummary | null | undefined;
};

export function ProjectHeroCard({ project, costSummary }: Props) {
  const endDateLabel = project.endDate ? formatDate(project.endDate) : "No end date";

  return (
    <div className="border-b px-6 py-4 bg-card">
      {/* Row 1: Name + Status Badge */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">{project.projectName}</h1>
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Row 2: Code · Date range */}
      <p className="text-sm text-muted-foreground font-mono mt-0.5">
        {project.projectCode} · {formatDate(project.startDate)} → {endDateLabel}
      </p>

      {/* Row 3: Financial summary — only when costSummary is available */}
      {costSummary != null && (
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span>Budget {formatCurrency(costSummary.budget)}</span>
          <span aria-hidden="true">·</span>
          <span>Cost {formatCurrency(costSummary.totalCost)}</span>
          <span aria-hidden="true">·</span>
          <HealthStatusPill status={costSummary.healthStatus} />
        </div>
      )}
    </div>
  );
}
