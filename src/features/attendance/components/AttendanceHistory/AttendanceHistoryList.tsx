import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { AttendanceLog } from "../../types/attendance.types";
import { formatHoursDisplay, formatTimeDisplay, sumClosedDurationHours } from "../../utils/attendance.utils";

type Props = {
  logs: AttendanceLog[];
};

type DayGroup = {
  date: string;
  label: string;
  logs: AttendanceLog[];
  totalHours: number;
};

function groupLogsByDay(logs: AttendanceLog[]): DayGroup[] {
  const map = new Map<string, AttendanceLog[]>();

  for (const log of logs) {
    const dateKey = log.checkInTime.slice(0, 10); // YYYY-MM-DD
    const existing = map.get(dateKey);
    if (existing !== undefined) {
      existing.push(log);
    } else {
      map.set(dateKey, [log]);
    }
  }

  return Array.from(map.entries())
    .map(([date, dayLogs]) => ({
      date,
      label: format(parseISO(date), "EEEE, MMMM d"),
      logs: dayLogs,
      totalHours: sumClosedDurationHours(dayLogs),
    }))
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first
}

export function AttendanceHistoryList({ logs }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");
  // Exclude today — shown in the AttendanceTodayCard above
  const pastLogs = logs.filter((l) => !l.checkInTime.startsWith(today));

  if (pastLogs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No past attendance records found.
      </div>
    );
  }

  const groups = groupLogsByDay(pastLogs);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.date}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{group.label}</h3>
            {group.totalHours > 0 && (
              <span className="text-xs text-muted-foreground">
                {formatHoursDisplay(group.totalHours)}
              </span>
            )}
          </div>
          <Card>
            <CardContent className="py-3 px-4">
              <div className="space-y-2">
                {group.logs.map((log) => (
                  <div key={log.logId} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatTimeDisplay(log.checkInTime)}
                      {" — "}
                      {log.checkOutTime !== null
                        ? formatTimeDisplay(log.checkOutTime)
                        : "not closed"}
                    </span>
                    {log.durationHours !== null ? (
                      <span className="font-medium tabular-nums">
                        {formatHoursDisplay(log.durationHours)}
                      </span>
                    ) : (
                      <span className="text-xs text-destructive">Unclosed</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
