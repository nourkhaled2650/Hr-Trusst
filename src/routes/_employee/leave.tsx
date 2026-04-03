import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeaveBalanceCard } from "@/features/leave/components/leave-balance-card";
import { LeaveHistoryTable } from "@/features/leave/components/leave-history-table";
import { SubmitLeaveRequestDialog } from "@/features/leave/components/submit-leave-request-dialog";
import { UpcomingLeaveCard } from "@/features/leave/components/upcoming-leave-card";
import { LEAVE_BALANCES, LEAVE_HISTORY } from "@/features/leave/constants/leave-data";

// ---------------------------------------------------------------------------
// Leave Requests Page
// Route: /leave
// Employee layout — white navbar, no sidebar. No permission gates needed.
// ---------------------------------------------------------------------------

function LeavePage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const upcomingApproved = LEAVE_HISTORY.filter(
    (r) => r.status === "APPROVED" && r.startDate >= today
  );

  return (
    <div className="container py-6 space-y-8">
      {/* Section 1 — Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Leave Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View your leave balances and manage your time-off requests.
          </p>
        </div>
        <Button
          variant="default"
          className="w-full sm:w-auto"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Submit Leave Request
        </Button>
      </div>

      {/* Section 2 — Leave Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LEAVE_BALANCES.map((balance) => (
          <LeaveBalanceCard key={balance.type} balance={balance} />
        ))}
      </div>

      {/* Section 3 — Upcoming Approved Leave */}
      {upcomingApproved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Upcoming Leave</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingApproved.map((r) => (
              <UpcomingLeaveCard key={r.id} request={r} />
            ))}
          </div>
        </div>
      )}

      {/* Section 4 — Leave Request History */}
      <LeaveHistoryTable requests={LEAVE_HISTORY} />

      {/* Submit Leave Request Dialog */}
      <SubmitLeaveRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

export const Route = createFileRoute("/_employee/leave")({
  component: LeavePage,
});
