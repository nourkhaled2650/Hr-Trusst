import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function BasicInfoSection({ form, disabled }: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-neutral-900">
          Basic Info
        </CardTitle>
        <CardDescription>Personal details for this employee</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="firstName">First Name</FieldLabel>
            <Input
              id="firstName"
              disabled={disabled}
              {...register("firstName")}
            />
            <FieldError errors={[errors.firstName]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
            <Input
              id="lastName"
              disabled={disabled}
              {...register("lastName")}
            />
            <FieldError errors={[errors.lastName]} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
          <Controller
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <Input
                id="dateOfBirth"
                type="date"
                disabled={disabled}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
              />
            )}
          />
          <FieldError errors={[errors.dateOfBirth]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
          <Controller
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <Input
                id="phoneNumber"
                type="tel"
                disabled={disabled}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
              />
            )}
          />
          <FieldError errors={[errors.phoneNumber]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Controller
            control={form.control}
            name="address"
            render={({ field }) => (
              <Textarea
                id="address"
                rows={3}
                disabled={disabled}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
              />
            )}
          />
          <FieldError errors={[errors.address]} />
        </Field>
      </CardContent>
    </Card>
  );
}
