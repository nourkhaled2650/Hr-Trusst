import { Bell } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { UserDropdown } from "./UserDropdown";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/employees": "Employees",
  "/admin/attendance": "Attendance",
  "/admin/leave": "Leave",
  "/admin/projects": "Projects",
  "/admin/payroll": "Payroll",
  "/admin/settings": "Configuration",
  "/admin/permissions": "Permissions",
};

function usePageTitle() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return PAGE_TITLES[pathname] ?? "Dashboard";
}

export function AdminNavbar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const title = usePageTitle();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-14 bg-card border-b border z-30",
        "flex items-center justify-between px-4",
        "transition-all duration-200 ease-in-out",
        sidebarOpen ? "left-60" : "left-14",
      )}
    >
      <span className="text-base font-semibold text-foreground max-w-[200px] truncate md:max-w-none">
        {title}
      </span>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>
        <UserDropdown />
      </div>
    </header>
  );
}
