import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { adjustmentSchema } from "../../schemas/payroll.schema";
import { useCreateAdjustment } from "../../api/payroll.queries";
import type { AdjustmentFormValues } from "../../types/payroll.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AdjustmentAddFormProps {
  year: number;
  month: number;
  employeeId: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdjustmentAddForm({ year, month, employeeId }: AdjustmentAddFormProps) {
  const createMutation = useCreateAdjustment();

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      type: "DEDUCTION",
      label: "",
      amount: undefined as unknown as number,
      note: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const onSubmit = (values: AdjustmentFormValues) => {
    createMutation.mutate(
      { ...values, year, month, employeeId },
      {
        onSuccess: () => {
          reset({
            type: values.type,
            label: "",
            amount: undefined as unknown as number,
            note: "",
          });
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Add Adjustment
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type */}
        <Field>
          <FieldLabel htmlFor="adj-type">Type</FieldLabel>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="adj-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEDUCTION">DEDUCTION</SelectItem>
                  <SelectItem value="ADDITION">ADDITION</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.type]} />
        </Field>

        {/* Label */}
        <Field>
          <FieldLabel htmlFor="adj-label">Label</FieldLabel>
          <Input
            id="adj-label"
            placeholder="e.g. Equipment damage"
            {...register("label")}
          />
          <FieldError errors={[errors.label]} />
        </Field>

        {/* Amount */}
        <Field>
          <FieldLabel htmlFor="adj-amount">Amount</FieldLabel>
          <Input
            id="adj-amount"
            type="number"
            min={0.01}
            step={0.01}
            placeholder="0.00"
            {...register("amount")}
          />
          <FieldError errors={[errors.amount]} />
        </Field>

        {/* Note */}
        <Field>
          <FieldLabel htmlFor="adj-note">Note</FieldLabel>
          <Textarea
            id="adj-note"
            placeholder="Describe the reason..."
            {...register("note")}
          />
          <FieldDescription>
            This note will be visible to the employee on their payslip.
          </FieldDescription>
          <FieldError errors={[errors.note]} />
        </Field>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
          Add Adjustment
        </Button>

        {/* Inline API error */}
        {createMutation.isError && (
          <p className="text-sm text-destructive">
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : "An error occurred. Please try again."}
          </p>
        )}
      </form>
    </div>
  );
}
