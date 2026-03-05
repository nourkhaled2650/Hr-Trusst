import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "../types/projects.types";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className:
      "bg-success-subtle text-success border border-success-border font-medium",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-muted text-muted-foreground border border font-medium",
  },
  ON_HOLD: {
    label: "On Hold",
    className:
      "bg-warning-subtle text-warning-foreground border border-warning-border font-medium",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive border border-destructive/30 font-medium",
  },
};

type Props = {
  status: ProjectStatus;
};

export function ProjectStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
