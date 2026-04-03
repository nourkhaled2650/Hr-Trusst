import { useState } from "react";
import { Users, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProjectAssignments } from "../../hooks/use-project-assignments";
import { AssignEmployeeDialog } from "../assign-employee-dialog";
import type { Project, EmployeeCostEntry } from "../../types/projects.types";
import { TeamTable } from "./TeamTable";
import { PastMembersCollapsible } from "./PastMembersCollapsible";

type Props = {
  projectId: string;
  project: Project;
  employeeCosts: EmployeeCostEntry[];
};

export function TeamTab({ projectId, project: _project, employeeCosts }: Props) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const {
    data: assignments,
    isLoading,
    isError,
  } = useProjectAssignments(Number(projectId));

  const active   = assignments?.filter((a) => a.active)  ?? [];
  const inactive = assignments?.filter((a) => !a.active) ?? [];

  const hasAny = active.length > 0 || inactive.length > 0;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setAssignDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Employee
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {isError && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load team members. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !isError && !hasAny && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
              <p className="text-base font-medium text-foreground">No employees assigned yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Use the button above to assign employees to this project.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setAssignDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Employee
              </Button>
            </div>
          )}

          {!isLoading && !isError && active.length > 0 && (
            <TeamTable
              assignments={active}
              employeeCosts={employeeCosts}
              projectId={projectId}
            />
          )}

          {!isLoading && !isError && inactive.length > 0 && (
            <PastMembersCollapsible
              assignments={inactive}
              employeeCosts={employeeCosts}
            />
          )}
        </CardContent>
      </Card>

      <AssignEmployeeDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        projectId={Number(projectId)}
      />
    </>
  );
}
