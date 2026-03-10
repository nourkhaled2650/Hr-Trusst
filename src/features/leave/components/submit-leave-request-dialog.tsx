import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { submitLeaveSchema, type SubmitLeaveFormValues } from "../schemas/submit-leave.schema";
import type { LeaveTypeName } from "../types/leave.types";

const LEAVE_TYPE_OPTIONS: LeaveTypeName[] = [
  "Annual Leave",
  "Sick Leave",
  "Unpaid Leave",
];

// ---------------------------------------------------------------------------
// Duration calculation — inclusive calendar days
// ---------------------------------------------------------------------------
function calcDurationDays(startDate: string, endDate: string): number {
  return (
    Math.floor(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubmitLeaveRequestDialog({ open, onOpenChange }: Props) {
  // When the API is ready, replace isSubmitting + handleSubmit stub with a
  // useMutation call. The form wiring stays identical.
  const isSubmitting = false;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubmitLeaveFormValues>({
    resolver: zodResolver(submitLeaveSchema),
    defaultValues: {
      leaveType: undefined,
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  // Reset form to empty defaults each time the dialog opens
  useEffect(() => {
    if (open) reset({ leaveType: undefined, startDate: "", endDate: "", reason: "" });
  }, [open, reset]);

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const reason = watch("reason");

  const showDuration =
    startDate !== "" &&
    endDate !== "" &&
    endDate >= startDate;
  const durationDays = showDuration ? calcDurationDays(startDate, endDate) : 0;

  // TODO: Replace with useMutation → POST /api/leave/request when backend is ready.
  function onValid(_values: SubmitLeaveFormValues) {
    onOpenChange(false);
    toast.success("Leave request submitted.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Leave Request</DialogTitle>
          <DialogDescription>
            Fill in the details for your time-off request.
          </DialogDescription>
        </DialogHeader>

        <form
          id="submit-leave-form"
          onSubmit={handleSubmit(onValid)}
          className="space-y-4"
        >
          {/* Leave Type */}
          <Field>
            <FieldLabel htmlFor="leaveType">Leave Type</FieldLabel>
            <Controller
              control={control}
              name="leaveType"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.leaveType]} />
          </Field>

          {/* Start Date */}
          <Field>
            <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
            <Input
              id="startDate"
              type="date"
              min={getTodayString()}
              disabled={isSubmitting}
              {...register("startDate")}
            />
            <FieldError errors={[errors.startDate]} />
          </Field>

          {/* End Date */}
          <Field>
            <FieldLabel htmlFor="endDate">End Date</FieldLabel>
            <Input
              id="endDate"
              type="date"
              min={startDate !== "" ? startDate : getTodayString()}
              disabled={isSubmitting}
              {...register("endDate")}
            />
            <FieldError errors={[errors.endDate]} />
          </Field>

          {/* Duration — computed, read-only */}
          {showDuration && (
            <p className="text-sm text-muted-foreground -mt-1">
              Duration:{" "}
              <span className="font-medium text-foreground">
                {durationDays} day{durationDays !== 1 ? "s" : ""}
              </span>
            </p>
          )}

          {/* Reason */}
          <Field>
            <FieldLabel htmlFor="reason">Reason</FieldLabel>
            <Textarea
              id="reason"
              rows={3}
              placeholder="Briefly describe the reason for your leave request."
              disabled={isSubmitting}
              className={errors.reason ? "border-destructive" : undefined}
              {...register("reason")}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reason.length} / 500
            </p>
            <FieldError errors={[errors.reason]} />
          </Field>

          {/* Inline submission error — shown when mutation returns an error.
              TODO: When wiring up useMutation, import AlertCircle from lucide-react
              and uncomment the block below:
          {mutationError && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Submission failed. Please check your details and try again.
            </p>
          )} */}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="submit-leave-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

