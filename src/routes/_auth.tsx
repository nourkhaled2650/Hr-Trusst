import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";

const AuthLayout = () => (
  <div
    className="min-h-screen w-full flex items-center justify-center bg-neutral-50"
    style={{
      backgroundImage:
        "linear-gradient(145deg,var(--background) 0%,var(--secondary) 40%,var(--muted) 100%)",
      backgroundSize: "20px 20px",
    }}
  >
    <Outlet />
  </div>
);

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
});
