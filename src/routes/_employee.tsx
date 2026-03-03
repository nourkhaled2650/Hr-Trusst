import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";

const EmployeeLayout = () => (
  <div className="min-h-screen bg-background">
    {/* Employee sidebar + topbar — built as part of the layout feature */}
    <Outlet />
  </div>
);

export const Route = createFileRoute("/_employee")({
  component: EmployeeLayout,
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    if (user?.role !== "employee") {
      throw redirect({ to: "/admin" });
    }
  },
});
