import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/shared/date-picker";
import { Textarea } from "@/components/ui/textarea";
import type { UpdateProjectFormValues } from "../types/projects.types";

type Props = {
  form: UseFormReturn<UpdateProjectFormValues>;
  disabled: boolean;
};

export function ProjectInfoForm({
  form,
  disabled,
}: Props) {
  const { register, formState: { errors }, control } = form;

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel htmlFor="projectName">
          Project Name <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="projectName"
          disabled={disabled}
          {...register("projectName")}
        />
        <FieldError errors={[errors.projectName]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="projectCode">
          Project Code <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="projectCode"
          disabled={disabled}
          {...register("projectCode")}
        />
        <FieldError errors={[errors.projectCode]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea id="description" rows={4} disabled={disabled} {...field} />
          )}
        />
        <FieldError errors={[errors.description]} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
          <Controller
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <DatePicker
                id="startDate"
                value={field.value ?? null}
                onChange={field.onChange}
                disabled={disabled}
                placeholder="Pick a date"
              />
            )}
          />
          <FieldError errors={[errors.startDate]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="endDate">End Date</FieldLabel>
          <Controller
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <DatePicker
                id="endDate"
                value={field.value ?? null}
                onChange={field.onChange}
                disabled={disabled}
                placeholder="Pick a date"
              />
            )}
          />
          <FieldError errors={[errors.endDate]} />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="status">
          Status <span className="text-destructive">*</span>
        </FieldLabel>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={[errors.status]} />
      </Field>
    </div>
  );
}
