import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";

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
    if (user?.role !== "sub_admin" && user?.role !== "super_admin") {
      throw redirect({ to: "/" });
    }
  },
});
