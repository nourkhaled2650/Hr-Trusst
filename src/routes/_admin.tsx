import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import { UserRole } from "@/types";
const AdminLayout = () => (
  <div className="min-h-screen bg-background">
    {/* Admin sidebar + topbar — built as part of the layout feature */}
    <Outlet />
  </div>
);

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    if (
      !user?.roles?.includes(UserRole.SUB_ADMIN) &&
      !user?.roles?.includes(UserRole.SUPER_ADMIN)
    ) {
      throw redirect({ to: "/" });
    }
  },
});
