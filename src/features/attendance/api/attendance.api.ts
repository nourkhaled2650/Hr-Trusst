import { apiClient } from "@/lib/axios";
import type {
  AttendanceLog,
  SessionStatusResponse,
  DaySummaryResponse,
  AdminWorkingDay,
} from "../types/attendance.types";

// ---------------------------------------------------------------------------
// Attendance API — all calls go through apiClient from lib/axios.ts
// ---------------------------------------------------------------------------

export const attendanceApi = {
  // E1 — GET /api/attendance/session/status
  getSessionStatus: async (): Promise<SessionStatusResponse> => {
    const { data } = await apiClient.get<SessionStatusResponse>(
      "/api/attendance/session/status",
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to fetch session status.");
    }
    return data.data;
  },

  // E2 — POST /api/attendance/clock-in
  clockIn: async (opts?: { manualTime?: string }): Promise<void> => {
    const body = opts?.manualTime ? { manualTime: opts.manualTime } : {};
    const { data } = await apiClient.post<null>(
      "/api/attendance/clock-in",
      body,
    );
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to start session.");
    }
  },

  // E3 — POST /api/attendance/clock-out
  clockOut: async (opts?: { manualTime?: string }): Promise<void> => {
    const body = opts?.manualTime ? { manualTime: opts.manualTime } : {};
    const { data } = await apiClient.post<null>(
      "/api/attendance/clock-out",
      body,
    );
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to end session.");
    }
  },

  // E4 — GET /api/attendance/day-summary?date=YYYY-MM-DD
  getDaySummary: async (date: string): Promise<DaySummaryResponse> => {
    console.log("getDaySummary", date);
    const { data } = await apiClient.get<DaySummaryResponse>(
      `/api/attendance/day-summary?date=${date}`,
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to fetch day summary.");
    }
    return data.data;
  },

  // E6 — POST /api/attendance/reentry
  submitReentry: async (body: {
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<void> => {
    const { data } = await apiClient.post<null>(
      "/api/attendance/reentry",
      body,
    );
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to submit re-entry.");
    }
  },

  // E7 — GET /api/admin/attendance/employee/{employeeId}/days
  getEmployeeWorkingDays: async (
    employeeId: number,
  ): Promise<AdminWorkingDay[]> => {
    const { data } = await apiClient.get<AdminWorkingDay[]>(
      `/api/admin/attendance/employee/${employeeId}/days`,
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to fetch working days.");
    }
    return data.data;
  },

  // E8 — POST /api/admin/attendance/days/{dayId}/approve
  approveWorkingDay: async (dayId: number): Promise<void> => {
    const { data } = await apiClient.post<null>(
      `/api/admin/attendance/days/${dayId}/approve`,
    );
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to approve day.");
    }
  },

  // E9 — POST /api/admin/attendance/days/{dayId}/reject
  rejectWorkingDay: async (dayId: number): Promise<void> => {
    const { data } = await apiClient.post<null>(
      `/api/admin/attendance/days/${dayId}/reject`,
    );
    if (data.status !== "success") {
      throw new Error(data.message ?? "Failed to reject day.");
    }
  },

  // ---------------------------------------------------------------------------
  // Legacy — GET /api/attendance/logs/{employeeId}
  // Used by the attendance history page. V2 widget no longer calls this.
  // ---------------------------------------------------------------------------
  getAttendanceLogs: async (employeeId: number): Promise<AttendanceLog[]> => {
    const { data } = await apiClient.get<AttendanceLog[]>(
      `/api/attendance/logs/${employeeId}`,
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Failed to fetch attendance logs.");
    }
    return data.data;
  },
} as const;
