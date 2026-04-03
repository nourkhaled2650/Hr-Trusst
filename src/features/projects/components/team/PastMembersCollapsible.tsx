import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import type { Assignment, EmployeeCostEntry } from "../../types/projects.types";

type Props = {
  assignments: Assignment[];
  employeeCosts: EmployeeCostEntry[];
};

export function PastMembersCollapsible({ assignments, employeeCosts }: Props) {
  if (assignments.length === 0) return null;

  const costMap = new Map(employeeCosts.map((c) => [c.employeeId, c]));

  return (
    <Collapsible className="mt-4">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
          <ChevronRight className="h-4 w-4 data-[state=open]:rotate-90 transition-transform" />
          Show removed members ({assignments.length})
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Alloc %</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a) => {
              const cost = costMap.get(a.employeeId);
              return (
                <TableRow key={a.assignmentId} className="text-muted-foreground">
                  <TableCell className="text-muted-foreground">
                    <p className="font-medium">{a.employeeName}</p>
                    {a.roleInProject && (
                      <p className="text-xs">{a.roleInProject}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {cost ? (
                      cost.employmentType === "FULL_TIME" ? (
                        /* exception: employment type badge colors — no semantic token */
                        <Badge className="bg-violet-50 text-violet-700 border border-violet-200 text-xs opacity-60">
                          FT
                        </Badge>
                      ) : (
                        /* exception: employment type badge colors — no semantic token */
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs opacity-60">
                          PT
                        </Badge>
                      )
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.allocationPercentage != null ? `${a.allocationPercentage}%` : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.assignedDate ? formatDate(a.assignedDate) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {cost ? formatHours(cost.totalHours) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  );
}
