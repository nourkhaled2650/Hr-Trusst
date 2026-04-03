import { PayslipNetBox } from "./PayslipNetBox";
import { formatEGP } from "../../utils/payroll.utils";
import type { PayslipDetail } from "../../types/payroll.types";

interface PartTimePayslipBodyProps {
  payslip: PayslipDetail & { employmentType: "PART_TIME" };
}

function LineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function PartTimePayslipBody({ payslip }: PartTimePayslipBodyProps) {
  const hours =
    payslip.hoursWorked != null
      ? `${payslip.hoursWorked.toFixed(1)} hrs`
      : "—";

  const rate =
    payslip.hourlyRate != null
      ? `${formatEGP(payslip.hourlyRate)} / hr`
      : "—";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border px-4 py-3 space-y-1">
        <LineRow label="Hours Worked" value={hours} />
        <LineRow label="Hourly Rate" value={rate} />
      </div>

      <PayslipNetBox netPayable={payslip.netPayable} />
    </div>
  );
}
