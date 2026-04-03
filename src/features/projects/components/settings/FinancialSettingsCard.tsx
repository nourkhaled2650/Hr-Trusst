import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { UpdateProjectFormValues } from "../../types/projects.types";

type Props = {
  register: UseFormRegister<UpdateProjectFormValues>;
  errors: FieldErrors<UpdateProjectFormValues>;
};

export function FinancialSettingsCard({ register, errors }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Financial</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Budget */}
          <Field>
            <FieldLabel htmlFor="budget">Budget</FieldLabel>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              placeholder="—"
              {...register("budget", { setValueAs: (v: unknown) => v === "" ? null : Number(v) })}
            />
            <FieldError errors={[errors.budget]} />
          </Field>

          {/* Revenue Target */}
          <Field>
            <FieldLabel htmlFor="revenueTarget">Revenue Target</FieldLabel>
            <Input
              id="revenueTarget"
              type="number"
              min="0"
              step="0.01"
              placeholder="—"
              {...register("revenueTarget", { setValueAs: (v: unknown) => v === "" ? null : Number(v) })}
            />
            <FieldError errors={[errors.revenueTarget]} />
          </Field>

          {/* Actual Revenue */}
          <Field>
            <FieldLabel htmlFor="actualRevenue">Actual Revenue</FieldLabel>
            <Input
              id="actualRevenue"
              type="number"
              min="0"
              step="0.01"
              placeholder="—"
              {...register("actualRevenue", { setValueAs: (v: unknown) => v === "" ? null : Number(v) })}
            />
            <FieldError errors={[errors.actualRevenue]} />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
