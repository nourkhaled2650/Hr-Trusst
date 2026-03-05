import { useState } from "react";
import {
  Menu,
  Bell,
  LayoutDashboard,
  Clock,
  CalendarDays,
  FolderKanban,
  Receipt,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { UserDropdown } from "./UserDropdown";

type NavItem = {
  label: string;
  to: string;
  exact?: boolean;
};

type MobileNavItem = NavItem & {
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: ROUTES.EMPLOYEE_HOME, exact: true },
  { label: "Attendance", to: ROUTES.EMPLOYEE_ATTENDANCE },
  { label: "Leave", to: ROUTES.EMPLOYEE_LEAVE },
  { label: "Projects", to: ROUTES.EMPLOYEE_PROJECTS },
  { label: "Payslips", to: ROUTES.EMPLOYEE_PAYSLIPS },
];

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: "Dashboard", to: ROUTES.EMPLOYEE_HOME, exact: true, icon: LayoutDashboard },
  { label: "Attendance", to: ROUTES.EMPLOYEE_ATTENDANCE, icon: Clock },
  { label: "Leave", to: ROUTES.EMPLOYEE_LEAVE, icon: CalendarDays },
  { label: "Projects", to: ROUTES.EMPLOYEE_PROJECTS, icon: FolderKanban },
  { label: "Payslips", to: ROUTES.EMPLOYEE_PAYSLIPS, icon: Receipt },
];

const DESKTOP_LINK = "text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors duration-150";
const DESKTOP_ACTIVE = "text-sm font-medium text-brand font-semibold px-3 py-1.5 rounded-md hover:bg-muted transition-colors duration-150";
const MOBILE_LINK = "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150";
const MOBILE_ACTIVE = "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold bg-brand-subtle text-brand transition-colors duration-150";

export function EmployeeNavbar() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border z-40 flex items-center px-4 gap-4">
      {/* Mobile hamburger */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 pt-6">
          <img src="/logo.png" alt="Trusst" className="h-7 w-auto mb-6 px-2" />
          <nav className="flex flex-col gap-1 px-2">
            {MOBILE_NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={item.exact ? { exact: true } : undefined}
                className={MOBILE_LINK}
                activeProps={{ className: cn(MOBILE_ACTIVE) }}
                onClick={() => setSheetOpen(false)}
              >
                <item.icon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link to={ROUTES.EMPLOYEE_HOME}>
        <img src="/logo.png" alt="Trusst" className="h-7 w-auto" />
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={item.exact ? { exact: true } : undefined}
            className={DESKTOP_LINK}
            activeProps={{ className: DESKTOP_ACTIVE }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-1 ml-auto">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>
        <UserDropdown />
      </div>
    </header>
  );
}
