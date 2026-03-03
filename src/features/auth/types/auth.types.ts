import type { SessionUser } from "@/types";

export type LoginRequest = {
  email: string;
  password: string;
};

export type SessionResponse = SessionUser;
