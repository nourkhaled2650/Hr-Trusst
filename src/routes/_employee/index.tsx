import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth";

const EmployeeHomePage = () => {
  const { logout, isPending } = useLogout();
  return (
    <div className="p-8 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <Button variant="outline" onClick={logout} disabled={isPending}>
        {isPending ? "Signing out…" : "Sign out"}
      </Button>
    </div>
  );
};

export const Route = createFileRoute("/_employee/")({
  component: EmployeeHomePage,
});
