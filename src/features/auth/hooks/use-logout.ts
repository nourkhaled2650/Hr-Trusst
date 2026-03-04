import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout as useLogoutMutation } from "../api/auth.queries";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const mutation = useLogoutMutation();

  const logout = () => {
    mutation.mutate(undefined, {
      onSettled: () => {
        clearAuth();
        void router.navigate({ to: "/login", replace: true });
      },
    });
  };

  return { logout, isPending: mutation.isPending };
}
