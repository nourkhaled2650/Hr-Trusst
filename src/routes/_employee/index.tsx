import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Clock,
  AlertCircle,
  CalendarDays,
  FolderKanban,
  ScanFace,
  CalendarPlus,
  FileText,
  User,
  LogIn,
  ClipboardList,
  CalendarCheck,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

// ── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  Icon: LucideIcon;
}

function StatCard({ label, value, Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
          <Icon className="size-4 text-muted-foreground mt-1 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── ActionCard ────────────────────────────────────────────────────────────────

interface ActionCardProps {
  label: string;
  route: string;
  Icon: LucideIcon;
}

function ActionCard({ label, route, Icon }: ActionCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:bg-muted transition-colors"
      onClick={() => void navigate({ to: route })}
    >
      <CardContent className="flex flex-col items-center justify-center py-6">
        <Icon className="size-6 text-primary" />
        <p className="text-sm font-medium mt-2 text-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// ── ActivityItem ──────────────────────────────────────────────────────────────

interface ActivityItemProps {
  Icon: LucideIcon;
  title: string;
  timeAgo: string;
}

function ActivityItem({ Icon, title, timeAgo }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="bg-muted rounded-full p-2 shrink-0">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_employee/")({
  component: EmployeeHomePage,
});

function EmployeeHomePage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">Dashboard</h1>

      {/* Section 1 — Overview */}
      <section className="mb-8">
        <p className="text-sm font-medium text-muted-foreground mb-3">Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Monthly Hours" value="142.5" Icon={Clock} />
          <StatCard label="Late Balance" value="4h 20m" Icon={AlertCircle} />
          <StatCard label="Leave Balance" value="12 days" Icon={CalendarDays} />
          <StatCard label="Assigned Projects" value="3" Icon={FolderKanban} />
        </div>
      </section>

      {/* Section 2 — Quick Actions */}
      <section className="mb-8">
        <p className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionCard label="Attendance" route="/attendance" Icon={ScanFace} />
          <ActionCard label="Leave Request" route="/leave" Icon={CalendarPlus} />
          <ActionCard label="Payslips" route="/payslips" Icon={FileText} />
          <ActionCard label="Profile" route="/profile" Icon={User} />
        </div>
      </section>

      {/* Section 3 — Latest Activity */}
      <section>
        <p className="text-sm font-medium text-muted-foreground mb-3">Latest Activity</p>
        <div className="rounded-lg border border-border divide-y divide-border">
          <ActivityItem Icon={LogIn} title="Clocked in" timeAgo="Today, 9:02 AM" />
          <ActivityItem Icon={ClipboardList} title="Submitted project hours" timeAgo="Today, 9:05 AM" />
          <ActivityItem Icon={CalendarCheck} title="Leave request approved" timeAgo="Yesterday" />
          <ActivityItem Icon={CheckCircle2} title="Day approved by admin" timeAgo="2 days ago" />
          <ActivityItem Icon={FileCheck} title="Payslip for February available" timeAgo="Mar 1" />
        </div>
      </section>
    </div>
  );
}
