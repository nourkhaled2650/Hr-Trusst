import { useEffect, useState } from "react";
import { useRouter, Link, useBlocker } from "@tanstack/react-router";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2, AlertCircle, FolderX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { updateProjectSchema } from "../schemas/projects.schema";
import type { UpdateProjectFormValues } from "../types/projects.types";
import { mapProjectToFormValues } from "../utils/projects.utils";
import { useProject } from "../hooks/use-project";
import { useUpdateProject } from "../hooks/use-update-project";
import { useCloseProject } from "../hooks/use-close-project";
import { ProjectStatusBadge } from "./project-status-badge";
import { ProjectInfoForm } from "./project-info-form";
import { AssignedEmployeesPanel } from "./assigned-employees-panel";
import { formatDate } from "@/lib/utils";

type Props = {
  projectId: string;
};

function ProjectLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-5 w-20" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ProjectDetailPage({ projectId }: Props) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showBlockerDialog, setShowBlockerDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const { data: project, isLoading, isError } = useProject(projectId);
  const { mutateAsync: updateProject, isPending: isSaving } = useUpdateProject();
  const { mutateAsync: closeProject, isPending: isClosing } = useCloseProject();

  const form = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema) as Resolver<UpdateProjectFormValues>,
    defaultValues: {
      projectName: "",
      projectCode: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (project) {
      form.reset(mapProjectToFormValues(project));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.projectId]);

  const blocker = useBlocker({
    shouldBlockFn: () => form.formState.isDirty && !isSaving,
    withResolver: true,
  });

  useEffect(() => {
    if (blocker.status === "blocked") {
      setShowBlockerDialog(true);
    }
  }, [blocker.status]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty]);

  const onSubmit = async (values: UpdateProjectFormValues) => {
    if (!project) return;
    setApiError(null);
    try {
      const saved = await updateProject({
        projectId: Number(project.projectId),
        values,
      });
      toast.success("Changes saved successfully");
      form.reset(mapProjectToFormValues(saved));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setApiError(msg);
    }
  };

  const handleCloseProject = async () => {
    if (!project) return;
    try {
      await closeProject(Number(project.projectId));
      toast.success("Project closed successfully");
      setShowCloseDialog(false);
      void router.navigate({ to: "/admin/projects" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to close project.";
      setApiError(msg);
      setShowCloseDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Skeleton className="h-5 w-28" />
        </div>
        <ProjectLoadingSkeleton />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <FolderX className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-base font-medium text-muted-foreground">
          Project not found
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          This project may have been deleted or the link is invalid.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => void router.navigate({ to: "/admin/projects" })}
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  const isPending = isSaving;

  return (
    <>
      <div className="p-6 space-y-4">
        {/* Breadcrumb */}
        <Link
          to="/admin/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Projects
        </Link>

        {/* Hero card */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-foreground">
                    {project.projectName}
                  </h1>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <span className="text-sm text-muted-foreground/70 font-mono">
                  {project.projectCode}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(project.startDate)} → {formatDate(project.endDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Project Info
            </CardTitle>
            <CardDescription>
              Update project details and status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} id="project-form">
              <ProjectInfoForm
                form={form}
                disabled={isPending}
                projectStatus={project.status}
                onCloseProjectClick={() => setShowCloseDialog(true)}
              />

              {apiError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end pt-6">
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
          </CardContent>
        </Card>

        {/* Assigned Employees */}
        <AssignedEmployeesPanel projectId={Number(project.projectId)} />
      </div>

      {/* Close project confirmation */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark &ldquo;{project.projectName}&rdquo; as Completed.
              Employees will no longer be able to log hours against it. This
              action cannot be undone via the UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive text-white"
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
