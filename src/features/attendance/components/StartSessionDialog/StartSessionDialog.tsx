import { useState } from "react";
import { format } from "date-fns";
import { Clock, Play, Loader2, AlertCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useClockInMutation } from "../../api/attendance.queries";
import { getTodayString } from "../../utils/attendance.utils";

type TimeMode = "now" | "manual";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StartSessionDialog({ open, onOpenChange }: Props) {
  const { mutate: clockIn, isPending, error, reset } = useClockInMutation();
  const [mode, setMode] = useState<TimeMode>("now");
  const [manualTime, setManualTime] = useState("");
  const [timeError, setTimeError] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setMode("now");
      setManualTime("");
      setTimeError(null);
    }
    onOpenChange(nextOpen);
  }

  function handleClockIn() {
    if (mode === "manual") {
      if (!manualTime) {
        setTimeError("Please enter a time.");
        return;
      }
      setTimeError(null);
      const isoManualTime = `${getTodayString()}T${manualTime}:00`;
      clockIn({ manualTime: isoManualTime }, { onSuccess: () => onOpenChange(false) });
    } else {
      clockIn(undefined, { onSuccess: () => onOpenChange(false) });
    }
  }

  const todayLabel = format(new Date(), "EEEE, MMMM d");
  const errorMessage =
    error instanceof Error ? error.message : "Failed to start session. Please try again.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Start a new session?</DialogTitle>
          <DialogDescription>{todayLabel}</DialogDescription>
        </DialogHeader>

        {/* Time mode toggle */}
        <div className="flex rounded-md border overflow-hidden my-2">
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

        {mode === "now" ? (
          <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Session will start now</p>
              <p className="text-xs text-muted-foreground">
                Clock-in time is recorded by the server
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Enter the actual time you started working.
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

        {error !== null && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleClockIn} disabled={isPending}>
            {isPending ? (
              <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
            ) : (
              <Play className="h-4 w-4 mr-1.5" />
            )}
            {isPending ? "Starting..." : "Start Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
