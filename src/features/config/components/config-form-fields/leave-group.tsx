import type { UseFormReturn } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { ConfigFormValues } from "../../schemas/config.schema";

type Props = {
  form: UseFormReturn<ConfigFormValues>;
  disabled: boolean;
};

export function LeaveGroup({ form, disabled }: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 whitespace-nowrap">
          Leave
        </p>
        <Separator className="flex-1" />
      </div>

      <Field>
        <FieldLabel htmlFor="leaveBalanceLimit">Annual Leave Days</FieldLabel>
        <p className="text-xs text-neutral-500 mt-0.5 mb-1.5">
          Number of paid leave days granted to each full-time employee per year
          (e.g. 21).
        </p>
        <Input
          id="leaveBalanceLimit"
          type="number"
          step="1"
          min="0"
          max="365"
          disabled={disabled}
          {...register("leaveBalanceLimit")}
        />
        <FieldError errors={[errors.leaveBalanceLimit]} />
      </Field>
    </div>
  );
}
