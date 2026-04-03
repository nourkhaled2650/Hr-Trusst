import { useState, useEffect } from "react";
import { useRouter, useBlocker } from "@tanstack/react-router";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { updateProjectSchema } from "../../schemas/projects.schema";
import type { UpdateProjectFormValues, Project } from "../../types/projects.types";
import { mapProjectToFormValues } from "../../utils/projects.utils";
import { useUpdateProject } from "../../hooks/use-update-project";
import { useCloseProject } from "../../hooks/use-close-project";
import { ProjectInfoFormCard } from "./ProjectInfoFormCard";
import { FinancialSettingsCard } from "./FinancialSettingsCard";

type Props = {
  project: Project;
  projectId: string;
};

export function ProjectSettingsTab({ project, projectId }: Props) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showBlockerDialog, setShowBlockerDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const { mutateAsync: updateProject, isPending: isSaving } = useUpdateProject();
  const { mutateAsync: closeProject, isPending: isClosing } = useCloseProject();

  const form = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema) as Resolver<UpdateProjectFormValues>,
    defaultValues: mapProjectToFormValues(project),
  });

  const { register, formState: { errors, isDirty, isSubmitting } } = form;

  useEffect(() => {
    form.reset(mapProjectToFormValues(project));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.projectId]);

  const blocker = useBlocker({
    shouldBlockFn: () => isDirty && !isSaving,
    withResolver: true,
  });

  useEffect(() => {
    if (blocker.status === "blocked") setShowBlockerDialog(true);
  }, [blocker.status]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const onSubmit = async (values: UpdateProjectFormValues) => {
    setApiError(null);
    try {
      const saved = await updateProject({ projectId: Number(projectId), values });
      toast.success("Changes saved successfully");
      form.reset(mapProjectToFormValues(saved));
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handleCloseProject = async () => {
    try {
      await closeProject(Number(projectId));
      toast.success("Project closed successfully");
      setShowCloseDialog(false);
      void router.navigate({ to: "/admin/projects" });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to close project.");
      setShowCloseDialog(false);
    }
  };

  const isPending = isSaving || isSubmitting;

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-8">
        <ProjectInfoFormCard
          form={form}
          disabled={isPending}
        />

        <FinancialSettingsCard register={register} errors={errors} />

        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      {project.status !== "COMPLETED" && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Close this project</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Marks the project as Completed. Employees will no longer be able to log hours.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive ml-6 shrink-0"
                onClick={() => setShowCloseDialog(true)}
                disabled={isClosing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Close Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Close project confirmation */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark &ldquo;{project.projectName}&rdquo; as Completed.
              Employees will no longer be able to log hours against it. This action cannot be undone via the UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive text-destructive-foreground"
              onClick={() => void handleCloseProject()}
              disabled={isClosing}
            >
              {isClosing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Closing...
                </>
              ) : (
                "Close Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Navigation blocker */}
      <AlertDialog open={showBlockerDialog} onOpenChange={setShowBlockerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
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
