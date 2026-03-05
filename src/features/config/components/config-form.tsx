import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  AlertCircle,
  Settings,
  Plus,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { configSchema, type ConfigFormValues } from "../schemas/config.schema";
import type { PayrollSettings } from "../types/config.types";
import {
  useSaveConfig,
  mapApiToFormValues,
  extractErrorMessage,
} from "../hooks/use-save-config";
import { OvertimeGroup } from "./config-form-fields/overtime-group";
import { AttendanceGroup } from "./config-form-fields/attendance-group";
import { LeaveGroup } from "./config-form-fields/leave-group";
import { ValidityPeriodGroup } from "./config-form-fields/validity-period-group";

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ConfigFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state (no config exists)
// ---------------------------------------------------------------------------

type EmptyStateProps = {
  onCreateClick: () => void;
};

function ConfigEmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Settings className="h-12 w-12 text-neutral-300 mb-4" />
      <p className="text-base font-medium text-neutral-700">
        No configuration set yet
      </p>
      <p className="text-sm text-neutral-400 mt-1 max-w-sm">
        The system has no active payroll settings. Create an initial
        configuration to enable payroll calculations.
      </p>
      <Button
        className="mt-6 bg-violet-600 hover:bg-violet-700"
        onClick={onCreateClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Initial Configuration
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form body (edit + create)
// ---------------------------------------------------------------------------

type FormBodyProps = {
  config: PayrollSettings | null;
  isCreateMode: boolean;
};

function ConfigFormBody({ config, isCreateMode }: FormBodyProps) {
  const saveConfig = useSaveConfig();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema) as Resolver<ConfigFormValues>,
    defaultValues: config !== null ? mapApiToFormValues(config) : undefined,
  });

  const {
    formState: { isDirty, isSubmitting },
    watch,
    reset,
    trigger,
  } = form;

  // Clear API error whenever any form field value changes
  useEffect(() => {
    const subscription = watch(() => {
      if (apiError !== null) {
        setApiError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, apiError]);

  const isPending = saveConfig.isPending || isSubmitting;

  const handleConfirmedSave = form.handleSubmit(async (values) => {
    setShowConfirm(false);
    setApiError(null);
    try {
      const saved = await saveConfig.mutateAsync({
        formValues: values,
        existing: config,
      });
      reset(mapApiToFormValues(saved));
    } catch (err) {
      setApiError(extractErrorMessage(err));
    }
  });

  const buttonLabel = isPending
    ? "Saving…"
    : isCreateMode
      ? "Create Configuration"
      : "Save Configuration";

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="space-y-6">
          <OvertimeGroup form={form} disabled={isPending} />
          <AttendanceGroup form={form} disabled={isPending} />
          <LeaveGroup form={form} disabled={isPending} />
          <ValidityPeriodGroup form={form} disabled={isPending} />

          {/* Read-only metadata — only shown when editing an existing record */}
          {config !== null && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-neutral-400 pt-2 border-t border-neutral-100">
              <span>
                Config ID:{" "}
                <span className="font-mono text-neutral-500">
                  {config.settingId}
                </span>
              </span>
              {config.isExpired && (
                <Badge
                  variant="outline"
                  className="text-red-500 border-red-200 text-xs"
                >
                  Expired
                </Badge>
              )}
            </div>
          )}

          {/* API error alert */}
          {apiError !== null && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto"
              disabled={(!isDirty && !isCreateMode) || isPending}
              onClick={async () => {
                const valid = await trigger();
                if (valid) setShowConfirm(true);
              }}
            >
              {isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              {buttonLabel}
            </Button>
          </div>
        </div>
      </form>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              System-wide impact
            </AlertDialogTitle>
            <AlertDialogDescription>
              These changes will apply to all payroll calculations company-wide.
              This cannot be undone. Are you sure you want to save?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-violet-600 hover:bg-violet-700"
              onClick={handleConfirmedSave}
            >
              Yes, save configuration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Public component: ConfigForm (Card wrapper)
// ---------------------------------------------------------------------------

type ConfigFormProps = {
  isLoading: boolean;
  isError: boolean;
  config: PayrollSettings | null | undefined;
};

export function ConfigForm({ isLoading, isError, config }: ConfigFormProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // config === undefined means the query hasn't resolved yet
  const resolved = config !== undefined;
  const hasConfig = resolved && config !== null;
  const noConfig = resolved && config === null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-neutral-900">
          Current Configuration
        </CardTitle>
        <CardDescription>
          Edit the active HR policy values. Changes apply immediately to all
          payroll calculations.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading && <ConfigFormSkeleton />}

        {isError && !isLoading && (
          <Alert variant="destructive" className="mx-auto max-w-lg mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load configuration. Please refresh the page.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !isError && hasConfig && (
          <ConfigFormBody config={config} isCreateMode={false} />
        )}

        {!isLoading && !isError && noConfig && !showCreateForm && (
          <ConfigEmptyState onCreateClick={() => setShowCreateForm(true)} />
        )}

        {!isLoading && !isError && noConfig && showCreateForm && (
          <ConfigFormBody config={null} isCreateMode={true} />
        )}
      </CardContent>
    </Card>
  );
}
