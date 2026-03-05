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
import { AssignEmployeeDialog } from "./assign-employee-dialog";

type Props = {
  projectId: number;
};

export function AssignedEmployeesPanel({ projectId }: Props) {
  const [assignOpen, setAssignOpen] = useState(false);

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
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
            <Users className="h-10 w-10 text-neutral-300 mb-3" />
            <p className="text-sm font-medium text-neutral-500">
              Assignment list coming soon
            </p>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs">
              Viewing existing assignments is not yet supported. You can still
              assign new employees using the button above.
            </p>
          </div>
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
