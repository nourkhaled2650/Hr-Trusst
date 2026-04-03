import { Users, Activity, Clock, Hourglass, TrendingUp, PenLine } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AdminTodayEmployee, AttendanceMonthStats } from "../../types/attendance.types";

type Props = {
  todayData: AdminTodayEmployee[] | undefined;
  pendingCount: number;
  monthStats: AttendanceMonthStats | undefined;
  isLoading: boolean;
  totalFT: number;
  onNavigateToday: () => void;
  onNavigatePending: () => void;
  onNavigateAllDays: () => void;
  onNavigateAllDaysManual: () => void;
};

type ChipProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
  accent?: boolean;
};

function StatsChip({ label, value, icon, onClick, accent }: ChipProps) {
  const sharedClasses = cn(
    "flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left",
    accent && "border-warning/30 bg-warning/5",
    onClick && "hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );

  const inner = (
    <>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
      <div className="rounded-full bg-muted p-2 shrink-0">
        {icon}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={sharedClasses}>
        {inner}
      </button>
    );
  }

  return <div className={sharedClasses}>{inner}</div>;
}

export function AdminStatsStrip({
  todayData,
  pendingCount,
  monthStats,
  isLoading,
  totalFT,
  onNavigateToday,
  onNavigatePending,
  onNavigateAllDays,
  onNavigateAllDaysManual,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[66px] rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Month</p>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[66px] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const clockedIn = todayData?.filter((e) => e.clockedInAt !== null).length ?? 0;
  const activeNow = todayData?.filter((e) => e.status === "active").length ?? 0;
  const lateCount = todayData?.filter((e) => e.isLateToday).length ?? 0;

  const monthlyHoursFormatted = monthStats
    ? new Intl.NumberFormat("en-US").format(monthStats.monthlyHoursTotal) + " h"
    : "—";

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatsChip
            label="Clocked In Today"
            value={`${clockedIn}/${totalFT}`}
            icon={<Users className="h-3.5 w-3.5 text-muted-foreground" />}
            onClick={onNavigateToday}
          />
          <StatsChip
            label="Active Right Now"
            value={activeNow}
            icon={<Activity className="h-3.5 w-3.5 text-muted-foreground" />}
            onClick={onNavigateToday}
          />
          <StatsChip
            label="Late Arrivals"
            value={lateCount}
            icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
            onClick={onNavigateToday}
            accent={lateCount > 0}
          />
          <StatsChip
            label="Pending Review"
            value={pendingCount}
            icon={<Hourglass className="h-3.5 w-3.5 text-muted-foreground" />}
            onClick={onNavigatePending}
            accent={pendingCount > 0}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Month</p>
        <div className="grid grid-cols-3 gap-3">
          <StatsChip
            label="Hours Logged"
            value={monthlyHoursFormatted}
            icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <StatsChip
            label="Overtime Days"
            value={monthStats?.overtimeDaysThisMonth ?? "—"}
            icon={<TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />}
            onClick={onNavigateAllDays}
          />
          <StatsChip
            label="Manual Sessions"
            value={monthStats?.manualSessionsThisMonth ?? "—"}
            icon={<PenLine className="h-3.5 w-3.5 text-muted-foreground" />}
            onClick={onNavigateAllDaysManual}
          />
        </div>
      </div>
    </div>
  );
}
