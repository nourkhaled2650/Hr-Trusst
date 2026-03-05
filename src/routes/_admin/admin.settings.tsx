import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import { UserRole } from "@/types";
import { useLatestConfig } from "@/features/config";
import { useAllConfigs } from "@/features/config";
import { ConfigForm } from "@/features/config";
import { ConfigHistoryTable } from "@/features/config";

export const Route = createFileRoute("/_admin/admin/settings")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    // Only Super Admins may access system configuration
    if (user?.role !== UserRole.SUPER_ADMIN) {
      throw redirect({ to: "/admin" });
    }
  },
  component: AdminConfigPage,
});

function AdminConfigPage() {
  const latestQuery = useLatestConfig();
  const historyQuery = useAllConfigs();

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          System Configuration
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage company-wide HR policy values.
        </p>
      </div>

      {/* Section 1 — Current Configuration */}
      <ConfigForm
        isLoading={latestQuery.isLoading}
        isError={latestQuery.isError}
        config={latestQuery.data}
      />

      {/* Section 2 — Configuration History */}
      <ConfigHistoryTable
        configs={historyQuery.data}
        isLoading={historyQuery.isLoading}
        isError={historyQuery.isError}
      />
    </div>
  );
}
