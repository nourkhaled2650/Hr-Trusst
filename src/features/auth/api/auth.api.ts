import { apiClient } from "@/lib/axios";
import type { LoginTokens, SessionUser } from "@/types";
import type { LoginRequest } from "../types/auth.types";

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginTokens> => {
    const { data } = await apiClient.post<LoginTokens>(
      "/api/auth/login",
      payload,
      { _toast: false },
    );
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Login failed");
    }
    return data.data;
  },

  session: async (): Promise<SessionUser> => {
    const { data } = await apiClient.get<SessionUser>("/api/auth/session", {
      _toast: false,
    });
    if (data.status !== "success" || data.data === null) {
      throw new Error(data.message ?? "Session fetch failed");
    }
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout", undefined, { _toast: false });
  },
} as const;
