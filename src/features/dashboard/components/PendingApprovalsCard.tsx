import { CheckCircle2, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Static data — replace with TanStack Query hook when endpoint is available
// ---------------------------------------------------------------------------
interface ApprovalItem {
  label: string;
  count: number;
  to: string;
}

const APPROVAL_ITEMS: ApprovalItem[] = [
  { label: "Manual Working Days", count: 7, to: "/admin/attendance" },
  { label: "Leave Requests",      count: 3, to: "/admin/leave"      },
];

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
export function PendingApprovalsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Pending Approvals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PendingApprovalsCard() {
  // TODO: replace with useQuery when endpoint is available
  const items = APPROVAL_ITEMS;
  const allZero = items.every((item) => item.count === 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Pending Approvals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allZero ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground">
              No pending approvals.
            </p>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <Link
                key={item.label}
                to={item.to as never} // typed as `never`; update when route types are finalised
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0 hover:bg-muted -mx-6 px-6 transition-colors"
              >
                <span className="text-sm text-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={item.count > 0 ? "destructive" : "secondary"}
                    className="min-w-[1.5rem] justify-center"
                  >
                    {item.count}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
