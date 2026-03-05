import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignEmployeeDialog } from "./assign-employee-dialog";
import { useProjectAssignments } from "../hooks/use-project-assignments";

type Props = {
  projectId: number;
};

export function AssignedEmployeesPanel({ projectId }: Props) {
  const [assignOpen, setAssignOpen] = useState(false);
  const { data: assignments = [], isLoading, isError } = useProjectAssignments(projectId);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-neutral-900">
                Assigned Employees
              </CardTitle>
              <CardDescription>
                Employees currently assigned to this project.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-red-500 text-center py-6">
              Failed to load assignments.
            </p>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
              <Users className="h-10 w-10 text-neutral-300 mb-3" />
              <p className="text-sm font-medium text-neutral-500">
                No employees assigned yet
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Use the button above to assign an employee.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {assignments.map((a) => (
                <div
                  key={a.assignmentId}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {a.employeeName}
                    </p>
                    {a.assignedDate && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Since {a.assignedDate}
                      </p>
                    )}
                  </div>
                  {a.roleInProject ? (
                    <Badge variant="secondary" className="text-xs">
                      {a.roleInProject}
                    </Badge>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignEmployeeDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        projectId={projectId}
      />
    </>
  );
}
