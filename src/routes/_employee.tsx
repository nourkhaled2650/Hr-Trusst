import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import { UserRole } from "@/types";
import { EmployeeNavbar } from "@/components/shared/EmployeeNavbar";

const EmployeeLayout = () => (
  <div className="min-h-screen bg-neutral-50">
    <EmployeeNavbar />
    <main className="pt-14 min-h-screen">
      <Outlet />
    </main>
  </div>
);

export const Route = createFileRoute("/_employee")({
  component: EmployeeLayout,
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    if (!user?.roles.includes(UserRole.EMPLOYEE)) {
      throw redirect({ to: "/admin" });
    }
  },
});
