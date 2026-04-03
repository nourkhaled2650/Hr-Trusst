import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { costCategorySchema } from "../../schemas/projects.schema";
import type { CreateCostCategoryFormValues } from "../../types/projects.types";
import { useAddCostCategory } from "../../hooks/use-add-cost-category";
import { useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddCostCategoryDialog({ open, onOpenChange }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useAddCostCategory();

  const form = useForm<CreateCostCategoryFormValues>({
    resolver: zodResolver(costCategorySchema),
    defaultValues: { name: "", description: "" },
  });

  const { register, formState: { errors }, reset } = form;

  const handleOpenChange = (next: boolean) => {
    if (!next) { reset(); setApiError(null); }
    onOpenChange(next);
  };

  const onSubmit = async (values: CreateCostCategoryFormValues) => {
    setApiError(null);
    try {
      await mutateAsync(values);
      toast.success("Category added");
      handleOpenChange(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Cost Category</DialogTitle>
          <DialogDescription>Create a new category for manual cost entries.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="cat-name">Name <span className="text-destructive">*</span></FieldLabel>
            <Input id="cat-name" placeholder="e.g. Equipment" disabled={isPending} {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="cat-description">Description</FieldLabel>
            <Textarea
              id="cat-description"
              placeholder="Optional description"
              rows={3}
              disabled={isPending}
              {...register("description")}
            />
            <FieldError errors={[errors.description]} />
          </Field>

          {apiError && (
            <Alert variant="destructive">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
