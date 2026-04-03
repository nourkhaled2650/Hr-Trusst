import { enrichTrendWeeks } from "@/lib/utils";
import type { TrendWeek } from "../types/projects.types";
import { STATIC_TREND_WEEKS } from "../static/project-trend.static";

// PLACEHOLDER: returns enriched static data until GET /api/admin/projects/{projectId}/trend is implemented
export const trendApi = {
  // TODO: replace with real API call — fetch raw weeks from backend and enrich client-side
  fetchProjectTrend: async (_projectId: string): Promise<TrendWeek[]> => {
    return Promise.resolve(enrichTrendWeeks(STATIC_TREND_WEEKS));
  },
} as const;
