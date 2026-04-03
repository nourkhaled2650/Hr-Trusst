import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { manualCostSchema } from "../../schemas/projects.schema";
import type { ManualCostEntry, ManualCostFormValues } from "../../types/projects.types";
import { useAddManualCost } from "../../hooks/use-add-manual-cost";
import { useEditManualCost } from "../../hooks/use-edit-manual-cost";
import { useCostCategories } from "../../hooks/use-cost-categories";
import { ManualCostFormFields } from "./ManualCostFormFields";

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editEntry?: ManualCostEntry;
};

function buildDefaultValues(editEntry?: ManualCostEntry): ManualCostFormValues {
  if (editEntry) {
    return {
      categoryId:  editEntry.categoryId,
      description: editEntry.description,
      amount:      editEntry.amount,
      costDate:    editEntry.costDate,
    };
  }
  return {
    categoryId:  0,
    description: "",
    amount:      0,
    costDate:    new Date().toISOString().split("T")[0]!,
  };
}

export function ManualCostDialog({ projectId, open, onOpenChange, editEntry }: Props) {
  const isEditMode = !!editEntry;
  const [discardOpen, setDiscardOpen] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { data: categories, isLoading: isLoadingCategories } = useCostCategories();
  const addMutation  = useAddManualCost(projectId);
  const editMutation = useEditManualCost(projectId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ManualCostFormValues>({
    resolver: zodResolver(manualCostSchema),
    defaultValues: buildDefaultValues(editEntry),
  });

  const watchedCategoryId = watch("categoryId");

  // Reset form whenever dialog opens or editEntry changes
  useEffect(() => {
    if (open) {
      reset(buildDefaultValues(editEntry));
      setMutationError(null);
    }
  }, [open, editEntry, reset]);

  const handleClose = () => {
    if (isDirty) {
      setDiscardOpen(true);
    } else {
      onOpenChange(false);
    }
  };

  const onSubmit = (values: ManualCostFormValues) => {
    setMutationError(null);

    if (isEditMode && editEntry) {
      editMutation.mutate(
        { costId: editEntry.costId, values },
        {
          onSuccess: () => {
            toast.success("Cost updated");
            onOpenChange(false);
          },
          onError: () => setMutationError("Failed to update cost entry. Please try again."),
        },
      );
    } else {
      addMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Cost added");
          onOpenChange(false);
        },
        onError: () => setMutationError("Failed to add cost entry. Please try again."),
      });
    }
  };

  const isBusy = isSubmitting || addMutation.isPending || editMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Cost Entry" : "Add Manual Cost"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="py-4">
              {mutationError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{mutationError}</AlertDescription>
                </Alert>
              )}

              <ManualCostFormFields
                register={register}
                errors={errors}
                control={control}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                watchedCategoryId={watchedCategoryId}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy}>
                Cancel
              </Button>
              <Button type="submit" disabled={isBusy}>
                {isBusy ? "Saving…" : isEditMode ? "Save Changes" : "Add Cost"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dirty-cancel discard confirmation */}
      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardOpen(false);
                onOpenChange(false);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
