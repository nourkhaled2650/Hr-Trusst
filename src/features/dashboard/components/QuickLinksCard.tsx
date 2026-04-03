import { Clock, CalendarDays, History, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Links definition
// Note: "to" typed as string to avoid TanStack Router literal type narrowing
// issues — update to typed route when router is fully configured
// ---------------------------------------------------------------------------
interface QuickLink {
  label: string;
  to: string;
  Icon: LucideIcon;
  badge: string | null;
}

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Log Today's Hours",
    to: "/attendance/log",
    Icon: Clock,
    badge: null,
  },
  {
    label: "Leave Requests",
    to: "/leave",
    Icon: CalendarDays,
    badge: null,
  },
  {
    label: "Attendance History",
    to: "/attendance",
    Icon: History,
    badge: null,
  },
  // My Payslips omitted until payroll module is built
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function QuickLinksCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Quick Links
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <nav>
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to as never} // typed as `never` to satisfy TanStack Router; update when route types are finalised
              className="flex items-center gap-3 px-6 py-3 hover:bg-muted border-b border-border last:border-0 group transition-colors"
            >
              <link.Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground flex-1">
                {link.label}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}
