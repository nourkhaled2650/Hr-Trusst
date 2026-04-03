import type { DayDetail, PagedResponse, WorkingDayRow } from "../types/attendance.types";
import { STATIC_MY_DAYS } from "../static/my-days.static";
import { STATIC_MY_DAY_DETAIL } from "../static/my-day-detail.static";

export const myDaysApi = {
  // TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
  getMyDays: async (page: number): Promise<PagedResponse<WorkingDayRow>> => {
    // STATIC: return static data until backend delivers
    return Promise.resolve({ ...STATIC_MY_DAYS, number: page });
    // REAL:
    // import { apiClient } from "@/lib/axios";
    // const { data } = await apiClient.get<ApiResponse<PagedResponse<WorkingDayRow>>>(`/api/attendance/my/days?page=${page}&size=20`, { _toast: false });
    // if (data.status !== "success" || data.data === null) throw new Error(data.message ?? "Failed to fetch attendance days.");
    // return data.data;
  },

  // TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
  getMyDayDetail: async (_date: string): Promise<DayDetail> => {
    // STATIC: return static data until backend delivers
    return Promise.resolve(STATIC_MY_DAY_DETAIL);
    // REAL:
    // import { apiClient } from "@/lib/axios";
    // const { data } = await apiClient.get<ApiResponse<DayDetail>>(`/api/attendance/my/days/${_date}`, { _toast: false });
    // if (data.status !== "success" || data.data === null) throw new Error(data.message ?? "Failed to fetch day detail.");
    // return data.data;
  },
} as const;
