import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Square, CheckSquare, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useClockOutMutation } from "../../api/attendance.queries";
import { useSessionTimer } from "../../hooks/use-session-timer";
import { formatElapsedTime, getTodayString } from "../../utils/attendance.utils";

type TimeMode = "now" | "manual";
type PendingChoice = "session" | "day" | null;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startTime: string;
};

export function EndSessionDialog({ open, onOpenChange, startTime }: Props) {
  const navigate = useNavigate();
  const { mutate: clockOut, isPending, error, reset } = useClockOutMutation();
  const [pendingChoice, setPendingChoice] = useState<PendingChoice>(null);
  const [mode, setMode] = useState<TimeMode>("now");
  const [manualTime, setManualTime] = useState("");
  const [timeError, setTimeError] = useState<string | null>(null);
  const elapsedSeconds = useSessionTimer(startTime);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setPendingChoice(null);
      setMode("now");
      setManualTime("");
      setTimeError(null);
    }
    onOpenChange(nextOpen);
  }

  function buildClockOutOpts(): { manualTime?: string } | null {
    if (mode === "manual") {
      if (!manualTime) {
        setTimeError("Please enter a time.");
        return null;
      }
      return { manualTime: `${getTodayString()}T${manualTime}:00` };
    }
    return {};
  }

  function handleEndSessionOnly() {
    const opts = buildClockOutOpts();
    if (opts === null) return;
    setPendingChoice("session");
    clockOut(opts.manualTime !== undefined ? opts : undefined, {
      onSuccess: () => handleOpenChange(false),
      onError: () => setPendingChoice(null),
    });
  }

  function handleEndWorkingDay() {
    const opts = buildClockOutOpts();
    if (opts === null) return;
    setPendingChoice("day");
    const today = getTodayString();
    clockOut(opts.manualTime !== undefined ? opts : undefined, {
      onSuccess: () => {
        handleOpenChange(false);
        void navigate({ to: ROUTES.EMPLOYEE_ATTENDANCE_LOG, search: { date: today } });
      },
      onError: () => setPendingChoice(null),
    });
  }

  const sessionStartedAt = (() => {
    try { return format(parseISO(startTime), "hh:mm a"); } catch { return startTime; }
  })();
  const elapsedLabel = formatElapsedTime(elapsedSeconds);
  const errorMessage =
    error instanceof Error ? error.message : "Failed to end session. Please try again.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>End Session</DialogTitle>
          <DialogDescription>
            Choose what happens after this session is closed.
          </DialogDescription>
        </DialogHeader>

        {/* Session summary */}
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Session started</span>
            <span className="font-medium">{sessionStartedAt}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Elapsed time</span>
            <span className="font-mono font-medium">{elapsedLabel}</span>
          </div>
        </div>

        {/* Time mode toggle */}
        <div className="space-y-2">
          <div className="flex rounded-md border overflow-hidden">
            <button
              type="button"
              onClick={() => { setMode("now"); setTimeError(null); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                mode === "now"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                mode === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              Manual time
            </button>
          </div>
          {mode === "manual" && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Enter the actual time you stopped working.
              </p>
              <Input
                type="time"
                value={manualTime}
                onChange={(e) => { setManualTime(e.target.value); setTimeError(null); }}
                disabled={isPending}
              />
              {timeError !== null && (
                <p className="text-xs text-destructive">{timeError}</p>
              )}
            </div>
          )}
        </div>

        {error !== null && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleEndSessionOnly}
            disabled={isPending}
            className={cn(
              "flex items-start gap-4 rounded-lg border p-4 text-left hover:bg-accent hover:border-primary transition-colors disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            {pendingChoice === "session" && isPending ? (
              <Loader2 className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground animate-spin" />
            ) : (
              <Square className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-semibold">End This Session</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Close the current session. You can start another later.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleEndWorkingDay}
            disabled={isPending}
            className={cn(
              "flex items-start gap-4 rounded-lg border border-primary p-4 text-left bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            {pendingChoice === "day" && isPending ? (
              <Loader2 className="h-5 w-5 mt-0.5 shrink-0 text-primary animate-spin" />
            ) : (
              <CheckSquare className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
            )}
            <div>
              <p className="text-sm font-semibold text-primary">End Working Day</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Close this session and go to the hour distribution page.
              </p>
            </div>
          </button>
        </div>

        <DialogFooter className="mt-2">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
