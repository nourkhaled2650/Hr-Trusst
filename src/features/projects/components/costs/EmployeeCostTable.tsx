import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatHours } from "@/lib/utils";
import type {
  EmployeeCostEntry,
  ProjectCostSummary,
} from "../../types/projects.types";

type Props = {
  costSummary: ProjectCostSummary | null | undefined;
};

function EmploymentTypeBadge({
  type,
}: {
  type: EmployeeCostEntry["employmentType"];
}) {
  if (type === "FULL_TIME") {
    return (
      /* cost category colors — no semantic token */
      <Badge className="bg-violet-50 text-violet-700 border border-violet-200 text-xs">
        FT
      </Badge>
    );
  }
  return (
    /* cost category colors — no semantic token */
    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
      PT
    </Badge>
  );
}

function CostStatusBadge({
  status,
}: {
  status: EmployeeCostEntry["costStatus"];
}) {
  if (status === "CONFIRMED") {
    return (
      /* cost category colors — no semantic token */
      <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">
        Confirmed
      </Badge>
    );
  }
  return (
    <TooltipProvider>
      <ShadcnTooltip>
        <TooltipTrigger asChild>
          {/* cost category colors — no semantic token */}
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs cursor-default">
            Estimated
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          Full-time salary cost is estimated until the monthly payslip is
          generated.
        </TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  );
}

function ManualCostRow({ totalManualCost }: { totalManualCost: number }) {
  if (totalManualCost === 0) return null;

  return (
    <>
      <TableRow className="bg-muted/40">
        <TableCell colSpan={4}>Manual Costs</TableCell>
        <TableCell className=" font-medium tabular-nums text-sm">
          {formatCurrency(totalManualCost)}
        </TableCell>
      </TableRow>
    </>
  );
}

export function EmployeeCostTable({ costSummary }: Props) {
  const employees = [...(costSummary?.employeeCosts ?? [])].sort(
    (a, b) => b.salaryCost - a.salaryCost,
  );
  const totalManualCost = costSummary?.totalManualCost ?? 0;
  const grandTotal = costSummary?.totalCost ?? 0;

  if (employees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Cost by Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground text-center">
            No cost data yet. Assign employees and have them log hours.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Cost by Employee
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Salary Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.employeeId}>
                <TableCell className="font-medium">
                  {emp.employeeName}
                </TableCell>
                <TableCell>
                  <EmploymentTypeBadge type={emp.employmentType} />
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {formatHours(emp.totalHours)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {formatCurrency(emp.salaryCost)}
                </TableCell>
                <TableCell>
                  <CostStatusBadge status={emp.costStatus} />
                </TableCell>
              </TableRow>
            ))}

            {totalManualCost > 0 && (
              <ManualCostRow totalManualCost={totalManualCost} />
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="font-semibold">
                Total
              </TableCell>
              <TableCell className=" tabular-nums font-semibold">
                {formatCurrency(grandTotal)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
