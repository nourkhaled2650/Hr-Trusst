import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function EmploymentDetailsSection({ form, disabled }: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-neutral-900">
          Employment Details
        </CardTitle>
        <CardDescription>Role and employment information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field>
          <FieldLabel htmlFor="employeeType">Employee Type</FieldLabel>
          <Controller
            control={form.control}
            name="employeeType"
            render={({ field }) => (
              <Select
                onValueChange={(v) => field.onChange(v === "" ? null : v)}
                value={field.value ?? ""}
                disabled={disabled}
              >
                <SelectTrigger id="employeeType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full-time</SelectItem>
                  <SelectItem value="PART_TIME">Part-time</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.employeeType]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="position">Position</FieldLabel>
          <Input id="position" disabled={disabled} {...register("position")} />
          <FieldError errors={[errors.position]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="hireDate">Hire Date</FieldLabel>
          <Controller
            control={form.control}
            name="hireDate"
            render={({ field }) => (
              <Input
                id="hireDate"
                type="date"
                disabled={disabled}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? null : e.target.value)
                }
              />
            )}
          />
          <FieldError errors={[errors.hireDate]} />
        </Field>
      </CardContent>
    </Card>
  );
}
