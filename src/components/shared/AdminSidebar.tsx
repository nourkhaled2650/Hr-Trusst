import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  FolderKanban,
  Wallet,
  Settings2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { useCurrentUser } from "@/stores/auth.store";
import { useHasPermission } from "@/hooks/use-has-permission";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/types";

type NavItem = {
  label: string;
  icon: LucideIcon;
  to: string;
  exact?: boolean;
  visible: boolean;
};

const BASE_LINK =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150";
const ACTIVE_LINK =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-brand-subtle text-brand transition-colors duration-150";

export function AdminSidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useCurrentUser();

  const canViewEmployees = useHasPermission(PERMISSIONS.VIEW_EMPLOYEES);
  const canViewPayroll = useHasPermission(PERMISSIONS.VIEW_PAYROLL);
  const canManageSettings = useHasPermission(PERMISSIONS.MANAGE_SETTINGS);
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  const mainNav: NavItem[] = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      to: ROUTES.ADMIN_DASHBOARD,
      exact: true,
      visible: true,
    },
    {
      label: "Employees",
      icon: Users,
      to: ROUTES.ADMIN_EMPLOYEES,
      visible: canViewEmployees,
    },
    {
      label: "Attendance",
      icon: Clock,
      to: ROUTES.ADMIN_ATTENDANCE,
      visible: true,
    },
    {
      label: "Leave",
      icon: CalendarDays,
      to: ROUTES.ADMIN_LEAVE,
      visible: true,
    },
    {
      label: "Projects",
      icon: FolderKanban,
      to: ROUTES.ADMIN_PROJECTS,
      visible: true,
    },
    {
      label: "Payroll",
      icon: Wallet,
      to: ROUTES.ADMIN_PAYROLL,
      visible: canViewPayroll,
    },
  ];

  const adminNav: NavItem[] = [
    {
      label: "Configuration",
      icon: Settings2,
      to: ROUTES.ADMIN_SETTINGS,
      visible: canManageSettings,
    },
    {
      label: "Permissions",
      icon: ShieldCheck,
      to: ROUTES.ADMIN_PERMISSIONS,
      visible: isSuperAdmin,
    },
  ];

  const initials = (user?.username ?? "U").charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen bg-white border-r border flex flex-col z-40",
        "transition-all duration-200 ease-in-out",
        sidebarOpen ? "w-60" : "w-14",
      )}
    >
      {/* Logo zone */}
      <div className="flex items-center justify-center px-3 pt-4  shrink-0">
        {sidebarOpen ? (
          <img
            src="/logo.png"
            alt="Trusst"
            className="h-20 w-20 m-auto"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <img
            src="/logo.png"
            alt="Trusst"
            className="object-contain mx-auto "
          />
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-[68px] z-50 h-6 w-6 rounded-full bg-white border border shadow-sm flex items-center justify-center hover:bg-muted/50"
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
      </button>

      {/* Nav list */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
          {mainNav
            .filter((item) => item.visible)
            .map((item) => (
              <NavLink key={item.to} item={item} sidebarOpen={sidebarOpen} />
            ))}

          {adminNav.some((item) => item.visible) && (
            <div className="my-2 h-px bg-muted mx-1" />
          )}

          {adminNav
            .filter((item) => item.visible)
            .map((item) => (
              <NavLink key={item.to} item={item} sidebarOpen={sidebarOpen} />
            ))}
        </nav>
      </TooltipProvider>

      {/* User mini-card */}
      <div className="border-t border p-2 shrink-0">
        {sidebarOpen ? (
          <div className="flex items-center gap-2 rounded-md p-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-brand text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.username}
              </p>
              <p className="text-xs text-muted-foreground/70 truncate">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-brand text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavLink({
  item,
  sidebarOpen,
}: {
  item: NavItem;
  sidebarOpen: boolean;
}) {
  const link = (
    <Link
      to={item.to}
      activeOptions={item.exact ? { exact: true } : undefined}
      className={BASE_LINK}
      activeProps={{ className: ACTIVE_LINK }}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {sidebarOpen && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!sidebarOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
