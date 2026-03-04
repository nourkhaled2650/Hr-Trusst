import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Employee } from "../types/employee.types";
import { getFullName, getInitials } from "../utils/employees.utils";

// ---------------------------------------------------------------------------
// Employee type badge
// ---------------------------------------------------------------------------

export function EmployeeTypeBadge({
  type,
}: {
  type: Employee["employeeType"];
}) {
  if (type === "FULL_TIME") {
    return (
      <Badge
        variant="secondary"
        className="bg-violet-50 text-violet-700 border-violet-200 font-medium"
      >
        Full-time
      </Badge>
    );
  }
  if (type === "PART_TIME") {
    return (
      <Badge variant="outline" className="text-neutral-600 font-medium">
        Part-time
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-neutral-400">
      Not set
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Name + avatar cell
// ---------------------------------------------------------------------------

export function EmployeeNameCell({ employee }: { employee: Employee }) {
  const fullName = getFullName(employee);
  const initials = getInitials(employee);
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        {fullName ? (
          <p className="text-sm font-medium text-neutral-900 truncate">
            {fullName}
          </p>
        ) : (
          <p className="text-sm text-neutral-400 italic">Name not set</p>
        )}
        <p className="text-xs text-neutral-500">{employee.employeeCode}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row action button
// ---------------------------------------------------------------------------

export function EmployeeRowAction({
  employee,
  onNavigate,
}: {
  employee: Employee;
  onNavigate: (employee: Employee) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onNavigate(employee);
      }}
    >
      <ChevronRight className="h-4 w-4 text-neutral-500" />
    </Button>
  );
}
