import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Component — placeholder until activity feed backend endpoint is available
// ---------------------------------------------------------------------------
export function ActivityFeedCard() {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent Activity
        </CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="rounded-full bg-muted p-3">
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Activity feed coming soon
          </p>
          <p className="text-xs text-muted-foreground max-w-[300px]">
            HR events — leave requests, approvals, new employees, and flagged
            sessions — will stream here once the backend endpoint is available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
