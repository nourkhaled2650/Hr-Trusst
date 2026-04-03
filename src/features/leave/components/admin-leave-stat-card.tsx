import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminLeaveStat } from "../types/admin-leave.types";

// ---------------------------------------------------------------------------
// AdminLeaveStatCard — summary stat card for the admin leave page
// ---------------------------------------------------------------------------

type Props = {
  stat: AdminLeaveStat;
};

export function AdminLeaveStatCard({ stat }: Props) {
  const { label, value, unit, description } = stat;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
