import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------------------------
// Date formatting utility
// ---------------------------------------------------------------------------

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/**
 * Format an ISO date string (YYYY-MM-DD) as "dd MMM yyyy" (e.g. "01 Jan 2026").
 * Returns "—" when the value is null or undefined.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    // Parse as UTC to avoid timezone-shift off-by-one day issues
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return DATE_FORMATTER.format(date);
  } catch {
    return "—";
  }
}
