import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { ChevronDown, ChevronRight, Info, AlertTriangle, Clock } from "lucide-react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UpdateEmployeeFormValues } from "../../types/employee.types";

type Props = {
  form: UseFormReturn<UpdateEmployeeFormValues>;
  disabled: boolean;
};

export function PolicyOverridesSection({ form, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const employeeType = form.watch("employeeType");
  const { formState: { errors } } = form;
  const configErrors = errors.configurationException;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="col-span-full"
    >
      <Card>
        <CardHeader className="pb-0">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-neutral-900">
                  Policy Overrides
                </CardTitle>
                <Badge variant="outline" className="ml-2 text-xs">
                  Advanced
                </Badge>
              </div>
              {open ? (
                <ChevronDown className="h-4 w-4 text-neutral-500 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 text-neutral-500 transition-transform duration-200" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">
            {/* Part-time warning */}
            {employeeType === "PART_TIME" && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  Policy overrides have no effect for part-time employees.
                  Part-time payroll uses only hours worked × hourly rate.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="normalOvertimeRate">Normal Overtime Rate (×)</FieldLabel>
                <Controller
                  control={form.control}
                  name="configurationException.normalOvertimeRate"
                  render={({ field }) => (
                    <Input
                      id="normalOvertimeRate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="System default"
                      disabled={disabled}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? null : Number(v));
                      }}
                    />
                  )}
                />
                <FieldError errors={[configErrors?.normalOvertimeRate]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="specialOvertimeRate">Special Overtime Rate (×)</FieldLabel>
                <Controller
                  control={form.control}
                  name="configurationException.specialOvertimeRate"
                  render={({ field }) => (
                    <Input
                      id="specialOvertimeRate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="System default"
                      disabled={disabled}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? null : Number(v));
                      }}
                    />
                  )}
                />
                <FieldError errors={[configErrors?.specialOvertimeRate]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="standardWorkingHours">Standard Working Hours (hrs/day)</FieldLabel>
                <Controller
                  control={form.control}
                  name="configurationException.standardWorkingHours"
                  render={({ field }) => (
                    <Input
                      id="standardWorkingHours"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      placeholder="System default"
                      disabled={disabled}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? null : Number(v));
                      }}
                    />
                  )}
                />
                <FieldError errors={[configErrors?.standardWorkingHours]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="workingDayStartTime">Working Day Start Time</FieldLabel>
                <Controller
                  control={form.control}
                  name="configurationException.workingDayStartTime"
                  render={({ field }) => (
                    <InputGroup className="rounded-md">
                      <InputGroupInput
                        id="workingDayStartTime"
                        type="time"
                        step="60"
                        disabled={disabled}
                        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? null : v);
                        }}
                      />
                      <InputGroupAddon align="inline-end">
                        <Clock className="text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
                  )}
                />
                <FieldError errors={[configErrors?.workingDayStartTime]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="lateBalanceLimit">Late Balance Limit (hrs/month)</FieldLabel>
                <Controller
                  control={form.control}
                  name="configurationException.lateBalanceLimit"
                  render={({ field }) => (
                    <Input
                      id="lateBalanceLimit"
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="System default"
                      disabled={disabled}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? null : Number(v));
                      }}
                    />
                  )}
                />
                <FieldError errors={[configErrors?.lateBalanceLimit]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="leaveBalanceLimit">Leave Balance Limit (days/year)</FieldLabel>
                <Controller
                  control={form.control}
                  name="configurationException.leaveBalanceLimit"
                  render={({ field }) => (
                    <Input
                      id="leaveBalanceLimit"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="System default"
                      disabled={disabled}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? null : Number(v));
                      }}
                    />
                  )}
                />
                <FieldError errors={[configErrors?.leaveBalanceLimit]} />
              </Field>
            </div>

            {/* Info callout */}
            <Alert className="mt-4 border-violet-200 bg-violet-50">
              <Info className="h-4 w-4 text-violet-600" />
              <AlertDescription className="text-violet-800 text-sm">
                Blank fields inherit the system default from Payroll Settings.
                Set a value only to override for this specific employee.
              </AlertDescription>
            </Alert>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
