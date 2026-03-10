import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Play,
  LogOut,
  Square,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import {
  useSessionStatusQuery,
  useClockOutMutation,
} from "../../api/attendance.queries";
import { useSessionTimer } from "../../hooks/use-session-timer";
import {
  formatElapsedTime,
  getTodayString,
} from "../../utils/attendance.utils";
import { StartSessionDialog } from "../StartSessionDialog/StartSessionDialog";
import { EndSessionDialog } from "../EndSessionDialog/EndSessionDialog";
import { RejectedDayReentryDialog } from "../RejectedDayReentryDialog/RejectedDayReentryDialog";

type Props = {
  variant?: "navbar" | "sheet";
};

export function SessionWidget({ variant = "navbar" }: Props) {
  const navigate = useNavigate();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [reentryOpen, setReentryOpen] = useState(false);

  const { data: status, isPending, isError } = useSessionStatusQuery();
  const { mutate: clockOut, isPending: clockOutPending } =
    useClockOutMutation();

  const elapsedSeconds = useSessionTimer(status?.startTime ?? null);

  function navigateToLog() {
    const today = getTodayString();
    void navigate({
      to: ROUTES.EMPLOYEE_ATTENDANCE_LOG,
      search: { date: today },
    });
  }

  function handleEndWorkingDayDirect() {
    clockOut(undefined, {
      onSuccess: () => navigateToLog(),
      onError: () => toast.error("Could not end session. Please try again."),
    });
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
      </div>
    );
  }

  if (isError || !status) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  // State 2: Session Active
  if (status.startTime != null) {
    const elapsedLabel = formatElapsedTime(elapsedSeconds);
    return (
      <>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm tabular-nums hidden sm:block">
            {elapsedLabel}
          </span>

          {/* Stop (opens EndSessionDialog) */}
          {variant === "navbar" ? (
            <Button
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => setEndOpen(true)}
              disabled={clockOutPending}
            >
              <Square className="h-4 w-4 mr-1.5" />
              <span className="hidden md:inline">Stop</span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => setEndOpen(true)}
                  disabled={clockOutPending}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop session</TooltipContent>
            </Tooltip>
          )}

          {/* End Working Day (direct clock-out + navigate) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleEndWorkingDayDirect}
            disabled={clockOutPending}
          >
            {clockOutPending ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 mr-1.5" />
            )}
            <span className="hidden md:inline">End Working Day</span>
          </Button>
        </div>

        <EndSessionDialog
          open={endOpen}
          onOpenChange={setEndOpen}
          startTime={status.startTime}
        />
      </>
    );
  }

  // States based on dayStatus (startTime is null for all below)

  // State 1: No Active Session (open day)
  if (status.dayStatus === "open") {
    return (
      <>
        <div className="flex items-center gap-2">
          {variant === "navbar" ? (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => setStartOpen(true)}
              >
                <Play className="h-4 w-4 mr-1.5" />
                <span className="hidden md:inline">Start Session</span>
              </Button>
              <Button variant="outline" size="sm" onClick={navigateToLog}>
                <LogOut className="h-4 w-4 mr-1.5" />
                <span className="hidden md:inline">End Working Day</span>
              </Button>
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => setStartOpen(true)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start session</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={navigateToLog}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>End working day</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
        <StartSessionDialog open={startOpen} onOpenChange={setStartOpen} />
      </>
    );
  }

  // State 3: Pending approval
  if (status.dayStatus === "pending") {
    return (
      <Badge className="flex items-center gap-1.5 px-3 py-1.5 bg-warning text-warning-foreground border-warning/20">
        <Clock className="h-4 w-4 shrink-0" />
        <span className="hidden md:inline">Pending Approval</span>
      </Badge>
    );
  }

  // State 4: Approved
  if (status.dayStatus === "approved") {
    return (
      <Badge className="flex items-center gap-1.5 px-3 py-1.5 bg-success text-success-foreground border-success/20">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span className="hidden md:inline">Day Approved</span>
      </Badge>
    );
  }

  // State 5: Rejected
  return (
    <>
      <div className="flex items-center gap-2">
        <Badge className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20">
          <XCircle className="h-4 w-4 shrink-0" />
          <span className="hidden md:inline">Day Rejected</span>
        </Badge>
        <Button variant="ghost" size="sm" onClick={() => setReentryOpen(true)}>
          Re-enter Day
        </Button>
      </div>
      <RejectedDayReentryDialog
        open={reentryOpen}
        onOpenChange={setReentryOpen}
      />
    </>
  );
}
