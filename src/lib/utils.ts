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

const DATE_SHORT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/**
 * Format an ISO date string (YYYY-MM-DD) as "MMM d" (e.g. "Apr 20").
 * Returns "—" when the value is null or undefined.
 */
export function formatDateShort(dateStr: string): string {
  return DATE_SHORT_FORMATTER.format(new Date(dateStr + "T00:00:00"));
}

// ---------------------------------------------------------------------------
// Duration formatting
// ---------------------------------------------------------------------------

/**
 * Convert a total-minutes value to a human-readable hours/minutes string.
 * Examples: 105 → "1 h 45 m", 60 → "1 h", 30 → "30 m", 0 → "0 m"
 */
export function formatHoursMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} m`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} m`;
}

// ---------------------------------------------------------------------------
// Hours formatting
// ---------------------------------------------------------------------------

/**
 * Format a decimal hours value to a compact human-readable string.
 * Examples: 0 → "—", 0.5 → "30m", 1.5 → "1h 30m", 2.0 → "2h"
 */
export function formatHours(h: number): string {
  if (h === 0) return "—";
  const mins = Math.round((h % 1) * 60);
  const wholeHours = Math.floor(h);
  if (wholeHours === 0) return `${Math.round(h * 60)}m`;
  if (mins === 0) return `${wholeHours}h`;
  return `${wholeHours}h ${mins}m`;
}

// ---------------------------------------------------------------------------
// Name utilities
// ---------------------------------------------------------------------------

/**
 * Returns the initials of a full name.
 * "Ahmed Hassan" → "AH", "Nour" → "N"
 */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

const CURRENCY_COMPACT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const CURRENCY_FULL = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format as compact: $1.2k, $1.2M. Returns "—" for null/undefined. */
export function formatCurrencyCompact(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return CURRENCY_COMPACT.format(amount);
}

/** Format as full: $12,450.00. Returns "—" for null/undefined. */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return CURRENCY_FULL.format(amount);
}

// ---------------------------------------------------------------------------
// Percent formatting
// ---------------------------------------------------------------------------

/** Format as percentage string. Returns "—" for null/undefined. */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return "—";
  return `${value.toFixed(decimals)}%`;
}

// ---------------------------------------------------------------------------
// Trend data enrichment
// ---------------------------------------------------------------------------

type RawTrendWeek = {
  weekStart: string;
  salaryCost: number;
  manualCost: number;
  totalCost: number;
  hours: number;
};

type EnrichedTrendWeek = RawTrendWeek & {
  weekLabel: string;
  cumulativeCost: number;
};

const WEEK_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/**
 * Adds `weekLabel` ("Apr 7") and `cumulativeCost` (running total) to raw trend weeks.
 */
export function enrichTrendWeeks(weeks: RawTrendWeek[]): EnrichedTrendWeek[] {
  let cumulative = 0;
  return weeks.map((w) => {
    cumulative += w.totalCost;
    return {
      ...w,
      weekLabel: WEEK_LABEL_FORMATTER.format(new Date(w.weekStart + "T00:00:00")),
      cumulativeCost: cumulative,
    };
  });
}

// ---------------------------------------------------------------------------
// Timeline progress
// ---------------------------------------------------------------------------

/**
 * Returns % elapsed (0–100) from startDate to today (or endDate if provided).
 * Returns 0 if dates are invalid or duration is zero.
 */
export function computePctElapsed(
  startDate: string,
  endDate: string | null,
  today: Date = new Date(),
): number {
  try {
    const start = new Date(startDate + "T00:00:00").getTime();
    const end   = endDate
      ? new Date(endDate + "T00:00:00").getTime()
      : today.setHours(0, 0, 0, 0);
    const now   = new Date(today).setHours(0, 0, 0, 0);
    const total = end - start;
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, ((now - start) / total) * 100));
  } catch {
    return 0;
  }
}
