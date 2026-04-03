import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatHours } from "@/lib/utils";
import type { SessionEntry } from "../../types/attendance.types";

type Props = {
  sessions: SessionEntry[];
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatTime(isoString: string): string {
  return timeFormatter.format(new Date(isoString));
}

export function SessionsCard({ sessions }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sessions</CardTitle>
        <CardDescription>Individual clock-in / clock-out pairs for this day</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            No sessions recorded for this day.
          </p>
        ) : (
          <ol className="relative border-l border-border ml-2 space-y-4 pl-4">
            {sessions.map((session, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-border" />
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Session {i + 1}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatTime(session.startTime)}
                      {" → "}
                      {session.endTime ? (
                        formatTime(session.endTime)
                      ) : (
                        <span className="text-muted-foreground">ongoing</span>
                      )}
                    </p>
                    {session.isManual && (
                      <span className="text-xs bg-muted text-muted-foreground rounded-sm px-1.5 py-0.5">
                        Manual
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground shrink-0">
                    {formatHours(session.durationHours)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
