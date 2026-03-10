import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { format, parseISO, isFuture } from "date-fns";
import {
  CalendarIcon,
  CalendarX,
  ClipboardList,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDaySummaryQuery, formatHoursDisplay } from "@/features/attendance";
import {
  useMyAssignmentsQuery,
  useSubmittedDayLogQuery,
  useSubmitDailyLogsMutation,
} from "@/features/project-hours";
import type { ProjectAssignment } from "@/features/project-hours";

// ---------------------------------------------------------------------------
// Route definition
// ---------------------------------------------------------------------------
const searchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute("/_employee/attendance/log")({
  validateSearch: searchSchema,
  component: LogWorkingDayPage,
});

// ---------------------------------------------------------------------------
// Local entry shape (client-side only, not persisted until E5 submit)
// ---------------------------------------------------------------------------
interface LocalEntry {
  id: string;
  assignmentId: number | null;
  hours: number | "";
  notes: string;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
function LogWorkingDayPage() {
  const { date: dateParam } = Route.useSearch();
  const [selectedDate, setSelectedDate] = useState<Date>(
    dateParam ? parseISO(dateParam) : new Date(),
  );
  const date = format(selectedDate, "yyyy-MM-dd");
  const dateLabelDisplay = format(selectedDate, "EEEE, MMMM d, yyyy");
  console.log(date);
  const {
    data: daySummary,
    isPending: e4Pending,
    isError: e4Error,
    refetch: e4Refetch,
  } = useDaySummaryQuery(date);
  console.log(daySummary);
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-semibold mb-1">Log Working Day</h1>

      {/* Date picker */}
      <div className="flex items-center gap-3 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {dateLabelDisplay}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              disabled={(d) => isFuture(d)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Day content area */}
      {e4Pending ? (
        <DaySkeleton />
      ) : e4Error || !daySummary ? (
        <DayError onRetry={() => void e4Refetch()} />
      ) : daySummary.dayStatus === "locked" && daySummary.totalHours === 0 ? (
        <ModeC />
      ) : daySummary.dayStatus === "locked" ? (
        <ModeB date={date} totalHours={daySummary.totalHours} />
      ) : (
        <ModeA date={date} totalHours={daySummary.totalHours} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode A — Open day: local state allocation form
// ---------------------------------------------------------------------------
function ModeA({ date, totalHours }: { date: string; totalHours: number }) {
  const [entries, setEntries] = useState<LocalEntry[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: assignments = [] } = useMyAssignmentsQuery();
  const { mutate: submitLogs, isPending: submitting } =
    useSubmitDailyLogsMutation(date);

  const allocatedHours = entries.reduce(
    (sum, e) => sum + (typeof e.hours === "number" ? e.hours : 0),
    0,
  );
  const remaining = totalHours - allocatedHours;
  const canSubmit = Math.abs(remaining) < 0.01 && entries.length > 0; // <0.01h ≈ <1 min tolerance for float precision

  const usedAssignmentIds = entries
    .map((e) => e.assignmentId)
    .filter((id): id is number => id !== null);

  function addEntry() {
    setEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), assignmentId: null, hours: "", notes: "" },
    ]);
  }

  function updateEntry(id: string, updates: Partial<LocalEntry>) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleSubmit() {
    setSubmitError(null);
    const validEntries = entries.filter(
      (e): e is LocalEntry & { assignmentId: number; hours: number } =>
        e.assignmentId !== null && typeof e.hours === "number" && e.hours > 0,
    );
    submitLogs(
      {
        date,
        entries: validEntries.map((e) => ({
          assignmentId: e.assignmentId,
          hours: e.hours,
          notes: e.notes || undefined,
        })),
      },
      {
        onError: (err) =>
          setSubmitError(
            err instanceof Error
              ? err.message
              : "Submission failed. Please try again.",
          ),
      },
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">
          Total hours to allocate:{" "}
          <span className="font-semibold text-foreground">
            {totalHours.toFixed(2)} hrs
          </span>
        </span>
        <BalancePill remaining={remaining} />
      </div>

      {/* Entry list */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <ClipboardList className="h-10 w-10 mb-3 opacity-50" />
          <p className="text-sm">
            No hours logged yet. Click &lsquo;+ Add Entry&rsquo; to start.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              assignments={assignments}
              excludedAssignmentIds={usedAssignmentIds.filter(
                (id) => id !== entry.assignmentId,
              )}
              onChange={updateEntry}
              onDelete={deleteEntry}
              disabled={submitting}
            />
          ))}
        </div>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={addEntry}
        disabled={submitting}
      >
        + Add Entry
      </Button>

