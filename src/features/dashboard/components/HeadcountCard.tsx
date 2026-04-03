import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Static data — replace with TanStack Query hook when endpoint is available
// ---------------------------------------------------------------------------
const STATIC_HEADCOUNT = {
  total: 27,
  fullTime: 22,
  partTime: 5,
};

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
export function HeadcountCardSkeleton() {
  return <Skeleton className="h-[90px] rounded-xl" />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function HeadcountCard() {
  // TODO: replace with useQuery when endpoint is available
  const { total, fullTime, partTime } = STATIC_HEADCOUNT;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Headcount</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 divide-x divide-border">
          {[
            { label: "Total",     value: total    },
            { label: "Full-time", value: fullTime },
            { label: "Part-time", value: partTime },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5 px-3 first:pl-0 last:pr-0">
              <p className="text-xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
