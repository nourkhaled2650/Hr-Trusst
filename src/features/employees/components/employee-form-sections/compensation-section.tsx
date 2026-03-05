import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UpdateEmployeeFormValues } from "../../types/employee.types";

type Props = {
  form: UseFormReturn<UpdateEmployeeFormValues>;
  disabled: boolean;
};

export function CompensationSection({ form, disabled }: Props) {
  const {
    formState: { errors },
  } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Compensation
        </CardTitle>
        <CardDescription>Monthly salary configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel htmlFor="basicSalary">Basic Salary (EGP)</FieldLabel>
          <Controller
            control={form.control}
            name="basicSalary"
            render={({ field }) => (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/70 pointer-events-none">
                  EGP
                </span>
                <Input
                  id="basicSalary"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-12"
                  disabled={disabled}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? null : Number(v));
                  }}
                />
              </div>
            )}
          />
          <FieldError errors={[errors.basicSalary]} />
        </Field>
      </CardContent>
    </Card>
  );
}