      {submitError !== null && (
        <div className="rounded border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <Button
        className="w-full"
        disabled={!canSubmit || submitting}
        title={!canSubmit ? "Allocate all hours before submitting" : undefined}
        onClick={handleSubmit}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Hours for the Day"
        )}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Balance pill
// ---------------------------------------------------------------------------
function BalancePill({ remaining }: { remaining: number }) {
  if (Math.abs(remaining) < 0.01) {
    return (
      <Badge className="bg-success text-success-foreground border-success/20">
        Balanced
      </Badge>
    );
  }
  if (remaining > 0) {
    return (
      <Badge className="bg-warning text-warning-foreground border-warning/20">
        {remaining.toFixed(2)} hrs remaining
      </Badge>
    );
  }
  return (
    <Badge className="bg-destructive/10 text-destructive border border-destructive/20">
      {Math.abs(remaining).toFixed(2)} hrs over
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Entry row (local state — no mutations until E5 submit)
// ---------------------------------------------------------------------------
interface EntryRowProps {
  entry: LocalEntry;
  assignments: ProjectAssignment[];
  excludedAssignmentIds: number[];
  onChange: (id: string, updates: Partial<LocalEntry>) => void;
  onDelete: (id: string) => void;
  disabled: boolean;
}

function EntryRow({
  entry,
  assignments,
  excludedAssignmentIds,
  onChange,
  onDelete,
  disabled,
}: EntryRowProps) {
  const availableAssignments = assignments.filter(
    (a) => a.active && !excludedAssignmentIds.includes(a.assignmentId),
  );

  return (
    <div className="flex flex-col md:flex-row gap-2 rounded-lg border p-3 bg-card">
      {/* Project select */}
      <Select
        value={entry.assignmentId?.toString() ?? ""}
        onValueChange={(v) =>
          onChange(entry.id, { assignmentId: parseInt(v, 10) })
        }
        disabled={disabled}
      >
        <SelectTrigger className="md:flex-1">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {entry.assignmentId !== null && (
            <SelectItem value={entry.assignmentId.toString()}>
              {assignments.find((a) => a.assignmentId === entry.assignmentId)
                ?.projectName ?? "—"}
            </SelectItem>
          )}
          {availableAssignments.map((a) => (
            <SelectItem key={a.assignmentId} value={a.assignmentId.toString()}>
              {a.projectName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2 items-center">
        {/* Hours input */}
        <Input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          className="w-24"
          value={entry.hours}
          onChange={(e) =>
            onChange(entry.id, {
              hours: e.target.value === "" ? "" : parseFloat(e.target.value),
            })
          }
          disabled={disabled}
        />

        {/* Notes */}
        <Input
          type="text"
          placeholder="Notes (optional)"
          className="flex-1"
          value={entry.notes}
          onChange={(e) => onChange(entry.id, { notes: e.target.value })}
          disabled={disabled}
        />

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(entry.id)}
          disabled={disabled}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode B — Locked day: read-only submitted hours
// ---------------------------------------------------------------------------
function ModeB({ date, totalHours }: { date: string; totalHours: number }) {
  const {
    data: log,
    isPending,
    isError,
    refetch,
  } = useSubmittedDayLogQuery(date, true);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded border border-success/20 bg-success/10 p-3 text-sm text-success">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Day submitted — allocation locked.
      </div>

      {isPending ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError || !log ? (
        <div className="flex items-center gap-3 rounded border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Could not load submitted hours. Try refreshing the page.
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            className="ml-auto"
          >
            Retry
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {log.entries.map((entry, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">
                  {entry.projectName}
                </TableCell>
                <TableCell>{formatHoursDisplay(entry.hours)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.notes ?? "—"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold border-t-2">
              <TableCell>Total</TableCell>
              <TableCell>
                {formatHoursDisplay(log.totalHours || totalHours)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode C — No record for the selected date
// ---------------------------------------------------------------------------
function ModeC() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <CalendarX className="h-12 w-12 mb-4 opacity-40" />
      <p className="text-sm">
        No sessions recorded for this date. Start a session from the navbar to
        begin your day.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading / error states
// ---------------------------------------------------------------------------
function DaySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

function DayError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        Could not load day summary. Try refreshing the page.
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
