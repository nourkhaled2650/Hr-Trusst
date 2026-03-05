import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { XCircle } from "lucide-react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { UpdateProjectFormValues, ProjectStatus } from "../types/projects.types";

type Props = {
  form: UseFormReturn<UpdateProjectFormValues>;
  disabled: boolean;
  projectStatus: ProjectStatus;
  onCloseProjectClick: () => void;
};

export function ProjectInfoForm({
  form,
  disabled,
  projectStatus,
  onCloseProjectClick,
}: Props) {
  const { register, formState: { errors }, control } = form;

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel htmlFor="projectName">
          Project Name <span className="text-red-500">*</span>
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
          Project Code <span className="text-red-500">*</span>
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
          <Input
            id="startDate"
            type="date"
            disabled={disabled}
            {...register("startDate")}
          />
          <FieldError errors={[errors.startDate]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="endDate">End Date</FieldLabel>
          <Input
            id="endDate"
            type="date"
            disabled={disabled}
            {...register("endDate")}
          />
          <FieldError errors={[errors.endDate]} />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="status">
          Status <span className="text-red-500">*</span>
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

      {projectStatus !== "COMPLETED" && (
        <div className="pt-4">
          <Separator className="mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Danger Zone
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700">
                Close this project
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Marks the project as Completed. Employees will no longer be
                able to log hours.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 ml-6 shrink-0"
              onClick={onCloseProjectClick}
              disabled={disabled}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Close Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
