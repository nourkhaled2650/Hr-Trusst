// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

/**
 * Formats a number as EGP currency with no decimal places.
 * Output example: "EGP 48,200"
 */
export function formatEGP(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `EGP ${formatted}`;
}

// ---------------------------------------------------------------------------
// Month/year helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Returns display label for a month/year pair, e.g. "April 2026" */
export function formatMonthYear(year: number, month: number): string {
  const name = MONTH_NAMES[month - 1];
  if (name === undefined) return `${year}/${month}`;
  return `${name} ${year}`;
}

/** Returns previous month as { year, month } */
export function prevMonth(
  year: number,
  month: number,
): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

/** Returns next month as { year, month } */
export function nextMonth(
  year: number,
  month: number,
): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}
