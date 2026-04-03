import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatHours } from "@/lib/utils";
import type { DayStatus, ProjectEntry } from "../../types/attendance.types";

type Props = {
  projectEntries: ProjectEntry[];
  dayStatus: DayStatus;
};

export function ProjectHoursCard({ projectEntries, dayStatus }: Props) {
  const total = projectEntries.reduce((sum, e) => sum + e.hours, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Project Hours</CardTitle>
        <CardDescription>Hour allocation submitted for this day</CardDescription>
      </CardHeader>
      <CardContent>
        {projectEntries.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            {dayStatus === "open"
              ? "Project hours will appear here once you submit your day."
              : "No project hours were recorded for this day."}
          </p>
        ) : (
          <div className="space-y-0">
            {projectEntries.map((entry, i) => (
              <div key={i}>
                <div className="flex justify-between items-start gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.projectName}</p>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">{entry.notes}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground shrink-0">
                    {formatHours(entry.hours)}
                  </p>
                </div>
                {i < projectEntries.length - 1 && <Separator />}
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-3">
              <p className="text-sm font-semibold text-foreground">Total</p>
              <p className="text-sm font-semibold text-foreground">{formatHours(total)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
