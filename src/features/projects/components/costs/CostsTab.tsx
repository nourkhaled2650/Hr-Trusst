import type { Project, ProjectCostSummary } from "../../types/projects.types";
import { CostTrendChart } from "./CostTrendChart";
import { EmployeeCostTable } from "./EmployeeCostTable";
import { ManualCostTable } from "./ManualCostTable";

type Props = {
  projectId: string;
  project: Project;
  costSummary: ProjectCostSummary | null | undefined;
};

export function CostsTab({ projectId, project, costSummary }: Props) {
  return (
    <div>
      {/* A. Cost Trend Chart */}
      <CostTrendChart projectId={projectId} project={project} />

      {/* B. Employee Cost Table */}
      <div className="mt-6">
        <EmployeeCostTable costSummary={costSummary} />
      </div>

      {/* C. Manual Cost Table */}
      <div className="mt-6">
        <ManualCostTable projectId={projectId} />
      </div>
    </div>
  );
}
