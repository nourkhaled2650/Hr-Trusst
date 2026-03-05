import { useEffect, useState } from "react";
import { useRouter, Link, useBlocker } from "@tanstack/react-router";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2, AlertCircle, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { updateEmployeeSchema } from "../schemas/employees.schema";
import type {
  Employee,
  UpdateEmployeeFormValues,
} from "../types/employee.types";
import {
  getFullName,
  getInitials,
  mapEmployeeToFormValues,
} from "../utils/employees.utils";
import { useUpdateEmployee } from "../hooks/use-update-employee";
import { useEmployees } from "../hooks/use-employees";
import { EmployeeTypeBadge } from "./employee-columns";
import { BasicInfoSection } from "./employee-form-sections/basic-info-section";
import { EmploymentDetailsSection } from "./employee-form-sections/employment-details-section";
import { CompensationSection } from "./employee-form-sections/compensation-section";
import { PolicyOverridesSection } from "./employee-form-sections/policy-overrides-section";

type Props = {
  employeeId: string;
};

function EmployeeLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="py-6 space-y-3">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="space-y-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EmployeeDetailPage({ employeeId }: Props) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showBlockerDialog, setShowBlockerDialog] = useState(false);

  const { data: employees, isLoading, isError } = useEmployees();
  const { mutateAsync: updateEmployee, isPending } = useUpdateEmployee();

  const employee: Employee | undefined = employees?.find(
    (e) => String(Number(e.employeeId)) === employeeId,
  );

  const form = useForm<UpdateEmployeeFormValues>({
    resolver: zodResolver(updateEmployeeSchema) as Resolver<UpdateEmployeeFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      position: "",
      basicSalary: null,
      dateOfBirth: null,
      hireDate: null,
      employeeType: null,
      configurationException: null,
    },
  });

  // Initialize form when employee data is available
  useEffect(() => {
    if (employee) {
      form.reset(mapEmployeeToFormValues(employee));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee?.employeeId]);

  // Navigation blocker for unsaved changes
  const blocker = useBlocker({
    shouldBlockFn: () => form.formState.isDirty && !isPending,
    withResolver: true,
  });

  useEffect(() => {
    if (blocker.status === "blocked") {
      setShowBlockerDialog(true);
    }
  }, [blocker.status]);

  // Warn on browser tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty]);

  const onSubmit = async (values: UpdateEmployeeFormValues) => {
    if (!employee) return;
    setApiError(null);
    try {
      await updateEmployee({
        employeeId: Number(employee.employeeId),
        values,
      });
      toast.success("Changes saved successfully");
      form.reset(values);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setApiError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Skeleton className="h-5 w-28" />
        </div>
        <EmployeeLoadingSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load employee data. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24">
        <UserX className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-base font-medium text-muted-foreground">
          Employee not found
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          This employee may have been removed or the link is invalid.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => void router.navigate({ to: "/admin/employees" })}
        >
          Back to Employees
        </Button>
      </div>
    );
  }

  const fullName = getFullName(employee);
  const initials = getInitials(employee);
  return (
    <>
      <div className="p-6 space-y-4">
        {/* Breadcrumb */}
        <Link
          to="/admin/employees"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Employees
        </Link>

        {/* Hero card */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarFallback className="bg-brand-muted text-brand text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-foreground">
                    {fullName || "—"}
                  </h1>
                  <EmployeeTypeBadge type={employee.employeeType} />
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  {employee.employeeCode}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {[employee.email, employee.position].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 1 — Statistics placeholder */}
        <div className="rounded-lg border border-dashed border bg-muted/50 px-6 py-10 text-center text-sm text-muted-foreground/70">
          Employee statistics — coming soon
        </div>

        {/* Section 2 — Edit form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BasicInfoSection form={form} disabled={isPending} />
            <EmploymentDetailsSection form={form} disabled={isPending} />
            <CompensationSection form={form} disabled={isPending} />
            <PolicyOverridesSection form={form} disabled={isPending} />
          </div>

          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="bg-brand hover:bg-brand-hover"
              disabled={isPending || !form.formState.isDirty}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Navigation blocker dialog */}
      <AlertDialog open={showBlockerDialog} onOpenChange={setShowBlockerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your
              changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowBlockerDialog(false);
                if (blocker.status === "blocked") blocker.reset?.();
              }}
            >
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowBlockerDialog(false);
                if (blocker.status === "blocked") blocker.proceed?.();
              }}
            >
              Leave anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
