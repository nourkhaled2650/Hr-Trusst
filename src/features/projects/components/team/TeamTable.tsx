import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatHours, formatCurrency } from "@/lib/utils";
import { useDeactivateAssignment } from "../../hooks/use-deactivate-assignment";
import type { Assignment, EmployeeCostEntry } from "../../types/projects.types";
import { RemoveMemberDialog } from "./RemoveMemberDialog";

type Props = {
  assignments: Assignment[];
  employeeCosts: EmployeeCostEntry[];
  projectId: string;
};

type RemoveTarget = { assignmentId: number; employeeName: string };

export function TeamTable({ assignments, employeeCosts, projectId }: Props) {
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
  const { mutate: deactivate, isPending } = useDeactivateAssignment(projectId);

  const costMap = new Map(employeeCosts.map((c) => [c.employeeId, c]));

  const handleConfirmRemove = () => {
    if (!removeTarget) return;
    deactivate(removeTarget.assignmentId, {
      onSuccess: () => {
        toast.success(`${removeTarget.employeeName} removed from project`);
        setRemoveTarget(null);
      },
    });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Alloc %</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((a) => {
            const cost = costMap.get(a.employeeId);
            return (
              <TableRow key={a.assignmentId}>
                <TableCell>
                  <p className="font-medium">{a.employeeName}</p>
                  {a.roleInProject && (
                    <p className="text-xs text-muted-foreground">{a.roleInProject}</p>
                  )}
                </TableCell>
                <TableCell>
                  {cost ? (
                    cost.employmentType === "FULL_TIME" ? (
                      /* exception: employment type badge colors — no semantic token */
                      <Badge className="bg-violet-50 text-violet-700 border border-violet-200 text-xs">
                        FT
                      </Badge>
                    ) : (
                      /* exception: employment type badge colors — no semantic token */
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                        PT
                      </Badge>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {a.allocationPercentage != null ? `${a.allocationPercentage}%` : "—"}
                </TableCell>
                <TableCell>
                  {a.assignedDate ? formatDate(a.assignedDate) : "—"}
                </TableCell>
                <TableCell>
                  {cost ? formatHours(cost.totalHours) : "—"}
                </TableCell>
                <TableCell>
                  {cost ? (
                    <div>
                      <p>{formatCurrency(cost.salaryCost)}</p>
                      {cost.costStatus === "ESTIMATED" ? (
                        /* exception: cost status badge colors — no semantic token */
                        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded px-1">
                          ESTIMATED
                        </span>
                      ) : (
                        /* exception: cost status badge colors — no semantic token */
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1">
                          CONFIRMED
                        </span>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setRemoveTarget({
                        assignmentId: a.assignmentId,
                        employeeName: a.employeeName,
                      })
                    }
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <RemoveMemberDialog
        open={removeTarget !== null}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
        employeeName={removeTarget?.employeeName ?? ""}
        isPending={isPending}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
