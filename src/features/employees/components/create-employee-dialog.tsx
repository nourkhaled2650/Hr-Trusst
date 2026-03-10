import { useState, useEffect, startTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Copy, Check, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createEmployeeSchema } from "../schemas/employees.schema";
import type { CreateEmployeeFormValues } from "../types/employee.types";
import { useCreateEmployee } from "../hooks/use-create-employee";
import { generateSecurePassword } from "../utils/employees.utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEmployeeDialog({ open, onOpenChange }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const { mutateAsync: createEmployee, isPending } = useCreateEmployee();

  const form = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      position: "",
      employeeType: undefined,
      basicSalary: undefined,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset();
      startTransition(() => {
        setShowPassword(false);
        setAutoGenerate(false);
        setGeneratedPassword(null);
        setCopied(false);
        setApiError(null);
      });
    }
  }, [open, form]);

  // Clear API error on field change
  const handleFieldChange = () => {
    if (apiError !== null) setApiError(null);
  };

  const handleToggleGenerate = (on: boolean) => {
    setAutoGenerate(on);
    if (on) {
      const pwd = generateSecurePassword();
      setGeneratedPassword(pwd);
      form.setValue("password", pwd, { shouldValidate: true });
    } else {
      setGeneratedPassword(null);
      form.setValue("password", "", { shouldValidate: false });
      setShowPassword(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword);
    toast.success("Password copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const onSubmit = async (values: CreateEmployeeFormValues) => {
    setApiError(null);
    try {
      await createEmployee(values);
      toast.success("Employee created successfully");
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setApiError(msg);
    }
  };

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Employee</DialogTitle>
            <DialogDescription>
              Create an employee account. You can complete the full profile
              after creation.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            onChange={handleFieldChange}
          >
            {/* Account section */}
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </p>

            <Field>
              <FieldLabel htmlFor="email">
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="employee@company.com"
                disabled={isPending}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="username">
                Username <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="username"
                placeholder="john_doe"
                disabled={isPending}
                {...register("username")}
              />
              <FieldError errors={[errors.username]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">
                Password <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={autoGenerate ? "text" : showPassword ? "text" : "password"}
                  placeholder={autoGenerate ? "" : "Min 8 chars"}
                  readOnly={autoGenerate}
                  disabled={isPending}
                  {...register("password")}
                />
                {!autoGenerate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground/70" />
                    )}
                  </Button>
                )}
              </div>
              <FieldError errors={[errors.password]} />

              {/* Auto-generate toggle */}
              <div className="flex items-center gap-2 mt-1.5">
                <Switch
                  id="auto-generate"
                  checked={autoGenerate}
                  onCheckedChange={handleToggleGenerate}
                  disabled={isPending}
                />
                <label
                  htmlFor="auto-generate"
                  className="text-sm text-muted-foreground cursor-pointer select-none"
                >
                  Auto-generate password
                </label>
              </div>

              {/* Copy button — only when auto-generate is on */}
              {autoGenerate && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1.5"
                  onClick={handleCopy}
                  disabled={isPending}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1.5" /> Copy password
                    </>
                  )}
                </Button>
              )}
            </Field>

            <Separator />

            {/* Profile section */}
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Profile
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                <Input
                  id="firstName"
                  disabled={isPending}
                  {...register("firstName")}
                />
                <FieldError errors={[errors.firstName]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                <Input
                  id="lastName"
                  disabled={isPending}
                  {...register("lastName")}
                />
                <FieldError errors={[errors.lastName]} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="position">Position</FieldLabel>
              <Input
                id="position"
                disabled={isPending}
                {...register("position")}
              />
              <FieldError errors={[errors.position]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="employeeType">Employee Type</FieldLabel>
              <Controller
                control={form.control}
                name="employeeType"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={isPending}
                  >
                    <SelectTrigger id="employeeType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full-time</SelectItem>
                      <SelectItem value="PART_TIME">Part-time</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.employeeType]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="basicSalary">Basic Salary</FieldLabel>
              <Controller
                control={form.control}
                name="basicSalary"
                render={({ field }) => (
                  <Input
                    id="basicSalary"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    disabled={isPending}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? undefined : Number(v));
                    }}
                  />
                )}
              />
              <FieldError errors={[errors.basicSalary]} />
            </Field>

            {/* API error */}
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
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Discard confirmation */}
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
