import { format, parseISO } from "date-fns";

// ---------------------------------------------------------------------------
// Parse the clock-in timestamp from the backend success message.
//
// The clock-in endpoint returns: "Clock-in successful at 2026-01-26T09:00:00"
// DEV-001: The timestamp is currently hardcoded on the backend — this parsing
// will return whatever timestamp is in the message, hardcoded or not.
// We MUST NOT substitute Date.now() — the server-returned timestamp is the
// source of truth for the timer.
// ---------------------------------------------------------------------------
export function parseClockInTimestamp(message: string): string | null {
  const match = /Clock-in successful at (.+)/.exec(message);
  if (!match || !match[1]) return null;
  try {
    // Validate that it is a parseable date before returning
    const parsed = new Date(match[1].trim());
    if (isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Get today's date as YYYY-MM-DD string (used for localStorage key and
// filtering attendance logs by today's date)
// ---------------------------------------------------------------------------
export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// ---------------------------------------------------------------------------
// Format decimal hours to "Xh Ym" display string.
// Examples: 7.5 → "7h 30m", 8.0 → "8h 00m", 0.75 → "0h 45m"
// ---------------------------------------------------------------------------
export function formatHoursDisplay(decimalHours: number): string {
  const totalMinutes = Math.round(decimalHours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

// ---------------------------------------------------------------------------
// Format elapsed seconds to HH:MM:SS for the session timer.
// Used in SESSION_ACTIVE state in the navbar widget.
// ---------------------------------------------------------------------------
export function formatElapsedTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");
}

// ---------------------------------------------------------------------------
// Format elapsed seconds to compact mobile timer: MM:SS or H:MM:SS
// ---------------------------------------------------------------------------
export function formatElapsedTimeCompact(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Format an ISO datetime string to a human-readable time: "09:00 AM"
// ---------------------------------------------------------------------------
export function formatTimeDisplay(isoString: string): string {
  try {
    return format(parseISO(isoString), "hh:mm a");
  } catch {
    return "--:--";
  }
}

// ---------------------------------------------------------------------------
// Format decimal hours as a H:MM string for display in badges / pills.
// Examples: 2.5 → "2:30", 8.0 → "8:00", 0.75 → "0:45"
// ---------------------------------------------------------------------------
export function formatHoursAsTime(decimalHours: number): string {
  const totalMinutes = Math.round(Math.abs(decimalHours) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Convert a time input value ("HH:MM") to decimal hours.
// Examples: "02:30" → 2.5, "08:00" → 8.0, "00:45" → 0.75
// Returns 0 for empty or invalid input.
// ---------------------------------------------------------------------------
export function timeInputToDecimalHours(value: string): number {
  const [hStr, mStr] = value.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = parseInt(mStr ?? "0", 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return h + m / 60;
}

// ---------------------------------------------------------------------------
// Convert decimal hours to a "HH:MM" string for use as a time input value.
// Examples: 2.5 → "02:30", 8.0 → "08:00"
// Returns "" for falsy / zero input so the input appears empty.
// ---------------------------------------------------------------------------
export function decimalHoursToTimeInput(decimalHours: number): string {
  if (!decimalHours) return "";
  const totalMinutes = Math.round(decimalHours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Filter attendance logs to only those for a specific date (YYYY-MM-DD).
// The backend returns all logs for an employee — we filter client-side.
// ---------------------------------------------------------------------------
export function filterLogsByDate<T extends { checkInTime: string }>(
  logs: ReadonlyArray<T>,
  date: string,
): T[] {
  return logs.filter((log) => log.checkInTime.startsWith(date));
}

// ---------------------------------------------------------------------------
// Sum the durationHours of all closed (checked-out) sessions.
// Used to compute totalClosedHours for the SESSION_ACTIVE label and
// totalWorkingHours for the Log Working Day page.
// ---------------------------------------------------------------------------
export function sumClosedDurationHours(
  logs: ReadonlyArray<{ checkOutTime: string | null; durationHours: number | null }>,
): number {
  return logs
    .filter((log) => log.checkOutTime !== null && log.durationHours !== null)
    .reduce((sum, log) => sum + (log.durationHours ?? 0), 0);
}
