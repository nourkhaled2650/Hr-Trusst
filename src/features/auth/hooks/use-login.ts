import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth.store";
import { UserRole } from "@/types";
import type { AppUser } from "@/types";
import { authApi } from "../api/auth.api";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";

function extractApiErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message) return error.message;
  return null;
}

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values: LoginFormValues) => {
    setLoginError(null);
    setIsPending(true);

    try {
      // Step 1 — Login
      const tokens = await authApi.login(values);
      useAuthStore.setState({ accessToken: tokens.accessToken });

      // Step 2 — Session
      const sessionUser = await authApi.session();

      // Step 3 — Active check
      if (!sessionUser.isActive) {
        useAuthStore.getState().clearAuth();
        setLoginError("Your account has been deactivated. Please contact HR.");
        return;
      }

      // Step 4 — Commit auth
      setAuth(sessionUser as AppUser, tokens.accessToken, tokens.refreshToken);
    } catch (error: unknown) {
      useAuthStore.getState().clearAuth();
      const apiMessage = extractApiErrorMessage(error);
      setLoginError(apiMessage ?? "Something went wrong. Please try again.");
      return;
    } finally {
      setIsPending(false);
    }

    // Only reached after a clean, committed auth state — navigate outside try-catch
    const { user } = useAuthStore.getState();
    const destination = user?.role === UserRole.EMPLOYEE ? "/" : "/admin";
    void router.navigate({ to: destination, replace: true });
  });

  // Clear error when the user starts typing again
  const handleFieldChange = () => {
    if (loginError !== null) setLoginError(null);
  };

  return { form, onSubmit, loginError, isPending, handleFieldChange };
}
