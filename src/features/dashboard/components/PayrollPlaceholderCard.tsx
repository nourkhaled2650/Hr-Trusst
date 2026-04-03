import { Wallet, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Component — placeholder until payroll module is built
// ---------------------------------------------------------------------------
export function PayrollPlaceholderCard() {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Payroll Status
        </CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="rounded-full bg-muted p-3">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Payroll module coming soon
          </p>
          <p className="text-xs text-muted-foreground max-w-[260px]">
            Payslip generation, salary processing, and payroll summaries will
            appear here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
