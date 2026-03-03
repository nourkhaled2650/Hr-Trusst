import { useMutation } from "@tanstack/react-query";
import { authApi } from "./auth.api";
import type { LoginFormValues } from "../schemas/auth.schema";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (values: LoginFormValues) => authApi.login(values),
  });

export const useSessionMutation = () =>
  useMutation({
    mutationFn: authApi.session,
  });

export const useLogout = () =>
  useMutation({
    mutationFn: authApi.logout,
  });
