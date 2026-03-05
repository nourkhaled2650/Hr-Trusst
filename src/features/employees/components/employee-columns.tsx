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
        className="bg-brand-subtle text-brand border-brand-border font-medium"
      >
        Full-time
      </Badge>
    );
  }
  if (type === "PART_TIME") {
    return (
      <Badge variant="outline" className="text-muted-foreground font-medium">
        Part-time
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground/70">
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
        <AvatarFallback className="bg-brand-muted text-brand text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        {fullName ? (
          <p className="text-sm font-medium text-foreground truncate">
            {fullName}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/70 italic">Name not set</p>
        )}
        <p className="text-xs text-muted-foreground">{employee.employeeCode}</p>
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
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Button>
  );
}
