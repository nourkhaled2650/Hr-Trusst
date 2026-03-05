import type { UseFormReturn } from "react-hook-form";
import { Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { ConfigFormValues } from "../../schemas/config.schema";

type Props = {
  form: UseFormReturn<ConfigFormValues>;
  disabled: boolean;
};

export function AttendanceGroup({ form, disabled }: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          Attendance
        </p>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="standardWorkingHours">
              Standard Working Hours
            </FieldLabel>
            <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
              The expected number of working hours per day for full-time
              employees (e.g. 8.5).
            </p>
            <Input
              id="standardWorkingHours"
              type="number"
              step="0.5"
              min="1"
              max="24"
              disabled={disabled}
              {...register("standardWorkingHours")}
            />
            <FieldError errors={[errors.standardWorkingHours]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="workingDayStartTime">
              Working Day Start Time
            </FieldLabel>
            <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
              Official start of the working day. Used to calculate lateness
              (e.g. 09:00).
            </p>
            <InputGroup className="rounded-md">
              <InputGroupInput
                id="workingDayStartTime"
                type="time"
                step="60"
                disabled={disabled}
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                {...register("workingDayStartTime")}
              />
              <InputGroupAddon align="inline-end">
                <Clock className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errors.workingDayStartTime]} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="lateBalanceLimit">Late Grace Hours</FieldLabel>
          <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
            Monthly grace period (in hours) before lateness begins affecting
            payroll (e.g. 6.0).
          </p>
          <Input
            id="lateBalanceLimit"
            type="number"
            step="0.5"
            min="0"
            max="24"
            disabled={disabled}
            {...register("lateBalanceLimit")}
          />
          <FieldError errors={[errors.lateBalanceLimit]} />
        </Field>
      </div>
    </div>
  );
}
