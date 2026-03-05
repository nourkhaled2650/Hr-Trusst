import type { UseFormReturn } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { ConfigFormValues } from "../../schemas/config.schema";

type Props = {
  form: UseFormReturn<ConfigFormValues>;
  disabled: boolean;
};

export function OvertimeGroup({ form, disabled }: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 whitespace-nowrap">
          Overtime
        </p>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="normalOvertimeRate">
            Normal Overtime Rate
          </FieldLabel>
          <p className="text-xs text-neutral-500 mt-0.5 mb-1.5">
            Multiplier applied to the hourly rate for normal overtime hours
            (e.g. 1.5 = 150% of base rate).
          </p>
          <Input
            id="normalOvertimeRate"
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            disabled={disabled}
            {...register("normalOvertimeRate")}
          />
          <FieldError errors={[errors.normalOvertimeRate]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="specialOvertimeRate">
            Special Overtime Rate
          </FieldLabel>
          <p className="text-xs text-neutral-500 mt-0.5 mb-1.5">
            Multiplier for overtime worked on public holidays or special
            occasions (e.g. 2.0 = double pay).
          </p>
          <Input
            id="specialOvertimeRate"
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            disabled={disabled}
            {...register("specialOvertimeRate")}
          />
          <FieldError errors={[errors.specialOvertimeRate]} />
        </Field>
      </div>
    </div>
  );
}
