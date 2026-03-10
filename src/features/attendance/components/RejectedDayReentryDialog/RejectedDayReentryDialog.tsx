import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, AlertCircle } from "lucide-react";
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { ROUTES } from "@/constants/routes";
import { useReentryMutation } from "../../api/attendance.queries";
import { getTodayString } from "../../utils/attendance.utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RejectedDayReentryDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { mutate: submitReentry, isPending, error, reset } = useReentryMutation();

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endTimeError, setEndTimeError] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setStartTime("");
      setEndTime("");
      setEndTimeError(null);
    }
    onOpenChange(nextOpen);
  }

  function validateEndTime(end: string, start: string): boolean {
    if (!end || !start) return true;
    if (end <= start) {
      setEndTimeError("End time must be after start time.");
      return false;
    }
    setEndTimeError(null);
    return true;
  }

  function handleSubmit() {
    if (!startTime || !endTime) return;
    if (!validateEndTime(endTime, startTime)) return;

    const today = getTodayString();
    submitReentry(
      {
        date: today,
        startTime: `${today}T${startTime}:00`,
        endTime: `${today}T${endTime}:00`,
      },
      {
        onSuccess: () => {
          handleOpenChange(false);
          void navigate({
            to: ROUTES.EMPLOYEE_ATTENDANCE_LOG,
            search: { date: today },
          });
        },
      },
    );
  }

  const today = getTodayString();
  const canSubmit = !!startTime && !!endTime && !endTimeError;
  const errorMessage =
    error instanceof Error
      ? error.message
      : "Submission failed. Please check your times and try again.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Re-enter Working Day</DialogTitle>
          <DialogDescription>
            Your previous submission was rejected. Enter your actual working hours to
            resubmit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel>Date</FieldLabel>
            <Input value={today} disabled className="opacity-60" />
          </Field>

          <Field>
            <FieldLabel>Start time</FieldLabel>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isPending}
            />
          </Field>

          <Field>
            <FieldLabel>End time</FieldLabel>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                if (endTimeError) validateEndTime(e.target.value, startTime);
              }}
              onBlur={() => validateEndTime(endTime, startTime)}
              disabled={isPending}
              className={endTimeError ? "border-destructive" : ""}
            />
            {endTimeError !== null && <FieldError>{endTimeError}</FieldError>}
          </Field>

          {error !== null && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
