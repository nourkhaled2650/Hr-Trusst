import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { UserRole } from "@/types";
import type { AppUser } from "@/types";
import { useLoginMutation, useSessionMutation } from "../api/auth.queries";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";

type LoginError =
  | { type: "invalid_credentials" }
  | { type: "account_inactive" }
  | { type: "network" };

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loginError, setLoginError] = useState<LoginError | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: login, isPending } = useLoginMutation();
  const { mutateAsync: fetchSession } = useSessionMutation();

  const onSubmit = form.handleSubmit((values) => {
    setLoginError(null);
    login(values, {
      onSuccess: async (tokens) => {
        try {
          // Temporarily store access token so the session call can attach it
          useAuthStore.setState({ accessToken: tokens.accessToken });

          const sessionUser = await fetchSession();

          if (!sessionUser.isActive) {
            useAuthStore.getState().clearAuth();
            setLoginError({ type: "account_inactive" });
            return;
          }

          setAuth(sessionUser as AppUser, tokens.accessToken, tokens.refreshToken);

          const destination =
            sessionUser.role === UserRole.EMPLOYEE ? "/" : "/admin";
          router.navigate({ to: destination, replace: true });
        } catch {
          useAuthStore.getState().clearAuth();
          setLoginError({ type: "network" });
        }
      },
      onError: (error) => {
        useAuthStore.getState().clearAuth();
        if (isAxiosError(error) && error.response?.status === 401) {
          setLoginError({ type: "invalid_credentials" });
        } else {
          setLoginError({ type: "network" });
        }
      },
    });
  });

  const handleFieldChange = () => {
    if (loginError !== null) setLoginError(null);
  };

  return { form, onSubmit, loginError, isPending, handleFieldChange };
}
