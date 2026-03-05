import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { DatePicker } from "@/components/shared/date-picker";
import type { ConfigFormValues } from "../../schemas/config.schema";

type Props = {
  form: UseFormReturn<ConfigFormValues>;
  disabled: boolean;
};

// Split "YYYY-MM-DDTHH:mm" → { date: "YYYY-MM-DD", time: "HH:mm" }
function splitDatetime(value: string | null): {
  date: string | null;
  time: string;
} {
  if (!value) return { date: null, time: "" };
  const [date, time] = value.split("T");
  return { date: date ?? null, time: time ?? "" };
}

// Combine date + time → "YYYY-MM-DDTHH:mm" or null
function combineDatetime(date: string | null, time: string): string | null {
  if (!date) return null;
  return `${date}T${time || "00:00"}`;
}

export function ValidityPeriodGroup({ form, disabled }: Props) {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          Validity Period
        </p>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Activation Date */}
        <Field>
          <FieldLabel htmlFor="validFrom-date">Activation Date</FieldLabel>
          <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
            Date and time from which this configuration becomes effective.
          </p>
          <Controller
            control={control}
            name="validFrom"
            render={({ field }) => {
              const { date, time } = splitDatetime(field.value);
              return (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DatePicker
                      id="validFrom-date"
                      value={date}
                      onChange={(newDate) =>
                        field.onChange(combineDatetime(newDate, time))
                      }
                      disabled={disabled}
                      placeholder="Pick a date"
                    />
                  </div>
                  <InputGroup className="w-32 shrink-0 rounded-md">
                    <InputGroupInput
                      type="time"
                      step="60"
                      disabled={disabled || !date}
                      className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      value={time}
                      onChange={(e) =>
                        field.onChange(combineDatetime(date, e.target.value))
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <Clock className="text-muted-foreground" />
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              );
            }}
          />
          <FieldError errors={[errors.validFrom]} />
        </Field>

        {/* Inactivation Date */}
        <Field>
          <FieldLabel htmlFor="validUntil-date">Inactivation Date</FieldLabel>
          <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
            Date and time at which this configuration expires.
          </p>
          <Controller
            control={control}
            name="validUntil"
            render={({ field }) => {
              const { date, time } = splitDatetime(field.value);
              return (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DatePicker
                      id="validUntil-date"
                      value={date}
                      onChange={(newDate) =>
                        field.onChange(combineDatetime(newDate, time))
                      }
                      disabled={disabled}
                      placeholder="Pick a date"
                    />
                  </div>
                  <InputGroup className="w-32 shrink-0 rounded-md">
                    <InputGroupInput
                      type="time"
                      step="60"
                      disabled={disabled || !date}
                      className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      value={time}
                      onChange={(e) =>
                        field.onChange(combineDatetime(date, e.target.value))
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <Clock className="text-muted-foreground" />
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              );
            }}
          />
          <FieldError errors={[errors.validUntil]} />
        </Field>
      </div>
    </div>
  );
}
