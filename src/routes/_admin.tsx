import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { AdminNavbar } from "@/components/shared/AdminNavbar";

const AdminLayout = () => {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminSidebar />
      <AdminNavbar />
      <main
        className={cn(
          "pt-14 min-h-screen transition-all duration-200 ease-in-out",
          sidebarOpen ? "ml-60" : "ml-14",
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    if (
      !user?.roles.includes(UserRole.SUB_ADMIN) &&
      !user?.roles.includes(UserRole.SUPER_ADMIN)
    ) {
      throw redirect({ to: "/" });
    }
  },
});
