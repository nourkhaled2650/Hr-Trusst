import type { UseFormRegister, FieldErrors, Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ManualCostFormValues, CostCategory } from "../../types/projects.types";

type Props = {
  register: UseFormRegister<ManualCostFormValues>;
  errors: FieldErrors<ManualCostFormValues>;
  control: Control<ManualCostFormValues>;
  categories: CostCategory[] | undefined;
  isLoadingCategories: boolean;
  watchedCategoryId: number | undefined;
};

export function ManualCostFormFields({
  register,
  errors,
  control,
  categories,
  isLoadingCategories,
  watchedCategoryId,
}: Props) {
  const selectedCategory = categories?.find((c) => c.categoryId === watchedCategoryId);
  const isOther = selectedCategory?.categoryName === "Other";

  return (
    <div className="space-y-4">
      {/* Date */}
      <Field>
        <FieldLabel htmlFor="costDate">Date</FieldLabel>
        <Input id="costDate" type="date" {...register("costDate")} />
        <FieldError errors={[errors.costDate]} />
      </Field>

      {/* Category */}
      <Field>
        <FieldLabel htmlFor="categoryId">Category</FieldLabel>
        {isLoadingCategories ? (
          <Skeleton className="h-9 w-full rounded-md" />
        ) : (
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? [])
                    .filter((c) => c.active)
                    .map((c) => (
                      <SelectItem key={c.categoryId} value={String(c.categoryId)}>
                        {c.categoryName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
        <FieldError errors={[errors.categoryId]} />
      </Field>

      {/* Description */}
      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Input
          id="description"
          placeholder="Describe the expense"
          {...register("description")}
        />
        {isOther && (
          <p className="text-xs text-muted-foreground mt-1">
            Please describe the expense in detail.
          </p>
        )}
        <FieldError errors={[errors.description]} />
      </Field>

      {/* Amount */}
      <Field>
        <FieldLabel htmlFor="amount">Amount</FieldLabel>
        <Input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          {...register("amount", { valueAsNumber: true })}
        />
        <FieldError errors={[errors.amount]} />
      </Field>
    </div>
  );
}
