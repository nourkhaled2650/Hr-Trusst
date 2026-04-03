// PLACEHOLDER: static data used until GET /api/admin/projects/{id}/trend is implemented

// Typed inline to match RawTrendWeek shape (weekLabel and cumulativeCost are added by enrichTrendWeeks)
export const STATIC_TREND_WEEKS: Array<{
  weekStart:   string;
  salaryCost:  number;
  manualCost:  number;
  totalCost:   number;
  hours:       number;
}> = [
  {
    weekStart:  "2026-01-05",
    salaryCost: 4200,
    manualCost: 0,
    totalCost:  4200,
    hours:      56,
  },
  {
    weekStart:  "2026-01-12",
    salaryCost: 4400,
    manualCost: 800,
    totalCost:  5200,
    hours:      60,
  },
  {
    weekStart:  "2026-01-19",
    salaryCost: 4600,
    manualCost: 1200,
    totalCost:  5800,
    hours:      64,
  },
  {
    weekStart:  "2026-01-26",
    salaryCost: 5100,
    manualCost: 0,
    totalCost:  5100,
    hours:      68,
  },
  {
    // Idle gap — no work this week
    weekStart:  "2026-02-02",
    salaryCost: 0,
    manualCost: 0,
    totalCost:  0,
    hours:      0,
  },
  {
    weekStart:  "2026-02-09",
    salaryCost: 5400,
    manualCost: 2400,
    totalCost:  7800,
    hours:      72,
  },
  {
    weekStart:  "2026-02-16",
    salaryCost: 5600,
    manualCost: 0,
    totalCost:  5600,
    hours:      74,
  },
  {
    weekStart:  "2026-02-23",
    salaryCost: 5500,
    manualCost: 2000,
    totalCost:  7500,
    hours:      70,
  },
];
