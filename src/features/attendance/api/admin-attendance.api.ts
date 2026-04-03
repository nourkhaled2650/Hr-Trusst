import type {
  AdminTodayEmployee,
  AdminWorkingDayRow,
  AttendanceDayFilters,
  AttendanceMonthStats,
  PagedResponse,
} from "../types/attendance.types";
import { STATIC_ADMIN_TODAY } from "../static/admin-today.static";
import { STATIC_ADMIN_DAYS, STATIC_ATTENDANCE_MONTH_STATS } from "../static/admin-days.static";

export const adminAttendanceApi = {
  // TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
  getAdminToday: async (): Promise<AdminTodayEmployee[]> => {
    // STATIC: return static data until backend delivers
    return Promise.resolve(STATIC_ADMIN_TODAY);
    // REAL:
    // import { apiClient } from "@/lib/axios";
    // const { data } = await apiClient.get<ApiResponse<AdminTodayEmployee[]>>("/api/admin/attendance/today", { _toast: false });
    // if (data.status !== "success" || data.data === null) throw new Error(data.message ?? "Failed to fetch today's attendance.");
    // return data.data;
  },

  // TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
  getAdminDays: async (_filters: AttendanceDayFilters): Promise<PagedResponse<AdminWorkingDayRow>> => {
    // STATIC: return static data until backend delivers
    return Promise.resolve({ ...STATIC_ADMIN_DAYS, number: _filters.page });
    // REAL:
    // import { apiClient } from "@/lib/axios";
    // const params = new URLSearchParams();
    // params.set("page", String(_filters.page));
    // if (_filters.size) params.set("size", String(_filters.size));
    // if (_filters.employeeId) params.set("employeeId", String(_filters.employeeId));
    // if (_filters.status) params.set("status", _filters.status);
    // if (_filters.startDate) params.set("startDate", _filters.startDate);
    // if (_filters.endDate) params.set("endDate", _filters.endDate);
    // if (_filters.hasManualSession !== undefined) params.set("hasManualSession", String(_filters.hasManualSession));
    // const { data } = await apiClient.get<ApiResponse<PagedResponse<AdminWorkingDayRow>>>(`/api/admin/attendance/days?${params.toString()}`, { _toast: false });
    // if (data.status !== "success" || data.data === null) throw new Error(data.message ?? "Failed to fetch attendance days.");
    // return data.data;
  },

  // TODO: Pending backend — endpoint not yet implemented. Remove static data fallback when delivered.
  getMonthStats: async (): Promise<AttendanceMonthStats> => {
    // STATIC: return static data until backend delivers
    return Promise.resolve(STATIC_ATTENDANCE_MONTH_STATS);
    // REAL:
    // import { apiClient } from "@/lib/axios";
    // const { data } = await apiClient.get<ApiResponse<AttendanceMonthStats>>("/api/admin/attendance/stats/month", { _toast: false });
    // if (data.status !== "success" || data.data === null) throw new Error(data.message ?? "Failed to fetch monthly stats.");
    // return data.data;
  },
} as const;
