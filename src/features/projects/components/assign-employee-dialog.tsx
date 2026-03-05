import { useState, useEffect, startTransition } from "react";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { assignEmployeeSchema } from "../schemas/projects.schema";
import type { AssignEmployeeFormValues } from "../types/projects.types";
import { useAssignEmployee } from "../hooks/use-assign-employee";
import { useEmployees } from "@/features/employees";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
};

const DEFAULT_VALUES: AssignEmployeeFormValues = {
  employeeId: 0,
  roleInProject: "",
};

export function AssignEmployeeDialog({ open, onOpenChange, projectId }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const { mutateAsync: assignEmployee, isPending } = useAssignEmployee();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();

  const form = useForm<AssignEmployeeFormValues>({
    resolver: zodResolver(assignEmployeeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { register, formState: { errors }, control } = form;

  useEffect(() => {
    if (open) {
      form.reset(DEFAULT_VALUES);
      startTransition(() => setApiError(null));
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

  const onSubmit = async (values: AssignEmployeeFormValues) => {
    setApiError(null);
    try {
      await assignEmployee({ values, projectId });
      toast.success("Employee assigned successfully");
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
            <DialogTitle>Assign Employee</DialogTitle>
            <DialogDescription>
              Assign an employee to this project.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            onChange={handleFieldChange}
          >
            <Field>
              <FieldLabel htmlFor="employeeId">
                Employee <span className="text-red-500">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="employeeId"
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : ""}
                    disabled={isPending || employeesLoading}
                  >
                    <SelectTrigger id="employeeId">
                      <SelectValue
                        placeholder={
                          employeesLoading
                            ? "Loading employees..."
                            : "Select employee"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => {
                        const name = [emp.firstName, emp.lastName]
                          .filter(Boolean)
                          .join(" ");
                        const label = name || emp.email;
                        return (
                          <SelectItem
                            key={Number(emp.employeeId)}
                            value={String(Number(emp.employeeId))}
                          >
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.employeeId]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="roleInProject">Role in Project</FieldLabel>
              <Input
                id="roleInProject"
                disabled={isPending}
                {...register("roleInProject")}
              />
              <FieldError errors={[errors.roleInProject]} />
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
                disabled={isPending || employeesLoading}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign"
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
