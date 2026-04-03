import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Static data — replace with TanStack Query hook when endpoint is available
// ---------------------------------------------------------------------------
const STATIC_ATTENDANCE_OVERVIEW = {
  totalFullTime: 22,
  clockedIn: 17,
  activeSessions: 3,
  notClockedIn: 5,
};

type FilterKey = "all_ft" | "clocked_in" | "active_now" | "not_clocked";

interface MetricChip {
  value: number;
  label: string;
  filterKey: FilterKey;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
export function AttendanceOverviewCardSkeleton() {
  return <Skeleton className="h-[100px] rounded-xl" />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AttendanceOverviewCard() {
  // TODO: replace with useQuery when endpoint is available
  const { totalFullTime, clockedIn, activeSessions, notClockedIn } =
    STATIC_ATTENDANCE_OVERVIEW;

  const metrics: MetricChip[] = [
    { value: totalFullTime, label: "Total Full-Time", filterKey: "all_ft" },
    { value: clockedIn,     label: "Clocked In Today", filterKey: "clocked_in" },
    { value: activeSessions, label: "Active Sessions", filterKey: "active_now" },
    { value: notClockedIn,  label: "Not Clocked In",  filterKey: "not_clocked" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Attendance Today
        </CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-4 divide-x divide-border">
          {metrics.map((metric) => (
            <button
              key={metric.filterKey}
              onClick={() => {}}
              className="flex flex-col gap-0.5 px-3 py-3 hover:bg-muted
                         transition-colors text-left first:pl-0 last:pr-0
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-xl font-bold text-foreground">{metric.value}</span>
              <span className="text-xs text-muted-foreground leading-tight">{metric.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
