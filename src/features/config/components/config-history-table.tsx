import { History } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PayrollSettings } from "../types/config.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatValidUntil(validUntil: string | null): string {
  if (!validUntil) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
    new Date(validUntil),
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ isExpired }: { isExpired: boolean }) {
  if (!isExpired) {
    return (
      <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs font-medium">
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-neutral-400 text-xs font-medium">
      Expired
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Column header shared style
// ---------------------------------------------------------------------------

const TH_CLASS =
  "text-xs font-medium text-neutral-500 uppercase tracking-wide whitespace-nowrap";

// ---------------------------------------------------------------------------
// Loading rows
// ---------------------------------------------------------------------------

function LoadingRows() {
  return (
    <TableBody>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 9 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

type ConfigHistoryTableProps = {
  configs: PayrollSettings[] | undefined;
  isLoading: boolean;
  isError: boolean;
};

export function ConfigHistoryTable({
  configs,
  isLoading,
  isError,
}: ConfigHistoryTableProps) {
  // Sort newest first (descending by settingId)
  const sorted = configs
    ? [...configs].sort((a, b) => b.settingId - a.settingId)
    : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-neutral-900">
            Configuration History
          </CardTitle>
          <CardDescription>
            All past configuration records, newest first.
          </CardDescription>
        </div>
        <History className="h-5 w-5 text-neutral-400" />
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={TH_CLASS}>ID</TableHead>
                <TableHead className={TH_CLASS}>Std Hours</TableHead>
                <TableHead className={TH_CLASS}>Normal OT</TableHead>
                <TableHead className={TH_CLASS}>Special OT</TableHead>
                <TableHead className={TH_CLASS}>Late Limit</TableHead>
                <TableHead className={TH_CLASS}>Leave Days</TableHead>
                <TableHead className={TH_CLASS}>Start Time</TableHead>
                <TableHead className={TH_CLASS}>Valid Until</TableHead>
                <TableHead className={TH_CLASS}>Status</TableHead>
              </TableRow>
            </TableHeader>

            {isLoading ? (
              <LoadingRows />
            ) : (
              <TableBody>
                {isError && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <p className="text-sm text-red-500">
                        Failed to load configuration history.
                      </p>
                    </TableCell>
                  </TableRow>
                )}

                {!isError && sorted.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-sm text-neutral-400"
                    >
                      No configuration history yet.
                    </TableCell>
                  </TableRow>
                )}

                {!isError &&
                  sorted.map((config) => (
                    <TableRow key={config.settingId}>
                      <TableCell>
                        <span className="font-mono text-xs text-neutral-500">
                          #{config.settingId}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {config.standardWorkingHours} hrs/day
                      </TableCell>
                      <TableCell className="text-sm">
                        {config.normalOvertimeRate}×
                      </TableCell>
                      <TableCell className="text-sm">
                        {config.specialOvertimeRate}×
                      </TableCell>
                      <TableCell className="text-sm">
                        {config.lateBalanceLimit} hrs/mo
                      </TableCell>
                      <TableCell className="text-sm">
                        {config.leaveBalanceLimit} days/yr
                      </TableCell>
                      <TableCell className="text-sm">
                        {config.workingDayStartTime.slice(0, 5)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatValidUntil(config.validUntil)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge isExpired={config.isExpired} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
