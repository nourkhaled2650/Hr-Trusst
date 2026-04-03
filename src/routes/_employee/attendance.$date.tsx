import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/stores/auth.store";
import { formatHours } from "@/lib/utils";
import {
  useMyDayDetailQuery,
  DayStatusBadge,
  SessionsCard,
  ProjectHoursCard,
} from "@/features/attendance";

// ---------------------------------------------------------------------------
// Route setup
// ---------------------------------------------------------------------------
export const Route = createFileRoute("/_employee/attendance/$date")({
  beforeLoad: ({ params }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
      throw new Error("Invalid date");
    }
  },
  component: DayDetailPage,
  errorComponent: InvalidDateRedirect,
});

function InvalidDateRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: "/attendance" });
  }, [navigate]);
  return null;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatLong(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return longDateFormatter.format(new Date(Date.UTC(year!, month! - 1, day!)));
}

function formatShort(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return shortDateFormatter.format(new Date(Date.UTC(year!, month! - 1, day!)));
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
type StatCardProps = {
  label: string;
  value: string;
  subtext?: string;
};

function StatCard({ label, value, subtext }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
function DayDetailPage() {
  const { date } = Route.useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const employmentType = user?.employmentType ?? null;
  const isFullTime = employmentType === "FULL_TIME";

  const formattedDateLong = formatLong(date);
  const formattedDateShort = formatShort(date);

  const { data, isLoading, isError } = useMyDayDetailQuery(date);

  // Document title
  useEffect(() => {
    document.title = `Attendance — ${formattedDateLong} | Trusst`;
  }, [formattedDateLong]);

  const showLate = isFullTime && (data?.latenessMinutes ?? 0) > 0;
  const showOvertime = isFullTime && (data?.overtimeHours ?? 0) > 0;

  const statCards: StatCardProps[] = [];
  statCards.push({ label: "Total Hours", value: formatHours(data?.totalHours ?? 0) });
  if (showLate) statCards.push({ label: "Late Start", value: `${data!.latenessMinutes} min` });
  if (showOvertime) statCards.push({ label: "Overtime", value: formatHours(data!.overtimeHours) });

  const onlyOneCard = statCards.length === 1;

  return (
    <div className="container py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/attendance" className="hover:text-foreground transition-colors">
          Attendance
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{formattedDateLong}</span>
      </nav>

      {/* Header row */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-semibold text-foreground">{formattedDateShort}</h1>
        {data && (
          <div className="flex items-center gap-2">
            <DayStatusBadge status={data.dayStatus} />
            {data.hasManualSession && (
              <span className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                Manual
              </span>
            )}
          </div>
        )}
        {isLoading && <Skeleton className="h-6 w-24 rounded-full" />}
      </div>

      {/* Rejected banner */}
      {!isLoading && data?.dayStatus === "rejected" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-destructive">This day was rejected</p>
            <p className="text-sm text-muted-foreground">
              Your submitted hours were not approved. You can re-enter this day&apos;s attendance data.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void navigate({ to: "/attendance/log", search: { date, reentry: "true" } })}
          >
            Re-enter Day
          </Button>
        </div>
      )}

      {/* Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Could not load day details.{" "}
            <Link to="/attendance" className="underline">
              Back to history
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats row */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-20 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map((card, i) => (
              <div key={card.label} className={onlyOneCard && i === 0 ? "col-span-2" : ""}>
                <StatCard {...card} />
              </div>
            ))}
          </div>
        )
      )}

      {/* Two-column grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SessionsCard sessions={data.sessions} />
            <ProjectHoursCard projectEntries={data.projectEntries} dayStatus={data.dayStatus} />
          </div>
        )
      )}
    </div>
  );
}
