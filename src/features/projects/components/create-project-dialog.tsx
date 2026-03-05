import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createProjectSchema } from "../schemas/projects.schema";
import type { CreateProjectFormValues } from "../types/projects.types";
import { useCreateProject } from "../hooks/use-create-project";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DEFAULT_VALUES: CreateProjectFormValues = {
  projectName: "",
  projectCode: "",
  description: "",
  startDate: "",
  endDate: "",
  status: undefined,
};

export function CreateProjectDialog({ open, onOpenChange }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const { mutateAsync: createProject, isPending } = useCreateProject();

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { register, formState: { errors }, control } = form;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset(DEFAULT_VALUES);
      setApiError(null);
    }
  }, [open, form]);

  const handleClose = () => {
    if (form.formState.isDirty) {
      setShowDiscardDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleDiscard = () => {
    setShowDiscardDialog(false);
    onOpenChange(false);
  };

  const handleFieldChange = () => {
    if (apiError !== null) setApiError(null);
  };

  const onSubmit = async (values: CreateProjectFormValues) => {
    setApiError(null);
    try {
      await createProject(values);
      toast.success("Project created successfully");
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setApiError(msg);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Add a new project. You can assign employees after creation.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            onChange={handleFieldChange}
          >
            <Field>
              <FieldLabel htmlFor="projectName">
                Project Name <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="projectName"
                disabled={isPending}
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
                disabled={isPending}
                {...register("projectCode")}
                onBlur={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  form.setValue("projectCode", e.target.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
              <p className="text-xs text-neutral-400 mt-1">
                Unique identifier for this project. Cannot be changed later.
              </p>
              <FieldError errors={[errors.projectCode]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    id="description"
                    rows={3}
                    disabled={isPending}
                    {...field}
                  />
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
                  disabled={isPending}
                  {...register("startDate")}
                />
                <FieldError errors={[errors.startDate]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="endDate">End Date</FieldLabel>
                <Input
                  id="endDate"
                  type="date"
                  disabled={isPending}
                  {...register("endDate")}
                />
                <FieldError errors={[errors.endDate]} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={isPending}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status (defaults to Active)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.status]} />
            </Field>

            {apiError && (
              <Alert variant="destructive">
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDiscardDialog(false)}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
