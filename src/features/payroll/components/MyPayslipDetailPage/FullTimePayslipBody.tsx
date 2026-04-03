import { Separator } from "@/components/ui/separator";
import { PayslipNetBox } from "./PayslipNetBox";
import { formatEGP } from "../../utils/payroll.utils";
import type { PayslipDetail, PayslipAdjustmentLine } from "../../types/payroll.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
        {label}
      </p>
      <Separator />
    </div>
  );
}

function LineRow({
  label,
  amount,
  variant = "normal",
}: {
  label: string;
  amount: string;
  variant?: "normal" | "deduction" | "addition" | "total";
}) {
  const amountClass =
    variant === "deduction"
      ? "text-destructive"
      : variant === "addition"
        ? "text-success"
        : variant === "total"
          ? "font-semibold text-foreground"
          : "text-foreground";

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm ${amountClass}`}>{amount}</span>
    </div>
  );
}

function TotalRow({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between pt-2 mt-1 border-t border-border">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{amount}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Adjustment item
// ---------------------------------------------------------------------------

function AdjustmentItem({
  item,
  isLast,
}: {
  item: PayslipAdjustmentLine;
  isLast: boolean;
}) {
  const isDeduction = item.type === "DEDUCTION";
  const amountLabel = isDeduction
    ? `(${formatEGP(item.amount)})`
    : `+${formatEGP(item.amount)}`;

  return (
    <>
      <div className="py-2 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{item.label}</span>
          <span
            className={`text-sm ${isDeduction ? "text-destructive" : "text-success"}`}
          >
            {amountLabel}
          </span>
        </div>
        {item.note != null && item.note.length > 0 && (
          <p className="text-sm text-muted-foreground italic">{item.note}</p>
        )}
      </div>
      {!isLast && <Separator className="border-dashed" />}
    </>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

interface EarningsSectionProps {
  basicSalary: number;
  normalOvertimeHours: number | null;
  normalOvertimeAmount: number | null;
  specialOvertimeHours: number | null;
  specialOvertimeAmount: number | null;
  totalEarnings: number;
}

function EarningsSection({
  basicSalary,
  normalOvertimeHours,
  normalOvertimeAmount,
  specialOvertimeHours,
  specialOvertimeAmount,
  totalEarnings,
}: EarningsSectionProps) {
  const showNormalOt =
    normalOvertimeHours != null &&
    normalOvertimeHours > 0 &&
    normalOvertimeAmount != null;
  const showSpecialOt =
    specialOvertimeHours != null &&
    specialOvertimeHours > 0 &&
    specialOvertimeAmount != null;

  return (
    <div className="space-y-1">
      <SectionHeading label="Earnings" />
      <LineRow label="Basic Salary (pro-rated)" amount={formatEGP(basicSalary)} />
      {showNormalOt && (
        <LineRow
          label={`Normal Overtime (${normalOvertimeHours!.toFixed(1)} hrs)`}
          amount={formatEGP(normalOvertimeAmount!)}
        />
      )}
      {showSpecialOt && (
        <LineRow
          label={`Special Overtime (${specialOvertimeHours!.toFixed(1)} hrs)`}
          amount={formatEGP(specialOvertimeAmount!)}
        />
      )}
      <TotalRow label="Total Earnings" amount={formatEGP(totalEarnings)} />
    </div>
  );
}

interface DeductionsSectionProps {
  latenessDeductionHours: number | null;
  latenessDeductionAmount: number | null;
  leaveDeductionDays: number | null;
  leaveDeductionAmount: number | null;
  totalDeductions: number;
}

function DeductionsSection({
  latenessDeductionHours,
  latenessDeductionAmount,
  leaveDeductionDays,
  leaveDeductionAmount,
  totalDeductions,
}: DeductionsSectionProps) {
  const showLateness =
    latenessDeductionHours != null &&
    latenessDeductionHours > 0 &&
    latenessDeductionAmount != null;
  const showLeave =
    leaveDeductionDays != null &&
    leaveDeductionDays > 0 &&
    leaveDeductionAmount != null;

  return (
    <div className="space-y-1">
      <SectionHeading label="Deductions" />
      {showLateness && (
        <LineRow
          label={`Lateness (${latenessDeductionHours!.toFixed(1)} hrs deducted)`}
          amount={`(${formatEGP(latenessDeductionAmount!)})`}
          variant="deduction"
        />
      )}
      {showLeave && (
        <LineRow
          label={`Unpaid Leave (${leaveDeductionDays!.toFixed(1)} day)`}
          amount={`(${formatEGP(leaveDeductionAmount!)})`}
          variant="deduction"
        />
      )}
      <TotalRow
        label="Total Deductions"
        amount={`(${formatEGP(totalDeductions)})`}
      />
    </div>
  );
}

interface AdjustmentsSectionProps {
  adjustments: PayslipAdjustmentLine[];
  netAdjustments: number;
}

function AdjustmentsSection({
  adjustments,
  netAdjustments,
}: AdjustmentsSectionProps) {
  return (
    <div className="space-y-1">
      <SectionHeading label="Adjustments" />
      <div>
        {adjustments.map((item, idx) => (
          <AdjustmentItem
            key={item.id}
            item={item}
            isLast={idx === adjustments.length - 1}
          />
        ))}
      </div>
      <TotalRow
        label="Net Adjustments"
        amount={
          netAdjustments >= 0
            ? `+${formatEGP(netAdjustments)}`
            : `(${formatEGP(Math.abs(netAdjustments))})`
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface FullTimePayslipBodyProps {
  payslip: PayslipDetail & { employmentType: "FULL_TIME" };
}

export function FullTimePayslipBody({ payslip }: FullTimePayslipBodyProps) {
  const showDeductions =
    payslip.totalDeductions != null && payslip.totalDeductions > 0;
  const showAdjustments = payslip.adjustments.length > 0;

  return (
    <div className="space-y-6">
      {/* EARNINGS — always visible for full-time */}
      <EarningsSection
        basicSalary={payslip.basicSalary ?? 0}
        normalOvertimeHours={payslip.normalOvertimeHours}
        normalOvertimeAmount={payslip.normalOvertimeAmount}
        specialOvertimeHours={payslip.specialOvertimeHours}
        specialOvertimeAmount={payslip.specialOvertimeAmount}
        totalEarnings={payslip.totalEarnings ?? 0}
      />

      {/* DEDUCTIONS — hidden if totalDeductions is 0 or null */}
      {showDeductions && (
        <DeductionsSection
          latenessDeductionHours={payslip.latenessDeductionHours}
          latenessDeductionAmount={payslip.latenessDeductionAmount}
          leaveDeductionDays={payslip.leaveDeductionDays}
          leaveDeductionAmount={payslip.leaveDeductionAmount}
          totalDeductions={payslip.totalDeductions!}
        />
      )}

      {/* ADJUSTMENTS — hidden if array is empty */}
      {showAdjustments && (
        <AdjustmentsSection
          adjustments={payslip.adjustments}
          netAdjustments={payslip.netAdjustments ?? 0}
        />
      )}

      {/* NET PAYABLE */}
      <PayslipNetBox netPayable={payslip.netPayable} />
    </div>
  );
}
