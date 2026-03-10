import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AttendanceLog } from "../../types/attendance.types";
import { formatHoursDisplay, formatTimeDisplay, sumClosedDurationHours } from "../../utils/attendance.utils";

type Props = {
  todayLogs: AttendanceLog[];
};

export function AttendanceTodayCard({ todayLogs }: Props) {
  const totalClosedHours = sumClosedDurationHours(todayLogs);
  const activeLog = todayLogs.find((l) => l.checkOutTime === null);
  const hasActivity = todayLogs.length > 0;

  if (!hasActivity) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Today</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No sessions recorded today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Today</CardTitle>
          {activeLog !== undefined ? (
            <Badge variant="default" className="text-xs">Active Session</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              {formatHoursDisplay(totalClosedHours)} total
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {todayLogs.map((log) => (
            <div key={log.logId} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {formatTimeDisplay(log.checkInTime)}
                  {" — "}
                  {log.checkOutTime !== null
                    ? formatTimeDisplay(log.checkOutTime)
                    : "ongoing"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {log.durationHours !== null ? (
                  <span className="font-medium tabular-nums">
                    {formatHoursDisplay(log.durationHours)}
                  </span>
                ) : (
                  <Badge variant="outline" className="text-xs">Active</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
