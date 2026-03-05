import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "../types/projects.types";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className:
      "bg-green-50 text-green-700 border border-green-200 font-medium",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-neutral-100 text-neutral-600 border border-neutral-200 font-medium",
  },
  ON_HOLD: {
    label: "On Hold",
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 font-medium",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border border-red-200 font-medium",
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
