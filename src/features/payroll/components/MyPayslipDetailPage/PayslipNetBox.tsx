import { Card, CardContent } from "@/components/ui/card";
import { formatEGP } from "../../utils/payroll.utils";

interface PayslipNetBoxProps {
  netPayable: number;
}

export function PayslipNetBox({ netPayable }: PayslipNetBoxProps) {
  return (
    <Card className="bg-muted/40">
      <CardContent className="py-5 px-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Net Payable
          </p>
          <p className="text-2xl font-bold text-foreground">
            {formatEGP(netPayable)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
