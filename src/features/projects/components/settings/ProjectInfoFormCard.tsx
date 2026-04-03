import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProjectInfoForm } from "../project-info-form";
import type { UpdateProjectFormValues } from "../../types/projects.types";

type Props = {
  form: UseFormReturn<UpdateProjectFormValues>;
  disabled: boolean;
};

export function ProjectInfoFormCard({ form, disabled }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Project Info</CardTitle>
        <CardDescription>Update project details and status.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectInfoForm
          form={form}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
